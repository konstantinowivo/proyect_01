@echo off
echo ========================================
echo   INICIANDO POSTGRESQL SERVER
echo ========================================
echo.
echo PostgreSQL se esta iniciando...
echo IMPORTANTE: NO CIERRES ESTA VENTANA
echo.
echo El servidor estara corriendo mientras
echo esta ventana permanezca abierta.
echo.
echo ========================================

cd "C:\Program Files\PostgreSQL\18\bin"
postgres.exe -D "C:\Program Files\PostgreSQL\18\data"

echo.
echo PostgreSQL se ha detenido.
pause
