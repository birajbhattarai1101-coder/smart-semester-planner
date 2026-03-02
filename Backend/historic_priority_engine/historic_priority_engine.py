import os
import pandas as pd
from experta import KnowledgeEngine, Fact, Rule, Field, MATCH, AS, NOT

class SubjectFact(Fact):
    subject = Field(str, mandatory=True)
    avg_failure_rate = Field(float, mandatory=True)
    coverage_percentage = Field(float, mandatory=True)

class PriorityResult(Fact):
    subject = Field(str, mandatory=True)
    priority_label = Field(str, mandatory=True)
    priority_score = Field(float, mandatory=True)
    avg_failure_rate = Field(float, mandatory=True)
    coverage_percentage = Field(float, mandatory=True)

class HistoricPriorityEngine(KnowledgeEngine):
    @Rule(AS.f << SubjectFact(subject=MATCH.subject,
                               avg_failure_rate=MATCH.afr,
                               coverage_percentage=MATCH.cov),
          NOT(PriorityResult(subject=MATCH.subject)))
    def classify_priority(self, f, subject, afr, cov):
        ws = round(afr + (100 - cov), 4)
        if ws >= 130:
            label = "HIGH"
        elif ws >= 90:
            label = "MEDIUM"
        else:
            label = "LOW"
        self.declare(PriorityResult(
            subject=subject, priority_label=label,
            priority_score=ws,
            avg_failure_rate=round(afr, 4),
            coverage_percentage=round(cov, 4)))

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "utils", "data", "historic_failure_rates.csv")

def load_csv(csv_path):
    df = pd.read_csv(csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    return df.groupby("subject")["failure_rate"].mean().reset_index().rename(columns={"failure_rate": "avg_failure_rate"})

def run_historic_priority_engine(coverage_map, csv_path=None):
    avg_df = load_csv(csv_path or DEFAULT_CSV_PATH)
    engine = HistoricPriorityEngine()
    engine.reset()
    for _, row in avg_df.iterrows():
        subj = row["subject"]
        cov = float(coverage_map.get(subj, 50))
        engine.declare(SubjectFact(
            subject=subj,
            avg_failure_rate=float(row["avg_failure_rate"]),
            coverage_percentage=cov))
    engine.run()
    results = []
    for fact in engine.facts.values():
        if isinstance(fact, PriorityResult):
            results.append({
                "subject": fact["subject"],
                "priority_label": fact["priority_label"],
                "priority_score": fact["priority_score"],
                "avg_failure_rate": fact["avg_failure_rate"],
                "coverage_percentage": fact["coverage_percentage"]})
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results
