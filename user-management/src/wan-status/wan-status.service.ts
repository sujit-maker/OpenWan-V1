import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { format } from 'date-fns'; 

@Injectable()
export class WanStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async saveData(data: { identity: string; comment: string; status: string; since: string }): Promise<void> {
    try {
      const formattedSince = new Date(data.since).toLocaleString('en-GB', { hour12: false });

      await this.prisma.mikroTik.create({
        data: {
          identity: data.identity,
          comment: data.comment,
          status: data.status,
          since: formattedSince,

        },
      });
    } catch (error) {
      console.error('Error saving MikroTik data:', error);
      throw error;
    }
  }

  async getLogs(): Promise<any[]> {
    try {
      const logs = await this.prisma.mikroTik.findMany();

      const formattedLogs = logs.map(log => {
        const formattedCreatedAt = format(new Date(log.createdAt), 'dd/MM/yyyy , HH:mm:ss');
        return {
          ...log,
          createdAt: formattedCreatedAt,
        };
      });

      return formattedLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}

