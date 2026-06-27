import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Xóa các khóa học không phù hợp đã tạo trước đó
  const coursesToDelete = [
    'Tiếng Anh Giao tiếp Hàng ngày',
    'Lập trình Python Cơ bản',
    'Tin học Văn phòng Microsoft Office',
    'Kỹ năng Viết Email Công việc (Professional Email Writing)',
  ];

  console.log('Đang xóa các khóa học cũ không phù hợp...');
  for (const title of coursesToDelete) {
    const course = await prisma.course.findFirst({ where: { title } });
    if (course) {
      await prisma.course.delete({ where: { id: course.id } });
      console.log(`- Đã xóa khóa học: ${title}`);
    }
  }

  // 2. Dữ liệu cho 4 khóa học nối tiếp dành cho học sinh THCS
  const newCoursesData = [
    {
      title: 'Ngữ pháp Tiếng Anh THCS - Tập 2',
      description: 'Tiếp nối Tập 1, hệ thống các thì nâng cao và cấu trúc so sánh thường gặp trong chương trình THCS.',
      level: 'A2',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Present Perfect Tense (Thì Hiện tại hoàn thành)',
          content: '### Mục tiêu bài học\n- Nắm vững công thức và các từ nhận biết thì Hiện tại hoàn thành.\n\n### Nội dung\n- **Công thức:** S + have/has + V3/ed\n- **Dấu hiệu:** since, for, already, yet, ever, never, just.',
          order: 1,
          quizTitle: 'Trắc nghiệm: Present Perfect Tense',
          questions: [
            {
              content: 'Chọn câu viết đúng thì Hiện tại hoàn thành:',
              explanation: 'Chủ ngữ "He" đi với "has" + V3 ("has lived").',
              options: [
                { content: 'He has lived here since 2010.', isCorrect: true },
                { content: 'He have lived here since 2010.', isCorrect: false },
                { content: 'He lived here since 2010.', isCorrect: false },
                { content: 'He is living here since 2010.', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Past Continuous Tense (Thì Quá khứ tiếp diễn)',
          content: '### Mục tiêu bài học\n- Nắm vững công thức và cách kết hợp giữa Quá khứ tiếp diễn và Quá khứ đơn bằng "when/while".\n\n### Nội dung\n- **Công thức:** S + was/were + V-ing\n- **Cách dùng:** Hành động đang diễn ra tại một thời điểm xác định trong quá khứ.',
          order: 2,
          quizTitle: 'Trắc nghiệm: Past Continuous Tense',
          questions: [
            {
              content: 'Điền từ thích hợp: "I was doing my homework when the phone _______ (ring)."',
              explanation: 'Hành động xen vào ("the phone rang") chia ở thì Quá khứ đơn.',
              options: [
                { content: 'rang', isCorrect: true },
                { content: 'was ringing', isCorrect: false },
                { content: 'rings', isCorrect: false },
                { content: 'rung', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Comparisons (Cấu trúc so sánh)',
          content: '### Mục tiêu bài học\n- Sử dụng thành thạo so sánh hơn, so sánh nhất đối với tính từ ngắn và tính từ dài.\n\n### Nội dung\n- **So sánh hơn:** S1 + V + adj-er + than + S2 | S1 + V + more + adj + than + S2\n- **So sánh nhất:** S + V + the + adj-est | S + V + the most + adj',
          order: 3,
          quizTitle: 'Trắc nghiệm: Comparisons',
          questions: [
            {
              content: 'Chọn câu so sánh đúng nhất:',
              explanation: '"beautiful" là tính từ dài nên ta dùng cấu trúc "more beautiful than".',
              options: [
                { content: 'She is more beautiful than her sister.', isCorrect: true },
                { content: 'She is beautifuler than her sister.', isCorrect: false },
                { content: 'She is the most beautiful than her sister.', isCorrect: false },
                { content: 'She is as beautiful than her sister.', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Modal Verbs (Động từ khuyết thiếu)',
          content: '### Mục tiêu bài học\n- Sử dụng các động từ khuyết thiếu: can, could, must, should để diễn đạt khả năng, nghĩa vụ và lời khuyên.\n\n### Nội dung\n- Cấu trúc chung: S + Modal Verb + V-bare\n- **Should:** Khuyên bảo | **Must:** Bắt buộc | **Can/Could:** Khả năng.',
          order: 4,
          quizTitle: 'Trắc nghiệm: Modal Verbs',
          questions: [
            {
              content: 'Khi khuyên ai đó nên làm gì, ta dùng từ nào?',
              explanation: '"Should" dùng để đưa ra lời khuyên.',
              options: [
                { content: 'must', isCorrect: false },
                { content: 'should', isCorrect: true },
                { content: 'can', isCorrect: false },
                { content: 'could', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Ngữ pháp Tiếng Anh THCS - Tập 3',
      description: 'Làm chủ các cấu trúc ngữ pháp trọng tâm học kỳ 2 lớp 8 và lớp 9 như Câu bị động và Câu điều kiện.',
      level: 'B1',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Passive Voice (Câu bị động)',
          content: '### Mục tiêu bài học\n- Chuyển đổi câu chủ động sang câu bị động cơ bản.\n\n### Nội dung\n- **Cấu trúc chung:** S + be + V3/ed + (by O)\n- Thì hiện tại đơn bị động: am/is/are + V3/ed',
          order: 1,
          quizTitle: 'Trắc nghiệm: Passive Voice',
          questions: [
            {
              content: 'Chuyển sang câu bị động: "They build this bridge in 2020."',
              explanation: 'Thời quá khứ đơn bị động: "was built" đi với chủ ngữ số ít "This bridge".',
              options: [
                { content: 'This bridge was built in 2020.', isCorrect: true },
                { content: 'This bridge is built in 2020.', isCorrect: false },
                { content: 'This bridge built in 2020.', isCorrect: false },
                { content: 'This bridge has been built in 2020.', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Conditional Sentences - Type 1 (Câu điều kiện loại 1)',
          content: '### Mục tiêu bài học\n- Diễn tả giả định có thể xảy ra ở hiện tại hoặc tương lai.\n\n### Nội dung\n- **Công thức:** If + S + V(hiện tại đơn), S + will/can + V-bare',
          order: 2,
          quizTitle: 'Trắc nghiệm: Conditional Type 1',
          questions: [
            {
              content: 'Điền vào chỗ trống: "If it rains tomorrow, we _______ the picnic."',
              explanation: 'Mệnh đề chính của câu điều kiện loại 1 dùng "will" + động từ nguyên mẫu ("will cancel").',
              options: [
                { content: 'cancel', isCorrect: false },
                { content: 'will cancel', isCorrect: true },
                { content: 'cancelled', isCorrect: false },
                { content: 'would cancel', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Relative Clauses (Mệnh đề quan hệ)',
          content: '### Mục tiêu bài học\n- Sử dụng các đại từ quan hệ Who, Whom, Which, That để nối hai câu đơn.\n\n### Nội dung\n- **Who:** Thay thế cho người (chủ ngữ)\n- **Which:** Thay thế cho vật (chủ ngữ/tân ngữ)\n- **That:** Thay thế cho cả người lẫn vật.',
          order: 3,
          quizTitle: 'Trắc nghiệm: Relative Clauses',
          questions: [
            {
              content: 'Điền đại từ quan hệ đúng: "The girl _______ called me yesterday is my classmate."',
              explanation: '"The girl" chỉ người đóng vai trò chủ ngữ nên dùng "who".',
              options: [
                { content: 'which', isCorrect: false },
                { content: 'who', isCorrect: true },
                { content: 'whom', isCorrect: false },
                { content: 'whose', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Reported Speech (Câu gián tiếp)',
          content: '### Mục tiêu bài học\n- Chuyển đổi câu trực tiếp sang gián tiếp bằng quy tắc lùi thì và đổi đại từ.',
          order: 4,
          quizTitle: 'Trắc nghiệm: Reported Speech',
          questions: [
            {
              content: 'Đổi sang gián tiếp: "I am tired", she said.',
              explanation: 'Thì hiện tại đơn lùi sang quá khứ đơn ("was"), đại từ "I" đổi thành "she".',
              options: [
                { content: 'She said she is tired.', isCorrect: false },
                { content: 'She said she was tired.', isCorrect: true },
                { content: 'She said I was tired.', isCorrect: false },
                { content: 'She said she has been tired.', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Ngữ pháp Tiếng Anh THCS - Tập 4',
      description: 'Khóa học ôn thi cuối kỳ lớp 9 và chuẩn bị cho kỳ thi tuyển sinh lớp 10 THPT công lập.',
      level: 'B1',
      isPublished: true,
      lessons: [
        {
          title: 'Unit 1: Conditional Sentences - Type 2 (Câu điều kiện loại 2)',
          content: '### Mục tiêu bài học\n- Diễn tả giả định không có thật hoặc trái ngược với thực tế ở hiện tại.\n\n### Nội dung\n- **Công thức:** If + S + V2/ed (tobe dùng were), S + would/could + V-bare',
          order: 1,
          quizTitle: 'Trắc nghiệm: Conditional Type 2',
          questions: [
            {
              content: 'Điền vào chỗ trống: "If I _______ you, I would study harder."',
              explanation: 'Trong câu điều kiện loại 2, động từ TO BE ở mệnh đề If luôn chia là "were" với mọi chủ ngữ.',
              options: [
                { content: 'am', isCorrect: false },
                { content: 'was', isCorrect: false },
                { content: 'were', isCorrect: true },
                { content: 'be', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 2: Gerunds and Infinitives (Danh động từ & Động từ nguyên mẫu)',
          content: '### Mục tiêu bài học\n- Phân biệt các động từ đi với V-ing và to-V.\n\n### Nội dung\n- **V-ing:** enjoy, avoid, mind, practice, suggest...\n- **To-V:** decide, want, hope, promise, agree...',
          order: 2,
          quizTitle: 'Trắc nghiệm: Gerunds & Infinitives',
          questions: [
            {
              content: 'Điền từ thích hợp: "She suggested _______ (go) to the park."',
              explanation: 'Động từ "suggest" đi kèm danh động từ V-ing ("going").',
              options: [
                { content: 'go', isCorrect: false },
                { content: 'to go', isCorrect: false },
                { content: 'going', isCorrect: true },
                { content: 'went', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 3: Wish Clauses (Câu ước)',
          content: '### Mục tiêu bài học\n- Viết câu ước ở hiện tại diễn tả mong muốn trái ngược với thực tế.\n\n### Nội dung\n- **Cấu trúc câu ước hiện tại:** S + wish(es) + S + V2/ed (tobe dùng were).',
          order: 3,
          quizTitle: 'Trắc nghiệm: Wish Clauses',
          questions: [
            {
              content: 'Viết lại câu ước của: "I don\'t have a computer."',
              explanation: 'Câu ước ở hiện tại lùi thì sang quá khứ đơn ("had").',
              options: [
                { content: 'I wish I have a computer.', isCorrect: false },
                { content: 'I wish I had a computer.', isCorrect: true },
                { content: 'I wish I will have a computer.', isCorrect: false },
                { content: 'I wish I would have a computer.', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Unit 4: Tag Questions (Câu hỏi đuôi)',
          content: '### Mục tiêu bài học\n- Thành lập và sử dụng câu hỏi đuôi chính xác theo nguyên tắc trái ngược khẳng/phủ định.',
          order: 4,
          quizTitle: 'Trắc nghiệm: Tag Questions',
          questions: [
            {
              content: 'Tìm câu hỏi đuôi chính xác: "You like learning English, _______?"',
              explanation: 'Mệnh đề trước khẳng định ở hiện tại đơn (like) nên câu hỏi đuôi dùng phủ định "don\'t you".',
              options: [
                { content: 'don\'t you', isCorrect: true },
                { content: 'do you', isCorrect: false },
                { content: 'aren\'t you', isCorrect: false },
                { content: 'haven\'t you', isCorrect: false },
              ]
            }
          ]
        }
      ]
    },
    {
      title: 'Từ vựng IELTS cho người bắt đầu - Tập 2',
      description: 'Phần 2 tiếp tục bổ sung các chủ đề từ vựng nâng cao hơn phục vụ viết và nói IELTS cho học sinh THCS có nguyện vọng học sớm.',
      level: 'B1',
      isPublished: true,
      lessons: [
        {
          title: 'Topic 5: Work & Careers (Công việc và Nghề nghiệp)',
          content: '### Mục tiêu bài học\n- Học từ vựng về định hướng nghề nghiệp, kỹ năng làm việc.\n\n### Nội dung\n- **Career path (n):** Con đường sự nghiệp\n- **Job satisfaction (n):** Sự hài lòng trong công việc\n- **White-collar / Blue-collar job (n):** Việc văn phòng / lao động tay chân.',
          order: 1,
          quizTitle: 'Trắc nghiệm: Work & Careers',
          questions: [
            {
              content: 'Từ nào dùng để chỉ công việc làm việc trong văn phòng?',
              explanation: '"White-collar" dùng để chỉ công việc văn phòng, bàn giấy.',
              options: [
                { content: 'Blue-collar', isCorrect: false },
                { content: 'White-collar', isCorrect: true },
                { content: 'Manual labor', isCorrect: false },
                { content: 'Freelance', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Topic 6: Travel & Tourism (Du lịch và Lữ hành)',
          content: '### Mục tiêu bài học\n- Từ vựng mô tả trải nghiệm du lịch, địa điểm và văn hóa các quốc gia.\n\n### Nội dung\n- **Breathtaking view (n.phr):** Cảnh đẹp nghẹt thở\n- **Local delicacy (n.phr):** Đặc sản địa phương\n- **Tourist attraction (n.phr):** Địa điểm thu hút khách du lịch.',
          order: 2,
          quizTitle: 'Trắc nghiệm: Travel & Tourism',
          questions: [
            {
              content: 'Điền từ: "Halong Bay is one of the most famous tourist _______ in Vietnam."',
              explanation: '"Tourist attractions" là các điểm thu hút khách du lịch.',
              options: [
                { content: 'destines', isCorrect: false },
                { content: 'attractions', isCorrect: true },
                { content: 'delicacies', isCorrect: false },
                { content: 'facilities', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Topic 7: Media & Advertising (Truyền thông và Quảng cáo)',
          content: '### Mục tiêu bài học\n- Từ vựng về ảnh hưởng của mạng xã hội, tin tức truyền thông đối với giới trẻ.\n\n### Nội dung\n- **Inundated with ads (phr):** Bị ngập trong quảng cáo\n- **Sensational news (n.phr):** Tin giật gân\n- **Filter bubble (n.phr):** Bộ lọc thông tin thiên vị.',
          order: 3,
          quizTitle: 'Trắc nghiệm: Media & Advertising',
          questions: [
            {
              content: 'Khi nói về tin tức mang tính phóng đại, gây sốc, ta gọi là gì?',
              explanation: '"Sensational news" là tin tức giật gân, phóng đại.',
              options: [
                { content: 'Objective news', isCorrect: false },
                { content: 'Sensational news', isCorrect: true },
                { content: 'Editorial', isCorrect: false },
                { content: 'Classified ads', isCorrect: false },
              ]
            }
          ]
        },
        {
          title: 'Topic 8: Sports & Leisure (Thể thao và Giải trí)',
          content: '### Mục tiêu bài học\n- Từ vựng về lợi ích thể thao và các hoạt động giải trí lành mạnh cho học sinh.\n\n### Nội dung\n- **Physical fitness (n):** Sức khỏe thể chất\n- **Teamwork spirit (n):** Tinh thần đồng đội\n- **Sedentary habits (n.phr):** Thói quen ngồi nhiều.',
          order: 4,
          quizTitle: 'Trắc nghiệm: Sports & Leisure',
          questions: [
            {
              content: 'Hoạt động thể thao giúp cải thiện khía cạnh nào nhiều nhất?',
              explanation: '"Physical fitness" là sức khỏe thể chất.',
              options: [
                { content: 'Sedentary habits', isCorrect: false },
                { content: 'Physical fitness', isCorrect: true },
                { content: 'Filter bubbles', isCorrect: false },
                { content: 'Breathtaking view', isCorrect: false },
              ]
            }
          ]
        }
      ]
    }
  ];

  console.log('Bắt đầu tạo 4 khóa học THCS mới...');

  for (const courseData of newCoursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        isPublished: courseData.isPublished,
      }
    });

    console.log(`- Đã tạo khóa học THCS: ${course.title} (ID: ${course.id})`);

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

  console.log('Đã cập nhật toàn bộ hệ thống khóa học nối tiếp THCS thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
