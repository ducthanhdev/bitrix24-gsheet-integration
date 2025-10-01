# Deployment Guide

This guide covers different deployment options for the Bitrix24 Google Sheets Integration.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd bitrix24-gsheet-integration

# Copy environment file
cp env.example .env

# Edit configuration
nano .env

# Start with Docker Compose
docker-compose up -d
```

### Manual Docker Build
```bash
# Build the image
docker build -t bitrix24-gsheet-integration .

# Run the container
docker run -d \
  --name bitrix24-sync \
  --env-file .env \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  bitrix24-gsheet-integration
```

## 🚀 Production Deployment

### Using PM2 (Node.js Process Manager)

1. **Install PM2**:
```bash
npm install -g pm2
```

2. **Create PM2 configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'bitrix24-sync',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

3. **Start the application**:
```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Using Systemd (Linux)

1. **Create service file** (`/etc/systemd/system/bitrix24-sync.service`):
```ini
[Unit]
Description=Bitrix24 Google Sheets Integration
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/bitrix24-sync
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

2. **Enable and start the service**:
```bash
sudo systemctl daemon-reload
sudo systemctl enable bitrix24-sync
sudo systemctl start bitrix24-sync
```

## ☁️ Cloud Deployment

### AWS EC2

1. **Launch EC2 instance** (t3.micro or larger)
2. **Install Node.js 18+**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Deploy application**:
```bash
git clone <repository-url>
cd bitrix24-gsheet-integration
npm install
npm run build
```

4. **Configure environment**:
```bash
cp env.example .env
nano .env
```

5. **Start with PM2**:
```bash
npm install -g pm2
pm2 start dist/main.js --name bitrix24-sync
pm2 startup
pm2 save
```

### Google Cloud Platform

1. **Create Compute Engine instance**
2. **Install Docker**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

3. **Deploy with Docker**:
```bash
git clone <repository-url>
cd bitrix24-gsheet-integration
docker-compose up -d
```

### Azure

1. **Create App Service**
2. **Configure deployment**:
```bash
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name bitrix24-sync --runtime "NODE|18-lts"
```

3. **Deploy from Git**:
```bash
az webapp deployment source config --name bitrix24-sync --resource-group myResourceGroup --repo-url <repository-url> --branch main --manual-integration
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000

# Google Sheets
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Bitrix24
BITRIX24_WEBHOOK_URL=https://domain.bitrix24.com/rest/1/webhook/
BITRIX24_ACCESS_TOKEN=your-token

# Sync Settings
SYNC_SCHEDULE=*/15 * * * *
SYNC_BATCH_SIZE=10
```

### Security Considerations

1. **Use environment variables** for all sensitive data
2. **Never commit** `.env` files to version control
3. **Use secrets management** in production (AWS Secrets Manager, Azure Key Vault, etc.)
4. **Enable HTTPS** for production deployments
5. **Configure firewall** to restrict access

## 📊 Monitoring and Logging

### Application Logs
```bash
# View logs
docker logs bitrix24-sync

# Follow logs
docker logs -f bitrix24-sync

# PM2 logs
pm2 logs bitrix24-sync
```

### Health Checks
```bash
# Check application health
curl http://localhost:3000/health

# Check sync status
curl http://localhost:3000/sync/stats
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/bitrix24-sync

# Add configuration
/opt/bitrix24-sync/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 node node
}
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Backup configuration
cp .env .env.backup
cp src/config/mapping.json src/config/mapping.json.backup
```

### Application Backup
```bash
# Create backup
tar -czf bitrix24-sync-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .
```

### Recovery
```bash
# Restore from backup
tar -xzf bitrix24-sync-backup-20231201.tar.gz
npm install
npm run build
pm2 restart bitrix24-sync
```

## 🚨 Troubleshooting

### Common Issues

1. **Application won't start**:
   - Check environment variables
   - Verify all dependencies are installed
   - Check logs for error messages

2. **Sync not working**:
   - Test connections: `npm run validate`
   - Check Google Sheets permissions
   - Verify Bitrix24 webhook URL

3. **High memory usage**:
   - Reduce batch size in configuration
   - Monitor with `pm2 monit`
   - Restart application if needed

### Performance Optimization

1. **Increase batch size** for better performance:
```env
SYNC_BATCH_SIZE=20
```

2. **Adjust sync frequency**:
```env
SYNC_SCHEDULE=*/30 * * * *  # Every 30 minutes
```

3. **Monitor resource usage**:
```bash
pm2 monit
htop
```

## 📈 Scaling

### Horizontal Scaling
- Deploy multiple instances behind a load balancer
- Use Redis for shared state management
- Implement database clustering

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize batch processing
- Use SSD storage for better I/O

## 🔐 Security Hardening

1. **Firewall Configuration**:
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Application
sudo ufw enable
```

2. **SSL/TLS Configuration**:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Regular Updates**:
```bash
# Update dependencies
npm audit
npm update

# Update system packages
sudo apt update && sudo apt upgrade
```
