# mr_zhuge_workspace/Dockerfile

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 👇 先创建用户
RUN adduser --disabled-password --gecos '' appuser

COPY . .

# 👇 后赋权（此时 appuser 已存在）
RUN chown -R appuser:appuser /app && \
    mkdir -p generated_content/battles && \
    chown -R appuser:appuser generated_content

USER appuser

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]