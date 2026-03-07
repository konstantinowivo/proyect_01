@echo off
echo ================================================
echo CAMBIO DE CONTRASEÑA DE POSTGRESQL
echo ================================================
echo.
echo Este script cambiara la contraseña del usuario postgres a: admin123
echo.
echo PASO 1: Detener el servicio de PostgreSQL...
net stop postgresql-x64-18
if errorlevel 1 (
    echo Error: No se pudo detener el servicio. Ejecuta este script como Administrador.
    pause
    exit /b 1
)

echo.
echo PASO 2: Crear backup del archivo de configuracion...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

echo.
echo PASO 3: Modificar configuracion de autenticacion...
powershell -Command "(Get-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf') -replace 'md5', 'trust' -replace 'scram-sha-256', 'trust' | Set-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'"

echo.
echo PASO 4: Iniciar el servicio de PostgreSQL...
net start postgresql-x64-18

echo.
echo PASO 5: Cambiar la contraseña...
timeout /t 3 /nobreak > nul
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'admin123';"

echo.
echo PASO 6: Restaurar configuracion original...
copy "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup" "C:\Program Files\PostgreSQL\18\data\pg_hba.conf" /Y

echo.
echo PASO 7: Reiniciar el servicio de PostgreSQL...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo ================================================
echo CONTRASEÑA CAMBIADA EXITOSAMENTE!
echo Usuario: postgres
echo Nueva contraseña: admin123
echo ================================================
pause
