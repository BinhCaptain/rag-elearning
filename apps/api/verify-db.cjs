const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'mysql://root:root@localhost:3307/elearning_db' } }
});

async function main() {
  const lessons = await prisma.lesson.findMany({
    where: { title: { contains: 'MOCK' } },
    include: {
      quizzes: {
        include: {
          questions: {
            include: { options: true }
          }
        }
      }
    }
  });

  console.log(`Found ${lessons.length} mock lesson(s) in DB:\n`);
  for (const lesson of lessons) {
    console.log('Lesson:', lesson.title);
    console.log('  Quiz:', lesson.quizzes?.[0]?.title || '[none]');
    console.log('  Questions:', lesson.quizzes?.[0]?.questions?.length || 0);
    if (lesson.quizzes?.[0]?.questions?.length > 0) {
      const q = lesson.quizzes[0].questions[0];
      console.log('  First Q:', q.content?.substring(0, 70));
      q.options?.forEach(o =>
        console.log('    ' + (o.isCorrect ? '[CORRECT]' : '        ') + ' ' + o.content)
      );
    }
    console.log();
  }

  // Also check latest quiz
  const latestQuiz = await prisma.quiz.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { questions: { include: { options: true } } }
  });
  if (latestQuiz) {
    console.log('=== Latest Quiz in DB ===');
    console.log('Title:', latestQuiz.title);
    console.log('Questions:', latestQuiz.questions?.length);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e.message);
  process.exit(1);
});
