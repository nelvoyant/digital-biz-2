@echo off
set PORT_NUMBER=5173

REM Find the process ID using the port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT_NUMBER%') do set PID=%%a

REM If no process found, inform and exit
if "%PID%"=="" (
    echo Port %PORT_NUMBER% is already free.
    goto :end
)

REM Kill the process using that PID
echo Found process %PID% using port %PORT_NUMBER%. Terminating...
taskkill /F /PID %PID%

:end
pause
