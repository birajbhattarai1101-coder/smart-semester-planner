import datetime

URGENCY_OVERRIDE_DAYS = 1
STUDY_MIN_WEEK = 1.0
URGENCY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

def _date_labels(start_date, days=7):
    weekday_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    return [{"day_label": f"Day{i+1} ({weekday_names[(start_date + datetime.timedelta(days=i)).weekday()]})",
             "date": start_date + datetime.timedelta(days=i), "available_hours": 0.0} for i in range(days)]

def _get_daily_cap(study_budget, total_week_hours):
    if total_week_hours <= 0:
        return 2.0
    ratio = study_budget / total_week_hours
    if ratio >= 0.70:
        return 5.0
    elif ratio >= 0.31:
        return 3.0
    else:
        return 2.0

def run_scheduler(availability, task_priorities, subject_priorities, start_offset_days=0):
    today = datetime.date.today()
    start_date = today + datetime.timedelta(days=start_offset_days)
    day_slots = _date_labels(start_date, days=7)
    for i, avail in enumerate(availability[:7]):
        day_slots[i]["available_hours"] = float(avail.get("available_hours", 0.0))

    day_remaining = [s["available_hours"] for s in day_slots]
    schedule_rows = []
    total_week_hours = round(sum(s["available_hours"] for s in day_slots), 2)

    def _deadline_date_str(days):
        return str(today + datetime.timedelta(days=days))

    task_queue = sorted(
        task_priorities,
        key=lambda x: (URGENCY_ORDER.get(x["urgency_label"], 3), -x["priority_score"])
    )
    task_queue = [{**t, "hours_remaining": t["hours_required"],
                   "deadline_date": _deadline_date_str(t["deadline_days"])} for t in task_queue]

    cap_map = {"Assignment": 0.45, "Lab": 0.25}

    def schedule_tasks(queue):
        for t in queue:
            days_left = t["deadline_days"]
            cap_ratio = cap_map.get(t["task_type"], 0.45)
            is_critical = t["urgency_label"] in ("CRITICAL", "HIGH")
            eligible = [(i, day_slots[i], day_remaining[i])
                        for i in range(7)
                        if i <= days_left and day_remaining[i] > 0.05]
            if not eligible:
                continue
            if days_left <= URGENCY_OVERRIDE_DAYS:
                total_avail = sum(r for _, _, r in eligible)
                not_enough = total_avail < t["hours_remaining"]
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01: break
                    give = min(t["hours_remaining"], day_remaining[i])
                    if give < 0.05: continue
                    label = t["task_name"] + (" ⚠️ NOT ENOUGH HOURS" if not_enough else "")
                    schedule_rows.append({"day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                        "task_name": label, "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"], "urgency_label": t["urgency_label"]})
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)
            else:
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01: break
                    day_orig = slot["available_hours"]
                    daily_cap = round(day_orig * cap_ratio, 4)
                    give = min(t["hours_remaining"], day_remaining[i], daily_cap)
                    if give < 0.5 and not is_critical: continue
                    if give < 0.05: continue
                    schedule_rows.append({"day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                        "task_name": t["task_name"], "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"], "urgency_label": t["urgency_label"]})
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)

    schedule_tasks(task_queue)

    # Study budget = all leftover after tasks
    total_study_budget = round(sum(day_remaining), 2)
    if total_study_budget < 0.05 or not subject_priorities:
        return schedule_rows

    # Determine dynamic daily cap based on study budget ratio
    daily_cap = _get_daily_cap(total_study_budget, total_week_hours)

    def distribute_to_subjects(budget, subjects):
        """Distribute budget proportionally by priority score, min 1h each first."""
        alloc = {s["subject"]: 0.0 for s in subjects}
        remaining = budget

        # Step 1: min 1h each
        for s in subjects:
            if remaining >= STUDY_MIN_WEEK:
                alloc[s["subject"]] = STUDY_MIN_WEEK
                remaining = round(remaining - STUDY_MIN_WEEK, 4)

        # Step 2: distribute rest proportionally
        if remaining > 0.01:
            total_score = sum(s["priority_score"] for s in subjects) or 1.0
            for s in subjects:
                if remaining <= 0.01: break
                extra = round(remaining * (s["priority_score"] / total_score), 2)
                give = min(extra, remaining)
                alloc[s["subject"]] = round(alloc[s["subject"]] + give, 2)
                remaining = round(remaining - give, 4)

        # Step 3: dump any floating point leftover to top subject
        if remaining > 0.01:
            top = sorted(subjects, key=lambda x: x["priority_score"], reverse=True)
            alloc[top[0]["subject"]] = round(alloc[top[0]["subject"]] + remaining, 2)

        return alloc

    study_alloc = distribute_to_subjects(total_study_budget, subject_priorities)

    study_queue = sorted(
        [{"subject": s["subject"], "hrs_remaining": study_alloc[s["subject"]],
          "priority_label": s["priority_label"], "priority_score": s["priority_score"],
          "task_name": f"Study {s['subject']}"}
         for s in subject_priorities if study_alloc.get(s["subject"], 0) >= 0.05],
        key=lambda x: x["priority_score"], reverse=True
    )

    def spread_study(queue, cap):
        """Spread study hours across days respecting daily cap per subject."""
        for i, slot in enumerate(day_slots):
            if day_remaining[i] < 0.05: continue
            day_label = slot["day_label"]
            day_date = str(slot["date"])
            for sq in queue:
                if day_remaining[i] < 0.05: break
                if sq["hrs_remaining"] < 0.05: continue
                give = min(sq["hrs_remaining"], day_remaining[i], cap)
                give = round(give, 2)
                if give < 0.05: continue
                # Merge into existing row for same day+subject if exists
                existing = next((r for r in schedule_rows
                                 if r["day"] == day_label and r["subject"] == sq["subject"]
                                 and r["task_type"] == "Study"), None)
                if existing:
                    existing["allocated_hours"] = round(existing["allocated_hours"] + give, 2)
                else:
                    schedule_rows.append({"day": day_label, "date": day_date,
                        "task_type": "Study", "subject": sq["subject"],
                        "task_name": sq["task_name"], "allocated_hours": give,
                        "deadline": "-", "urgency_label": sq["priority_label"]})
                sq["hrs_remaining"] = round(sq["hrs_remaining"] - give, 4)
                day_remaining[i] = round(day_remaining[i] - give, 4)

    spread_study(study_queue, daily_cap)

    # Recycling pass — if hours still remain redistribute proportionally back to subjects
    passes = 0
    while passes < 10:
        still_remaining = round(sum(day_remaining), 2)
        if still_remaining < 0.05: break
        passes += 1

        recycle_alloc = distribute_to_subjects(still_remaining, subject_priorities)
        recycle_queue = sorted(
            [{"subject": s["subject"], "hrs_remaining": recycle_alloc[s["subject"]],
              "priority_label": s["priority_label"], "priority_score": s["priority_score"],
              "task_name": f"Study {s['subject']}"}
             for s in subject_priorities if recycle_alloc.get(s["subject"], 0) >= 0.05],
            key=lambda x: x["priority_score"], reverse=True
        )
        before = round(sum(day_remaining), 2)
        spread_study(recycle_queue, daily_cap)
        after = round(sum(day_remaining), 2)

        # If no progress made (all days at cap for all subjects), break to avoid infinite loop
        if after >= before - 0.01:
            break

    return schedule_rows
