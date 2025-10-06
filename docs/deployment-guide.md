# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Google Cloud Service Account credentials
- Bitrix24 webhook URL

### Step 1: Environment Setup

1. Copy environment template:
```bash
cp env.example .env
```

2. Configure environment variables in `.env`:
```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_SHEET_RANGE=A:Z
GOOGLE_SHEET_HEADER_ROW=1

# Bitrix24 Configuration
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your-webhook-code/
BITRIX24_ACCESS_TOKEN=your-access-token
BITRIX24_DOMAIN=your-domain.bitrix24.com

# Sync Configuration
SYNC_SCHEDULE=*/15 * * * *
SYNC_BATCH_SIZE=10
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=1000
```

### Step 2: Build and Run

```bash
# Build Docker image
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Step 3: Verify Deployment

```bash
# Health check
curl http://localhost:3000/health

# Validate connections
curl http://localhost:3000/google-sheets/validate
curl http://localhost:3000/bitrix24/validate
```

## PM2 Deployment

### Installation
```bash
npm install -g pm2
```

### Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bitrix24-gsheet-integration',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Deployment
```bash
# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs
```

## Systemd Service

### Create service file
```bash
sudo nano /etc/systemd/system/bitrix24-gsheet-integration.service
```

### Service configuration
```ini
[Unit]
Description=Bitrix24 Google Sheets Integration
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/bitrix24-gsheet-integration
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### Enable and start
```bash
sudo systemctl daemon-reload
sudo systemctl enable bitrix24-gsheet-integration
sudo systemctl start bitrix24-gsheet-integration
sudo systemctl status bitrix24-gsheet-integration
```
