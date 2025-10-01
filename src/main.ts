import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loggerConfig } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });
  
  // Chỉ hiển thị log quan trọng
  app.useLogger(loggerConfig);
  
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
