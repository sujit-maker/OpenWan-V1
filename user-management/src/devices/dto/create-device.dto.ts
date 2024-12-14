import { IsNotEmpty, IsString, IsInt, IsIP, IsOptional } from 'class-validator';

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
  
  @IsOptional()
  @IsInt()
  adminId?: number; // Optional field for admin

  @IsOptional()
  @IsInt()
  managerId?: number; // Optional field for manager
}
