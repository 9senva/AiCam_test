import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2
from pathlib import Path

# ---------- 2. 可视化函数 ----------
def draw_landmarks_on_image(rgb_image, detection_result):
    # 绘制检测到的关键点和连接线在图像上
    annotated_image = np.copy(rgb_image)
    if not detection_result.pose_landmarks:
        return annotated_image

    for landmarks in detection_result.pose_landmarks:  # List[Landmark]
        landmark_list = landmark_pb2.NormalizedLandmarkList()
        landmark_list.landmark.extend([
            landmark_pb2.NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z)
            for lm in landmarks
        ])
        mp.solutions.drawing_utils.draw_landmarks(
            annotated_image,
            landmark_list,
            mp.solutions.pose.POSE_CONNECTIONS,
            mp.solutions.drawing_styles.get_default_pose_landmarks_style()
        )
    return annotated_image

# ---------- 3. 创建检测器 ----------
# 使用指定选项创建姿势关键点检测器
MODEL_PATH = Path("pose_landmarker_heavy.task")
if not MODEL_PATH.exists():
    DOWNLOAD_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task"  # 替换为你的下载链接
    download_file(DOWNLOAD_URL, MODEL_PATH)
base_options = python.BaseOptions(model_asset_path=str(MODEL_PATH))
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=True
)
detector = vision.PoseLandmarker.create_from_options(options)

# ---------- 4. 读取图像 ----------
IMAGE_PATH = "image.jpg"
image = mp.Image.create_from_file(IMAGE_PATH)

# ---------- 5. 推理 ----------
# 检测图像中的姿势关键点
detection_result = detector.detect(image)

# ---------- 6. 可视化关键点 ----------
# 在图像上绘制关键点并显示结果
annotated_image = draw_landmarks_on_image(image.numpy_view(), detection_result)
annotated_bgr = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)
cv2.imshow("Pose Landmarks", annotated_bgr)
cv2.imwrite("output_pose.jpg", annotated_bgr)
print("✅ 已保存 output_pose.jpg")
cv2.waitKey(0)

# ---------- 7. 可视化分割掩码 ----------
# 如果检测结果包含分割掩码，则可视化并保存掩码图像
if detection_result.segmentation_masks:
    mask = detection_result.segmentation_masks[0].numpy_view()
    vis_mask = (mask * 255).astype(np.uint8)
    vis_mask = cv2.cvtColor(vis_mask, cv2.COLOR_GRAY2BGR)
    cv2.imshow("Segmentation Mask", vis_mask)
    cv2.imwrite("output_mask.jpg", vis_mask)
    print("✅ 已保存 output_mask.jpg")
    cv2.waitKey(0)

cv2.destroyAllWindows()
