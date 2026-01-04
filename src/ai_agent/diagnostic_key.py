import os
import sys
import dashscope
from dashscope import Generation

# Add project root to path
sys.path.append(os.getcwd())
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("ALIBABA_BAILIAN_API_KEY")
dashscope.api_key = api_key

print(f"API Key present: {bool(api_key)}")
if api_key:
    print(f"Key preview: {api_key[:4]}...{api_key[-4:]}")

print("\n--- Diagnostic: Testing Text Generation (qwen-turbo) ---")
try:
    rsp = Generation.call(
        model="qwen-turbo",
        prompt="Hello, are you working?"
    )
    
    if rsp.status_code == 200:
        print("✅ Text Generation SUCCESS!")
        print(f"Response: {rsp.output.text}")
    else:
        print(f"❌ Text Generation FAILED. Code: {rsp.code}, Message: {rsp.message}")

except Exception as e:
    print(f"❌ Text Generation EXCEPTION: {e}")

print("\n--- Diagnostic: Re-testing Video Generation (wanx-t2v-1) ---")
try:
    from dashscope import VideoSynthesis
    rsp = VideoSynthesis.call(
        model="wanx-t2v-1",
        prompt="A testing video",
        size="1280*720"
    )
    if rsp.status_code == 200:
        print("✅ Video Generation SUCCESS!")
    else:
        print(f"❌ Video Generation FAILED. Code: {rsp.code}, Message: {rsp.message}")
except Exception as e:
    print(f"❌ Video Generation EXCEPTION: {e}")
