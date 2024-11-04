import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MikroTikService } from '../mikrotik/mikrotik.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mikrotikService: MikroTikService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const newDeviceId = await this.generateNewDeviceId();

    // Prepare the router URL and credentials for MikroTik access
    const routerUrl = `http://${createDeviceDto.deviceIp}:${createDeviceDto.devicePort}`;
    const auth = {
      username: createDeviceDto.deviceUsername,
      password: createDeviceDto.devicePassword,
    };

    // Fetch the device name from MikroTik if not provided in `CreateDeviceDto`
    let deviceName = createDeviceDto.deviceName;
    if (!deviceName) {
      try {
        deviceName = await this.mikrotikService.fetchDeviceName(routerUrl, auth);
      } catch (error) {
        throw new HttpException(
          `Failed to retrieve device name: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.device.create({
      data: {
        deviceId: newDeviceId,
        deviceName: deviceName || 'Unknown Device', // Fallback in case the name couldn't be fetched
        deviceType: createDeviceDto.deviceType,
        deviceIp: createDeviceDto.deviceIp,
        devicePort: createDeviceDto.devicePort,
        deviceUsername: createDeviceDto.deviceUsername,
        devicePassword: createDeviceDto.devicePassword,
      },
    });
  }

  private async generateNewDeviceId(): Promise<string> {
    const lastDevice = await this.prisma.device.findFirst({ orderBy: { id: 'desc' } });
    let newDeviceId = 'gateway-01';
    if (lastDevice?.deviceId) {
      const lastDeviceNumber = parseInt(lastDevice.deviceId.split('-')[1], 10) || 0;
      newDeviceId = `gateway-${String(lastDeviceNumber + 1).padStart(2, '0')}`;
    }
    return newDeviceId;
  }

  async getDeviceById(deviceId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({
      where: { deviceId },
    });
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }
    return device;
  }

  async fetchDeviceData(deviceId: string, endpoint: string) {
    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    return this.mikrotikService.fetchEndpointData(routerUrl, auth, endpoint);
  }

  async fetchEndpointData(routerUrl: string, auth: { username: string; password: string }, endpoint: string) {
    try {
      const authHeader = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: `Basic ${authHeader}` },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getNetwatchData(deviceId: string): Promise<any> {
    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    return this.mikrotikService.fetchNetwatchData(routerUrl, auth);
  }

  async getWanIpAddress(deviceId: string, wanType: 'WAN1' | 'WAN2'): Promise<string | null> {
    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    if (wanType === 'WAN1') {
      return this.mikrotikService.fetchWan1IpAddress(routerUrl, auth);
    } else if (wanType === 'WAN2') {
      return this.mikrotikService.fetchWan2IpAddress(routerUrl, auth);
    } else {
      throw new NotFoundException(`Invalid WAN type: ${wanType}`);
    }
  }

  async findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  async findOne(deviceId: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { deviceId },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    return this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.prisma.device.delete({ where: { id } });
    return { message: `Device with ID ${id} deleted successfully` };
  }
}
