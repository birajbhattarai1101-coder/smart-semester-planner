import datetime
from collections import defaultdict

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

    # ----------------------------------------------------------------
    # COLLISION DETECTION
    # Group tasks by deadline_days. Eligible days = day indices 0..(deadline_days-1)
    # i.e. exclude the due date itself — user works day BEFORE due date
    # ----------------------------------------------------------------
    def get_eligible_indices(deadline_days):
        """Days from today up to but NOT including the due date."""
        end = min(deadline_days, 7)  # don't go beyond our 7-day window
        return list(range(0, end))   # excludes deadline day itself

    def get_eligible_hours(deadline_days):
        idxs = get_eligible_indices(deadline_days)
        return sum(day_remaining[i] for i in idxs)

    # Filter out tasks whose deadline has already passed (skip entirely)
    task_queue = [t for t in task_queue if t["deadline_days"] > 0]

    # Group tasks that share the same deadline_days value
    deadline_groups = defaultdict(list)
    for t in task_queue:
        deadline_groups[t["deadline_days"]].append(t)

    # Identify collision groups: 2+ tasks, same deadline, eligible hours < total needed
    collision_deadlines = set()
    for dl, group in deadline_groups.items():
        if len(group) < 2:
            continue
        eligible_idxs = get_eligible_indices(dl)
        if not eligible_idxs:
            # Due today or past — flag all as no-time
            collision_deadlines.add(dl)
            continue
        total_needed = sum(t["hours_required"] for t in group)
        total_avail = sum(day_remaining[i] for i in eligible_idxs)
        if total_avail < total_needed:
            collision_deadlines.add(dl)

    # ----------------------------------------------------------------
    # COLLISION HANDLER — proportional split across eligible days
    # ----------------------------------------------------------------
    def handle_collision_group(group, deadline_days):
        eligible_idxs = get_eligible_indices(deadline_days)

        # Total available hours across eligible days
        total_avail = round(sum(day_remaining[i] for i in eligible_idxs), 4)
        total_needed = round(sum(t["hours_required"] for t in group), 4)

        if total_avail <= 0:
            # No time at all — flag everything
            for t in group:
                schedule_rows.append({
                    "day": day_slots[0]["day_label"], "date": str(day_slots[0]["date"]),
                    "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                    "task_name": t["task_name"] + " ⚠️ NO TIME AVAILABLE BEFORE DEADLINE",
                    "allocated_hours": 0.0, "deadline": t["deadline_date"],
                    "urgency_label": t["urgency_label"]
                })
            return

        compressed = total_avail < total_needed

        # Proportional allocation per task based on original hours_required ratio
        total_hours_sum = sum(t["hours_required"] for t in group)
        task_alloc = {}
        allocated_so_far = 0.0
        for idx, t in enumerate(group):
            if idx == len(group) - 1:
                # Last task gets remainder to ensure zero waste
                task_alloc[id(t)] = round(total_avail - allocated_so_far, 4)
            else:
                share = round((t["hours_required"] / total_hours_sum) * total_avail, 4)
                task_alloc[id(t)] = share
                allocated_so_far = round(allocated_so_far + share, 4)

        # Now spread each task's allocation across eligible days
        for t in group:
            hrs_to_place = task_alloc[id(t)]
            caution = (
                f" ⚠️ Compressed ({round(total_avail,1)}h available, "
                f"{round(total_needed,1)}h needed) — plan extra personal time"
                if compressed else ""
            )
            task_name_label = t["task_name"] + caution

            for i in eligible_idxs:
                if hrs_to_place <= 0.01:
                    break
                if day_remaining[i] <= 0.01:
                    continue
                give = min(hrs_to_place, day_remaining[i])
                give = round(give, 2)
                if give < 0.01:
                    continue
                schedule_rows.append({
                    "day": day_slots[i]["day_label"], "date": str(day_slots[i]["date"]),
                    "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                    "task_name": task_name_label,
                    "allocated_hours": give,
                    "deadline": t["deadline_date"],
                    "urgency_label": t["urgency_label"]
                })
                hrs_to_place = round(hrs_to_place - give, 4)
                day_remaining[i] = round(day_remaining[i] - give, 4)
                t["hours_remaining"] = round(t["hours_remaining"] - give, 4)

    # Process collision groups first (highest priority — soonest deadline)
    for dl in sorted(collision_deadlines):
        group = sorted(deadline_groups[dl],
                       key=lambda x: (URGENCY_ORDER.get(x["urgency_label"], 3), -x["priority_score"]))
        handle_collision_group(group, dl)

    # Mark collision tasks as done so normal scheduler skips them
    collision_task_ids = set()
    for dl in collision_deadlines:
        for t in deadline_groups[dl]:
            collision_task_ids.add(id(t))

    # ----------------------------------------------------------------
    # NORMAL SCHEDULER — for non-collision tasks
    # ----------------------------------------------------------------
    def schedule_tasks(queue):
        for t in queue:
            if id(t) in collision_task_ids:
                continue  # already handled
            days_left = t["deadline_days"]
            cap_ratio = cap_map.get(t["task_type"], 0.45)
            is_critical = t["urgency_label"] in ("CRITICAL", "HIGH")

            # Eligible = days before deadline (exclude due date itself)
            eligible_end = min(days_left, 7)
            eligible = [(i, day_slots[i], day_remaining[i])
                        for i in range(0, eligible_end)
                        if day_remaining[i] > 0.05]

            # If only 1 task with deadline tomorrow, use today only
            if not eligible and days_left <= URGENCY_OVERRIDE_DAYS:
                eligible = [(i, day_slots[i], day_remaining[i])
                            for i in range(0, min(1, 7))
                            if day_remaining[i] > 0.05]

            if not eligible:
                continue

            total_avail = sum(r for _, _, r in eligible)
            not_enough = total_avail < t["hours_remaining"]

            if days_left <= URGENCY_OVERRIDE_DAYS:
                # Urgent single task — dump into eligible days
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01: break
                    give = min(t["hours_remaining"], day_remaining[i])
                    if give < 0.01: continue
                    label = t["task_name"] + (" ⚠️ NOT ENOUGH HOURS — plan extra personal time" if not_enough else "")
                    schedule_rows.append({
                        "day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                        "task_name": label, "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"], "urgency_label": t["urgency_label"]
                    })
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)
            else:
                # Normal spread across eligible days with cap
                for i, slot, _ in eligible:
                    if t["hours_remaining"] <= 0.01: break
                    day_orig = slot["available_hours"]
                    daily_cap = round(day_orig * cap_ratio, 4)
                    give = min(t["hours_remaining"], day_remaining[i], daily_cap)
                    if give < 0.5 and not is_critical: continue
                    if give < 0.05: continue
                    schedule_rows.append({
                        "day": slot["day_label"], "date": str(slot["date"]),
                        "task_type": t["task_type"], "subject": t.get("subject", t["task_name"]),
                        "task_name": t["task_name"], "allocated_hours": round(give, 2),
                        "deadline": t["deadline_date"], "urgency_label": t["urgency_label"]
                    })
                    t["hours_remaining"] = round(t["hours_remaining"] - give, 4)
                    day_remaining[i] = round(day_remaining[i] - give, 4)

    schedule_tasks(task_queue)

    # ----------------------------------------------------------------
    # STUDY TIME — all leftover hours
    # ----------------------------------------------------------------
    total_study_budget = round(sum(day_remaining), 2)
    if total_study_budget < 0.05 or not subject_priorities:
        return schedule_rows

    daily_cap = _get_daily_cap(total_study_budget, total_week_hours)

    def distribute_to_subjects(budget, subjects):
        alloc = {s["subject"]: 0.0 for s in subjects}
        remaining = budget
        for s in subjects:
            if remaining >= STUDY_MIN_WEEK:
                alloc[s["subject"]] = STUDY_MIN_WEEK
                remaining = round(remaining - STUDY_MIN_WEEK, 4)
        if remaining > 0.01:
            total_score = sum(s["priority_score"] for s in subjects) or 1.0
            for s in subjects:
                if remaining <= 0.01: break
                extra = round(remaining * (s["priority_score"] / total_score), 2)
                give = min(extra, remaining)
                alloc[s["subject"]] = round(alloc[s["subject"]] + give, 2)
                remaining = round(remaining - give, 4)
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
        if after >= before - 0.01:
            break

    return schedule_rows
