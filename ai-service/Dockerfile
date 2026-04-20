FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for Playwright and FAISS
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (text-only)
RUN playwright install chromium --with-deps

# Copy source code
COPY . .

# Create temp directory
RUN mkdir -p temp_uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
