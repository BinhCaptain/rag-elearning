const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient({
  datasources: { db: { url: 'mysql://root:root@localhost:3307/elearning_db' } }
});

async function main() {
  const password = 'Admin@123';
  const hash = await bcrypt.hash(password, 10);

  // Reset password cho admin@gmail.com
  await prisma.user.update({
    where: { email: 'admin@gmail.com' },
    data: { passwordHash: hash }
  });

  // Reset password cho student@gmail.com
  await prisma.user.update({
    where: { email: 'student@gmail.com' },
    data: { passwordHash: hash }
  });

  // tester2@example.com giữ nguyên password cũ (password123)
  const hashOld = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { email: 'tester2@example.com' },
    data: { passwordHash: hashOld }

  });

  console.log('Passwords reset successfully!');
  console.log('');
  console.log('ADMIN  : admin@gmail.com    / Admin@123');
  console.log('STUDENT: student@gmail.com  / Admin@123');
  console.log('STUDENT: tester2@example.com / password123');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
