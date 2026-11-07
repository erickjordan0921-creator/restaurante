@echo off
title SINU Control - Lanzador
cd /d "%~dp0"
echo Iniciando SINU Control...
echo.
echo [1/3] API (puerto 5000)
start "SINU API" cmd /k "cd /d "%~dp0api" && venv\Scripts\python.exe app.py"
echo [2/3] Frontend (puerto 5173)
start "SINU Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo [3/3] Abriendo SINU Control en el navegador...
timeout /t 3 /nobreak >nul
start "" "%~dp0SINU CONTROL.html"
echo.
echo Listo. Para apagar el sistema cierre las ventanas "SINU API" y "SINU Frontend".
timeout /t 5 >nul
