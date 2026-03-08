import datetime

URGENCY_OVERRIDE_DAYS = 1
STUDY_MIN_WEEK = 1.0
STUDY_MAX_BY_PRIORITY = {"HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}
URGENCY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}

def _date_labels(start_date, days=7):
    weekday_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    return [{"day_label": f"Day{i+1} ({weekday_names[(start_date + datetime.timedelta(days=i)).weekday()]})",
             "date": start_date + datetime.timedelta(days=i), "available_hours": 0.0} for i in range(days)]

def _deadline_date(today, days_from_today):
    return today + datetime.timedelta(days=days_from_today)

def run_scheduler(availability, task_priorities, subject_priorities, start_offset_days=0):
    today = datetime.date.today()
    start_date = today + datetime.timedelta(days=start_offset_days)
    day_slots = _date_labels(start_date, days=7)
    for i, avail in enumerate(availability[:7]):
        day_slots[i]["available_hours"] = float(avail.get("available_hours", 0.0))

    day_remaining = [s["available_hours"] for s in day_slots]
    schedule_rows = []

    def _deadline_date_str(days):
        return str(today + datetime.timedelta(days=days))

    # Sort all tasks by urgency first, then priority score descending
    task_queue = sorted(
        task_priorities,
        key=lambda x: (URGENCY_ORDER.get(x["urgency_label"], 3), -x["priority_score"])
    )

    # Build queue with hours_remaining
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
                # CRITICAL/urgent: dump into earliest available days
                total_avail = sum(r for _, _, r in eligible)
                not_enough = total_avail < t["hours_remaining"]
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01:
                        break
                    give = min(t["hours_remaining"], day_remaining[i])
                    if give < 0.05:
                        continue
                    label = t["task_name"] + (" ⚠️ NOT ENOUGH HOURS" if not_enough else "")
                    schedule_rows.append({
                        "day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"],
                        "subject": t.get("subject", t["task_name"]),
                        "task_name": label,
                        "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"],
                        "urgency_label": t["urgency_label"]
                    })
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)
            else:
                # Spread across eligible days within cap
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01:
                        break
                    day_orig = slot["available_hours"]
                    daily_cap = round(day_orig * cap_ratio, 4)
                    give = min(t["hours_remaining"], day_remaining[i], daily_cap)
                    # Skip sub-1hr blocks unless critical/high
                    if give < 1.0 and not is_critical:
                        continue
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

    # Study budget = leftover after tasks
    total_study_budget = round(sum(day_remaining), 2)
    if total_study_budget < 1.0 or not subject_priorities:
        return schedule_rows

    # Assign weekly study hours per subject
    study_alloc = {}
    remaining_budget = total_study_budget

    # Step 1: minimum 1hr each
    for s in subject_priorities:
        if remaining_budget >= STUDY_MIN_WEEK:
            study_alloc[s["subject"]] = STUDY_MIN_WEEK
            remaining_budget = round(remaining_budget - STUDY_MIN_WEEK, 4)
        else:
            study_alloc[s["subject"]] = 0.0

    # Step 2: distribute remainder by priority weight up to max
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

    # Step 3: dump any remaining into highest priority
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

    # Build study queue sorted by priority
    study_queue = sorted(
        [{"subject": s["subject"], "hrs_remaining": study_alloc[s["subject"]],
          "priority_label": s["priority_label"], "task_name": f"Study {s['subject']}"}
         for s in subject_priorities if study_alloc.get(s["subject"], 0) >= 0.05],
        key=lambda x: STUDY_MAX_BY_PRIORITY.get(x["priority_label"], 1.0), reverse=True
    )

    # Spread study across days in 1hr blocks
    for i, slot in enumerate(day_slots):
        if day_remaining[i] < 0.05:
            continue
        day_label = slot["day_label"]
        day_date = str(slot["date"])
        for sq in study_queue:
            if day_remaining[i] < 0.05:
                break
            if sq["hrs_remaining"] < 0.05:
                continue
            max_block = STUDY_MAX_BY_PRIORITY.get(sq["priority_label"], 1.0)
            give = min(sq["hrs_remaining"], day_remaining[i], max_block)
            give = round(give, 2)
            if give > day_remaining[i]:
                give = round(day_remaining[i], 2)
            if give < 0.05:
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