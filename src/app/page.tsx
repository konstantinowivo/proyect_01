import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="text-center space-y-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Edificios
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            Plataforma integral para administración de edificios, gestión de inquilinos,
            mantenimiento y control de pagos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Registrarse
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon="🏢"
              title="Gestión de Edificios"
              description="Administra múltiples edificios desde un solo dashboard"
            />
            <FeatureCard
              icon="👥"
              title="Control de Inquilinos"
              description="Gestiona inquilinos, unidades y contratos fácilmente"
            />
            <FeatureCard
              icon="📢"
              title="Sistema de Avisos"
              description="Comunica novedades importantes a los residentes"
            />
            <FeatureCard
              icon="🔧"
              title="Mantenimiento"
              description="Registra y da seguimiento a tareas de mantenimiento"
            />
            <FeatureCard
              icon="💰"
              title="Control de Pagos"
              description="Gestiona expensas y pagos de forma organizada"
            />
            <FeatureCard
              icon="📄"
              title="Documentos"
              description="Almacena y comparte documentos importantes"
            />
          </div>

          {/* Tech Stack */}
          <div className="mt-16 pt-8 border-t border-gray-300">
            <p className="text-sm text-gray-500 mb-4">Desarrollado con tecnologías modernas</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <TechBadge text="Next.js 14" />
              <TechBadge text="TypeScript" />
              <TechBadge text="PostgreSQL" />
              <TechBadge text="Prisma" />
              <TechBadge text="Tailwind CSS" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function TechBadge({ text }: { text: string }) {
  return (
    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
      {text}
    </span>
  );
}
