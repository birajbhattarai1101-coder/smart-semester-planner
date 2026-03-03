import urllib.request, urllib.error, json, os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
from datetime import date

# Load from environment variables (set in .env or Render dashboard)
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
FROM_EMAIL    = os.environ.get("FROM_EMAIL", "justcode50@gmail.com")
FROM_NAME     = "Smart Semester Planner"

def _send(to_email, subject, html_body):
    try:
        payload = json.dumps({
            "sender":      {"name": FROM_NAME, "email": FROM_EMAIL},
            "to":          [{"email": to_email}],
            "subject":     subject,
            "htmlContent": html_body
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.brevo.com/v3/smtp/email",
            data=payload,
            headers={
                "accept":       "application/json",
                "api-key":      BREVO_API_KEY,
                "content-type": "application/json"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            return {"sent": True, "to": to_email, "subject": subject, "messageId": result.get("messageId","")}
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return {"sent": False, "to": to_email, "error": body}
    except Exception as e:
        return {"sent": False, "to": to_email, "error": str(e)}

def _wrap(content):
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{{margin:0;padding:0;background:#FAF6EF;font-family:Georgia,serif;color:#2C1F14}}
.outer{{max-width:620px;margin:0 auto;background:#FAF6EF;padding:0 0 40px}}
.header{{background:#5C4433;padding:32px 40px;text-align:center}}
.header h1{{margin:0;color:#FAF6EF;font-size:22px;font-weight:400;letter-spacing:2px}}
.header p{{margin:6px 0 0;color:#C9A96E;font-size:12px;letter-spacing:3px;text-transform:uppercase}}
.body{{background:#FFFDF9;margin:0 20px;border:1px solid #E8D9C5;padding:32px 36px}}
.greeting{{font-size:20px;color:#5C4433;margin-bottom:8px;font-style:italic}}
.lead{{font-size:14px;color:#8B6F4E;margin-bottom:24px;line-height:1.7}}
table{{width:100%;border-collapse:collapse;margin:16px 0}}
th{{background:#F2EBE0;color:#5C4433;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:10px 12px;text-align:left;border-bottom:2px solid #E8D9C5}}
td{{padding:10px 12px;border-bottom:1px solid #F2EBE0;font-size:13px;color:#4A3728}}
.badge{{display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px}}
.badge-a{{background:#EEEEE8;color:#5C6340;border:1px solid #C8CC9E}}
.badge-l{{background:#EAE8F0;color:#3D3A5C;border:1px solid #9E9ECC}}
.badge-s{{background:#F0EAE8;color:#5C3A35;border:1px solid #CC9E9E}}
.high{{color:#8B2E2E;font-weight:bold}}
.medium{{color:#7A6528}}
.low{{color:#3A6528}}
.alert-box{{background:#FDF0EE;border-left:4px solid #C97B6E;padding:14px 18px;margin-bottom:20px;border-radius:2px;font-size:13px;color:#5C3A35}}
.ornament{{text-align:center;color:#C9A96E;font-size:18px;letter-spacing:8px;margin:20px 0;opacity:.6}}
.footer{{text-align:center;margin-top:24px;font-size:11px;color:#D4BC9E;letter-spacing:2px;text-transform:uppercase}}
</style></head><body>
<div class="outer">
  <div class="header"><h1>Smart Semester Planner</h1><p>Academic Intelligence</p></div>
  <div class="body">{content}<div class="ornament">--- * ---</div></div>
  <div class="footer">Smart Semester Planner - AI-Powered Study Scheduling</div>
</div></body></html>"""

def send_deadline_alert(to_email, username, urgent_tasks):
    if not urgent_tasks:
        return {"sent": False, "reason": "No urgent tasks."}
    rows = ""
    for t in urgent_tasks:
        days = t.get("deadline_days_from_today", 0)
        urgency_cls  = "high" if days <= 1 else "medium"
        urgency_text = "DUE TODAY" if days == 0 else f"Due in {days} day{'s' if days!=1 else ''}"
        badge_cls    = "badge-a" if t["task_type"] == "Assignment" else "badge-l"
        rows += f"<tr><td>{t['task_name']}</td><td><span class='badge {badge_cls}'>{t['task_type']}</span></td><td>{t.get('subject','General')}</td><td>{t['difficulty']}</td><td class='{urgency_cls}'><strong>{urgency_text}</strong></td><td>{t['deadline']}</td></tr>"
    content = f"""<p class="greeting">Hello, {username}</p>
    <p class="lead">You have <strong>{len(urgent_tasks)}</strong> task(s) due within 2 days.</p>
    <div class="alert-box"><strong>Urgent Attention Required</strong> - deadline(s) approaching!</div>
    <table><thead><tr><th>Task</th><th>Type</th><th>Subject</th><th>Difficulty</th><th>Urgency</th><th>Deadline</th></tr></thead><tbody>{rows}</tbody></table>"""
    return _send(to_email, f"Deadline Alert - {len(urgent_tasks)} Task(s) Due Soon", _wrap(content))

def send_daily_reminder(to_email, username, todays_tasks, total_hours):
    today_str = date.today().strftime("%A, %d %B %Y")
    if not todays_tasks:
        content = f'<p class="greeting">Good morning, {username}</p><p class="lead">Today is <strong>{today_str}</strong>. No tasks scheduled today - enjoy the rest!</p>'
    else:
        rows = ""
        for t in todays_tasks:
            badge_cls = "badge-a" if t["task_type"]=="Assignment" else ("badge-l" if t["task_type"]=="Lab" else "badge-s")
            pri_cls   = "high" if t.get("urgency_label") in ("HIGH","CRITICAL") else ("medium" if t.get("urgency_label")=="MEDIUM" else "low")
            rows += f"<tr><td>{t['task_name']}</td><td><span class='badge {badge_cls}'>{t['task_type']}</span></td><td>{t.get('subject','')}</td><td style='text-align:right'><strong>{t['allocated_hours']}h</strong></td><td class='{pri_cls}'>{t.get('urgency_label','')}</td></tr>"
        content = f"""<p class="greeting">Good morning, {username}</p>
        <p class="lead">Today is <strong>{today_str}</strong>. Your plan: <strong>{total_hours:.1f} hours</strong> across <strong>{len(todays_tasks)}</strong> task(s).</p>
        <table><thead><tr><th>Task</th><th>Type</th><th>Subject</th><th style="text-align:right">Hours</th><th>Priority</th></tr></thead><tbody>{rows}</tbody></table>
        <p style="font-size:13px;color:#8B6F4E;margin-top:20px">Stay consistent - small daily effort compounds into great results!</p>"""
    return _send(to_email, f"Your Study Plan for {today_str}", _wrap(content))

def send_weekly_summary(to_email, username, schedule, subject_priorities):
    if not schedule:
        return {"sent": False, "reason": "Empty schedule."}
    days = {}
    for row in schedule:
        days.setdefault(row["day"], []).append(row)
    day_rows = ""
    for day, tasks in days.items():
        day_total = sum(t["allocated_hours"] for t in tasks)
        inner = ""
        for t in tasks:
            badge_cls = "badge-a" if t["task_type"]=="Assignment" else ("badge-l" if t["task_type"]=="Lab" else "badge-s")
            inner += f"<tr><td style='padding-left:24px;color:#8B6F4E'>{t['task_name']}</td><td><span class='badge {badge_cls}'>{t['task_type']}</span></td><td>{t.get('subject','')}</td><td style='text-align:right'>{t['allocated_hours']}h</td><td>{t.get('deadline','')}</td></tr>"
        day_rows += f"<tr style='background:#F2EBE0'><td colspan='5' style='padding:8px 12px;font-weight:bold;color:#5C4433'>{day} - {day_total:.1f}h total</td></tr>{inner}"
    pri_rows = ""
    for p in subject_priorities:
        pri_cls = "high" if p["priority_label"]=="HIGH" else ("medium" if p["priority_label"]=="MEDIUM" else "low")
        pri_rows += f"<tr><td>{p['subject']}</td><td style='text-align:right'>{p['priority_score']:.1f}</td><td class='{pri_cls}'><strong>{p['priority_label']}</strong></td><td>{p['coverage_percentage']}% covered</td></tr>"
    total_hours = sum(t["allocated_hours"] for t in schedule)
    week_start  = date.today().strftime("%d %B %Y")
    content = f"""<p class="greeting">Weekly Summary for {username}</p>
    <p class="lead">Your 7-day schedule starting <strong>{week_start}</strong>. Total: <strong>{total_hours:.1f} hours</strong>.</p>
    <p style="font-size:13px;font-weight:bold;color:#5C4433;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Subject Priority Analysis</p>
    <table><thead><tr><th>Subject</th><th style="text-align:right">Score</th><th>Priority</th><th>Coverage</th></tr></thead><tbody>{pri_rows}</tbody></table>
    <p style="font-size:13px;font-weight:bold;color:#5C4433;text-transform:uppercase;letter-spacing:1px;margin:24px 0 8px">7-Day Schedule</p>
    <table><thead><tr><th>Task</th><th>Type</th><th>Subject</th><th style="text-align:right">Hours</th><th>Deadline</th></tr></thead><tbody>{day_rows}</tbody></table>"""
    return _send(to_email, f"Your Weekly Study Schedule - w/c {week_start}", _wrap(content))
