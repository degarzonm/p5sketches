@echo off
setlocal enabledelayedexpansion

rem Function to recursively print folder structure
call :print_tree "%~dp0" 0

goto :eof

:print_tree
set "indentation="
for /L %%i in (1,1,%2) do set "indentation=!indentation!|   "

for /d %%d in ("%~1\*") do (
    echo !indentation!|--- %%~nxd
    call :print_tree "%%d" %((%2)+1)
)

for %%f in ("%~1\*.*") do (
    if not "%%~nxf"=="" echo !indentation!|--- %%~nxf
)

goto :eof
