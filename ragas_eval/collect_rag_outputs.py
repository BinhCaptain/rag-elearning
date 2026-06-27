"""
collect_rag_outputs.py
──────────────────────
Gọi API hệ thống RAG E-Learning để thu thập outputs cho từng câu hỏi test.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import json
import time
import os
import requests
from datetime import datetime

from config import (
    API_BASE_URL,
    TEST_EMAIL,
    TEST_PASSWORD,
    REQUEST_TIMEOUT,
    DELAY_BETWEEN_REQUESTS,
    RAW_OUTPUTS_FILE,
    RESULTS_DIR,
)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def login() -> str:
    """Đăng nhập và trả về JWT token."""
    print("🔐 Đang đăng nhập vào hệ thống...")
    resp = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()
    token = data.get("access_token") or data.get("token") or data.get("accessToken")
    if not token:
        raise ValueError(f"Không tìm thấy token trong response: {data}")
    print(f"✅ Đăng nhập thành công!")
    return token


def send_message(token: str, question: str, session_id: str | None = None) -> dict:
    """Gửi câu hỏi tới RAG chatbot và lấy kết quả."""
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"message": question}
    if session_id:
        payload["sessionId"] = session_id

    # Correct endpoint: POST /api/v1/chat (not /chat/send)
    resp = requests.post(
        f"{API_BASE_URL}/chat",
        json=payload,
        headers=headers,
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()


def extract_contexts(sources: list) -> list[str]:
    """Trích xuất danh sách text context từ retrieved_sources."""
    contexts = []
    for s in sources:
        text = s.get("chunk_text") or s.get("text") or s.get("content") or ""
        if text:
            contexts.append(str(text))
    return contexts if contexts else ["[No context retrieved]"]


# ─── Main Collection ──────────────────────────────────────────────────────────

def collect_outputs():
    # Load dataset
    with open("test_dataset.json", "r", encoding="utf-8") as f:
        test_dataset = json.load(f)

    print(f"📋 Loaded {len(test_dataset)} test questions")

    # Tạo thư mục results nếu chưa có
    os.makedirs(RESULTS_DIR, exist_ok=True)

    # Đăng nhập
    try:
        token = login()
    except Exception as e:
        print(f"❌ Lỗi đăng nhập: {e}")
        print("💡 Đảm bảo server đang chạy tại http://localhost:3001")
        return

    results = []
    session_id = None  # Tạo session mới cho mỗi câu hỏi (tránh context leak)

    for i, item in enumerate(test_dataset, 1):
        question = item["question"]
        ground_truth = item["ground_truth"]
        category = item["category"]

        print(f"\n[{i:02d}/{len(test_dataset)}] 🤔 Q: {question[:70]}...")

        try:
            # Gọi API (session = None → tạo session mới mỗi lần)
            api_response = send_message(token, question, session_id=None)

            answer = api_response.get("reply", "")
            sources = api_response.get("sources", [])
            timings = api_response.get("timings", {})
            contexts = extract_contexts(sources)

            print(f"   ✅ Answer length: {len(answer)} chars | Contexts: {len(contexts)} chunks | LLM: {timings.get('llmCallMs', '?')}ms")

            results.append({
                "id": item["id"],
                "question": question,
                "answer": answer,
                "contexts": contexts,
                "ground_truth": ground_truth,
                "category": category,
                "sources_count": len(sources),
                "timings": timings,
                "status": "ok",
                "timestamp": datetime.now().isoformat(),
            })

        except requests.exceptions.ConnectionError:
            print(f"   ❌ Không thể kết nối API. Server có đang chạy không?")
            results.append({
                "id": item["id"],
                "question": question,
                "answer": "",
                "contexts": ["[Connection error]"],
                "ground_truth": ground_truth,
                "category": category,
                "sources_count": 0,
                "timings": {},
                "status": "connection_error",
                "timestamp": datetime.now().isoformat(),
            })
        except Exception as e:
            print(f"   ❌ Lỗi: {e}")
            results.append({
                "id": item["id"],
                "question": question,
                "answer": "",
                "contexts": [f"[Error: {str(e)}]"],
                "ground_truth": ground_truth,
                "category": category,
                "sources_count": 0,
                "timings": {},
                "status": "error",
                "timestamp": datetime.now().isoformat(),
            })

        # Tránh rate limit giữa các request
        if i < len(test_dataset):
            print(f"   ⏳ Chờ {DELAY_BETWEEN_REQUESTS}s trước câu tiếp theo...")
            time.sleep(DELAY_BETWEEN_REQUESTS)

    # Lưu kết quả
    with open(RAW_OUTPUTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Tổng kết
    success = sum(1 for r in results if r["status"] == "ok")
    print(f"\n{'='*60}")
    print(f"✅ Hoàn tất! {success}/{len(results)} câu hỏi thành công")
    print(f"📁 Kết quả lưu tại: {RAW_OUTPUTS_FILE}")
    print(f"{'='*60}")
    print(f"\n👉 Bước tiếp theo: python run_evaluation.py")


if __name__ == "__main__":
    collect_outputs()
