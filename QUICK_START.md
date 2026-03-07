# ⚡ Guía Rápida de Inicio

## 🎯 Cuando PostgreSQL esté instalado

### Opción A: Configuración Automática (Recomendado)

Ejecuta este comando que hace todo automáticamente:

```bash
# Windows PowerShell (ejecutar como Administrador)
psql -U postgres -c "CREATE DATABASE adm_system;" && npx prisma migrate dev --name init && npm run prisma:seed && npm run dev
```

### Opción B: Paso a Paso

#### 1. Verificar PostgreSQL
```bash
node verify-postgres.js
```

#### 2. Crear base de datos (si no existe)
```bash
# Opción 1: Desde psql
psql -U postgres
CREATE DATABASE adm_system;
\q

# Opción 2: Una sola línea
psql -U postgres -c "CREATE DATABASE adm_system;"
```

#### 3. Configurar .env
Asegúrate de que tu archivo `.env` tenga la contraseña correcta:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/adm_system?schema=public"
```

Reemplaza `TU_PASSWORD` con la contraseña que pusiste al instalar PostgreSQL.

#### 4. Ejecutar migraciones
```bash
npx prisma migrate dev --name init
```

Esto creará todas las tablas en la base de datos.

#### 5. Poblar con datos de prueba
```bash
npm run prisma:seed
```

Esto creará:
- Usuario admin: `admin@test.com` / `admin123`
- 1 edificio con 40 unidades
- 5 inquilinos de prueba
- Avisos y tareas de ejemplo

#### 6. Iniciar servidor
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 🔑 Credenciales de Prueba

### Administrador
- Email: `admin@test.com`
- Password: `admin123`
- Dashboard: http://localhost:3000/admin

### Inquilinos
- Email: `inquilino1@test.com` (hasta `inquilino5@test.com`)
- Password: `admin123`
- Dashboard: http://localhost:3000/tenant

---

## 🛠️ Comandos Útiles

```bash
# Ver base de datos en interfaz gráfica
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status

# Reset completo (CUIDADO: borra todo)
npx prisma migrate reset

# Regenerar Prisma Client
npx prisma generate

# Ver logs en consola
npm run dev
```

---

## ⚠️ Problemas Comunes

### Error: "Can't reach database server"
**Solución:**
1. Verifica que PostgreSQL esté corriendo:
   - Windows: Servicios → postgresql-x64-16 → Estado: Iniciado
2. Verifica la contraseña en `.env`
3. Verifica el puerto (5432 por defecto)

### Error: "Database does not exist"
**Solución:**
```bash
psql -U postgres -c "CREATE DATABASE adm_system;"
```

### Error: "EPERM: operation not permitted"
**Solución:**
- Cierra VSCode u otros editores
- Ejecuta la terminal como Administrador
- Intenta de nuevo

### Error: "Prisma Client not found"
**Solución:**
```bash
npx prisma generate
```

---

## 📊 Verificar que todo funciona

1. ✅ PostgreSQL instalado y corriendo
2. ✅ Base de datos `adm_system` creada
3. ✅ Migraciones ejecutadas (tablas creadas)
4. ✅ Datos de prueba cargados (seed)
5. ✅ Servidor corriendo en http://localhost:3000
6. ✅ Login funciona con `admin@test.com` / `admin123`
7. ✅ Dashboard se muestra correctamente

---

## 🎉 ¡Listo!

Si completaste todos los pasos, el sistema está funcionando.

**Próximos pasos:**
- Explorar el dashboard
- Crear nuevos edificios
- Agregar inquilinos
- Probar el sistema de avisos

**¿Necesitas ayuda?** Revisa:
- `SETUP_POSTGRES.md` - Guía detallada de PostgreSQL
- `AUTH_IMPLEMENTATION.md` - Documentación del sistema de auth
- `README.md` - Documentación general del proyecto
