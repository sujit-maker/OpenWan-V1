import { Module } from '@nestjs/common';
import { WanStatusController } from './wan-status.controller';
import { WanStatusService } from './wan-status.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [PrismaModule,EmailModule],  // Ensure PrismaModule is imported
    controllers: [WanStatusController],  // Register controller
    providers: [WanStatusService],  // Register service
  })
  
  export class WanStatusModule {}
