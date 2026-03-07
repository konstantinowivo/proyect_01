-- Script para cambiar la contraseña del usuario postgres
-- Ejecuta este archivo en SQL Shell (psql) o pgAdmin

ALTER USER postgres WITH PASSWORD 'admin123';

-- Verificar el cambio
SELECT 'Contraseña cambiada exitosamente para el usuario postgres' AS resultado;
