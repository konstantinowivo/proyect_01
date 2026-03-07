# Guía de Inicio - Sistema de Gestión de Edificios

## ✅ Lo que hemos completado

1. ✅ **Modelo de datos completo** con Prisma
   - 11 entidades definidas
   - Relaciones establecidas
   - Enums configurados
   - Índices optimizados

2. ✅ **Tipos TypeScript** compartidos
   - Interfaces para todas las entidades
   - Tipos para requests/responses de API
   - Tipos extendidos con relaciones
   - Tipos para filtros y paginación

3. ✅ **Arquitectura del proyecto** documentada
   - Estructura de carpetas definida
   - Flujos de datos establecidos
   - Separación de concerns
   - Decisiones arquitectónicas documentadas

4. ✅ **Configuraciones base**
   - `prisma/schema.prisma`
   - `tsconfig.json`
   - `next.config.js`
   - `tailwind.config.ts`
   - `package.json`
   - `.gitignore`

---

## 🚀 Próximos Pasos para Inicializar el Proyecto

### Paso 1: Instalar Dependencias

```bash
cd C:\Users\PC\Desktop\adm_system
npm install
```

### Paso 2: Configurar Base de Datos PostgreSQL

#### Opción A: PostgreSQL Local

1. Instalar PostgreSQL desde: https://www.postgresql.org/download/
2. Crear la base de datos:

```bash
# Abrir psql
psql -U postgres

# Crear base de datos
CREATE DATABASE adm_system;

# Salir de psql
\q
```

#### Opción B: PostgreSQL con Docker

```bash
docker run --name adm-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=adm_system \
  -p 5432:5432 \
  -d postgres:15
```

#### Opción C: Usar servicio cloud (Supabase, Railway, Neon)

- **Supabase**: https://supabase.com (gratis)
- **Railway**: https://railway.app (gratis)
- **Neon**: https://neon.tech (gratis)

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` y configurar:

```env
# Para PostgreSQL local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/adm_system?schema=public"

# Para PostgreSQL con Docker:
DATABASE_URL="postgresql://postgres:password@localhost:5432/adm_system?schema=public"

# Para servicio cloud (ejemplo Supabase):
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="genera-una-clave-secreta-aqui"  # Puedes usar: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

NODE_ENV="development"
```

### Paso 4: Ejecutar Migraciones de Prisma

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones (crea las tablas)
npx prisma migrate dev --name init
```

### Paso 5: (Opcional) Poblar con Datos de Prueba

Crear archivo `prisma/seed.ts`:

```typescript
import { Prisma, UserRole, UnitStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin Principal',
      phone: '+54 11 1234-5678',
      role: UserRole.ADMIN,
    },
  });

  // Crear edificio
  const building = await prisma.building.create({
    data: {
      name: 'Torre Central',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      state: 'CABA',
      zipCode: '1043',
      floors: 10,
      totalUnits: 40,
      adminId: admin.id,
    },
  });

  // Crear unidades
  for (let floor = 1; floor <= 10; floor++) {
    for (let unit of ['A', 'B', 'C', 'D']) {
      await prisma.unit.create({
        data: {
          buildingId: building.id,
          number: `${floor}${unit}`,
          floor: floor,
          size: 45 + Math.random() * 30,
          status: UnitStatus.VACANT,
        },
      });
    }
  }

  console.log('✅ Base de datos poblada con datos de prueba');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Ejecutar el seed:

```bash
npx prisma db seed
```

### Paso 6: Verificar con Prisma Studio

```bash
npx prisma studio
```

Esto abre una interfaz web en `http://localhost:5555` donde puedes ver y editar los datos.

---

## 🏗️ Desarrollo: Crear la Estructura Básica de Next.js

### Paso 7: Crear Cliente de Prisma

Crear `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Paso 8: Crear Layout Principal

Crear `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Edificios',
  description: 'Plataforma integral para administración de edificios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Paso 9: Crear Página de Inicio Temporal

Crear `src/app/page.tsx`:

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Gestión de Edificios
        </h1>
        <p className="text-xl text-gray-600">
          Proyecto iniciado correctamente ✅
        </p>
      </div>
    </main>
  );
}
```

### Paso 10: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Visita: `http://localhost:3000`

---

## 📋 Checklist de Verificación

Antes de continuar con el desarrollo, verifica que:

- [ ] Node.js y npm están instalados
- [ ] PostgreSQL está corriendo
- [ ] Las dependencias se instalaron correctamente
- [ ] El archivo `.env` está configurado
- [ ] Las migraciones de Prisma se ejecutaron sin errores
- [ ] Prisma Studio muestra las tablas correctamente
- [ ] El servidor de desarrollo inicia sin errores
- [ ] La página inicial se muestra correctamente

---

## 🎯 Próximas Funcionalidades a Desarrollar

### 1. Sistema de Autenticación (Prioridad Alta)
- [ ] Implementar NextAuth.js o JWT manual
- [ ] Crear páginas de login y registro
- [ ] Crear middleware de autenticación
- [ ] Proteger rutas del dashboard

**Archivos a crear:**
```
src/app/api/auth/[...nextauth]/route.ts
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/lib/auth.ts
src/middleware.ts
```

### 2. Layout del Dashboard Admin (Prioridad Alta)
- [ ] Crear componente Sidebar
- [ ] Crear componente Header con tabs de edificios
- [ ] Crear layout del dashboard
- [ ] Implementar navegación

**Archivos a crear:**
```
src/components/layout/Sidebar.tsx
src/components/layout/Header.tsx
src/components/layout/BuildingTabs.tsx
src/components/layout/DashboardLayout.tsx
src/app/(dashboard)/admin/layout.tsx
src/app/(dashboard)/admin/page.tsx
```

### 3. CRUD de Edificios (Prioridad Alta)
- [ ] API endpoints para edificios
- [ ] Lista de edificios
- [ ] Formulario de creación
- [ ] Formulario de edición
- [ ] Eliminación con confirmación

**Archivos a crear:**
```
src/app/api/buildings/route.ts
src/app/api/buildings/[id]/route.ts
src/app/(dashboard)/admin/buildings/page.tsx
src/components/buildings/BuildingForm.tsx
src/components/buildings/BuildingList.tsx
```

### 4. CRUD de Unidades (Prioridad Media)
- [ ] API endpoints para unidades
- [ ] Lista de unidades por edificio
- [ ] Formulario de creación
- [ ] Cambio de estado

### 5. Sistema de Novedades/Avisos (Prioridad Media)
- [ ] API endpoints para avisos
- [ ] Crear aviso
- [ ] Lista de avisos
- [ ] Marcar como leído
- [ ] Filtro por prioridad

### 6. Gestión de Inquilinos (Prioridad Media)
- [ ] API endpoints para inquilinos
- [ ] Asignar inquilino a unidad
- [ ] Ver historial de inquilinos
- [ ] Estado de cuenta

---

## 🛠️ Comandos Útiles para el Desarrollo

```bash
# Desarrollo
npm run dev                    # Iniciar servidor
npm run build                  # Build de producción
npm run start                  # Iniciar producción

# Prisma
npx prisma studio              # Abrir GUI de base de datos
npx prisma migrate dev         # Crear nueva migración
npx prisma migrate reset       # Resetear base de datos
npx prisma generate            # Regenerar cliente
npx prisma db push             # Push schema sin migración
npx prisma db pull             # Generar schema desde DB existente

# Código
npm run lint                   # Linter
npm run format                 # Formatear código
```

---

## 📚 Recursos Adicionales

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev

---

## 🐛 Solución de Problemas Comunes

### Error: "Can't connect to database"
- Verifica que PostgreSQL esté corriendo
- Verifica la `DATABASE_URL` en `.env`
- Intenta conectarte manualmente con `psql`

### Error: "Prisma Client not generated"
- Ejecuta: `npx prisma generate`

### Error: "Module not found"
- Ejecuta: `npm install`
- Verifica los paths en `tsconfig.json`

### Error en migraciones
- Resetea la base de datos: `npx prisma migrate reset`
- Ejecuta nuevamente: `npx prisma migrate dev`

---

## 💡 Tips de Desarrollo

1. **Usa Prisma Studio** para inspeccionar datos mientras desarrollas
2. **Commits frecuentes** con mensajes descriptivos
3. **Sigue la estructura de carpetas** definida en ARCHITECTURE.md
4. **Valida en cliente Y servidor** siempre
5. **Usa TypeScript strict mode** para evitar bugs
6. **Documenta funciones complejas** con comentarios
7. **Crea componentes pequeños y reutilizables**

---

## 🎉 ¡Estás listo para comenzar!

La base está completa y sólida. Ahora puedes comenzar a desarrollar las funcionalidades paso a paso.

**Recomendación**: Comienza por el sistema de autenticación, ya que es fundamental para el resto de la aplicación.

¿Necesitas ayuda con algún paso específico? ¡Pregunta!
