@'
@echo off
echo Starting Smart Semester Planner...

start "Backend" cmd /k "cd /d C:\Users\User\OneDrive\Desktop\CLAUDE_AI__Study_Planer\Backend && .venv\Scripts\activate && python app.py"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d C:\Users\User\OneDrive\Desktop\CLAUDE_AI__Study_Planer\Frontend && "C:\Program Files\nodejs\npm.cmd" start"

timeout /t 15 /nobreak >nul
start http://localhost:3000
'@ | Set-Content -Path "C:\Users\User\OneDrive\Desktop\CLAUDE_AI__Study_Planer\start.bat" -Encoding ASCII