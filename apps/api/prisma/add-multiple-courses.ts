import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const coursesData = [
    {
      title: 'Tiếng Anh Giao tiếp Hàng ngày',
      description: 'Khóa học giao tiếp tiếng Anh cơ bản dành cho đời sống hàng ngày.',
      level: 'A2',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Greeting & Self-introduction (Chào hỏi & Giới thiệu bản thân)',
          content: '### Mục tiêu bài học\n- Biết cách chào hỏi trang trọng và thân mật.\n- Giới thiệu bản thân cơ bản (tên, tuổi, quốc tịch, công việc).\n\n### Nội dung\n- **Chào hỏi:** "Hello", "Hi", "Good morning", "Good afternoon".\n- **Giới thiệu:** "My name is...", "I am ... years old", "I work as a..."',
          order: 1,
          quizTitle: 'Trắc nghiệm: Greeting & Self-introduction',
          questions: [
            {
              content: 'Cách chào hỏi nào lịch sự nhất vào buổi sáng khi gặp khách hàng?',
              explanation: '"Good morning" là lời chào lịch sự, trang trọng nhất vào buổi sáng.',
              options: [
                { content: 'Hi there', isCorrect: false },
                { content: 'Good morning', isCorrect: true },
                { content: 'What\'s up?', isCorrect: false },
                { content: 'Hello guys', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Ordering Food at a Restaurant (Gọi món tại nhà hàng)',
          content: '### Mục tiêu bài học\n- Học cách đặt bàn, gọi món và thanh toán.\n\n### Nội dung\n- "Can we have the menu, please?"\n- "I would like to order..."\n- "Could we get the bill, please?"',
          order: 2,
          quizTitle: 'Trắc nghiệm: Ordering Food',
          questions: [
            {
              content: 'Khi muốn thanh toán tiền ăn ở nhà hàng, bạn nên nói như thế nào?',
              explanation: '"Could we get the bill, please?" là câu lịch sự dùng để yêu cầu thanh toán/hóa đơn.',
              options: [
                { content: 'Give me money', isCorrect: false },
                { content: 'Could we get the bill, please?', isCorrect: true },
                { content: 'I pay now', isCorrect: false },
                { content: 'Where is my bill?', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Asking for Directions (Hỏi đường)',
          content: '### Mục tiêu bài học\n- Hỏi và chỉ đường cơ bản.\n\n### Nội dung\n- "Excuse me, how do I get to...?"\n- "Is there a supermarket nearby?"\n- "Go straight, turn left, turn right."',
          order: 3,
          quizTitle: 'Trắc nghiệm: Asking for Directions',
          questions: [
            {
              content: 'Cụm từ "Go straight" nghĩa là gì?',
              explanation: '"Go straight" có nghĩa là đi thẳng.',
              options: [
                { content: 'Rẽ trái', isCorrect: false },
                { content: 'Rẽ phải', isCorrect: false },
                { content: 'Đi thẳng', isCorrect: true },
                { content: 'Quay đầu lại', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Shopping & Bargaining (Mua sắm & Trả giá)',
          content: '### Mục tiêu bài học\n- Giao tiếp khi mua sắm quần áo, thực phẩm và cách trả giá lịch sự.\n\n### Nội dung\n- "How much is this?"\n- "Do you have this in a larger size?"\n- "Can you give me a discount?"',
          order: 4,
          quizTitle: 'Trắc nghiệm: Shopping & Bargaining',
          questions: [
            {
              content: 'Câu nào sau đây dùng để hỏi giá tiền?',
              explanation: '"How much does this cost?" là câu hỏi giá tiền phổ biến nhất.',
              options: [
                { content: 'How far is this?', isCorrect: false },
                { content: 'How much does this cost?', isCorrect: true },
                { content: 'How long is this?', isCorrect: false },
                { content: 'How heavy is this?', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Lập trình Python Cơ bản',
      description: 'Khóa học Python căn bản cho người mới bắt đầu lập trình.',
      level: 'B1',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Python Installation & Hello World (Cài đặt Python & Hello World)',
          content: '### Mục tiêu bài học\n- Cài đặt môi trường Python.\n- Chạy chương trình đầu tiên.\n\n### Nội dung\nSử dụng lệnh `print("Hello World")` để hiển thị dòng chữ ra màn hình.',
          order: 1,
          quizTitle: 'Trắc nghiệm: Python Intro',
          questions: [
            {
              content: 'Lệnh nào dùng để in dữ liệu ra màn hình trong Python?',
              explanation: 'Hàm `print()` là hàm chuẩn để xuất dữ liệu ra màn hình trong Python.',
              options: [
                { content: 'console.log()', isCorrect: false },
                { content: 'system.out.print()', isCorrect: false },
                { content: 'print()', isCorrect: true },
                { content: 'echo()', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Variables & Data Types (Biến & Kiểu dữ liệu)',
          content: '### Mục tiêu bài học\n- Khai báo biến và hiểu các kiểu dữ liệu số, chuỗi, boolean trong Python.\n\n### Nội dung\n- Số nguyên: `x = 5`\n- Chuỗi: `name = "Python"`\n- Boolean: `is_easy = True`',
          order: 2,
          quizTitle: 'Trắc nghiệm: Variables',
          questions: [
            {
              content: 'Kiểu dữ liệu nào lưu trữ giá trị True hoặc False?',
              explanation: 'Kiểu Boolean (bool) dùng để lưu hai giá trị logic True và False.',
              options: [
                { content: 'int', isCorrect: false },
                { content: 'str', isCorrect: false },
                { content: 'float', isCorrect: false },
                { content: 'bool', isCorrect: true },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Control Flow (Cấu trúc rẽ nhánh & Lặp)',
          content: '### Mục tiêu bài học\n- Hiểu lệnh `if`, `else`, `elif` và vòng lặp `for`, `while`.',
          order: 3,
          quizTitle: 'Trắc nghiệm: Control Flow',
          questions: [
            {
              content: 'Để kiểm tra nhiều điều kiện rẽ nhánh liên tiếp, Python sử dụng từ khóa nào?',
              explanation: 'Python sử dụng `elif` (viết tắt của else if) để kiểm tra các điều kiện tiếp theo.',
              options: [
                { content: 'else if', isCorrect: false },
                { content: 'elif', isCorrect: true },
                { content: 'elseif', isCorrect: false },
                { content: 'switch', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Functions & Modules (Hàm & Module)',
          content: '### Mục tiêu bài học\n- Định nghĩa và gọi hàm tự tạo bằng từ khóa `def`.',
          order: 4,
          quizTitle: 'Trắc nghiệm: Functions',
          questions: [
            {
              content: 'Từ khóa nào dùng để định nghĩa một hàm trong Python?',
              explanation: 'Từ khóa `def` (define) được dùng để bắt đầu định nghĩa một hàm.',
              options: [
                { content: 'function', isCorrect: false },
                { content: 'def', isCorrect: true },
                { content: 'func', isCorrect: false },
                { content: 'void', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Tin học Văn phòng Microsoft Office',
      description: 'Làm chủ các công cụ tin học văn phòng Word, Excel, PowerPoint.',
      level: 'A1',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Microsoft Word Basics (Kỹ năng soạn thảo văn bản Word cơ bản)',
          content: '### Mục tiêu bài học\n- Học cách định dạng văn bản, căn lề và sử dụng phông chữ chuẩn hành chính.\n\n### Nội dung\n- Căn lề chuẩn (Top, Bottom, Left, Right).\n- Sử dụng font Times New Roman hoặc Arial, cỡ chữ 13-14.',
          order: 1,
          quizTitle: 'Trắc nghiệm: Word Basics',
          questions: [
            {
              content: 'Tổ hợp phím nào dùng để bôi đậm văn bản đã chọn?',
              explanation: 'Ctrl + B (Bold) là phím tắt phổ biến để in đậm văn bản.',
              options: [
                { content: 'Ctrl + I', isCorrect: false },
                { content: 'Ctrl + U', isCorrect: false },
                { content: 'Ctrl + B', isCorrect: true },
                { content: 'Ctrl + N', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Working with Tables in Word (Làm việc với bảng biểu trong Word)',
          content: '### Mục tiêu bài học\n- Chèn, gộp, chia ô và căn chỉnh bảng biểu chuyên nghiệp.\n\n### Nội dung\n- Menu Insert -> Table.\n- Gộp ô (Merge Cells), Chia ô (Split Cells).',
          order: 2,
          quizTitle: 'Trắc nghiệm: Word Tables',
          questions: [
            {
              content: 'Tính năng gộp nhiều ô thành một ô duy nhất trong Word là gì?',
              explanation: '"Merge Cells" là tính năng gộp nhiều ô.',
              options: [
                { content: 'Split Cells', isCorrect: false },
                { content: 'Merge Cells', isCorrect: true },
                { content: 'Align Cells', isCorrect: false },
                { content: 'Delete Cells', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Excel Formulas & Functions (Công thức & Hàm cơ bản trong Excel)',
          content: '### Mục tiêu bài học\n- Sử dụng các hàm tính toán cơ bản: SUM, AVERAGE, IF, VLOOKUP.\n\n### Nội dung\n- Tính tổng: `=SUM(A1:A10)`\n- Tính trung bình: `=AVERAGE(B1:B5)`',
          order: 3,
          quizTitle: 'Trắc nghiệm: Excel Functions',
          questions: [
            {
              content: 'Hàm nào dùng để tính giá trị trung bình cộng trong Excel?',
              explanation: 'Hàm `AVERAGE` dùng để tính trung bình cộng của một dãy số.',
              options: [
                { content: 'SUM', isCorrect: false },
                { content: 'MEAN', isCorrect: false },
                { content: 'AVERAGE', isCorrect: true },
                { content: 'COUNT', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: PowerPoint Presentation Design (Thiết kế slide PowerPoint chuyên nghiệp)',
          content: '### Mục tiêu bài học\n- Tạo slide thuyết trình đẹp mắt, bố cục cân đối và sử dụng hiệu ứng chuyển slide mượt mà.',
          order: 4,
          quizTitle: 'Trắc nghiệm: PowerPoint Design',
          questions: [
            {
              content: 'Để bắt đầu trình chiếu slide từ trang đầu tiên, ta nhấn phím nào?',
              explanation: 'Phím F5 dùng để bắt đầu trình chiếu toàn màn hình từ trang đầu tiên.',
              options: [
                { content: 'F5', isCorrect: true },
                { content: 'F11', isCorrect: false },
                { content: 'Enter', isCorrect: false },
                { content: 'Space', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Kỹ năng Viết Email Công việc (Professional Email Writing)',
      description: 'Viết email chuyên nghiệp chuẩn công sở bằng tiếng Anh.',
      level: 'B2',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Structure of a Professional Email (Cấu trúc của một email chuyên nghiệp)',
          content: '### Mục tiêu bài học\n- Hiểu rõ 5 phần của một email công việc chuẩn quốc tế.\n\n### Nội dung\n1. Subject line (Tiêu đề)\n2. Salutation (Chào hỏi)\n3. Opening (Lời mở đầu)\n4. Body paragraph (Nội dung chính)\n5. Closing & Signature (Lời kết & Ký tên)',
          order: 1,
          quizTitle: 'Trắc nghiệm: Email Structure',
          questions: [
            {
              content: 'Phần nào của email giúp người nhận biết nhanh nội dung chính của email trước khi mở?',
              explanation: '"Subject line" (Tiêu đề email) mô tả ngắn gọn nội dung email.',
              options: [
                { content: 'Salutation', isCorrect: false },
                { content: 'Subject line', isCorrect: true },
                { content: 'Signature', isCorrect: false },
                { content: 'Attachment', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Polite Requests & Inquiries (Cách đưa ra yêu cầu và hỏi thông tin lịch sự)',
          content: '### Mục tiêu bài học\n- Sử dụng các cấu trúc trang trọng để hỏi thông tin hoặc nhờ vả.\n\n### Nội dung\n- "I would be grateful if you could..."\n- "Could you please send me..."\n- "I am writing to inquire about..."',
          order: 2,
          quizTitle: 'Trắc nghiệm: Polite Requests',
          questions: [
            {
              content: 'Cụm từ nào phù hợp nhất để mở đầu yêu cầu thông tin một cách lịch sự?',
              explanation: '"I am writing to inquire about..." (Tôi viết email này để hỏi về...) là cấu trúc lịch sự chuyên nghiệp.',
              options: [
                { content: 'Tell me about', isCorrect: false },
                { content: 'I am writing to inquire about', isCorrect: true },
                { content: 'Give me info of', isCorrect: false },
                { content: 'I want to know about', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Handling Complaints & Apologies (Xử lý khiếu nại và viết thư xin lỗi)',
          content: '### Mục tiêu bài học\n- Viết email xin lỗi khách hàng khi xảy ra lỗi phát sinh hoặc dịch vụ không tốt.\n\n### Nội dung\n- "We sincerely apologize for any inconvenience caused."\n- "Please accept our sincere apologies for..."\n- "We are actively resolving this issue."',
          order: 3,
          quizTitle: 'Trắc nghiệm: Apologies',
          questions: [
            {
              content: 'Câu nào thể hiện lời xin lỗi trang trọng, chuyên nghiệp nhất?',
              explanation: '"We sincerely apologize for the inconvenience caused." là câu xin lỗi tiêu chuẩn trong kinh doanh.',
              options: [
                { content: 'Sorry about that.', isCorrect: false },
                { content: 'We sincerely apologize for the inconvenience caused.', isCorrect: true },
                { content: 'My bad, sorry.', isCorrect: false },
                { content: 'We apologize for the problem.', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Follow-up & Closing (Email tiếp nối và phần kết thư ấn tượng)',
          content: '### Mục tiêu bài học\n- Cách viết email nhắc nhở phản hồi và lời chào kết thư phù hợp.\n\n### Nội dung\n- "I look forward to hearing from you."\n- "Best regards," / "Sincerely yours,"',
          order: 4,
          quizTitle: 'Trắc nghiệm: Follow-up & Closing',
          questions: [
            {
              content: 'Lời chào kết thư nào thường dùng trong email giao dịch kinh doanh trang trọng?',
              explanation: '"Best regards," hoặc "Sincerely," là những lời chào kết thư trang trọng nhất.',
              options: [
                { content: 'Bye bye,', isCorrect: false },
                { content: 'Best regards,', isCorrect: true },
                { content: 'Cheers,', isCorrect: false },
                { content: 'See ya,', isCorrect: false },
              ]
            }
          ]
        }
      ]
    }
  ];

  console.log('Bắt đầu tạo 4 khóa học mới...');

  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        isPublished: courseData.isPublished,
      }
    });

    console.log(`- Đã tạo khóa học: ${course.title} (ID: ${course.id})`);

    // Tạo các bài học cho khóa học này
    for (const lessonData of courseData.lessons) {
      await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: lessonData.title,
          content: lessonData.content,
          order: lessonData.order,
          quizzes: {
            create: [
              {
                title: lessonData.quizTitle,
                questions: {
                  create: lessonData.questions.map(q => ({
                    content: q.content,
                    explanation: q.explanation,
                    options: {
                      create: q.options
                    }
                  }))
                }
              }
            ]
          }
        }
      });
    }
    console.log(`  -> Đã tạo 4 bài học kèm trắc nghiệm cho khóa học: ${course.title}`);
  }

  console.log('Đã tạo thành công toàn bộ 4 khóa học mới, mỗi khóa học 4 bài học!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
