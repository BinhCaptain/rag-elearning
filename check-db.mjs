import { PrismaClient } from './apps/api/node_modules/@prisma/client/index.js';

const p = new PrismaClient({
  datasources: { db: { url: 'mysql://root:root@localhost:3307/elearning_db' } }
});

async function main() {
  const [users, courses, lessons, quizzes, questions, options, progress, enrollments, attempts] = await Promise.all([
    p.user.count(), p.course.count(), p.lesson.count(), p.quiz.count(),
    p.question.count(), p.option.count(), p.progress.count(), p.enrollment.count(), p.quizAttempt.count()
  ]);

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║         MySQL Database — Summary         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`  users          : ${users}`);
  console.log(`  courses        : ${courses}`);
  console.log(`  lessons        : ${lessons}`);
  console.log(`  quizzes        : ${quizzes}`);
  console.log(`  questions      : ${questions}`);
  console.log(`  options        : ${options}`);
  console.log(`  progress       : ${progress}`);
  console.log(`  enrollments    : ${enrollments}`);
  console.log(`  quiz_attempts  : ${attempts}`);

  // Users
  const userList = await p.user.findMany({
    select: { name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });
  console.log('\n┌─ USERS ─────────────────────────────────────────────────────┐');
  userList.forEach(u => {
    const date = u.createdAt.toLocaleDateString('vi-VN');
    console.log(`│ [${u.role.padEnd(7)}] ${u.email.padEnd(32)} ${u.name?.substring(0,20) ?? ''}`);
  });
  console.log('└─────────────────────────────────────────────────────────────┘');

  // Courses
  const courseList = await p.course.findMany({
    include: { _count: { select: { lessons: true, enrollments: true } } },
    orderBy: { createdAt: 'asc' }
  });
  console.log('\n┌─ COURSES ──────────────────────────────────────────────────────┐');
  courseList.forEach(c => {
    const pub = c.isPublished ? '✓PUB' : '----';
    console.log(`│ [${pub}] Lv:${(c.level ?? '?').padEnd(5)} ${c._count.lessons} lessons | ${c.title.substring(0, 45)}`);
  });
  console.log('└────────────────────────────────────────────────────────────────┘');

  // Lessons with quizzes
  const lessonList = await p.lesson.findMany({
    include: { course: { select: { title: true } }, _count: { select: { quizzes: true } } },
    orderBy: [{ course: { createdAt: 'asc' } }, { order: 'asc' }],
    take: 20
  });
  console.log('\n┌─ LESSONS (first 20) ───────────────────────────────────────────┐');
  lessonList.forEach(l => {
    const quiz = l._count.quizzes > 0 ? `[${l._count.quizzes} quiz]` : '       ';
    console.log(`│ ${quiz} #${String(l.order).padEnd(2)} ${l.title.substring(0, 40).padEnd(40)} ← ${l.course.title.substring(0, 20)}`);
  });
  console.log('└────────────────────────────────────────────────────────────────┘');

  // Progress stats
  const completedCount = await p.progress.count({ where: { status: 'COMPLETED' } });
  const inProgressCount = await p.progress.count({ where: { status: 'IN_PROGRESS' } });
  console.log('\n┌─ PROGRESS STATS ───────────────────────────────────────────────┐');
  console.log(`│  COMPLETED   : ${completedCount}`);
  console.log(`│  IN_PROGRESS : ${inProgressCount}`);
  console.log('└────────────────────────────────────────────────────────────────┘');

  // Quiz attempts
  if (attempts > 0) {
    const attemptList = await p.quizAttempt.findMany({
      include: { user: { select: { name: true } }, quiz: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log('\n┌─ QUIZ ATTEMPTS (latest 10) ────────────────────────────────────┐');
    attemptList.forEach(a => {
      const pct = Math.round(a.score / a.totalQuestions * 100);
      console.log(`│ ${a.user.name?.padEnd(20)} ${a.score}/${a.totalQuestions} (${pct}%) | ${a.quiz.title.substring(0, 30)}`);
    });
    console.log('└────────────────────────────────────────────────────────────────┘');
  }

  await p.$disconnect();
}

main().catch(e => {
  console.error('❌ Lỗi:', e.message);
  process.exit(1);
});
