import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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



  async findByAdminId(adminId: number) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { adminId: adminId }, // Expect adminId to be an integer
      });
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error); // Log any errors
      throw new BadRequestException('Failed to fetch devices');
    }
  }

  async findByManagerId(managerId: number) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { managerId: managerId }, // Expect managerId to be an integer
      });
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error); // Log any errors
      throw new BadRequestException('Failed to fetch devices');
    }
  }

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const newDeviceId = await this.generateNewDeviceId();
  
    return this.prisma.device.create({
      data: {
        deviceId: newDeviceId,
        deviceName: createDeviceDto.deviceName,
        siteId: createDeviceDto.siteId,
        deviceType: createDeviceDto.deviceType,
        deviceIp: createDeviceDto.deviceIp,
        devicePort: createDeviceDto.devicePort,
        portCount: createDeviceDto.portCount,
        deviceUsername: createDeviceDto.deviceUsername,
        devicePassword: createDeviceDto.devicePassword,
        adminId : createDeviceDto.adminId,
        managerId : createDeviceDto.managerId,
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
