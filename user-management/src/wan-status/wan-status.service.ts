import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service'; 
import { format } from 'date-fns';

@Injectable()
export class WanStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService, 
  ) {}

  // Function to save the data (only when status changes)
  async saveData(data: { identity: string; comment: string; status: string; since: string }): Promise<void> {
    try {
      // Fetch the most recent record for the given identity
      const previousStatus = await this.prisma.mikroTik.findFirst({
        where: { identity: data.identity },
        orderBy: { createdAt: 'desc' }, 
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
          recipients: ['waghmaresujit008@gmail.com'],
          subject: `${data.identity} ${data.comment} is ${data.status}`,
          html: `
            <div>
              <p>${data.identity} ${data.comment} is ${data.status}</p>
              <img src="${
                data.status.toLowerCase() === 'up' 
                  ? 'https://thumbs.dreamstime.com/b/green-arrow-pointing-up-isolated-d-illustration-green-arrow-pointing-up-isolated-335047632.jpg'
                  : 'https://media.istockphoto.com/id/1389684537/photo/red-down-arrow-isolated-on-white-background-with-shadow-fall-and-decline-concept-3d-render.jpg?s=612x612&w=0&k=20&c=xl0hH7k27JsIrUHPWvxxykim5J-SnawRSEPDnlWYPfc='
              }" alt="${data.status === 'up' ? 'Green up arrow' : 'Red down arrow'}" style="width:50px;height:auto;" />
            </div>
          `,
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
