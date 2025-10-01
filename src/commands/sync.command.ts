import { Command, CommandRunner } from 'nest-commander';
import { SyncService } from '../modules/sync/sync.service';

@Command({
  name: 'sync',
  description: 'Start manual synchronization between Google Sheets and Bitrix24',
})
export class SyncCommand extends CommandRunner {
  constructor(private readonly syncService: SyncService) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting manual synchronization...');
    
    try {
      const result = await this.syncService.syncData();
      
      if (result.success) {
        console.log('✅ Synchronization completed successfully!');
        console.log(`📊 Stats:`, result.stats);
        console.log(`⏱️  Duration: ${result.duration}ms`);
      } else {
        console.error('❌ Synchronization failed:', result.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Synchronization error:', error.message);
      process.exit(1);
    }
  }
}
