# Google Sheet Template

This document describes the required structure for your Google Sheet to work with the Bitrix24 integration.

## Required Columns

| Column | Field Name | Type | Required | Description |
|--------|------------|------|----------|-------------|
| A | Name | String | Yes | Customer/Lead name |
| B | Email | Email | Yes | Customer email address |
| C | Phone | Phone | No | Customer phone number |
| D | Company | String | No | Company name |
| E | Source | String | No | Lead source (UTM, referral, etc.) |
| F | Budget | Number | No | Expected budget/opportunity value |
| G | Status | String | No | Lead status |
| H | Assigned User | String | No | Assigned user ID or name |
| I | Notes | Text | No | Additional notes |
| J | Sync Status | String | System | Sync status (hidden column) |
| K | Lead ID | String | System | Bitrix24 Lead ID (hidden column) |
| L | Last Sync | DateTime | System | Last synchronization time (hidden column) |
| M | Error Message | Text | System | Error message if sync failed (hidden column) |

## Sample Data

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| John Doe | john@example.com | +1234567890 | Acme Corp | Website | 5000 | New | Sales Team | Interested in premium package |
| Jane Smith | jane@company.com | +0987654321 | Tech Inc | Referral | 3000 | Qualified | John Manager | Follow up next week |

## Setup Instructions

1. **Create a new Google Sheet** with the column structure above
2. **Add your data** in the first few columns (A-I)
3. **Share the sheet** with your service account email
4. **Copy the Sheet ID** from the URL and add it to your `.env` file
5. **Test the connection** using the CLI command: `npm run validate`

## Column Mapping Configuration

The field mapping can be customized in `src/config/mapping.json`:

```json
{
  "fieldMappings": {
    "name": {
      "googleSheetColumn": "A",
      "bitrix24Field": "TITLE",
      "required": true,
      "type": "string"
    },
    "email": {
      "googleSheetColumn": "B",
      "bitrix24Field": "EMAIL", 
      "required": true,
      "type": "email",
      "duplicateCheck": true
    }
  }
}
```

## Status Values

The system uses the following status values:

- **Chờ xử lý** (Pending): Row is waiting to be processed
- **Đã đồng bộ** (Synced): Successfully synced to Bitrix24
- **Lỗi** (Error): Sync failed with error
- **Trùng lặp** (Duplicate): Duplicate lead detected

## Best Practices

1. **Keep headers in row 1** - The system expects headers in the first row
2. **Use consistent data formats** - Phone numbers, emails, and dates should be consistent
3. **Don't modify system columns** - Columns J-M are managed by the system
4. **Regular backups** - Keep backups of your important data
5. **Test with small datasets** - Start with a few rows to test the integration

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure the service account has editor access to the sheet
2. **Invalid sheet ID**: Check that the sheet ID in your `.env` file is correct
3. **Column mismatch**: Verify that your sheet has the required columns in the correct order
4. **Data validation errors**: Check that required fields (Name, Email) are not empty

### Testing Your Setup

Use these CLI commands to test your setup:

```bash
# Test connections
npm run validate

# Test reading data
npm run sync

# Check statistics
npm run stats
```
