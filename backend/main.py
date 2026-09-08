import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from google import genai
from google.genai import types
from models import Bill
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="BillSplit AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@app.get("/")
def root():
    return {"message": "BillSplit AI backend is running!"}


@app.post("/bill")
def create_bill(bill: Bill):
    return bill


@app.post("/extract-bill", response_model=Bill)
async def extract_bill(file: UploadFile = File(...)):
    image_bytes = await file.read()
    media_type = file.content_type or "image/jpeg"

    prompt = """You are reading a restaurant/store bill from an image.
Extract the data and return ONLY valid JSON (no markdown, no explanation) matching exactly this shape:

{
  "items": [
    {"name": "string", "quantity": number, "price": number, "confidence": number between 0 and 1}
  ],
  "subtotal": number,
  "service_charge": number,
  "tax": number,
  "discount": number,
  "total": number,
  "confidence": number between 0 and 1
}

Rules:
- price is the price PER UNIT for that line item (not the line total).
- If service_charge, tax, or discount are not present on the bill, use 0.
- confidence should reflect how sure you are about each value (1.0 = very sure, lower if blurry/ambiguous).
- Return ONLY the JSON object, nothing else."""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=media_type),
            prompt,
        ],
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Model did not return valid JSON")

    try:
        bill = Bill(**data)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Extracted data failed validation: {e}")

    return bill