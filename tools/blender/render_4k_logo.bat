@echo off
rem Dream Labs - render 4K video "logo" (bam dup chuot vao file nay). Chay tiep duoc neu bi ngat.
chcp 65001 >nul
cd /d "%~dp0..\.."
set "BL="
for /d %%D in ("%ProgramFiles%\Blender Foundation\Blender*") do if exist "%%D\blender.exe" set "BL=%%D\blender.exe"
if not defined BL (
  echo Khong tim thay Blender trong "%ProgramFiles%\Blender Foundation". Hay cai Blender tu blender.org roi chay lai.
  pause & exit /b 1
)
echo Dang dung: %BL%
"%BL%" -b -P tools\blender\dl_logo.py -- --4k %*
echo.
echo Xong. File ket qua nam trong thu muc tools\blender\out\dl_logo
pause
