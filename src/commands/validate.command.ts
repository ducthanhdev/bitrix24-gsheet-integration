import { Command, CommandRunner } from 'nest-commander';
import { GoogleSheetsService } from '../modules/google-sheets/google-sheets.service';
import { Bitrix24Service } from '../modules/bitrix24/bitrix24.service';

@Command({
  name: 'validate',
  description: 'Validate connections to Google Sheets and Bitrix24',
})
export class ValidateCommand extends CommandRunner {
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly bitrix24Service: Bitrix24Service,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('🔍 Validating connections...\n');
    
    let allValid = true;
    
    // Validate Google Sheets connection
    console.log('📊 Checking Google Sheets connection...');
    try {
      const googleValid = await this.googleSheetsService.validateConnection();
      if (googleValid) {
        console.log('✅ Google Sheets connection: OK');
      } else {
        console.log('❌ Google Sheets connection: FAILED');
        allValid = false;
      }
    } catch (error) {
      console.log('❌ Google Sheets connection: ERROR -', error.message);
      allValid = false;
    }
    
    // Validate Bitrix24 connection
    console.log('\n🏢 Checking Bitrix24 connection...');
    try {
      const bitrixValid = await this.bitrix24Service.validateConnection();
      if (bitrixValid) {
        console.log('✅ Bitrix24 connection: OK');
      } else {
        console.log('❌ Bitrix24 connection: FAILED');
        allValid = false;
      }
    } catch (error) {
      console.log('❌ Bitrix24 connection: ERROR -', error.message);
      allValid = false;
    }
    
    console.log('\n' + '='.repeat(50));
    if (allValid) {
      console.log('🎉 All connections are valid! You can start syncing.');
    } else {
      console.log('⚠️  Some connections failed. Please check your configuration.');
      process.exit(1);
    }
  }
}
