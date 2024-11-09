import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '@prisma/client';
import { MikroTikService } from 'src/mikrotik/mikrotik.service';

  @Controller('devices')
  export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly mikrotikService: MikroTikService,
  ) {}

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get(':deviceId/data')
  async fetchDeviceData(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDeviceById(deviceId); 

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };                

    // Call the fetchAllData method to get all merged data
    return this.mikrotikService.fetchAllData(routerUrl, auth);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Device | null> {
    return this.devicesService.findOne(id);
  }

  @Get(':deviceId/wan-ip')
  async getWanIp(@Param('deviceId') deviceId: string, @Query('wan') wan: 'WAN1' | 'WAN2') {
    // Validate the WAN parameter
    if (!['WAN1', 'WAN2'].includes(wan)) {
      throw new NotFoundException(`Invalid WAN type: ${wan}`);
    }

    // Fetch all interfaces
    const interfaces = await this.devicesService.fetchDeviceData(deviceId, 'interface');
    
    // Find the interface based on the WAN type
    const wanInterface = interfaces.find((iface) => iface.comment === wan);

    if (!wanInterface) {
      throw new NotFoundException(`${wan} interface not found for device ${deviceId}`);
    }

    // Fetch the IP address for the found WAN interface
    return this.devicesService.fetchDeviceData(deviceId, `ip/address?interface=${wanInterface.name}`);
  }


  @Get(':deviceId/interface')
  async getDeviceInterfaces(@Param('deviceId') deviceId: string) {
    // Fetch all interfaces for the specified device
    const interfaces = await this.devicesService.fetchDeviceData(deviceId, 'interface');

    if (!interfaces || interfaces.length === 0) {
      throw new NotFoundException(`No interfaces found for device ${deviceId}`);
    }

    return interfaces;
  }

  @Get(':deviceId/tool/netwatch')
  async getNetwatch(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDeviceById(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    return this.devicesService.getNetwatchData(deviceId); // Ensure this is correct
  }


  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }
}
