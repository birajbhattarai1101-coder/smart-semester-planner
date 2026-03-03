import os
import pandas as pd
from experta import KnowledgeEngine, Fact, Rule, Field, MATCH, AS, NOT

URGENCY_MAP = {1:(1.00,"CRITICAL"),2:(0.85,"HIGH"),3:(0.70,"HIGH"),
               4:(0.50,"MEDIUM"),5:(0.50,"MEDIUM"),6:(0.30,"LOW"),7:(0.30,"LOW")}

def _urgency(days):
    if days <= 1:
        return 1.00, "CRITICAL"
    return URGENCY_MAP.get(days, (0.10, "LOW"))

class TaskFact(Fact):
    task_name = Field(str, mandatory=True)
    task_type = Field(str, mandatory=True)
    difficulty = Field(str, mandatory=True)
    hours_required = Field(float, mandatory=True)
    deadline_days = Field(int, mandatory=True)

class TaskPriorityResult(Fact):
    task_name = Field(str, mandatory=True)
    task_type = Field(str, mandatory=True)
    difficulty = Field(str, mandatory=True)
    hours_required = Field(float, mandatory=True)
    deadline_days = Field(int, mandatory=True)
    urgency_weight = Field(float, mandatory=True)
    priority_score = Field(float, mandatory=True)
    urgency_label = Field(str, mandatory=True)

class TaskPriorityEngine(KnowledgeEngine):
    @Rule(AS.f << TaskFact(task_name=MATCH.name,
                            task_type=MATCH.ttype,
                            difficulty=MATCH.diff,
                            hours_required=MATCH.hrs,
                            deadline_days=MATCH.days),
          NOT(TaskPriorityResult(task_name=MATCH.name)))
    def compute_priority(self, f, name, ttype, diff, hrs, days):
        uw, ulabel = _urgency(days)
        score = round(hrs * uw * 10, 4)
        self.declare(TaskPriorityResult(
            task_name=name, task_type=ttype, difficulty=diff,
            hours_required=hrs, deadline_days=days,
            urgency_weight=uw, priority_score=score, urgency_label=ulabel))

DEFAULT_ASSIGNMENT_CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "utils", "data", "assignments.csv")
DEFAULT_LAB_CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "utils", "data", "labs.csv")

def _load_tasks(csv_path, task_type):
    df = pd.read_csv(csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    return [{"task_name": str(r["task_name"]), "task_type": task_type,
             "difficulty": str(r["difficulty"]), "hours_required": float(r["hours_required"]),
             "deadline_days": int(r["deadline_days_from_today"])} for _, r in df.iterrows()]

def run_task_priority_engine(assignment_csv=None, lab_csv=None, extra_tasks=None):
    all_tasks = list(extra_tasks) if extra_tasks else []



    engine = TaskPriorityEngine()
    engine.reset()
    for t in all_tasks:
        engine.declare(TaskFact(
            task_name=t["task_name"], task_type=t["task_type"],
            difficulty=t["difficulty"], hours_required=t["hours_required"],
            deadline_days=t["deadline_days"]))
    engine.run()
    results = []
    for fact in engine.facts.values():
        if isinstance(fact, TaskPriorityResult):
            results.append({
                "task_name": fact["task_name"], "task_type": fact["task_type"],
                "difficulty": fact["difficulty"], "hours_required": fact["hours_required"],
                "deadline_days": fact["deadline_days"], "urgency_weight": fact["urgency_weight"],
                "priority_score": fact["priority_score"], "urgency_label": fact["urgency_label"]})
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results
