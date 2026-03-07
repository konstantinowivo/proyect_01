# 🏢 Sistema de Gestión de Edificios

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.3-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?logo=prisma)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema integral para administración de edificios e inquilinos, desarrollado con Next.js, TypeScript, PostgreSQL y Prisma.

**🔗 Repositorio**: [https://github.com/konstantinowivo/proyect_01](https://github.com/konstantinowivo/proyect_01)

---

## 📸 Screenshots

### Dashboard Administrativo
![Dashboard Admin](docs/screenshots/dashboard-admin.png)
*Panel de control con estadísticas en tiempo real y selector de edificios*

### Gestión de Edificios
![Buildings Management](docs/screenshots/buildings-crud.png)
*CRUD completo de edificios con tarjetas visuales*

### Building Tabs
![Building Tabs](docs/screenshots/building-tabs.png)
*Sistema de tabs con actualización automática usando React Context*

> **Nota**: Los screenshots serán agregados próximamente

---

## 🏢 Descripción

Plataforma completa para la gestión de edificios que permite a los administradores:
- Gestionar múltiples edificios desde un solo dashboard
- Administrar inquilinos y unidades
- Publicar avisos y novedades
- Controlar tareas de mantenimiento
- Gestionar pagos y expensas
- Almacenar documentos importantes

Los inquilinos pueden:
- Ver avisos del edificio
- Consultar sus pagos y expensas
- Solicitar mantenimiento
- Acceder a documentos compartidos

---

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Next.js 14 + TypeScript
- **Backend**: Next.js API Routes / Node.js + Express
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js / JWT
- **Estilos**: Tailwind CSS
- **Validación**: Zod

---

## 📋 Prerequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o pnpm

---

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/konstantinowivo/proyect_01.git
cd proyect_01
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/adm_system?schema=public"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Configurar la base de datos

```bash
# Crear la base de datos (si no existe)
createdb adm_system

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📂 Estructura del Proyecto

```
adm_system/
├── prisma/              # Schema y migraciones de base de datos
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # Componentes React
│   ├── lib/            # Utilidades y configuraciones
│   ├── hooks/          # Custom React Hooks
│   ├── services/       # Servicios de API
│   └── styles/         # Estilos globales
├── types/              # Tipos TypeScript compartidos
├── docs/               # Documentación
└── public/             # Archivos estáticos
```

Ver [ARCHITECTURE.md](./docs/ARCHITECTURE.md) para más detalles.

---

## 🗄️ Modelo de Datos

El sistema maneja las siguientes entidades principales:

- **User**: Usuarios del sistema (Admin/Tenant)
- **Building**: Edificios administrados
- **Unit**: Unidades/departamentos
- **Tenant**: Inquilinos
- **Announcement**: Avisos y novedades
- **Task**: Tareas de mantenimiento
- **Payment**: Pagos y expensas
- **Expense**: Gastos del edificio
- **Document**: Documentos adjuntos

Ver [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) para el modelo completo.

---

## 🎨 Características Principales

### Dashboard Administrativo
- 📊 Panel de control con métricas
- 🏢 Gestión de múltiples edificios (tabs superiores)
- 📢 Sistema de avisos tipo boletín
- 👥 CRUD de inquilinos
- 🏠 CRUD de unidades
- ✅ Gestión de tareas de mantenimiento
- 💰 Control de pagos y expensas
- 📄 Almacenamiento de documentos

### Dashboard de Inquilino
- 📢 Visualización de avisos
- 💰 Estado de cuenta
- 🔧 Solicitudes de mantenimiento
- 📄 Acceso a documentos

---

## 🔐 Autenticación

El sistema utiliza autenticación basada en JWT con dos roles:

- **ADMIN**: Acceso completo a gestión de edificios
- **TENANT**: Acceso limitado a información de su unidad

---

## 🧪 Testing (Futuro)

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 📦 Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter
npm run format       # Formatear código con Prettier

# Prisma
npx prisma studio    # Abrir Prisma Studio (GUI para DB)
npx prisma migrate dev    # Crear nueva migración
npx prisma db push   # Sincronizar schema sin migración
npx prisma generate  # Regenerar Prisma Client
```

---

## 🚧 Roadmap

### ✅ Fase 1: Fundamentos (COMPLETADA)
- [x] Modelo de datos completo con Prisma
- [x] Tipos TypeScript
- [x] Autenticación con JWT y roles (ADMIN/TENANT)
- [x] Dashboard administrativo con estadísticas en tiempo real
- [x] Gestión completa de edificios (CRUD)
- [x] Sistema de tabs con BuildingContext para actualización automática
- [x] Middleware de autenticación y protección de rutas
- [x] Seed data para testing

### 📋 Fase 2: Funcionalidades Core (EN PROGRESO)
- [ ] Sistema de avisos y novedades
- [ ] Gestión completa de inquilinos (CRUD)
- [ ] Gestión de unidades (CRUD)
- [ ] Gestión de tareas de mantenimiento
- [ ] Sistema de pagos y expensas
- [ ] Upload y gestión de documentos

### 🎯 Fase 3: Features Avanzadas
- [ ] Dashboard completo para inquilinos
- [ ] Reportes y estadísticas avanzadas
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Sistema de búsqueda y filtros
- [ ] Exportación de datos (PDF, Excel)

### 🌟 Futuro
- [ ] Amenidades y sistema de reservas
- [ ] Contratos de mantenimiento con proveedores
- [ ] Actas digitales de reuniones
- [ ] App móvil (React Native)
- [ ] Modo offline
- [ ] Integración con servicios de pago

---

## 📖 Documentación

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Schema de Base de Datos](./docs/DATABASE_SCHEMA.md)
- [Documentación de API](./docs/API_DOCUMENTATION.md) (próximamente)

---

## 🤝 Contribución

Este es un proyecto en desarrollo activo. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia [MIT](LICENSE).

---

## 👥 Autores

- **Tu Nombre** - Desarrollo inicial

---

## 🙏 Agradecimientos

- Next.js Team
- Prisma Team
- Vercel
- Comunidad Open Source
