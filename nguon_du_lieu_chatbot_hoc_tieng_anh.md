# Tổng hợp nguồn dữ liệu free/open để xây chatbot hỗ trợ học tiếng Anh

## Mục tiêu dữ liệu cần có
Bạn đang cần dữ liệu cho chatbot hỗ trợ học tiếng Anh theo 4 nhóm chính:

1. **Từ vựng**
2. **Ngữ pháp**
3. **Cách nói / mẫu hội thoại**
4. **Đề + đáp án + giải thích vì sao chọn**

> Lưu ý quan trọng: nhóm **“đề có giải thích vì sao chọn đáp án”** là nhóm khó tìm nhất trong nguồn mở. Nhiều bộ dữ liệu chỉ có **câu hỏi + lựa chọn + đáp án đúng**, còn phần **giải thích** thường rất ít hoặc không có sẵn.

---

## 1) Nguồn dữ liệu từ vựng

### 1.1. CEFR-J / Open Language Profiles
- **Loại dữ liệu:** Từ vựng theo level CEFR, grammar profile
- **Phù hợp cho:**  
  - phân cấp từ vựng A1, A2, B1...
  - sinh flashcard
  - kiểm soát độ khó bài học
  - chatbot giải thích từ theo trình độ
- **Ưu điểm:** cấu trúc rõ, rất phù hợp để làm knowledge base hoặc RAG
- **Nên dùng:** RAG / knowledge base, có thể chuyển thành instruction data để fine-tune nhẹ
- **Link:** https://github.com/openlanguageprofiles/olp-en-cefrj

### 1.2. Tatoeba
- **Loại dữ liệu:** câu ví dụ, câu song ngữ, cặp bản dịch
- **Phù hợp cho:**  
  - ví dụ từ vựng trong ngữ cảnh
  - dịch câu Anh–Việt
  - học từ theo mẫu câu
- **Ưu điểm:** nhiều câu thực tế, dễ dùng để tạo bài tập
- **Nên dùng:** RAG hoặc preprocessing thành dữ liệu instruction
- **Link:** https://tatoeba.org/en/
- **Download:** https://tatoeba.org/en/downloads

---

## 2) Nguồn dữ liệu ngữ pháp

### 2.1. CEFR-J Grammar Profile
- **Loại dữ liệu:** cấu trúc ngữ pháp theo cấp độ
- **Phù hợp cho:**  
  - chatbot giải thích ngữ pháp
  - tạo bài học theo level
  - gắn nhãn độ khó cho grammar topic
- **Nên dùng:** RAG / knowledge base
- **Link:** https://github.com/openlanguageprofiles/olp-en-cefrj

### 2.2. BEA-2019 / Write & Improve / LOCNESS
- **Loại dữ liệu:** learner English, grammatical error correction
- **Phù hợp cho:**  
  - sửa lỗi ngữ pháp
  - phản hồi bài viết
  - giải thích lỗi sai của học sinh
- **Ưu điểm:** rất mạnh cho tác vụ grammar correction
- **Hạn chế:** cần đọc kỹ điều khoản sử dụng của từng phần dữ liệu nếu triển khai thương mại
- **Nên dùng:** fine-tune cho grammar correction hoặc tạo phản hồi lỗi
- **Link:** https://www.cl.cam.ac.uk/research/nl/bea2019st/

### 2.3. JFLEG
- **Loại dữ liệu:** câu có lỗi và bản sửa tự nhiên hơn
- **Phù hợp cho:**  
  - sửa lỗi câu viết
  - viết lại câu cho tự nhiên hơn
  - giải thích sự khác nhau giữa “đúng ngữ pháp” và “tự nhiên”
- **Nên dùng:** fine-tune / instruction data
- **Link:** https://aclanthology.org/E17-2037/

### 2.4. Lang-8 / cLang-8
- **Loại dữ liệu:** bài viết của người học + bản sửa
- **Phù hợp cho:**  
  - writing correction
  - phản hồi lỗi người học
- **Lưu ý:** một số bản corpora chỉ dùng cho nghiên cứu/giáo dục, không phù hợp để dùng thương mại trực tiếp
- **Link:** https://sites.google.com/site/naistlang8corpora

---

## 3) Nguồn dữ liệu cách nói / mẫu hội thoại

### 3.1. DailyDialog
- **Loại dữ liệu:** hội thoại tiếng Anh nhiều lượt
- **Phù hợp cho:**  
  - mẫu hội thoại thường ngày
  - chatbot luyện speaking
  - role-play tình huống giao tiếp
  - học cách nói tự nhiên
- **Ưu điểm:** sạch, dễ dùng, gần giao tiếp đời thường
- **Nên dùng:** fine-tune hoặc instruction tuning
- **Link dataset:** https://huggingface.co/datasets/roskoN/dailydialog
- **Paper:** https://arxiv.org/abs/1710.03957

### 3.2. DREAM
- **Loại dữ liệu:** dialogue-based multiple-choice reading comprehension
- **Phù hợp cho:**  
  - bài đọc hội thoại
  - câu hỏi theo đoạn hội thoại
  - luyện kỹ năng hiểu hội thoại
- **Ưu điểm:** sát với mục tiêu học tiếng Anh theo đề
- **Hạn chế:** phần giải thích đáp án không mạnh
- **Nên dùng:** luyện đề / RAG / tạo bài tập
- **Link paper:** https://aclanthology.org/Q19-1014/

---

## 4) Nguồn dữ liệu đề thi / bài tập tiếng Anh

### 4.1. RACE
- **Loại dữ liệu:** passage + câu hỏi trắc nghiệm + đáp án
- **Phù hợp cho:**  
  - reading comprehension
  - ngân hàng đề trắc nghiệm
  - tạo bài kiểm tra theo dạng exam
- **Ưu điểm:** dữ liệu lớn, format rõ ràng
- **Hạn chế:** thường không có giải thích đáp án chi tiết
- **Nên dùng:** RAG / item bank / tạo đề
- **Link:** https://huggingface.co/datasets/ehovy/race

### 4.2. SQuAD
- **Loại dữ liệu:** đoạn đọc + câu hỏi + câu trả lời
- **Phù hợp cho:**  
  - reading comprehension
  - chatbot hỏi đáp theo ngữ cảnh
  - tạo bài học đọc hiểu
- **Ưu điểm:** chuẩn, phổ biến
- **Hạn chế:** không phải dạng multiple choice exam truyền thống
- **Nên dùng:** RAG / reading QA
- **Link:** https://rajpurkar.github.io/SQuAD-explorer/

### 4.3. CoQA
- **Loại dữ liệu:** conversational question answering
- **Phù hợp cho:**  
  - đọc hiểu hội thoại
  - hỏi đáp theo đoạn văn
- **Nên dùng:** RAG hoặc fine-tune nhẹ cho contextual QA
- **Link:** https://stanfordnlp.github.io/coqa/

---

## 5) Nguồn dữ liệu có giải thích đáp án

### 5.1. CoS-E
- **Loại dữ liệu:** multiple-choice QA + explanation
- **Phù hợp cho:**  
  - huấn luyện chatbot trả lời kiểu “đáp án đúng là ... vì ...”
  - học format giải thích lựa chọn
- **Ưu điểm:** có explanation
- **Hạn chế:** thiên về commonsense reasoning, không phải đề tiếng Anh học đường thuần
- **Nên dùng:** fine-tune phong cách giải thích
- **Link:** https://huggingface.co/datasets/Salesforce/cos_e

### 5.2. ECQA
- **Loại dữ liệu:** explainable commonsense question answering
- **Phù hợp cho:**  
  - sinh lời giải thích cho đáp án
  - tạo cấu trúc phản hồi “đúng vì sao, sai vì sao”
- **Ưu điểm:** có trường explanation, khá hữu ích để dạy chatbot cách giải thích
- **Hạn chế:** vẫn thiên về reasoning hơn là grammar/exam tiếng Anh thuần
- **Nên dùng:** fine-tune cho explanation format
- **Link:** https://huggingface.co/datasets/yangdong/ecqa
- **Paper:** https://aclanthology.org/2021.acl-long.238.pdf

---

## 6) Nguồn dữ liệu nghe nói (nếu chatbot có speaking/listening)

### 6.1. Mozilla Common Voice
- **Loại dữ liệu:** giọng nói + transcript
- **Phù hợp cho:**  
  - luyện nghe
  - nhận diện giọng nói
  - speaking chatbot
- **Ưu điểm:** miễn phí, phổ biến
- **Nên dùng:** ASR / speech module
- **Link:** https://commonvoice.mozilla.org/

### 6.2. LibriSpeech / LibriTTS
- **Loại dữ liệu:** audio đọc sách + transcript
- **Phù hợp cho:**  
  - luyện nghe
  - text-to-speech
  - speech recognition
- **Hạn chế:** thiên về giọng đọc sách, không phải hội thoại tự nhiên
- **Link:** https://www.openslr.org/12
- **Link:** https://www.openslr.org/60

---

## 7) Nguồn dữ liệu đọc hiểu / thư viện tri thức để làm RAG

### 7.1. Project Gutenberg
- **Loại dữ liệu:** sách tiếng Anh miễn phí
- **Phù hợp cho:**  
  - bài đọc
  - từ vựng trong ngữ cảnh
  - tạo câu hỏi đọc hiểu
- **Nên dùng:** RAG / reading corpus
- **Link:** https://www.gutenberg.org/

### 7.2. Wikipedia Dumps
- **Loại dữ liệu:** kho bài viết bách khoa
- **Phù hợp cho:**  
  - xây knowledge base
  - reading comprehension
  - giải thích từ/cụm theo ngữ cảnh
- **Nên dùng:** RAG
- **Link:** https://dumps.wikimedia.org/

---

## 8) Bảng tổng hợp nhanh

| Nguồn | Nhóm dữ liệu | Có giải thích đáp án không | Nên dùng cho | Hướng dùng |
|---|---|---:|---|---|
| CEFR-J / OLP | Từ vựng, ngữ pháp | Không trực tiếp | level, vocab, grammar | RAG / KB |
| Tatoeba | Câu ví dụ, song ngữ | Không | ví dụ câu, dịch, vocab context | RAG / preprocess |
| DailyDialog | Cách nói, hội thoại | Không | speaking chatbot | Fine-tune |
| BEA / W&I | Ngữ pháp, sửa lỗi | Có ở mức phản hồi lỗi | grammar correction | Fine-tune |
| JFLEG | Sửa lỗi và viết tự nhiên | Có gián tiếp | rewrite, feedback | Fine-tune |
| RACE | Đề đọc hiểu | Thường không | ngân hàng đề | RAG / exam bank |
| DREAM | Đề hội thoại | Thường không | đề hội thoại | RAG / exam bank |
| SQuAD | Đọc hiểu QA | Không | reading QA | RAG |
| CoQA | Hỏi đáp hội thoại | Không | contextual QA | RAG / tune nhẹ |
| CoS-E | QA + explanation | Có | dạy format giải thích đáp án | Fine-tune |
| ECQA | QA + explanation | Có | giải thích lựa chọn | Fine-tune |
| Common Voice | Speech | Không | nghe nói | Speech module |
| LibriSpeech / LibriTTS | Speech | Không | listening / TTS / ASR | Speech module |
| Gutenberg | Reading corpus | Không | bài đọc, từ vựng | RAG |
| Wikipedia Dumps | Knowledge corpus | Không | knowledge base | RAG |

---

## 9) Bộ dữ liệu khuyến nghị nếu muốn bắt đầu nhanh

Nếu chỉ lấy một bộ gọn để bắt đầu xây chatbot học tiếng Anh, nên lấy:

1. **CEFR-J / Open Language Profiles**  
   -> làm khung từ vựng + ngữ pháp

2. **DailyDialog**  
   -> làm dữ liệu cách nói / speaking

3. **RACE + DREAM**  
   -> làm ngân hàng đề và bài đọc

4. **ECQA / CoS-E**  
   -> dạy chatbot giải thích đáp án

5. **Tatoeba**  
   -> bổ sung ví dụ câu và dịch Anh–Việt

---

## 10) Nên train trực tiếp hay dùng RAG?

### Nên fine-tune / instruction-tune
- DailyDialog
- BEA / Write & Improve
- JFLEG
- CoS-E
- ECQA

### Nên dùng làm RAG / knowledge base
- CEFR-J
- Tatoeba
- RACE
- DREAM
- Gutenberg
- Wikipedia

### Lý do
Với chatbot học tiếng Anh, cách hiệu quả nhất thường là:

- **Fine-tune model** để học cách phản hồi như giáo viên
- **Dùng RAG** để kéo kiến thức từ vựng, ngữ pháp, đề và lời giải

Cách này rẻ hơn, dễ kiểm soát hơn và dễ cập nhật hơn so với train lại toàn bộ model.

---

## 11) Gợi ý pipeline thực tế cho dự án của bạn

### Giai đoạn 1: Thu thập dữ liệu
- Từ vựng/ngữ pháp: CEFR-J
- Cách nói: DailyDialog
- Ví dụ câu: Tatoeba
- Đề: RACE, DREAM
- Giải thích đáp án: ECQA, CoS-E
- Sửa lỗi ngữ pháp: BEA, JFLEG

### Giai đoạn 2: Chuẩn hóa format
Nên đưa về chung một schema như:

```json
{
  "instruction": "...",
  "input": "...",
  "output": "...",
  "skill": "vocabulary|grammar|speaking|exam|explanation",
  "level": "A1|A2|B1|B2|C1|C2",
  "source": "...",
  "license": "..."
}
```

### Giai đoạn 3: Tự sinh thêm dữ liệu explanation
Vì dữ liệu open có sẵn phần “giải thích đáp án” không nhiều, nên nên tự tạo thêm theo mẫu:

- Đáp án đúng là gì
- Vì sao đáp án này đúng
- Vì sao các đáp án khác sai
- Quy tắc ngữ pháp liên quan
- Ví dụ tương tự

### Giai đoạn 4: Chia hệ thống thành 2 lớp
- **Model layer:** fine-tune phong cách phản hồi
- **Knowledge layer:** RAG từ vocab/grammar/exam bank

---

## 12) Kết luận

Nếu mục tiêu của bạn là xây chatbot hỗ trợ học tiếng Anh với khả năng:
- dạy từ vựng,
- giải thích ngữ pháp,
- hướng dẫn cách nói,
- cho bài tập/đề,
- giải thích vì sao chọn đáp án,

thì chiến lược phù hợp nhất là:

- dùng **CEFR-J** làm xương sống từ vựng và ngữ pháp,
- dùng **DailyDialog** cho phần cách nói,
- dùng **RACE/DREAM** cho phần đề,
- dùng **ECQA/CoS-E** cho format giải thích đáp án,
- kết hợp **BEA/JFLEG** cho sửa lỗi và phản hồi bài viết.

> Điểm quan trọng nhất: đừng chỉ train một model từ dữ liệu thô. Nên kết hợp **fine-tune + RAG + rule-based explanation templates** để chatbot vừa đúng kiến thức, vừa giải thích giống giáo viên.

---

## 13) Danh sách link nhanh

- CEFR-J / Open Language Profiles: https://github.com/openlanguageprofiles/olp-en-cefrj
- Tatoeba: https://tatoeba.org/en/
- Tatoeba downloads: https://tatoeba.org/en/downloads
- DailyDialog: https://huggingface.co/datasets/roskoN/dailydialog
- DailyDialog paper: https://arxiv.org/abs/1710.03957
- BEA-2019 Shared Task: https://www.cl.cam.ac.uk/research/nl/bea2019st/
- JFLEG paper: https://aclanthology.org/E17-2037/
- Lang-8 corpora: https://sites.google.com/site/naistlang8corpora
- RACE: https://huggingface.co/datasets/ehovy/race
- DREAM paper: https://aclanthology.org/Q19-1014/
- SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- CoQA: https://stanfordnlp.github.io/coqa/
- CoS-E: https://huggingface.co/datasets/Salesforce/cos_e
- ECQA: https://huggingface.co/datasets/yangdong/ecqa
- ECQA paper: https://aclanthology.org/2021.acl-long.238.pdf
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- LibriSpeech: https://www.openslr.org/12
- LibriTTS: https://www.openslr.org/60
- Project Gutenberg: https://www.gutenberg.org/
- Wikimedia Dumps: https://dumps.wikimedia.org/
