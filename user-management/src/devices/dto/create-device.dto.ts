// src/devices/dto/create-device.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  deviceName: string;

  @IsNotEmpty()
  @IsString()
  deviceType: string;

  @IsNotEmpty()
  @IsString()
  deviceIp: string;

  @IsNotEmpty()
  @IsString()
  devicePort: string;

  @IsNotEmpty()
  @IsString()
  deviceUsername: string;

  @IsNotEmpty()
  @IsString()
  devicePassword: string;
}
