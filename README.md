# Bitrix24 Google Sheets Integration

A comprehensive NestJS application that automatically synchronizes data between Google Sheets and Bitrix24 CRM, eliminating manual data entry and ensuring data consistency.

## 🚀 Features

### Core Functionality
- **One-way Sync**: Automatically sync leads from Google Sheets to Bitrix24
- **Duplicate Detection**: Prevents duplicate leads based on email and phone
- **Flexible Mapping**: Configurable field mapping between Google Sheets and Bitrix24
- **Status Tracking**: Real-time sync status tracking in Google Sheets
- **Error Handling**: Comprehensive error handling with detailed logging
- **Scheduled Sync**: Automatic synchronization every 15 minutes (configurable)

### Advanced Features
- **Batch Processing**: Efficient batch operations for better performance
- **Rate Limiting**: Respects API rate limits with retry mechanisms
- **CLI Commands**: Command-line interface for manual operations
- **REST API**: HTTP endpoints for integration and monitoring
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Google Cloud Platform account with Sheets API enabled
- Bitrix24 account with REST API access
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bitrix24-gsheet-integration
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Bitrix24 Configuration  
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your-webhook-code/
BITRIX24_ACCESS_TOKEN=your-access-token
```

## 🔧 Setup Instructions

### Google Sheets Setup

1. **Create a Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create a service account and download the JSON key file
   - Extract the credentials and add them to your `.env` file

2. **Prepare Your Google Sheet**:
   - Create a Google Sheet with the following columns:
     - Column A: Name (required)
     - Column B: Email (required)
     - Column C: Phone
     - Column D: Company
     - Column E: Source
     - Column F: Budget
     - Column G: Status
     - Column H: Assigned User
     - Column I: Notes
     - Column J: Sync Status (hidden)
     - Column K: Lead ID (hidden)
     - Column L: Last Sync (hidden)
     - Column M: Error Message (hidden)

3. **Share the Sheet**:
   - Share your Google Sheet with the service account email
   - Give "Editor" permissions

### Bitrix24 Setup

1. **Create a Webhook**:
   - Go to your Bitrix24 admin panel
   - Navigate to Applications → Webhooks
   - Create a new webhook with the following permissions:
     - `crm.lead.add`
     - `crm.lead.update`
     - `crm.lead.get`
     - `crm.lead.list`
     - `crm.lead.fields`

2. **Get Webhook URL**:
   - Copy the webhook URL and add it to your `.env` file
   - The URL should look like: `https://your-domain.bitrix24.com/rest/1/your-webhook-code/`

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Using Docker
```bash
docker-compose up -d
```

## 📊 CLI Commands

### Validate Connections
```bash
npm run validate
```
Checks if Google Sheets and Bitrix24 connections are working properly.

### Manual Sync
```bash
npm run sync
```
Manually triggers synchronization between Google Sheets and Bitrix24.

### View Statistics
```bash
npm run stats
```
Shows current synchronization statistics.

## 🌐 API Endpoints

### Health Check
```
GET /health
```
Returns application health status.

### Google Sheets
```
GET /google-sheets/validate
GET /google-sheets/data
POST /google-sheets/test-read
```

### Bitrix24
```
GET /bitrix24/validate
GET /bitrix24/fields
POST /bitrix24/test-lead
```

### Sync Operations
```
POST /sync/start
GET /sync/stats
POST /sync/reset
```

## 📈 Monitoring and Logging

The application provides comprehensive logging:
- **Console Logs**: Real-time status updates
- **File Logs**: Detailed logs saved to `logs/app.log`
- **Sync Statistics**: Track created, updated, skipped, and error records
- **Error Tracking**: Detailed error messages for troubleshooting

## 🔧 Configuration

### Field Mapping
Edit `src/config/mapping.json` to customize field mappings:

```json
{
  "fieldMappings": {
    "name": {
      "googleSheetColumn": "A",
      "bitrix24Field": "TITLE",
      "required": true,
      "type": "string"
    }
  }
}
```

### Sync Schedule
Modify the sync schedule in your `.env` file:
```env
SYNC_SCHEDULE=*/15 * * * *  # Every 15 minutes
```

## 🧪 Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t bitrix24-gsheet-integration .
```

### Run Container
```bash
docker run -d \
  --name bitrix24-sync \
  --env-file .env \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  bitrix24-gsheet-integration
```

### Using Docker Compose
```bash
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Google Sheets Permission Error**:
   - Ensure the service account has access to the sheet
   - Check if the sheet ID is correct

2. **Bitrix24 Authentication Error**:
   - Verify the webhook URL is correct
   - Check if the webhook has necessary permissions

3. **Sync Not Working**:
   - Check the application logs
   - Verify environment variables
   - Test connections using CLI commands

### Debug Mode
```bash
npm run start:debug
```

## 📝 Data Flow

1. **Read Data**: Application reads data from Google Sheets
2. **Validate Data**: Checks for required fields and data quality
3. **Check Duplicates**: Searches Bitrix24 for existing leads
4. **Create/Update**: Creates new leads or updates existing ones
5. **Update Status**: Updates sync status in Google Sheets
6. **Log Results**: Records detailed logs of the operation

## 🔒 Security

- All sensitive data stored in environment variables
- Service account credentials secured
- API rate limiting implemented
- Input validation and sanitization
- Comprehensive error handling

## 📊 Performance

- **Batch Processing**: Handles multiple records efficiently
- **Rate Limiting**: Respects API quotas
- **Retry Mechanism**: Automatic retry on failures
- **Memory Efficient**: Processes data in chunks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review application logs
- Test connections using CLI commands
- Create an issue in the repository

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
