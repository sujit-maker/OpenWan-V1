import { IsNotEmpty, IsString, IsInt, IsIP } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  deviceName: string;

  @IsNotEmpty()
  @IsInt()
  siteId: number;

  @IsNotEmpty()
  @IsString()
  deviceType: string;

  @IsNotEmpty()
  @IsIP()
  deviceIp: string;

  @IsNotEmpty()
  @IsString()
  devicePort: string;

  @IsNotEmpty()
  @IsString()
  portCount: string;

  @IsNotEmpty()
  @IsString()
  deviceUsername: string;

  @IsNotEmpty()
  @IsString()
  devicePassword: string;
}
