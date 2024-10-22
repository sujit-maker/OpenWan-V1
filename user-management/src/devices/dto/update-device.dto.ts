// src/devices/dto/update-device.dto.ts

import { IsOptional, IsString } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  deviceIp?: string;

  @IsOptional()
  @IsString()
  devicePort?: string;

  @IsOptional()
  @IsString()
  deviceUsername?: string;

  @IsOptional()
  @IsString()
  devicePassword?: string;
}
