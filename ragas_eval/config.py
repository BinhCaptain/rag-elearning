"""
config.py - Cấu hình cho RAGAS Evaluation Pipeline
"""

import os

# ── API Backend ───────────────────────────────────────────────
API_BASE_URL = "http://localhost:3001/api/v1"

# Tài khoản student để test chatbot (seeded từ create-users.ts)
TEST_EMAIL = "student1@gmail.com"
TEST_PASSWORD = "User@123"

# ── Gemini API Keys (lấy từ .env của dự án) ───────────────────
# Danh sách keys để xoay vòng, tránh rate limit
def load_gemini_keys():
    # Thử đọc từ file .env của dự án
    possible_paths = [
        os.path.join(os.path.dirname(__file__), "../apps/api/.env"),
        os.path.join(os.path.dirname(__file__), "../.env"),
    ]
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip().startswith("GEMINI_API_KEYS="):
                        val = line.split("=", 1)[1].strip()
                        val = val.strip('"\'')
                        keys = [k.strip() for k in val.split(",") if k.strip()]
                        if keys:
                            return keys
                    elif line.strip().startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip()
                        val = val.strip('"\'')
                        if val:
                            return [val]
    # Fallback
    return [
        "AIzaSyDRHPNhxtg-1LxCm4vcMvXPLBVa8lAsU0w",
        "AIzaSyBwDVtR9uTTO7t_zB9ggmTKy4Qzb5C4hoE",
        "AIzaSyBw5UJ7NhtbBkWQgfuI587h0rw1kOCJ7sE",
        "AIzaSyD8o7hEVrZQYPMs-Wl39OkPxNsqRoGZyms",
        "AIzaSyB7goizDfsCYddqQCE9OBKKWEfempjlW8I",
        "AIzaSyA64MF4LK6v7yWf_CpHfpElb4yHyi2LsO8",
        "AIzaSyCVrtOAowQfA1HYQt-csW6WO5PdIbbl6f0",
    ]

GEMINI_API_KEYS = load_gemini_keys()

# Key đầu tiên làm mặc định cho RAGAS judge
GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else ""


# ── Output directories ────────────────────────────────────────
RESULTS_DIR = "results"
RAW_OUTPUTS_FILE = "results/raw_outputs.json"
RAGAS_SCORES_FILE = "results/ragas_scores.json"
REPORT_FILE = "results/ragas_report.md"

# ── Test settings ─────────────────────────────────────────────
REQUEST_TIMEOUT = 60   # giây
DELAY_BETWEEN_REQUESTS = 3  # giây, tránh rate limit
