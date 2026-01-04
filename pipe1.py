# dashed_contour_real_dash.py
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from pathlib import Path

# ---------- 1. 模型路径 ----------
MODEL_PATH = Path("models/selfie_segmenter.tflite")
if not MODEL_PATH.exists():
    raise FileNotFoundError(MODEL_PATH)

# ---------- 2. 创建分割器 ----------
base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.ImageSegmenterOptions(
        base_options=base_options,
        output_category_mask=True)
segmenter = vision.ImageSegmenter.create_from_options(options)

# ---------- 3. 读图 ----------
bgr = cv2.imread("image.jpg")
if bgr is None:
    raise FileNotFoundError("image.jpg 不存在或路径错误")
rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
h, w = bgr.shape[:2]
image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

# ---------- 4. 掩码 → 原图分辨率 ----------
mask = segmenter.segment(image).category_mask.numpy_view()
mask = (mask * 255).astype(np.uint8)
mask = cv2.resize(mask, (w, h), interpolation=cv2.INTER_LINEAR)
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

# ---------- 5. 找轮廓 + 剔除边界点 ----------
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
cnt = max(contours, key=cv2.contourArea).squeeze()

margin = 2
on_edge = (cnt[:, 0] <= margin) | (cnt[:, 0] >= w - margin) | \
          (cnt[:, 1] <= margin) | (cnt[:, 1] >= h - margin)
cnt = cnt[~on_edge]
if len(cnt) < 10:
    cnt = max(contours, key=cv2.contourArea)
    cnt = cnt.squeeze() - np.array([[2, 2]])
    cnt = cnt.clip([0, 0], [w - 1, h - 1])

# ---------- 6. 真正虚线多边形 ----------
def draw_dashed_poly(img, pts, color, thickness=2, dash=3, gap=2):
    n = len(pts)
    seg_len = np.array([np.hypot(pts[(i+1)%n,0]-pts[i,0],
                                   pts[(i+1)%n,1]-pts[i,1]) for i in range(n)])
    total = seg_len.sum()
    if total < 1: return
    step = dash + gap
    starts = np.arange(0, total, step)
    ends   = starts + dash
    ends[ends > total] = total
    cum = np.cumsum(np.insert(seg_len, 0, 0))

    for a, b in zip(starts, ends):
        if a >= total: break
        _draw_interval(img, pts, cum, a, b, color, thickness)

def _draw_interval(img, pts, cum, a, b, color, thickness):
    n = len(pts)
    i = np.searchsorted(cum, a, side='right') - 1
    x0, y0 = pts[i]
    ux = pts[(i+1)%n,0] - x0
    uy = pts[(i+1)%n,1] - y0
    segL = cum[i+1] - cum[i]
    if segL < 1: return
    ux, uy = ux/segL, uy/segL

    cursor = a
    while cursor < b:
        seg_avail = cum[i+1] - cursor
        if seg_avail <= 0:
            i = (i+1) % n
            x0, y0 = pts[i]
            ux = pts[(i+1)%n,0] - x0
            uy = pts[(i+1)%n,1] - y0
            segL = cum[i+1] - cum[i]
            if segL < 1: break
            ux, uy = ux/segL, uy/segL
            continue
        draw_len = min(b - cursor, seg_avail)
        s = cursor - cum[i]
        ps = (int(x0 + s*ux), int(y0 + s*uy))
        pe = (int(x0 + (s+draw_len)*ux), int(y0 + (s+draw_len)*uy))
        cv2.line(img, ps, pe, color, thickness)
        cursor += draw_len
        if cursor >= cum[i+1]:
            i = (i+1) % n

draw_dashed_poly(bgr, cnt, (0, 255, 255), 2)
cv2.imwrite("dashed_result.jpg", bgr)
print("✅ 已保存 dashed_result.jpg（标准虚线轮廓）")