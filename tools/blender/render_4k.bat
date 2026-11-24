@echo off
rem Dream Labs - render ban 4K cho 2 video (bam dup vao file nay, hoac chay trong Command Prompt).
rem Co the chay lai bat cu luc nao: khung hinh da render xong se duoc bo qua (render tiep tu cho dung).
rem Dung:  render_4k.bat            -> ca 2 video, ban ngang 16:9
rem        render_4k.bat doc         -> ca 2 video, ban doc 9:16
rem        render_4k.bat tat-ca      -> ca 4 ban (16:9 va 9:16)
setlocal
cd /d "%~dp0"

set "BLENDER="
where blender >nul 2>nul && set "BLENDER=blender"
if not defined BLENDER (
  for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do set "BLENDER=%%D\blender.exe"
)
if not defined BLENDER (
  echo Khong tim thay Blender. Hay cai Blender 4.2 tro len tu https://www.blender.org/download/
  pause
  exit /b 1
)
echo Dung Blender: "%BLENDER%"

if /i "%1"=="doc" goto doc
"%BLENDER%" -b -P logo.py -- --4k
"%BLENDER%" -b -P collision.py -- --4k
if /i not "%1"=="tat-ca" goto xong
:doc
"%BLENDER%" -b -P logo.py -- --4k --vertical
"%BLENDER%" -b -P collision.py -- --4k --vertical
:xong
echo.
echo Xong. Video nam trong thu muc: %~dp0out
explorer "%~dp0out"
pause
