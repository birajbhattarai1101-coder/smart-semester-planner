import datetime

CAP_ASSIGNMENT = 0.45
CAP_LAB        = 0.25
CAP_STUDY      = 0.30
URGENCY_OVERRIDE_DAYS = 2
STUDY_MIN_HOURS = 1.0
STUDY_MAX_HOURS = 3.0

def _date_labels(start_date, days=7):
    weekday_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    return [{"day_label": f"Day{i+1} ({weekday_names[(start_date + datetime.timedelta(days=i)).weekday()]})",
             "date": start_date + datetime.timedelta(days=i), "available_hours": 0.0} for i in range(days)]

def _deadline_date(today, days_from_today):
    return today + datetime.timedelta(days=days_from_today)

def _allocate_study(study_alloc, study_weights, day_label, day_date, schedule_rows):
    if study_alloc < STUDY_MIN_HOURS or not study_weights:
        return
    # Sort by priority score descending
    sorted_subjects = sorted(study_weights, key=lambda x: x["priority_score"], reverse=True)
    n = len(sorted_subjects)
    remaining = study_alloc
    allocations = {}
    # First pass: give each subject minimum 1hr if possible
    for sw in sorted_subjects:
        if remaining >= STUDY_MIN_HOURS:
            allocations[sw["subject"]] = STUDY_MIN_HOURS
            remaining = round(remaining - STUDY_MIN_HOURS, 4)
        else:
            break
    # Second pass: distribute remaining hours by priority weight up to max 3hr
    if remaining > 0.01:
        total_score = sum(sw["priority_score"] for sw in sorted_subjects) or 1.0
        for sw in sorted_subjects:
            extra = round(remaining * (sw["priority_score"] / total_score), 2)
            current = allocations.get(sw["subject"], 0)
            capped = min(current + extra, STUDY_MAX_HOURS)
            allocations[sw["subject"]] = capped
    # Write to schedule
    for sw in sorted_subjects:
        hrs = round(allocations.get(sw["subject"], 0), 2)
        if hrs < 0.05:
            continue
        schedule_rows.append({
            "day": day_label, "date": day_date, "task_type": "Study",
            "subject": sw["subject"], "task_name": f"Study {sw['subject']}",
            "allocated_hours": hrs, "deadline": "-",
            "urgency_label": sw["priority_label"]
        })

def run_scheduler(availability, task_priorities, subject_priorities, start_offset_days=0):
    today = datetime.date.today()
    start_date = today + datetime.timedelta(days=start_offset_days)
    day_slots = _date_labels(start_date, days=7)
    for i, avail in enumerate(availability[:7]):
        day_slots[i]["available_hours"] = float(avail.get("available_hours", 0.0))

    assignments = sorted([t for t in task_priorities if t["task_type"] == "Assignment"],
                         key=lambda x: x["priority_score"], reverse=True)
    labs = sorted([t for t in task_priorities if t["task_type"] == "Lab"],
                  key=lambda x: x["priority_score"], reverse=True)

    def _queue(tasks):
        return [{**t, "hours_remaining": t["hours_required"],
                 "deadline_date": str(_deadline_date(today, t["deadline_days"]))} for t in tasks]

    aqueue = _queue(assignments)
    lqueue = _queue(labs)
    total_study_score = sum(s["priority_score"] for s in subject_priorities) or 1.0
    study_weights = [{**s, "weight": s["priority_score"] / total_study_score} for s in subject_priorities]

    schedule_rows = []
    carryover_assign = 0.0
    carryover_lab = 0.0

    for slot in day_slots:
        avail = slot["available_hours"]
        if avail <= 0:
            continue
        day_label = slot["day_label"]
        day_date = str(slot["date"])

        urgent_assign = sum(t["hours_remaining"] for t in aqueue if t["deadline_days"] <= URGENCY_OVERRIDE_DAYS and t["hours_remaining"] > 0)
        urgent_lab = sum(t["hours_remaining"] for t in lqueue if t["deadline_days"] <= URGENCY_OVERRIDE_DAYS and t["hours_remaining"] > 0)

        if urgent_assign + urgent_lab > 0:
            assign_alloc = min(urgent_assign, avail)
            lab_alloc = min(urgent_lab, avail - assign_alloc)
            study_alloc = max(0.0, avail - assign_alloc - lab_alloc)
        else:
            assign_alloc = round(avail * CAP_ASSIGNMENT + carryover_assign, 4)
            lab_alloc = round(avail * CAP_LAB + carryover_lab, 4)
            study_alloc = round(avail - (avail * CAP_ASSIGNMENT) - (avail * CAP_LAB), 4)
            carryover_assign = 0.0
            carryover_lab = 0.0

        remaining_assign = assign_alloc
        for t in aqueue:
            if remaining_assign <= 0.01 or t["hours_remaining"] <= 0:
                continue
            give = min(t["hours_remaining"], remaining_assign)
            if give < 0.01:
                continue
            schedule_rows.append({"day": day_label, "date": day_date, "task_type": "Assignment",
                                   "subject": t.get("subject", t["task_name"]), "task_name": t["task_name"],
                                   "allocated_hours": round(give, 2), "deadline": t["deadline_date"],
                                   "urgency_label": t["urgency_label"]})
            t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
            remaining_assign = round(remaining_assign - give, 4)
        carryover_assign = round(carryover_assign + remaining_assign, 4)

        remaining_lab = lab_alloc
        for t in lqueue:
            if remaining_lab <= 0.01 or t["hours_remaining"] <= 0:
                continue
            give = min(t["hours_remaining"], remaining_lab)
            if give < 0.01:
                continue
            schedule_rows.append({"day": day_label, "date": day_date, "task_type": "Lab",
                                   "subject": t.get("subject", t["task_name"]), "task_name": t["task_name"],
                                   "allocated_hours": round(give, 2), "deadline": t["deadline_date"],
                                   "urgency_label": t["urgency_label"]})
            t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
            remaining_lab = round(remaining_lab - give, 4)
        carryover_lab = round(carryover_lab + remaining_lab, 4)

        _allocate_study(study_alloc, study_weights, day_label, day_date, schedule_rows)

        for t in aqueue + lqueue:
            t["deadline_days"] = max(0, t["deadline_days"] - 1)

    return schedule_rows