# BillSplit AI 🧾

Upload a photo of a restaurant bill, let AI extract the items automatically, assign items to friends, and split the total fairly — including tax and service charge.

**Live demo:** https://bill-split-ai-lime.vercel.app

## How it works

📷 Bill photo → FastAPI backend (`POST /extract-bill`) → Gemini 3.6 Flash (vision model) → Structured JSON validated with Pydantic → React frontend (assign items to people) → Fair split (tax & service distributed proportionally)

## Tech stack

- **Backend:** FastAPI, Pydantic, Google Gemini API (`google-genai`) — deployed on Render
- **Frontend:** React + Vite — deployed on Vercel

## Features

- 📷 Upload a bill photo, get itemized data back automatically
- ✅ Confidence scores per item — low-confidence reads are flagged for review
- 👥 Add people and assign items (supports shared items)
- 💰 Tax, service charge, and discount split proportionally, not equally
- 🧾 Receipt-styled UI

## Running locally

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create a `.env` file in `backend/` with:

python -m uvicorn main:app --reload
### Frontend

cd frontend
npm install
npm run dev
## License

MIT
