import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { CustomerModule } from './customer/customer.module';
import { SiteModule } from './site/site.module';
import { TasksModule } from './tasks/tasks.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [AuthModule,UserModule,PrismaModule, ServicesModule,CustomerModule, SiteModule,TasksModule, DevicesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
