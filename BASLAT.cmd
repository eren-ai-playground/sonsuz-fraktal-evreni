@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if not errorlevel 1 goto check
echo Node.js 22.12 veya uzeri gerekli. Node.js kurup yeniden deneyin.
pause
exit /b 1
:check
if exist "dist\index.html" goto start
echo Derleme bulunamadi. Once "pnpm install --frozen-lockfile" ve "pnpm run build" calistirin.
pause
exit /b 1
:start
echo Sonsuz Fraktal Evreni aciliyor: http://127.0.0.1:5191
echo Durdurmak icin Ctrl+C.
start "" /b cmd /c "ping -n 2 127.0.0.1 >nul & start "" http://127.0.0.1:5191"
node scripts\serve.mjs
pause
