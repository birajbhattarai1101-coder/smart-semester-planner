import os, csv

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

HISTORIC_ROWS = [
    (2015,"OS",37.74),(2015,"AI",35.92),(2015,"OOAD",17.83),(2015,"Economics",50.04),
    (2015,"DBMS",30.35),(2015,"Embedded",36.18),(2016,"Embedded",49.95),(2016,"OS",34.03),
    (2016,"AI",50.91),(2016,"Economics",54.22),(2016,"OOAD",23.9),(2016,"DBMS",22.77),
    (2017,"OOAD",29.04),(2017,"DBMS",33.22),(2017,"Economics",53.86),(2017,"AI",46.06),
    (2017,"Embedded",40.49),(2017,"OS",35.58),(2018,"Embedded",36.55),(2018,"OOAD",27.16),
    (2018,"AI",47.26),(2018,"OS",29.62),(2018,"DBMS",32.52),(2018,"Economics",62.14),
    (2019,"AI",42.63),(2019,"Economics",49.33),(2019,"Embedded",37.03),(2019,"OOAD",27.88),
    (2019,"DBMS",26.74),(2019,"OS",42.65),(2020,"Economics",56.52),(2020,"OS",46.96),
    (2020,"OOAD",34.32),(2020,"AI",39.08),(2020,"Embedded",39.56),(2020,"DBMS",36.19),
    (2021,"Economics",52.51),(2021,"OOAD",24.94),(2021,"DBMS",29.78),(2021,"AI",37.14),
    (2021,"OS",32.92),(2021,"Embedded",43.61),(2022,"Embedded",35.39),(2022,"OOAD",22.25),
    (2022,"AI",42.87),(2022,"Economics",50.39),(2022,"OS",36.44),(2022,"DBMS",21.79),
    (2023,"Economics",55.51),(2023,"DBMS",21.38),(2023,"OOAD",31.07),(2023,"Embedded",48.42),
    (2023,"AI",35.76),(2023,"OS",43.1),(2024,"DBMS",32.93),(2024,"Embedded",48.83),
    (2024,"Economics",58.85),(2024,"OS",47.83),(2024,"AI",38.8),(2024,"OOAD",16.24),
]

ASSIGNMENT_ROWS = [
    ("Assignment_Easy_1d","Easy",1.5,1),("Assignment_Medium_1d","Medium",2.0,1),
    ("Assignment_Hard_1d","Hard",3.0,1),("Assignment_Easy_2d","Easy",1.5,2),
    ("Assignment_Medium_2d","Medium",2.0,2),("Assignment_Hard_2d","Hard",3.0,2),
    ("Assignment_Easy_3d","Easy",1.5,3),("Assignment_Medium_3d","Medium",2.0,3),
    ("Assignment_Hard_3d","Hard",3.0,3),("Assignment_Easy_4d","Easy",1.5,4),
    ("Assignment_Medium_4d","Medium",2.0,4),("Assignment_Hard_4d","Hard",3.0,4),
    ("Assignment_Easy_5d","Easy",1.5,5),("Assignment_Medium_5d","Medium",2.0,5),
    ("Assignment_Hard_5d","Hard",3.0,5),("Assignment_Easy_6d","Easy",1.5,6),
    ("Assignment_Medium_6d","Medium",2.0,6),("Assignment_Hard_6d","Hard",3.0,6),
    ("Assignment_Easy_7d","Easy",1.5,7),("Assignment_Medium_7d","Medium",2.0,7),
    ("Assignment_Hard_7d","Hard",3.0,7),
]

LAB_ROWS = [
    ("Lab_Easy_1d","Easy",0.75,1),("Lab_Medium_1d","Medium",1.5,1),
    ("Lab_Hard_1d","Hard",2.0,1),("Lab_Easy_2d","Easy",0.75,2),
    ("Lab_Medium_2d","Medium",1.5,2),("Lab_Hard_2d","Hard",2.0,2),
    ("Lab_Easy_3d","Easy",0.75,3),("Lab_Medium_3d","Medium",1.5,3),
    ("Lab_Hard_3d","Hard",2.0,3),("Lab_Easy_4d","Easy",0.75,4),
    ("Lab_Medium_4d","Medium",1.5,4),("Lab_Hard_4d","Hard",2.0,4),
    ("Lab_Easy_5d","Easy",0.75,5),("Lab_Medium_5d","Medium",1.5,5),
    ("Lab_Hard_5d","Hard",2.0,5),("Lab_Easy_6d","Easy",0.75,6),
    ("Lab_Medium_6d","Medium",1.5,6),("Lab_Hard_6d","Hard",2.0,6),
    ("Lab_Easy_7d","Easy",0.75,7),("Lab_Medium_7d","Medium",1.5,7),
    ("Lab_Hard_7d","Hard",2.0,7),
]

def _write(path, header, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"[CSV] Written: {path}")

def generate_all_csvs():
    os.makedirs(DATA_DIR, exist_ok=True)
    _write(os.path.join(DATA_DIR,"historic_failure_rates.csv"),
           ["year","subject","failure_rate"], HISTORIC_ROWS)
    _write(os.path.join(DATA_DIR,"assignments.csv"),
           ["task_name","difficulty","hours_required","deadline_days_from_today"], ASSIGNMENT_ROWS)
    _write(os.path.join(DATA_DIR,"labs.csv"),
           ["task_name","difficulty","hours_required","deadline_days_from_today"], LAB_ROWS)
    print("[CSV] All CSV files generated.")

if __name__ == "__main__":
    generate_all_csvs()
