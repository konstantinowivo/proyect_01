# Arquitectura del Sistema

## 🏗️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Fetch API / Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes (o Express si se prefiere separado)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js / JWT
- **Validation**: Zod

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm / pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest + React Testing Library (futuro)

---

## 📁 Estructura del Proyecto

```
adm_system/
├── prisma/
│   ├── schema.prisma           # Schema de base de datos
│   └── migrations/             # Migraciones de Prisma
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Rutas protegidas
│   │   │   ├── admin/          # Dashboard administrativo
│   │   │   │   ├── page.tsx
│   │   │   │   ├── buildings/
│   │   │   │   ├── announcements/
│   │   │   │   ├── tenants/
│   │   │   │   ├── units/
│   │   │   │   ├── tasks/
│   │   │   │   ├── payments/
│   │   │   │   └── documents/
│   │   │   └── tenant/         # Dashboard para inquilinos
│   │   │       └── page.tsx
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   ├── buildings/
│   │   │   ├── units/
│   │   │   ├── tenants/
│   │   │   ├── announcements/
│   │   │   ├── tasks/
│   │   │   ├── payments/
│   │   │   └── documents/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes base (shadcn)
│   │   ├── layout/             # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── BuildingTabs.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── dashboard/          # Componentes de dashboard
│   │   ├── forms/              # Formularios
│   │   ├── tables/             # Tablas de datos
│   │   └── modals/             # Modales
│   │
│   ├── lib/                    # Utilidades y configuraciones
│   │   ├── prisma.ts           # Cliente de Prisma
│   │   ├── auth.ts             # Configuración de autenticación
│   │   ├── utils.ts            # Funciones auxiliares
│   │   └── validators.ts       # Schemas de validación (Zod)
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useBuildings.ts
│   │   ├── useTasks.ts
│   │   ├── usePayments.ts
│   │   └── useAuth.ts
│   │
│   ├── contexts/               # React Contexts
│   │   ├── AuthContext.tsx
│   │   └── BuildingContext.tsx
│   │
│   ├── services/               # Servicios de API (cliente)
│   │   ├── api.ts              # Cliente HTTP base
│   │   ├── buildings.ts
│   │   ├── tenants.ts
│   │   ├── tasks.ts
│   │   └── payments.ts
│   │
│   └── styles/                 # Estilos globales
│       └── globals.css
│
├── types/                      # Tipos TypeScript compartidos
│   └── index.ts
│
├── docs/                       # Documentación
│   ├── DATABASE_SCHEMA.md
│   ├── ARCHITECTURE.md
│   └── API_DOCUMENTATION.md
│
├── public/                     # Archivos estáticos
│   ├── images/
│   └── icons/
│
├── .env.example                # Variables de entorno ejemplo
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── README.md
```

---

## 🔐 Flujo de Autenticación

```
1. Usuario ingresa credenciales
2. POST /api/auth/login
3. Servidor valida credenciales (bcrypt)
4. Genera JWT token
5. Cliente almacena token (httpOnly cookie o localStorage)
6. Cada request incluye token en headers
7. Middleware valida token en rutas protegidas
```

### Roles y Permisos

**ADMIN**:
- Gestionar múltiples edificios
- CRUD completo sobre todas las entidades
- Ver dashboards de todos los edificios
- Publicar avisos
- Gestionar inquilinos
- Gestionar pagos y expensas

**TENANT**:
- Ver su edificio asignado
- Ver avisos del edificio
- Ver sus pagos/expensas
- Ver su unidad
- Crear solicitudes de mantenimiento
- Ver documentos compartidos

---

## 🎨 Layout del Dashboard Admin

### Header (Superior)
- Logo del sistema
- Tabs de edificios (horizontal scroll si hay muchos)
- Perfil de usuario
- Notificaciones

### Sidebar (Izquierda)
```
📊 Dashboard
📢 Novedades
👥 Inquilinos
🏠 Unidades
✅ Tareas
💰 Expensas/Pagos
📄 Documentos
📊 Reportes
⚙️ Configuración
```

### Área Principal
- Contenido dinámico según la sección seleccionada
- Filtrado por edificio activo (del header)

---

## 🔄 Flujo de Datos

### Patrón de Componentes

```tsx
Page Component (Server Component)
  ↓
  Fetch data from API/Database
  ↓
Client Component
  ↓
  Handle user interactions
  ↓
  Call API endpoints
  ↓
  Update UI optimistically/reactively
```

### Estrategia de Fetching

- **Server Components**: Para datos iniciales (SSR)
- **Client Components**: Para interactividad
- **API Routes**: Para mutations y datos dinámicos
- **React Query / SWR**: Para cache y sincronización (opcional)

---

## 🗄️ Capa de Datos

### Estructura de Servicios

```typescript
// Capa de Prisma (servidor)
prisma/schema.prisma → @prisma/client

// Capa de Servicios (servidor)
src/lib/services/
  ├── buildingService.ts
  ├── tenantService.ts
  └── paymentService.ts

// Capa de API (Next.js)
src/app/api/buildings/route.ts

// Capa de Cliente (frontend)
src/services/buildings.ts → fetch('/api/buildings')

// Hook personalizado
src/hooks/useBuildings.ts → useBuildingsService()
```

### Ejemplo de flujo completo:

```typescript
// 1. Server Service
// src/lib/services/buildingService.ts
export async function getBuildingsByAdmin(adminId: string) {
  return prisma.building.findMany({
    where: { adminId },
    include: { units: true }
  });
}

// 2. API Route
// src/app/api/buildings/route.ts
export async function GET(request: Request) {
  const session = await getSession(request);
  const buildings = await getBuildingsByAdmin(session.user.id);
  return Response.json(buildings);
}

// 3. Client Service
// src/services/buildings.ts
export async function fetchBuildings() {
  const res = await fetch('/api/buildings');
  return res.json();
}

// 4. Custom Hook
// src/hooks/useBuildings.ts
export function useBuildings() {
  const [buildings, setBuildings] = useState([]);
  useEffect(() => {
    fetchBuildings().then(setBuildings);
  }, []);
  return buildings;
}

// 5. Component
// src/app/(dashboard)/admin/page.tsx
export default function AdminDashboard() {
  const buildings = useBuildings();
  return <BuildingList buildings={buildings} />;
}
```

---

## 🧪 Separación de Concerns

### Backend (Server)
- Lógica de negocio
- Validaciones
- Acceso a base de datos
- Autenticación
- Autorización

### Frontend (Client)
- Presentación
- Interactividad del usuario
- Validaciones de UI (duplicadas para UX)
- Estado local
- Navegación

---

## 🚀 Fases de Desarrollo Propuestas

### Fase 1: Fundamentos (MVP)
- ✅ Modelo de datos
- ✅ Tipos TypeScript
- [ ] Autenticación básica
- [ ] Dashboard admin básico
- [ ] CRUD de edificios
- [ ] CRUD de unidades

### Fase 2: Funcionalidades Core
- [ ] Sistema de avisos/novedades
- [ ] Gestión de inquilinos
- [ ] Gestión de tareas
- [ ] Sistema de pagos básico

### Fase 3: Dashboard Inquilino
- [ ] Vista de inquilino
- [ ] Ver avisos
- [ ] Ver pagos
- [ ] Solicitar mantenimiento

### Fase 4: Features Avanzadas
- [ ] Sistema de documentos
- [ ] Reportes y estadísticas
- [ ] Notificaciones en tiempo real
- [ ] Upload de archivos

### Fase 5: Mejoras (Futuro)
- [ ] Amenidades y reservas
- [ ] Contratos de mantenimiento
- [ ] Actas de reuniones
- [ ] App móvil (React Native)

---

## 📊 Decisiones Arquitectónicas

### ¿Por qué Next.js?
- SSR para mejor SEO y performance
- API Routes integradas (full-stack en un solo proyecto)
- App Router moderno
- Optimizaciones automáticas

### ¿Por qué PostgreSQL + Prisma?
- PostgreSQL: ACID, relaciones complejas, integridad referencial
- Prisma: Type-safety, migraciones, excelente DX

### ¿Por qué TypeScript?
- Type-safety en toda la aplicación
- Mejor autocompletado y refactoring
- Menos bugs en producción

---

## 🔒 Consideraciones de Seguridad

1. **Autenticación**: JWT con httpOnly cookies
2. **Autorización**: Middleware para validar roles
3. **Validación**: Zod en cliente y servidor
4. **SQL Injection**: Prisma previene automáticamente
5. **XSS**: React sanitiza por defecto
6. **CSRF**: Tokens CSRF en formularios
7. **Rate Limiting**: En API routes (futuro)
8. **Hashing**: bcrypt para contraseñas

---

## 📝 Próximos Pasos

1. Inicializar proyecto Next.js
2. Configurar Prisma y PostgreSQL
3. Implementar autenticación
4. Crear layout del dashboard
5. Implementar CRUD de edificios
6. Continuar con features progresivamente
