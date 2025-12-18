import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from pathlib import Path
from typing import List
from app.schemas.pose import Landmark, SegmentedPose

# ---------- 模型下载 ----------
MODEL_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_DIR.mkdir(exist_ok=True)
MODEL_PATH = MODEL_DIR / "pose_landmarker_heavy.task"

if not MODEL_PATH.exists():
    import requests, shutil
    url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(MODEL_PATH, "wb") as f:
            shutil.copyfileobj(r.raw, f)

# ---------- 分类索引 ----------
HEAD_IDX  = list(range(0, 11))   # 0-10
UPPER_IDX = list(range(11, 25))  # 11-24
LOWER_IDX = list(range(25, 33))  # 25-32

# ---------- 检测器 ----------
base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=False   # 只要坐标，不要掩码
)
detector = vision.PoseLandmarker.create_from_options(options)

# ---------- 业务函数 ----------
async def run_pose(image_bytes: bytes) -> SegmentedPose:
    nparr = np.frombuffer(image_bytes, np.uint8)
    rgb = cv2.cvtColor(cv2.imdecode(nparr, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    result = detector.detect(mp_image)
    if not result.pose_landmarks:
        return SegmentedPose(head=[], upper=[], lower=[])

    all_landmarks = [Landmark(x=lm.x, y=lm.y, z=lm.z) for lm in result.pose_landmarks[0]]

    return SegmentedPose(
        head=[all_landmarks[i] for i in HEAD_IDX],
        upper=[all_landmarks[i] for i in UPPER_IDX],
        lower=[all_landmarks[i] for i in LOWER_IDX],
    )