import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.progress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // Create Users
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Hệ thống Admin',
      passwordHash,
      role: 'ADMIN',
    }
  });

  await prisma.user.create({
    data: {
      email: 'student@gmail.com',
      name: 'Nguyễn Văn Học',
      passwordHash,
      role: 'STUDENT',
    }
  });

  // Create Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Ngữ pháp Tiếng Anh THCS - Tập 1',
      description: 'Khóa học tổng quát hệ thống hóa toàn bộ kiến thức ngữ pháp cơ bản chương trình THCS.',
      level: 'A2',
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Unit 1: Present Simple Tense (Thì Hiện Tại Đơn)',
            content: '### Mục tiêu bài học\n- Nắm vững công thức khẳng định, phủ định, nghi vấn...\n### Nội dung\nHiện tại đơn dùng để diễn tả...',
            order: 1,
            quizzes: {
              create: [
                {
                  title: 'Kiểm tra kiến thức Thì Hiện tại đơn',
                  questions: {
                    create: [
                      {
                        content: 'Câu nào sau đây dùng đúng thì Hiện tại đơn?',
                        explanation: 'Chủ ngữ "She" đi với động từ thêm "s/es".',
                        options: {
                          create: [
                            { content: 'She go to school.', isCorrect: false },
                            { content: 'She goes to school.', isCorrect: true },
                            { content: 'She going to school.', isCorrect: false },
                            { content: 'She gone to school.', isCorrect: false },
                          ]
                        }
                      },
                      {
                        content: 'Phủ định của "I like apples" là gì?',
                        explanation: 'Với chủ ngữ "I", ta dùng trợ động từ "do" + "not".',
                        options: {
                          create: [
                            { content: 'I like not apples.', isCorrect: false },
                            { content: 'I doesn\'t like apples.', isCorrect: false },
                            { content: 'I don\'t like apples.', isCorrect: true },
                            { content: 'I not like apples.', isCorrect: false },
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            title: 'Unit 2: Present Continuous Tense (Thì Hiện Tại Tiếp Diễn)',
            content: '### Mục tiêu bài học\n- Cách dùng thì HTTD...\n### Nội dung\nS + am/is/are + V-ing...',
            order: 2,
          }
        ]
      }
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Từ vựng IELTS cho người bắt đầu',
      description: 'Củng cố nền tảng 3000 từ vựng cốt lõi tiếng Anh ứng dụng cho môi trường học thuật.',
      level: 'B1',
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Topic 1: Education & Learning',
            content: 'Vocabulary related to schools, universities, and studying methods.',
            order: 1,
          },
          {
            title: 'Topic 2: Environment & Nature',
            content: 'Vocabulary about climate change, pollution, and conservation.',
            order: 2,
          }
        ]
      }
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
