import requests
import time
import os
import json

# --- 配置 ---
BASE_URL = "https://60.205.143.96"
START_ENDPOINT = f"{BASE_URL}/api/v1/ai/async-generate/start"
# 测试图片路径
IMAGE_PATH = os.path.join(os.path.dirname(__file__), "OIP.jpg")

def print_data_with_types(data, indent=0):
    """递归地打印数据及其类型。"""
    prefix = " " * indent
    if isinstance(data, dict):
        print(f"{prefix}Type: dict")
        for key, value in data.items():
            print(f"{prefix}Key: '{key}'")
            print_data_with_types(value, indent + 4)
    elif isinstance(data, list):
        print(f"{prefix}Type: list (length: {len(data)})")
        for i, item in enumerate(data):
            print(f"{prefix}Item {i}:")
            print_data_with_types(item, indent + 4)
    elif data is None:
        print(f"{prefix}Value: None, Type: NoneType")
    else:
        print(f"{prefix}Value: {repr(data)}, Type: {type(data).__name__}")

def run_test():
    """运行完整的异步API测试。"""
    # --- 1. 检查测试图片是否存在 ---
    if not os.path.exists(IMAGE_PATH):
        print(f"错误: 测试图片未找到，请确保 '{IMAGE_PATH}' 文件存在。")
        return
    
    # --- 2. 启动异步任务 ---
    print("--- 步骤 1: 启动异步任务 ---")
    try:
        with open(IMAGE_PATH, "rb") as f:
            files = {"background_image": (os.path.basename(IMAGE_PATH), f, "image/jpeg")}
            response = requests.post(START_ENDPOINT, files=files , verify=False)
            response.raise_for_status()  # 如果状态码是 4xx 或 5xx，则抛出异常

        print(f"POST {START_ENDPOINT} 成功 (状态码: {response.status_code})")
        start_data = response.json()
        print_data_with_types(start_data)
        
        task_id = start_data.get("task_id")
        if not task_id:
            print("错误: 在响应中未找到 'task_id'。")
            return

    except requests.exceptions.RequestException as e:
        print(f"启动任务时出错: {e}")
        return

    # --- 3. 轮询任务状态 ---
    print("\n--- 步骤 2: 轮询任务状态 ---")
    status_endpoint = f"{BASE_URL}/api/v1/ai/async-generate/status/{task_id}"
    
    for i in range(30): # 最多轮询15次
        print(f"\n轮询尝试次数 {i+1}...")
        try:
            response = requests.get(status_endpoint, verify=False)
            response.raise_for_status()
            
            print(f"GET {status_endpoint} 成功 (状态码: {response.status_code})")
            status_data = response.json()
            
            print("--- 响应数据及类型 ---")
            print_data_with_types(status_data)
            print("--------------------")

            current_status = status_data.get("status")
            if current_status in ["completed", "failed"]:
                print(f"任务结束，状态: '{current_status}'")
                break
            
            time.sleep(2) # 等待2秒后再次轮询

        except requests.exceptions.RequestException as e:
            print(f"轮询状态时出错: {e}")
            break
    else:
        print("轮询超时。任务未在规定时间内完成。")

if __name__ == "__main__":
    run_test()
