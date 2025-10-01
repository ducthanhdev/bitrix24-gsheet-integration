import { Command, CommandRunner } from 'nest-commander';
import { SyncService } from '../modules/sync/sync.service';

@Command({
  name: 'stats',
  description: 'Get synchronization statistics',
})
export class StatsCommand extends CommandRunner {
  constructor(private readonly syncService: SyncService) {
    super();
  }

  async run(): Promise<void> {
    console.log('📊 Getting synchronization statistics...');
    
    try {
      const stats = await this.syncService.getSyncStats();
      
      console.log('\n📈 Current Statistics:');
      console.log(`   Total rows: ${stats.total}`);
      console.log(`   Created: ${stats.created}`);
      console.log(`   Updated: ${stats.updated}`);
      console.log(`   Skipped: ${stats.skipped}`);
      console.log(`   Errors: ${stats.errors}`);
      console.log(`   Duplicates: ${stats.duplicates}`);
      
      const successRate = stats.total > 0 ? 
        ((stats.created + stats.updated) / stats.total * 100).toFixed(1) : '0';
      console.log(`   Success rate: ${successRate}%`);
      
    } catch (error) {
      console.error('❌ Failed to get statistics:', error.message);
      process.exit(1);
    }
  }
}
