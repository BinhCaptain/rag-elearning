import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Tìm khóa học IELTS
  const course = await prisma.course.findFirst({
    where: {
      title: 'Từ vựng IELTS cho người bắt đầu',
    },
  });

  if (!course) {
    console.error('Không tìm thấy khóa học "Từ vựng IELTS cho người bắt đầu" trong Database.');
    process.exit(1);
  }

  console.log(`Tìm thấy khóa học: ${course.title} (ID: ${course.id})`);

  // 2. Định nghĩa nội dung đầy đủ cho Topic 3
  const topic3Content = `### Mục tiêu bài học
- Nắm vững các từ vựng IELTS chủ đề Công nghệ (Technology) & Phát minh (Innovation).
- Biết cách áp dụng từ vựng vào bài thi Speaking và Writing.

### 1. Từ vựng cốt lõi (Core Vocabulary)
*   **Cutting-edge (adj):** Cực kỳ hiện đại, tiên tiến nhất.
    *   *Ví dụ:* Scientists are developing cutting-edge technology to detect cancer early.
*   **Breakthrough (n):** Bước đột phá.
    *   *Ví dụ:* The discovery of penicillin was a major medical breakthrough.
*   **Obsolete (adj):** Lỗi thời, không còn được sử dụng.
    *   *Ví dụ:* Gas lamps became obsolete when electric lights were invented.
*   **State-of-the-art (adj):** Hiện đại nhất, tối tân nhất (đồng nghĩa với cutting-edge).
    *   *Ví dụ:* The new hospital is equipped with state-of-the-art medical facilities.
*   **Tech-savvy (adj):** Am hiểu công nghệ, thành thạo công nghệ.
    *   *Ví dụ:* The younger generation is extremely tech-savvy.

### 2. Collocations hay dùng trong IELTS
*   **Harness technology:** Khai thác công nghệ.
*   **Technological advances:** Những tiến bộ về mặt công nghệ.
*   **Revolutionize the way we live:** Cách mạng hóa cách chúng ta sống.
*   **Glued to a screen:** Dán mắt vào màn hình.

### 3. Ví dụ áp dụng IELTS Writing Task 2
*   **Đề bài:** *Does technology bring people closer together or isolate them?*
*   **Đoạn mẫu:** "While some argue that **technological advances** isolate individuals, others believe it connects us. With **state-of-the-art** communication tools, people can interact globally in real-time. However, being **glued to a screen** all day may reduce face-to-face interactions."
`;

  // 3. Định nghĩa nội dung đầy đủ cho Topic 4
  const topic4Content = `### Mục tiêu bài học
- Nắm vững các từ vựng IELTS chủ đề Sức khỏe (Health) & Phong cách sống (Lifestyle).
- Biết cách mô tả chế độ ăn uống, tập luyện và sức khỏe tinh thần.

### 1. Từ vựng cốt lõi (Core Vocabulary)
*   **Sedentary lifestyle (n.phr):** Lối sống thụ động, ít vận động.
    *   *Ví dụ:* A sedentary lifestyle can lead to various health problems such as obesity.
*   **Nutrient-dense (adj):** Giàu chất dinh dưỡng.
    *   *Ví dụ:* Leafy green vegetables are highly nutrient-dense foods.
*   **Detrimental (adj):** Có hại, bất lợi (bằng nghĩa với harmful).
    *   *Ví dụ:* Lack of sleep is detrimental to your mental health.
*   **Well-being (n):** Trạng thái khỏe mạnh, hạnh phúc (thể chất lẫn tinh thần).
    *   *Ví dụ:* Yoga is a great way to improve your general well-being.
*   **Immune system (n):** Hệ miễn dịch.
    *   *Ví dụ:* Eating fresh fruits help strengthen your immune system.

### 2. Collocations hay dùng trong IELTS
*   **Maintain a balanced diet:** Duy trì chế độ ăn uống cân bằng.
*   **Build up resistance to disease:** Tăng cường sức đề kháng chống lại bệnh tật.
*   **Relieve stress / Alleviate anxiety:** Giảm căng thẳng / lo âu.
*   **Take up a sport:** Bắt đầu tập một môn thể thao.

### 3. Ví dụ áp dụng IELTS Speaking Part 3
*   **Câu hỏi:** *What can people do to improve their health?*
*   **Câu trả lời mẫu:** "In my opinion, individuals should avoid a **sedentary lifestyle** by **taking up a sport** or doing regular physical exercise. Additionally, they must **maintain a balanced diet** with **nutrient-dense** meals to boost their **immune system** and protect their overall **well-being**."
`;

  // 4. Tạo Topic 3
  const topic3 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Topic 3: Technology & Innovation',
      content: topic3Content,
      order: 3,
      quizzes: {
        create: [
          {
            title: 'Kiểm tra từ vựng Topic 3: Technology',
            questions: {
              create: [
                {
                  content: 'Từ nào đồng nghĩa với "modern and using the most recent technology"?',
                  explanation: '"State-of-the-art" dùng để mô tả công nghệ hiện đại, tối tân nhất.',
                  options: {
                    create: [
                      { content: 'Obsolete', isCorrect: false },
                      { content: 'State-of-the-art', isCorrect: true },
                      { content: 'Sedentary', isCorrect: false },
                      { content: 'Nutrient-dense', isCorrect: false },
                    ]
                  }
                },
                {
                  content: 'Điền từ thích hợp: "A major medical _______ was achieved when the new vaccine was developed."',
                  explanation: '"Breakthrough" nghĩa là một bước đột phá quan trọng.',
                  options: {
                    create: [
                      { content: 'breakthrough', isCorrect: true },
                      { content: 'obsolete', isCorrect: false },
                      { content: 'detrimental', isCorrect: false },
                      { content: 'well-being', isCorrect: false },
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
  console.log(`- Đã tạo thành công: ${topic3.title}`);

  // 5. Tạo Topic 4
  const topic4 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Topic 4: Health & Lifestyle',
      content: topic4Content,
      order: 4,
      quizzes: {
        create: [
          {
            title: 'Kiểm tra từ vựng Topic 4: Health',
            questions: {
              create: [
                {
                  content: 'Lối sống ít vận động, dành nhiều thời gian ngồi một chỗ được gọi là gì?',
                  explanation: '"Sedentary lifestyle" là lối sống ít vận động.',
                  options: {
                    create: [
                      { content: 'Active lifestyle', isCorrect: false },
                      { content: 'Nutrient-dense lifestyle', isCorrect: false },
                      { content: 'Sedentary lifestyle', isCorrect: true },
                      { content: 'Tech-savvy lifestyle', isCorrect: false },
                    ]
                  }
                },
                {
                  content: 'Từ "detrimental" có nghĩa gần nhất với từ nào dưới đây?',
                  explanation: '"Detrimental" có nghĩa là gây hại, bất lợi, gần nghĩa nhất với "harmful".',
                  options: {
                    create: [
                      { content: 'Beneficial', isCorrect: false },
                      { content: 'Harmful', isCorrect: true },
                      { content: 'Obsolete', isCorrect: false },
                      { content: 'Modern', isCorrect: false },
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
  console.log(`- Đã tạo thành công: ${topic4.title}`);

  console.log('Hoàn thành việc tạo Topic 3 & 4!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
