const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'mysql://root:root@localhost:3307/elearning_db' } }
});
prisma.user.findMany({ select: { email: true, name: true, role: true } })
  .then(users => {
    console.log('Role       | Email                        | Name');
    console.log('-----------|------------------------------|------------------');
    users.forEach(u => console.log(u.role.padEnd(10), '|', u.email.padEnd(28), '|', u.name));
    return prisma.$disconnect();
  });
