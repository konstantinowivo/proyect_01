/**
 * Script de verificación de PostgreSQL
 * Ejecutar con: node verify-postgres.js
 */

const { exec } = require('child_process');

console.log('🔍 Verificando PostgreSQL...\n');

// Verificar si psql está instalado
exec('psql --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ PostgreSQL NO está instalado o no está en el PATH');
    console.log('   Descarga PostgreSQL de: https://www.postgresql.org/download/');
    return;
  }
  console.log('✅ PostgreSQL instalado:', stdout.trim());

  // Verificar si el servicio está corriendo
  checkPostgresRunning();
});

function checkPostgresRunning() {
  // Intentar conectar a PostgreSQL
  exec('psql -U postgres -c "SELECT version();" 2>&1', (error, stdout, stderr) => {
    if (error || stderr.includes('Connection refused') || stderr.includes('could not connect')) {
      console.log('❌ PostgreSQL está instalado pero NO está corriendo');
      console.log('\n📋 Para iniciar PostgreSQL:');
      console.log('   Windows: Busca "Servicios" → postgresql-x64-16 → Iniciar');
      console.log('   O ejecuta: net start postgresql-x64-16\n');
      return;
    }

    console.log('✅ PostgreSQL está corriendo');
    console.log(stdout);

    // Verificar si existe la base de datos
    checkDatabase();
  });
}

function checkDatabase() {
  exec('psql -U postgres -lqt | cut -d \\| -f 1 | grep -w adm_system', (error, stdout) => {
    if (!stdout.includes('adm_system')) {
      console.log('❌ La base de datos "adm_system" NO existe');
      console.log('\n📋 Para crear la base de datos:');
      console.log('   1. Ejecuta: psql -U postgres');
      console.log('   2. Ejecuta: CREATE DATABASE adm_system;');
      console.log('   3. Ejecuta: \\q para salir\n');
      return;
    }

    console.log('✅ Base de datos "adm_system" existe');
    console.log('\n🎉 Todo listo! Ahora puedes ejecutar:');
    console.log('   1. npx prisma migrate dev --name init');
    console.log('   2. npm run prisma:seed');
    console.log('   3. npm run dev\n');
  });
}
