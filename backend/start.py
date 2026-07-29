import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

import uvicorn
# 第一次启动前检查并修复 httpx 版本
try:
    import httpx
    if httpx.__version__.startswith("0.28"):
        print("httpx version issue detected, fixing...")
        os.system(f"{sys.executable} -m pip install httpx==0.27.2 -q")
        print("httpx fixed!")
except:
    pass

uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)