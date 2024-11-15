import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service'; // Inject EmailService
import { format } from 'date-fns';

@Injectable()
export class WanStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService, // Inject EmailService
  ) {}

  // Function to save the data (only when status changes)
  async saveData(data: { identity: string; comment: string; status: string; since: string }): Promise<void> {
    try {
      // Fetch the most recent record for the given identity
      const previousStatus = await this.prisma.mikroTik.findFirst({
        where: { identity: data.identity },
        orderBy: { createdAt: 'desc' }, // Fetch the most recent record
      });

      

      // Check if the status has changed (only allow up/down or down/up)
      if (!previousStatus || previousStatus.status !== data.status) {
        // Format the 'since' field
        const formattedSince = new Date(data.since).toLocaleString('en-GB', { hour12: false });

        // Save the new status in the database (even if it's the same status)
        await this.prisma.mikroTik.create({
          data: {
            identity: data.identity,
            comment: data.comment,
            status: data.status,
            since: formattedSince,
          },
        });

        // Send an email notification about the status change
        await this.emailService.sendEmail({
          recipients: ['waghmaresujit008@gmail.com'], // Replace with actual recipients
          subject: `Status changed for ${data.identity}`,
          html: `The status for ${data.identity} has changed to: ${data.status}`,
        });

      } else {
        console.log(`No status change for ${data.identity}. No email sent.`);
      }
    } catch (error) {
      console.error('Error saving MikroTik data:', error);
      throw error;
    }
  }

  // Function to retrieve logs
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
