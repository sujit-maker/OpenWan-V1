import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WanStatusService {
    constructor(private readonly prisma: PrismaService) {}

    // Method to save data
    async saveData(data: { identity: string; comment: string; status: string; since: Date }): Promise<void> {
      try {
        await this.prisma.mikroTik.create({
          data: {
            identity: data.identity,
            comment: data.comment,
            status: data.status,
            since: data.since,
          },
        });
      } catch (error) {
        console.error('Error saving MikroTik data:', error);
        throw error;
      }
    }

    async getLogs(): Promise<any[]> {
      try {
        return await this.prisma.mikroTik.findMany(); 
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    }
}
