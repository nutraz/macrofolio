import requests
import json

config = {
    "base_url": "http://localhost:11434/v1",
    "model": "deepseek-coder:1.3b",
    "api_key": "ollama"
}

# Test 1: List models
print("Testing model listing...")
try:
    response = requests.get(f"{config['base_url']}/models")
    print(f"✓ Models available: {[m['id'] for m in response.json()['data']]}")
except Exception as e:
    print(f"✗ Error listing models: {e}")

# Test 2: Chat completion
print("\nTesting chat completion...")
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {config['api_key']}"
}

payload = {
    "model": config["model"],
    "messages": [
        {"role": "user", "content": "What is 2+2?"}
    ],
    "max_tokens": 100
}

try:
    response = requests.post(
        f"{config['base_url']}/chat/completions",
        headers=headers,
        json=payload
    )
    if response.status_code == 200:
        answer = response.json()["choices"][0]["message"]["content"]
        print(f"✓ Chat working! Response: {answer[:50]}...")
    else:
        print(f"✗ Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"✗ Connection error: {e}")

print("\nZenflow should use these settings:")
print(f"Base URL: {config['base_url']}")
print(f"Model: {config['model']}")
print(f"API Key: {config['api_key']}")
