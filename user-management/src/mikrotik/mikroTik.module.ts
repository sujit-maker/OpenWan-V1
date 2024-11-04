// mikroTik.module.ts
import { Module } from '@nestjs/common';
import { MikroTikService } from './mikroTik.service';

@Module({
  providers: [MikroTikService],
  exports: [MikroTikService],  // Export so other modules can use it
})
export class MikroTikModule {}
