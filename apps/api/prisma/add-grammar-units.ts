import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Tìm khóa học "Ngữ pháp Tiếng Anh THCS - Tập 1"
  const course = await prisma.course.findFirst({
    where: {
      title: 'Ngữ pháp Tiếng Anh THCS - Tập 1',
    },
  });

  if (!course) {
    console.error('Không tìm thấy khóa học "Ngữ pháp Tiếng Anh THCS - Tập 1" trong Database.');
    process.exit(1);
  }

  console.log(`Tìm thấy khóa học: ${course.title} (ID: ${course.id})`);

  // 2. Định nghĩa nội dung cho Unit 3: Thì Quá khứ đơn
  const unit3Content = `### Mục tiêu bài học
- Nắm vững công thức khẳng định, phủ định, nghi vấn của Thì Quá khứ đơn (Past Simple Tense) với động từ To-be và động từ thường.
- Nhận biết các dấu hiệu nhận biết của thì quá khứ đơn.

### 1. Công thức (Form)
#### A. Với động từ TO BE (was/were)
*   **Khẳng định:** S + was / were + O
    *   *I/He/She/It/Danh từ số ít* + **was**
    *   *We/You/They/Danh từ số nhiều* + **were**
    *   *Ví dụ:* They were at the park yesterday.
*   **Phủ định:** S + was / were + not + O
    *   *was not = wasn't* | *were not = weren't*
    *   *Ví dụ:* She wasn't happy last night.
*   **Nghi vấn:** Was / Were + S + O?
    *   *Trả lời:* Yes, S + was/were. | No, S + wasn't/weren't.

#### B. Với động từ thường (Verbs)
*   **Khẳng định:** S + V2/ed + O
    *   *V-ed (Động từ có quy tắc):* watch -> watched, play -> played
    *   *V2 (Động từ bất quy tắc):* go -> went, see -> saw, buy -> bought
    *   *Ví dụ:* We watched a movie last weekend.
*   **Phủ định:** S + did not (didn't) + V(bare) + O
    *   *Ví dụ:* He didn't go to school yesterday.
*   **Nghi vấn:** Did + S + V(bare) + O?
    *   *Trả lời:* Yes, S + did. | No, S + didn't.

### 2. Cách dùng (Usage)
*   Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ.
*   Diễn tả một chuỗi hành động xảy ra liên tiếp trong quá khứ.

### 3. Dấu hiệu nhận biết (Signal Words)
*   **Yesterday** (hôm qua)
*   **Last** + time (last night, last week, last year)
*   Time + **ago** (two days ago, three years ago)
*   **In** + năm trong quá khứ (in 2020, in 1999)
`;

  // 3. Định nghĩa nội dung cho Unit 4: Thì Tương lai đơn
  const unit4Content = `### Mục tiêu bài học
- Nắm vững công thức và cách dùng Thì Tương lai đơn (Future Simple Tense) với "will".
- Phân biệt các dấu hiệu nhận biết của thì tương lai đơn.

### 1. Công thức (Form)
*   **Khẳng định:** S + will + V(bare) + O
    *   *Ví dụ:* I will travel to Tokyo next year.
*   **Phủ định:** S + will not (won't) + V(bare) + O
    *   *Ví dụ:* They won't come to the party tonight.
*   **Nghi vấn:** Will + S + V(bare) + O?
    *   *Trả lời:* Yes, S + will. | No, S + won't.

### 2. Cách dùng (Usage)
*   Diễn tả một quyết định nảy sinh ngay tại thời điểm nói (không có dự định trước).
    *   *Ví dụ:* "It's hot in here." - "I will open the window."
*   Diễn tả một dự đoán không có căn cứ xác thực.
    *   *Ví dụ:* I think it will rain tomorrow.
*   Diễn tả lời hứa, lời đe dọa hoặc lời đề nghị.
    *   *Ví dụ:* I promise I will help you with your homework.

### 3. Dấu hiệu nhận biết (Signal Words)
*   **Tomorrow** (ngày mai)
*   **Next** + time (next week, next month, next year)
*   **In** + khoảng thời gian ở tương lai (in 5 minutes, in 2 weeks)
*   Các động từ bày tỏ ý kiến: **think, believe, hope, suppose...**
`;

  // 4. Tạo Unit 3
  const unit3 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Unit 3: Past Simple Tense (Thì Quá khứ đơn)',
      content: unit3Content,
      order: 3,
      quizzes: {
        create: [
          {
            title: 'Kiểm tra kiến thức Thì Quá khứ đơn',
            questions: {
              create: [
                {
                  content: 'Điền dạng đúng của động từ: "Yesterday, my family _______ (go) to the cinema."',
                  explanation: '"go" là động từ bất quy tắc, dạng V2 của nó trong quá khứ đơn là "went".',
                  options: {
                    create: [
                      { content: 'goes', isCorrect: false },
                      { content: 'goed', isCorrect: false },
                      { content: 'went', isCorrect: true },
                      { content: 'gone', isCorrect: false },
                    ]
                  }
                },
                {
                  content: 'Câu phủ định nào sau đây là chính xác?',
                  explanation: 'Trong câu phủ định của động từ thường ở quá khứ đơn, ta dùng "didn\'t" + động từ nguyên mẫu ("didn\'t watch").',
                  options: {
                    create: [
                      { content: 'She didn\'t watched TV last night.', isCorrect: false },
                      { content: 'She didn\'t watch TV last night.', isCorrect: true },
                      { content: 'She not watched TV last night.', isCorrect: false },
                      { content: 'She doesn\'t watch TV last night.', isCorrect: false },
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`- Đã tạo thành công: ${unit3.title}`);

  // 5. Tạo Unit 4
  const unit4 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Unit 4: Future Simple Tense (Thì Tương lai đơn)',
      content: unit4Content,
      order: 4,
      quizzes: {
        create: [
          {
            title: 'Kiểm tra kiến thức Thì Tương lai đơn',
            questions: {
              create: [
                {
                  content: 'Chọn câu trả lời đúng: "I promise I _______ tell anyone your secret."',
                  explanation: 'Với lời hứa phủ định trong tương lai, ta dùng "won\'t" + động từ nguyên mẫu.',
                  options: {
                    create: [
                      { content: 'don\'t', isCorrect: false },
                      { content: 'won\'t', isCorrect: true },
                      { content: 'am not going to', isCorrect: false },
                      { content: 'haven\'t', isCorrect: false },
                    ]
                  }
                },
                {
                  content: 'Điền từ thích hợp: "Perhaps we _______ (visit) France next summer."',
                  explanation: 'Diễn tả dự đoán tương lai không có căn cứ rõ ràng bằng "will" + động từ nguyên mẫu.',
                  options: {
                    create: [
                      { content: 'will visit', isCorrect: true },
                      { content: 'visited', isCorrect: false },
                      { content: 'are visiting', isCorrect: false },
                      { content: 'visit', isCorrect: false },
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`- Đã tạo thành công: ${unit4.title}`);

  console.log('Hoàn thành việc tạo Unit 3 & 4!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
