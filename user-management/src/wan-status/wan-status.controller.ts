import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { WanStatusService } from './wan-status.service';

@Controller('wanstatus')
export class WanStatusController {
  constructor(private readonly wanStatusService: WanStatusService) {}

  @Post()
  async receiveData(
    @Body() data: { identity: string; comment: string; status: string; since: string },
  ): Promise<{ message: string; data: any }> {
    try {
      // Convert the 'since' string to a Date and then back to a string (ISO format)
      const sinceDateString = new Date(data.since).toISOString();

      // Pass the formatted string to the service
      await this.wanStatusService.saveData({
        ...data,
        since: sinceDateString,  // now it's a string in ISO format
      });

      return { message: 'Data saved successfully', data };
    } catch (error) {
      throw new HttpException(
        `Failed to save data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllLogs(): Promise<any> {
    try {
      const logs = await this.wanStatusService.getLogs();
      return { message: 'Logs retrieved successfully', data: logs };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
