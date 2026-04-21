# AuroraAI Deployment Guide - Server IP: 13.127.57.92

Follow these steps to deploy the AuroraAI platform on your server.

## 1. Security Group Configuration (Cloud Firewall)

Ensure the following ports are open in your server's security group (Inbound Rules):

| Port | Protocol | Purpose |
| :--- | :--- | :--- |
| **22** | TCP | SSH Access (Remote login) |
| **3000** | TCP | Frontend Web Application |
| **5000** | TCP | Backend API Service |
| **8000** | TCP | AI Service (Optional - for direct access) |

> [!CAUTION]
> **DO NOT** open port 27017 (MongoDB). This database should only be accessible internally by the backend service.

---

## 2. Server Preparation

Connect to your server via SSH:
```bash
ssh your-user@13.127.57.92
```

### Install Docker and Docker Compose
```bash
# Update package list
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Install Ollama (AI Engine)
The AI Service depends on Ollama running on the host machine.
```bash
curl -fsSL https://ollama.com/install.sh | sh

# Pull the required model
ollama pull mistral
```

---

## 3. Application Deployment

### Clone the Repository
```bash
git clone <your-repository-url>
cd AuroraAI-master
```

### Configure Environment Variables
Create a `.env` file in the root directory:
```bash
nano .env
```
Paste your configuration and add your actual API keys:
```env
GEMINI_API_KEY=your_gemini_key_here
STABILITY_API_KEY=your_stability_key_here
GIPHY_API_KEY=dc6zaTOxFJmzC
OLLAMA_MODEL=mistral
OLLAMA_HOST=http://localhost:11434
AI_SERVICE_PORT=8000
BACKEND_PORT=5000
```

### Launch the Application
Run Docker Compose to build and start all services in detached mode:
```bash
sudo docker-compose up -d --build
```

---

## 4. Verification

1. **Frontend**: Open `http://13.127.57.92:3000` in your browser.
2. **Backend**: Open `http://13.127.57.92:5000/api/health` to check if the backend is running.
3. **Logs**: If any service fails, check the logs:
   ```bash
   sudo docker-compose logs -f
   ```

## 5. Troubleshooting
- **Ollama connection**: If the AI-service cannot connect to Ollama, ensure Ollama is listening on all interfaces or that Docker can route to the host IP. By default, `host.docker.internal` is used in our config.
- **Port Conflicts**: Ensure no other services are running on ports 3000, 5000, or 8000.
