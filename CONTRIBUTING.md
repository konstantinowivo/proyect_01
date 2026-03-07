# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión de Edificios! Esta guía te ayudará a comenzar.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Workflow de Desarrollo](#workflow-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Estructura de Commits](#estructura-de-commits)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conducta

Este proyecto y todos los participantes están gobernados por un código de conducta. Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables.

---

## 🚀 ¿Cómo Puedo Contribuir?

### Reportar Bugs

Si encuentras un bug, crea un issue incluyendo:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Versión de Node.js y navegador

### Sugerir Mejoras

Para sugerir nuevas características:
- Crea un issue con el tag `enhancement`
- Describe claramente la funcionalidad
- Explica por qué sería útil
- Proporciona ejemplos de uso

### Contribuir con Código

1. Busca issues abiertos o crea uno nuevo
2. Comenta en el issue que trabajarás en él
3. Sigue el workflow de desarrollo descrito abajo

---

## 🔄 Workflow de Desarrollo

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub, luego:
git clone https://github.com/TU-USUARIO/proyect_01.git
cd proyect_01

# Agrega el repositorio original como upstream
git remote add upstream https://github.com/konstantinowivo/proyect_01.git
```

### 2. Crear una Rama

Crea una rama descriptiva para tu trabajo:

```bash
# Actualiza tu main
git checkout main
git pull upstream main

# Crea una nueva rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

**Nomenclatura de ramas:**
- `feature/` - Para nuevas características
- `fix/` - Para correcciones de bugs
- `docs/` - Para cambios en documentación
- `refactor/` - Para refactorización de código
- `test/` - Para agregar o modificar tests

### 3. Desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de prueba
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

### 4. Hacer Cambios

- Escribe código limpio y legible
- Sigue los estándares de código del proyecto
- Comenta código complejo cuando sea necesario
- Actualiza la documentación si es necesario

### 5. Testing

```bash
# Ejecutar linter
npm run lint

# Verificar tipos TypeScript
npx tsc --noEmit

# Build para verificar que no hay errores
npm run build
```

### 6. Commit

Sigue la [convención de commits](#estructura-de-commits):

```bash
git add .
git commit -m "feat: agregar funcionalidad de X"
```

### 7. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo
```

Luego crea un Pull Request en GitHub:
1. Ve a tu fork en GitHub
2. Click en "Pull Request"
3. Asegúrate de que apunte a `konstantinowivo/proyect_01:main`
4. Llena la plantilla del PR completamente

### 8. Mantener tu Rama Actualizada

```bash
# Mientras trabajas, mantén tu rama actualizada
git checkout main
git pull upstream main
git checkout feature/nombre-descriptivo
git rebase main
```

---

## 💻 Estándares de Código

### General

- **Idioma**: Comentarios y nombres de variables en español cuando sea posible
- **Indentación**: 2 espacios
- **Punto y coma**: Opcional pero consistente
- **Comillas**: Simples para strings, excepto JSX

### TypeScript

- Usa tipos explícitos en funciones públicas
- Evita `any`, usa `unknown` si es necesario
- Interfaces para objetos, Types para uniones

```typescript
// ✅ Bueno
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Malo
function getUser(id: any): any {
  // ...
}
```

### React Components

- Usa functional components con hooks
- Un componente por archivo
- Props con TypeScript interfaces

```typescript
// ✅ Bueno
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // ...
}
```

### API Routes

- Manejo de errores consistente
- Validación con Zod
- Respuestas estructuradas

```typescript
// Estructura de respuesta
{
  success: true,
  data: { ... }
}

// O en caso de error
{
  success: false,
  error: {
    message: "Mensaje descriptivo",
    code: "ERROR_CODE"
  }
}
```

---

## 📝 Estructura de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma, etc (no afecta funcionalidad)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Mantenimiento, dependencias, config

### Ejemplos

```bash
feat(buildings): agregar filtro por ciudad
fix(auth): corregir validación de token expirado
docs(readme): actualizar instrucciones de instalación
refactor(dashboard): extraer lógica de stats a hook personalizado
chore(deps): actualizar Next.js a 14.2.5
```

---

## 🔍 Pull Requests

### Antes de Crear un PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] Pasa el linter (`npm run lint`)
- [ ] Los tipos TypeScript están correctos
- [ ] Has probado manualmente los cambios
- [ ] Has actualizado la documentación si es necesario
- [ ] El PR resuelve un issue específico

### Plantilla del PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## Issue Relacionado
Fixes #123

## Cambios Realizados
- Cambio 1
- Cambio 2
- Cambio 3

## Capturas de Pantalla (si aplica)
[Screenshots aquí]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He probado en diferentes navegadores
```

### Revisión

- Responde a los comentarios de revisión
- Haz cambios solicitados en nuevos commits
- Mantén la conversación profesional y constructiva

---

## 🎯 Áreas de Contribución

### Prioritarias

- [ ] Sistema de avisos y novedades
- [ ] Gestión de inquilinos (CRUD completo)
- [ ] Gestión de unidades
- [ ] Sistema de tareas de mantenimiento
- [ ] Tests unitarios e integración

### Bienvenidas

- [ ] Mejoras de UI/UX
- [ ] Optimizaciones de performance
- [ ] Documentación mejorada
- [ ] Accesibilidad (a11y)
- [ ] Internacionalización (i18n)

---

## 📞 Contacto

Si tienes preguntas, puedes:
- Crear un issue con el tag `question`
- Comentar en el PR
- Contactar a los mantenedores

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia MIT del proyecto.

---

¡Gracias por contribuir! 🎉
