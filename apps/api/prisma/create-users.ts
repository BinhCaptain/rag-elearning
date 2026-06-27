import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const studentPasswordHash = await bcrypt.hash('User@123', 10);

  const admins = [
    { email: 'admin1@gmail.com', name: 'Admin Một', passwordHash: adminPasswordHash, role: 'ADMIN' as const },
    { email: 'admin2@gmail.com', name: 'Admin Hai', passwordHash: adminPasswordHash, role: 'ADMIN' as const },
  ];

  const students = [
    { email: 'student1@gmail.com', name: 'Nguyễn Văn Một', passwordHash: studentPasswordHash, role: 'STUDENT' as const },
    { email: 'student2@gmail.com', name: 'Trần Thị Hai', passwordHash: studentPasswordHash, role: 'STUDENT' as const },
    { email: 'student3@gmail.com', name: 'Lê Văn Ba', passwordHash: studentPasswordHash, role: 'STUDENT' as const },
    { email: 'student4@gmail.com', name: 'Phạm Thị Bốn', passwordHash: studentPasswordHash, role: 'STUDENT' as const },
    { email: 'student5@gmail.com', name: 'Hoàng Văn Năm', passwordHash: studentPasswordHash, role: 'STUDENT' as const },
  ];

  console.log('Creating admins...');
  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: admin,
    });
    console.log(`- Admin: ${user.name} (${user.email})`);
  }

  console.log('Creating students...');
  for (const student of students) {
    const user = await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: student,
    });
    console.log(`- Student: ${user.name} (${user.email})`);
  }

  console.log('Users created/verified successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
