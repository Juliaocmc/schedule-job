import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';

@Module({
  imports: [JobsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
