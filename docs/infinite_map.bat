@echo off
:: Crea las carpetas y subcarpetas
mkdir infinite_map
mkdir infinite_map\classes
mkdir infinite_map\workers
mkdir infinite_map\libs

:: Crea los archivos vacíos
echo. > infinite_map\index.html
echo. > infinite_map\sketch.js
echo. > infinite_map\classes\Cell.js
echo. > infinite_map\classes\Chunk.js
echo. > infinite_map\classes\Grid.js
echo. > infinite_map\classes\LRUCache.js
echo. > infinite_map\classes\Persistence.js
echo. > infinite_map\workers\chunkWorker.js
echo. > infinite_map\libs\dexie.js

:: Mensaje de éxito
echo Estructura de carpetas y archivos generada correctamente.
pause
