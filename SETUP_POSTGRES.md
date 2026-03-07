# Guía de Configuración de PostgreSQL

## 📋 Pasos a seguir cuando PostgreSQL esté instalado

### 1️⃣ Verificar instalación de PostgreSQL

Abre una terminal y ejecuta:

```bash
psql --version
```

Deberías ver algo como: `psql (PostgreSQL) 16.x`

---

### 2️⃣ Iniciar el servicio de PostgreSQL

**En Windows:**
- Busca "Servicios" en el menú inicio
- Busca "postgresql-x64-16" (o la versión que instalaste)
- Click derecho → Iniciar
- O desde la terminal como administrador:
  ```cmd
  net start postgresql-x64-16
  ```

---

### 3️⃣ Crear la base de datos

Abre `pgAdmin` (viene con PostgreSQL) o usa la terminal:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos (dentro de psql)
CREATE DATABASE adm_system;

# Verificar que se creó
\l

# Salir
\q
```

---

### 4️⃣ Configurar las variables de entorno

Tu archivo `.env` ya está configurado. Solo verifica que tenga:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/adm_system?schema=public"
```

**IMPORTANTE:** Cambia `password` por la contraseña que pusiste durante la instalación de PostgreSQL.

---

### 5️⃣ Ejecutar migraciones de Prisma

Desde la terminal del proyecto:

```bash
# Generar Prisma Client
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init
```

Esto creará todas las tablas en la base de datos.

---

### 6️⃣ Poblar la base de datos con datos de prueba

```bash
npm run prisma:seed
```

Esto creará:
- 1 usuario administrador: `admin@test.com` / `admin123`
- 1 edificio con 40 unidades
- 5 inquilinos de prueba
- Avisos y tareas de ejemplo

---

### 7️⃣ Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará en: http://localhost:3000

---

## 🧪 Probar la autenticación

### Opción 1: Usuario Administrador
- Email: `admin@test.com`
- Password: `admin123`
- Acceso: Dashboard administrativo completo

### Opción 2: Usuario Inquilino
- Email: `inquilino1@test.com` (hasta inquilino5@test.com)
- Password: `admin123`
- Acceso: Dashboard de inquilino

### Opción 3: Crear usuario nuevo
1. Ve a http://localhost:3000/register
2. Crea una cuenta nueva
3. Elige el rol (ADMIN o TENANT)

---

## 🔍 Herramientas útiles

### Prisma Studio (GUI para ver la DB)
```bash
npx prisma studio
```

Abre en: http://localhost:5555

### Ver logs de Prisma
Los queries SQL aparecen en la consola cuando el servidor está corriendo (solo en desarrollo).

---

## ⚠️ Problemas comunes

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo
- Verifica el puerto (5432 por defecto)
- Verifica usuario/password en `.env`

### Error: "Database does not exist"
- Crea la base de datos: `CREATE DATABASE adm_system;`

### Error: "Role does not exist"
- Usa el usuario `postgres` que se crea por defecto
- O crea un usuario nuevo en PostgreSQL

---

## 📚 Comandos útiles de Prisma

```bash
# Ver el estado de las migraciones
npx prisma migrate status

# Reset de la base de datos (CUIDADO: borra todo)
npx prisma migrate reset

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Formatear el schema
npx prisma format
```

---

## 🎯 Siguiente paso

Una vez completados todos estos pasos, puedes continuar con:
- Implementación del dashboard administrativo
- Sistema de avisos/notificaciones
- Gestión de inquilinos
- Control de pagos

**¿Algún problema? Avísame y te ayudo a resolverlo!**
