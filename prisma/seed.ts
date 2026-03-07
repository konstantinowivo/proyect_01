import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (opcional)
  await prisma.paymentRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.task.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.document.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.building.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Datos anteriores eliminados');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Administrador Principal',
      phone: '+54 11 1234-5678',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear un edificio de ejemplo
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

  console.log('✅ Edificio creado:', building.name);

  // Crear unidades
  const units = [];
  for (let floor = 1; floor <= 10; floor++) {
    for (const unit of ['A', 'B', 'C', 'D']) {
      const createdUnit = await prisma.unit.create({
        data: {
          buildingId: building.id,
          number: `${floor}${unit}`,
          floor: floor,
          size: 45 + Math.random() * 30,
          status: floor <= 7 ? 'OCCUPIED' : 'VACANT',
        },
      });
      units.push(createdUnit);
    }
  }

  console.log(`✅ ${units.length} unidades creadas`);

  // Crear algunos inquilinos
  const tenants = [];
  for (let i = 1; i <= 5; i++) {
    const tenantUser = await prisma.user.create({
      data: {
        email: `inquilino${i}@test.com`,
        password: hashedPassword,
        name: `Inquilino ${i}`,
        phone: `+54 11 ${1000 + i}-5678`,
        role: 'TENANT',
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        userId: tenantUser.id,
        unitId: units[i - 1].id,
        buildingId: building.id,
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    });

    tenants.push(tenant);
  }

  console.log(`✅ ${tenants.length} inquilinos creados`);

  // Crear un aviso
  await prisma.announcement.create({
    data: {
      buildingId: building.id,
      title: 'Bienvenida al Sistema',
      content: 'Bienvenido al sistema de gestión de edificios. Aquí podrás gestionar todas las novedades del edificio.',
      priority: 'NORMAL',
      createdById: admin.id,
      targetUnits: [],
    },
  });

  console.log('✅ Aviso de bienvenida creado');

  // Crear algunas tareas
  await prisma.task.create({
    data: {
      buildingId: building.id,
      unitId: units[0].id,
      title: 'Reparar grifo de cocina',
      description: 'El grifo de la cocina pierde agua',
      status: 'PENDING',
      priority: 'MEDIUM',
      createdById: admin.id,
      dueDate: new Date('2026-03-01'),
    },
  });

  await prisma.task.create({
    data: {
      buildingId: building.id,
      title: 'Mantenimiento del ascensor',
      description: 'Revisión trimestral del ascensor',
      status: 'PENDING',
      priority: 'HIGH',
      createdById: admin.id,
      dueDate: new Date('2026-02-28'),
    },
  });

  console.log('✅ Tareas de ejemplo creadas');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📝 Credenciales de prueba:');
  console.log('   Email: admin@test.com');
  console.log('   Password: admin123');
  console.log('\n🏢 Se creó 1 edificio con 40 unidades');
  console.log('👥 Se crearon 5 inquilinos de prueba');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
