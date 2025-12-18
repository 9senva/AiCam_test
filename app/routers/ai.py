# app/routers/ai.py
from fastapi import APIRouter, File, Form, UploadFile
from app.services.ai_service import analyze_image as ai_analyze, generate_image as ai_generate
from app.schemas.request import AnalysisResponse

router = APIRouter()

@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image_endpoint(file: UploadFile = File(...), text: str = Form(...)):
    return await ai_analyze(file, text)

@router.post("/generate-image")
async def generate_image_endpoint(background_image: UploadFile = File(...)):
    return await ai_generate(background_image)

