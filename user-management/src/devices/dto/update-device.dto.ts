// src/devices/dto/update-device.dto.ts

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsNotEmpty()
  siteId: number; 

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  deviceIp?: string;

  @IsOptional()
  @IsString()
  devicePort?: string;

  @IsNotEmpty()
  @IsString()
  portCount: string;

  @IsOptional()
  @IsString()
  deviceUsername?: string;

  @IsOptional()
  @IsString()
  devicePassword?: string;
}
