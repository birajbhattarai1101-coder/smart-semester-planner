import datetime

URGENCY_OVERRIDE_DAYS = 1
STUDY_MIN_WEEK = 1.0
STUDY_MAX_BY_PRIORITY = {"HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}

def _date_labels(start_date, days=7):
    weekday_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    return [{"day_label": f"Day{i+1} ({weekday_names[(start_date + datetime.timedelta(days=i)).weekday()]})",
             "date": start_date + datetime.timedelta(days=i), "available_hours": 0.0} for i in range(days)]

def _deadline_date(today, days_from_today):
    return today + datetime.timedelta(days=days_from_today)

URGENCY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

def run_scheduler(availability, task_priorities, subject_priorities, start_offset_days=0):
    today = datetime.date.today()
    start_date = today + datetime.timedelta(days=start_offset_days)
    day_slots = _date_labels(start_date, days=7)
    for i, avail in enumerate(availability[:7]):
        day_slots[i]["available_hours"] = float(avail.get("available_hours", 0.0))

    day_remaining = [s["available_hours"] for s in day_slots]
    schedule_rows = []

    def _queue(tasks):
        return [{**t, "hours_remaining": t["hours_required"],
                 "deadline_date": str(_deadline_date(today, t["deadline_days"]))} for t in tasks]

    # Sort all tasks together by urgency first, then priority score
    # CRITICAL lab beats HIGH assignment
    all_tasks = sorted(
        [t for t in task_priorities],
        key=lambda x: (URGENCY_ORDER.get(x["urgency_label"], 3), -x["priority_score"])
    )
    # Split into assignments and labs after urgency sort
    assignments = _queue([t for t in all_tasks if t["task_type"] == "Assignment"])
    labs = _queue([t for t in all_tasks if t["task_type"] == "Lab"])

    # Merge into single queue respecting urgency order
    task_queue = _queue(sorted(
        task_priorities,
        key=lambda x: (URGENCY_ORDER.get(x["urgency_label"], 3), -x["priority_score"])
    ))

    def schedule_tasks(queue):
        for t in queue:
            days_left = t["deadline_days"]
            cap_ratio = 0.45 if t["task_type"] == "Assignment" else 0.25

            eligible = [(i, day_slots[i], day_remaining[i])
                        for i in range(7)
                        if i <= days_left and day_remaining[i] > 0.05]

            if not eligible:
                continue

            if days_left <= URGENCY_OVERRIDE_DAYS:
                # CRITICAL: dump all into today, warn if not enough
                total_avail = sum(r for _, _, r in eligible)
                if total_avail < t["hours_remaining"]:
                    # Not enough hours — allocate what we have and add warning row
                    for i, slot, cap in eligible:
                        if t["hours_remaining"] <= 0.01:
                            break
                        give = min(t["hours_remaining"], day_remaining[i])
                        if give < 0.05:
                            continue
                        schedule_rows.append({
                            "day": slot["day_label"], "date": str(slot["date"]),
                            "task_type": t["task_type"],
                            "subject": t.get("subject", t["task_name"]),
                            "task_name": t["task_name"] + " ⚠️ NOT ENOUGH HOURS",
                            "allocated_hours": round(give, 2),
                            "deadline": t["deadline_date"],
                            "urgency_label": t["urgency_label"]
                        })
                        t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                        day_remaining[i] = round(day_remaining[i] - give, 4)
                else:
                    for i, slot, cap in eligible:
                        if t["hours_remaining"] <= 0.01:
                            break
                        give = min(t["hours_remaining"], day_remaining[i])
                        if give < 0.05:
                            continue
                        schedule_rows.append({
                            "day": slot["day_label"], "date": str(slot["date"]),
                            "task_type": t["task_type"],
                            "subject": t.get("subject", t["task_name"]),
                            "task_name": t["task_name"],
                            "allocated_hours": round(give, 2),
                            "deadline": t["deadline_date"],
                            "urgency_label": t["urgency_label"]
                        })
                        t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                        day_remaining[i] = round(day_remaining[i] - give, 4)
            else:
                for i, slot, cap in eligible:
                    if t["hours_remaining"] <= 0.01:
                        break
                    day_orig = slot["available_hours"]
                    daily_cap = round(day_orig * cap_ratio, 4)
                    give = min(t["hours_remaining"], day_remaining[i], daily_cap)
                    if give < 0.05:
                        continue
                    schedule_rows.append({
                        "day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"],
                        "subject": t.get("subject", t["task_name"]),
                        "task_name": t["task_name"],
                        "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"],
                        "urgency_label": t["urgency_label"]
                    })
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)

    schedule_tasks(task_queue)

    # ── study budget = whatever is left after tasks ───────────────────────────
    total_study_budget = round(sum(day_remaining), 2)

    if total_study_budget < 1.0 or not subject_priorities:
        return schedule_rows

    # ── assign weekly study hours per subject ─────────────────────────────────
    study_alloc = {}
    remaining_budget = total_study_budget

    for s in subject_priorities:
        if remaining_budget >= STUDY_MIN_WEEK:
            study_alloc[s["subject"]] = STUDY_MIN_WEEK
            remaining_budget = round(remaining_budget - STUDY_MIN_WEEK, 4)
        else:
            study_alloc[s["subject"]] = 0.0

    if remaining_budget > 0.01:
        total_score = sum(s["priority_score"] for s in subject_priorities) or 1.0
        for s in subject_priorities:
            max_hrs = STUDY_MAX_BY_PRIORITY.get(s["priority_label"], 1.0)
            current = study_alloc.get(s["subject"], 0.0)
            headroom = max_hrs - current
            if headroom <= 0 or remaining_budget <= 0.01:
                continue
            extra = round(remaining_budget * (s["priority_score"] / total_score), 2)
            give = min(extra, headroom, remaining_budget)
            study_alloc[s["subject"]] = round(current + give, 2)
            remaining_budget = round(remaining_budget - give, 4)

    if remaining_budget > 0.01:
        for s in sorted(subject_priorities, key=lambda x: x["priority_score"], reverse=True):
            if remaining_budget <= 0.01:
                break
            max_hrs = STUDY_MAX_BY_PRIORITY.get(s["priority_label"], 1.0)
            current = study_alloc.get(s["subject"], 0.0)
            headroom = max_hrs - current
            if headroom <= 0:
                continue
            give = min(remaining_budget, headroom)
            study_alloc[s["subject"]] = round(current + give, 2)
            remaining_budget = round(remaining_budget - give, 4)

    study_queue = sorted(
        [{"subject": s["subject"], "hrs_remaining": study_alloc[s["subject"]],
          "priority_label": s["priority_label"], "task_name": f"Study {s['subject']}"}
         for s in subject_priorities if study_alloc.get(s["subject"], 0) >= 1.0],
        key=lambda x: STUDY_MAX_BY_PRIORITY.get(x["priority_label"], 1.0), reverse=True
    )

    for i, slot in enumerate(day_slots):
        if day_remaining[i] < 1.0:
            continue
        day_label = slot["day_label"]
        day_date  = str(slot["date"])

        for sq in study_queue:
            if day_remaining[i] < 1.0:
                break
            if sq["hrs_remaining"] < 1.0:
                continue
            max_block = STUDY_MAX_BY_PRIORITY.get(sq["priority_label"], 1.0)
            give = min(sq["hrs_remaining"], day_remaining[i], max_block)
            give = max(1.0, round(give, 2))
            if give > day_remaining[i]:
                give = round(day_remaining[i], 2)
            if give < 1.0:
                break
            schedule_rows.append({
                "day": day_label, "date": day_date, "task_type": "Study",
                "subject": sq["subject"], "task_name": sq["task_name"],
                "allocated_hours": give, "deadline": "-",
                "urgency_label": sq["priority_label"]
            })
            sq["hrs_remaining"] = round(sq["hrs_remaining"] - give, 4)
            day_remaining[i] = round(day_remaining[i] - give, 4)

    return schedule_rows