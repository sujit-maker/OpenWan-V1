import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '@prisma/client';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Device | null> {
    return this.devicesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, // Ensure id is parsed as an integer
    @Body() updateDeviceDto: UpdateDeviceDto
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) { // Ensure id is parsed as an integer
    return this.devicesService.remove(id);
  }
}
