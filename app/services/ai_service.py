import os, tempfile, base64
from fastapi import UploadFile, HTTPException
from volcenginesdkarkruntime import AsyncArk
from app.schemas.request import AnalysisResponse

client = AsyncArk(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.getenv("ARK_API_KEY1"),
)

async def analyze_image(file: UploadFile, text: str) -> AnalysisResponse:
    tmp_dir = tempfile.gettempdir()
    local_path = os.path.join(tmp_dir, file.filename)
    try:
        with open(local_path, "wb") as buffer:
            buffer.write(await file.read())
        resp = await client.responses.create(
            model="doubao-seed-1-6-flash-250828",
            input=[{
                "role": "user",
                "content": [
                    {"type": "input_image", "image_url": f"file://{local_path}"},
                    {"type": "input_text", "text": text},
                ]
            }]
        )
        result = resp.output[1].content[0].text
        return AnalysisResponse(analysis=result)
    except Exception as e:
        raise HTTPException(500, str(e))
    finally:
        if os.path.exists(local_path):
            os.remove(local_path)

async def generate_image(background_image: UploadFile):
    person_image = "image.jpg"
    person_fmt = person_image.split('.')[-1].lower()
    bg_fmt = background_image.filename.split('.')[-1].lower()

    with open(person_image, "rb") as f:
        person_b64 = base64.b64encode(f.read()).decode()
    bg_b64 = base64.b64encode(await background_image.read()).decode()

    person_data = f"data:image/{person_fmt};base64,{person_b64}"
    bg_data = f"data:image/{bg_fmt};base64,{bg_b64}"

    images_resp = await client.images.generate(
        model="doubao-seedream-4-5-251128",
        prompt="人物摆出最适合当前背景的动作",
        image=[person_data, bg_data],
        size="2K",
        sequential_image_generation="auto",
        response_format="url",
        watermark=False,
    )
    results = [{"URL": img.url, "Size": img.size} for img in images_resp.data]
    return results