# 🚀 Configuración de Supabase - Guía Paso a Paso

## ✅ Checklist Rápido

- [ ] Crear cuenta en Supabase
- [ ] Crear proyecto en Supabase
- [ ] Copiar Connection String
- [ ] Actualizar archivo .env
- [ ] Ejecutar migraciones
- [ ] Ejecutar seed (datos de prueba)
- [ ] Iniciar servidor
- [ ] Probar login

---

## Paso 1: Crear Cuenta en Supabase

1. Ve a: **https://supabase.com**
2. Click en **"Start your project"** o **"Sign up"**
3. Regístrate con:
   - Email/Contraseña
   - O GitHub (más rápido)

---

## Paso 2: Crear Proyecto

1. Una vez dentro, click en **"New project"**
2. Completa el formulario:
   ```
   Name: adm-system
   Database Password: [Crea una contraseña segura y GUÁRDALA]
   Region: South America (São Paulo) - o el más cercano
   Pricing Plan: Free (es suficiente)
   ```
3. Click en **"Create new project"**
4. ⏳ Espera 1-2 minutos (verás una barra de progreso)

---

## Paso 3: Obtener Connection String

Una vez que el proyecto esté listo (la pantalla cambiará):

1. En el menú lateral izquierdo, busca el ícono de **engranaje** ⚙️
2. Click en **"Database"** (en la sección Settings)
3. Scroll hacia abajo hasta encontrar **"Connection string"**
4. Asegúrate de estar en la pestaña **"URI"** (NO "Session mode")
5. Verás algo así:
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```
6. **IMPORTANTE:** Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 2
7. **Copia la URL completa**

**Ejemplo:**
```
Si tu contraseña es: MiPass123!
La URL quedaría:
postgresql://postgres.xxxxxxxxxxxxx:MiPass123!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## Paso 4: Actualizar .env

1. Abre el archivo `.env` en tu proyecto:
   ```
   C:\Users\PC\Desktop\adm_system\.env
   ```

2. Reemplaza la línea `DATABASE_URL` con tu Connection String de Supabase:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```

3. **Guarda el archivo** (Ctrl + S)

---

## Paso 5: Ejecutar Migraciones

Abre tu terminal en el proyecto y ejecuta:

```bash
cd C:\Users\PC\Desktop\adm_system

# Ejecutar migraciones (esto crea las tablas en Supabase)
npx prisma migrate dev --name init
```

Deberías ver:
```
✔ Generated Prisma Client
✔ Migrations applied successfully
```

---

## Paso 6: Poblar con Datos de Prueba (Seed)

```bash
# Ejecutar el seed
npm run prisma:seed
```

Esto creará:
- ✅ 1 usuario administrador (admin@test.com / admin123)
- ✅ 1 edificio de ejemplo (Torre Central)
- ✅ 40 unidades
- ✅ 5 inquilinos de prueba
- ✅ Algunas tareas y avisos

---

## Paso 7: Iniciar el Servidor

```bash
npm run dev
```

Verás:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Paso 8: Probar el Sistema

1. **Abre tu navegador:** http://localhost:3000

2. **Iniciar Sesión:**
   - Click en "Iniciar Sesión"
   - Email: `admin@test.com`
   - Password: `admin123`

3. **Explorar:**
   - Verás el Dashboard con estadísticas
   - En el header verás el edificio "Torre Central"
   - En el sidebar puedes navegar por las secciones

4. **Probar CRUD de Edificios:**
   - Sidebar → Edificios
   - Verás "Torre Central"
   - Prueba crear un nuevo edificio

---

## 🔍 Verificar la Base de Datos con Prisma Studio

Opcionalmente, puedes ver los datos directamente:

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás ver todas las tablas y datos.

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"
- Verifica que la CONNECTION_STRING esté correcta en `.env`
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Verifica que no haya espacios extra al inicio o final

### Error: "Invalid connection string"
- La URL debe empezar con `postgresql://`
- No debe tener espacios
- Debe tener las comillas: `DATABASE_URL="..."`

### Error: "Authentication failed"
- La contraseña en la CONNECTION_STRING debe ser exacta
- Si tiene caracteres especiales (@, #, etc.), puede que necesites URL encoding

### Las migraciones fallan
- Verifica que el proyecto de Supabase esté completamente inicializado
- Espera 1-2 minutos después de crear el proyecto
- Intenta nuevamente: `npx prisma migrate dev --name init`

---

## ✅ Checklist Final

Después de seguir todos los pasos, deberías tener:

- [x] Proyecto de Supabase creado
- [x] Connection String configurada en .env
- [x] Migraciones ejecutadas (tablas creadas)
- [x] Datos de prueba cargados
- [x] Servidor corriendo en localhost:3000
- [x] Login funcionando con admin@test.com

---

## 🎉 ¡Listo!

Tu sistema está completamente funcional y conectado a Supabase.

**Credenciales de prueba:**
- Email: `admin@test.com`
- Password: `admin123`

**Próximos pasos:**
- Explora el dashboard
- Crea nuevos edificios
- Cuando quieras, instalamos PostgreSQL local

---

## 📊 Ver los Datos en Supabase

También puedes ver los datos directamente en Supabase:

1. Ve a tu proyecto en https://supabase.com
2. En el menú lateral, click en **"Table Editor"**
3. Verás todas las tablas: User, Building, Unit, etc.
4. Puedes explorar los datos ahí también

---

**¿Problemas?** Avísame y te ayudo.
