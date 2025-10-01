# Troubleshooting Guide

This comprehensive guide helps you diagnose and resolve common issues with the Bitrix24 Google Sheets Integration.

## 🔍 Quick Diagnostics

### Health Check Commands
```bash
# Check application health
curl http://localhost:3000/health

# Test Google Sheets connection
curl http://localhost:3000/google-sheets/validate

# Test Bitrix24 connection
curl http://localhost:3000/bitrix24/validate

# Check sync statistics
curl http://localhost:3000/sync/stats
```

### CLI Commands
```bash
# Validate all connections
npm run validate

# Manual sync
npm run sync

# View statistics
npm run stats
```

## 🚨 Common Issues and Solutions

### 1. Google Sheets Permission Error

**Error Message:**
```
The caller does not have permission
```

**Possible Causes:**
- Service account doesn't have access to the sheet
- Incorrect sheet ID
- Service account email not added to sheet sharing

**Solutions:**

#### Check Service Account Access
1. Verify the service account email in your `.env` file
2. Go to your Google Sheet
3. Click "Share" button
4. Add the service account email with "Editor" permissions
5. Ensure the email matches exactly (case-sensitive)

#### Verify Sheet ID
1. Open your Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
3. Update `GOOGLE_SHEET_ID` in your `.env` file

#### Test Connection
```bash
curl http://localhost:3000/google-sheets/validate
```

### 2. Bitrix24 Authentication Error

**Error Message:**
```
401 Unauthorized
```

**Possible Causes:**
- Incorrect webhook URL
- Webhook permissions insufficient
- Webhook inactive or expired

**Solutions:**

#### Verify Webhook URL
1. Go to Bitrix24 Admin Panel
2. Navigate to Applications → Webhooks
3. Check the webhook URL format: `https://your-domain.bitrix24.com/rest/1/your-webhook-code/`
4. Ensure the URL is complete and correct

#### Check Webhook Permissions
Required permissions:
- `crm.lead.add`
- `crm.lead.update`
- `crm.lead.get`
- `crm.lead.list`
- `crm.lead.fields`

#### Test Webhook Manually
```bash
curl -X POST "https://your-domain.bitrix24.com/rest/1/your-webhook-code/crm.lead.fields"
```

### 3. Sync Not Working

**Symptoms:**
- No data syncing
- Empty logs
- No error messages

**Diagnostic Steps:**

#### Check Environment Variables
```bash
# Verify all required variables are set
cat .env | grep -E "(GOOGLE_|BITRIX24_|SYNC_)"
```

#### Check Sheet Data
1. Open your Google Sheet
2. Verify there's data in the configured range
3. Check if the header row is correct
4. Ensure data is in the expected format

#### Check Application Logs
```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep -i "error" logs/app.log

# Check sync activity
grep -i "sync" logs/app.log
```

#### Test Individual Components
```bash
# Test Google Sheets connection
curl http://localhost:3000/google-sheets/validate

# Test Bitrix24 connection
curl http://localhost:3000/bitrix24/validate

# Manual sync
curl -X POST http://localhost:3000/sync/start
```

### 4. High Memory Usage

**Symptoms:**
- Application crashes
- Slow performance
- Out of memory errors

**Solutions:**

#### Reduce Batch Size
```env
SYNC_BATCH_SIZE=5  # Reduce from default 10
```

#### Check for Memory Leaks
```bash
# Monitor memory usage
docker stats bitrix24-gsheet-integration

# Check logs for memory issues
grep -i "memory" logs/app.log
```

#### Optimize Configuration
```env
# Reduce retry attempts
SYNC_RETRY_ATTEMPTS=2

# Increase retry delay
SYNC_RETRY_DELAY=2000
```

### 5. Rate Limiting Issues

**Error Message:**
```
Rate limit exceeded
```

**Solutions:**

#### Adjust Batch Size
```env
SYNC_BATCH_SIZE=5  # Reduce batch size
```

#### Increase Retry Delay
```env
SYNC_RETRY_DELAY=5000  # Increase delay between retries
```

#### Check API Quotas
- Google Sheets: 100 requests per 100 seconds
- Bitrix24: 2 requests per second

### 6. Data Mapping Issues

**Symptoms:**
- Data not syncing correctly
- Wrong field values
- Missing required fields

**Solutions:**

#### Check Field Mapping
1. Open `src/config/mapping.json`
2. Verify column mappings are correct
3. Check if required fields are marked properly
4. Ensure field types match

#### Validate Data Format
1. Check Google Sheet data format
2. Verify required fields have values
3. Ensure data types match expectations

#### Test Field Mapping
```bash
# Enable debug logging
LOG_LEVEL=debug npm run sync
```

## 🔧 Debug Mode

### Enable Debug Logging
```bash
# Set debug level
export LOG_LEVEL=debug

# Run with debug logging
npm run start:dev
```

### Debug Commands
```bash
# Test connections with verbose output
LOG_LEVEL=debug npm run validate

# Manual sync with debug logging
LOG_LEVEL=debug npm run sync

# Check statistics with details
npm run stats
```

### Log Analysis
```bash
# View all logs
cat logs/app.log

# Filter by level
grep "ERROR" logs/app.log
grep "WARN" logs/app.log
grep "INFO" logs/app.log

# Monitor real-time
tail -f logs/app.log

# Search for specific issues
grep -i "permission" logs/app.log
grep -i "timeout" logs/app.log
grep -i "rate limit" logs/app.log
```

## 📊 Performance Monitoring

### Check Application Status
```bash
# Health check
curl http://localhost:3000/health

# Sync statistics
curl http://localhost:3000/sync/stats

# Connection status
curl http://localhost:3000/google-sheets/validate
curl http://localhost:3000/bitrix24/validate
```

### Monitor Resources
```bash
# Docker container stats
docker stats bitrix24-gsheet-integration

# System resources
htop
free -h
df -h
```

### Performance Optimization
```env
# Optimize batch processing
SYNC_BATCH_SIZE=10
SYNC_RETRY_ATTEMPTS=3
SYNC_RETRY_DELAY=1000

# Logging level
LOG_LEVEL=info
```

## 🐳 Docker Troubleshooting

### Container Issues
```bash
# Check container status
docker ps -a

# View container logs
docker logs bitrix24-gsheet-integration

# Restart container
docker restart bitrix24-gsheet-integration

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Volume Issues
```bash
# Check volume mounts
docker volume ls

# Inspect volume
docker volume inspect bitrix24-gsheet-integration_logs
```

### Network Issues
```bash
# Check network connectivity
docker exec bitrix24-gsheet-integration ping google.com
docker exec bitrix24-gsheet-integration ping your-bitrix24-domain.com
```

## 📝 Log Analysis

### Understanding Log Messages

#### Success Messages
```
[SyncService] Sync completed: 5 created, 3 updated, 2 errors in 1500ms
[SchedulerService] Scheduled sync completed: 5 created, 3 updated
```

#### Error Messages
```
[GoogleSheetsService] Google Sheets connection validation failed
[Bitrix24Service] Failed to create lead in Bitrix24
[SyncService] Sync failed: API Error
```

#### Warning Messages
```
[GoogleSheetsService] No data found in the specified range
[SyncService] Required field email is missing for row 5
```

### Log Patterns
```bash
# Find all errors
grep "ERROR" logs/app.log

# Find sync completions
grep "Sync completed" logs/app.log

# Find connection issues
grep -i "connection" logs/app.log

# Find permission errors
grep -i "permission" logs/app.log
```

## 🆘 Getting Help

### Self-Diagnosis Checklist
- [ ] Environment variables configured correctly
- [ ] Google Sheets shared with service account
- [ ] Bitrix24 webhook URL correct and active
- [ ] Application logs show no errors
- [ ] Network connectivity to APIs
- [ ] Data format matches expectations

### Support Resources
- **Documentation**: Check README.md and API reference
- **Logs**: Review application logs for error details
- **Health Checks**: Use built-in health check endpoints
- **CLI Tools**: Use validation and stats commands
- **Community**: GitHub issues and discussions

### Reporting Issues
When reporting issues, include:
1. Error messages from logs
2. Environment configuration (without sensitive data)
3. Steps to reproduce
4. Expected vs actual behavior
5. System information (OS, Node.js version, Docker version)

### Emergency Recovery
```bash
# Stop all services
docker-compose down

# Clear logs
rm -rf logs/*

# Restart with fresh state
docker-compose up -d

# Monitor startup
docker-compose logs -f
```
