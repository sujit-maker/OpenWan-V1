import { IsNotEmpty, IsString, IsInt, IsIP, IsOptional, ArrayNotEmpty, ArrayUnique, IsArray } from 'class-validator';

export class CreateDeviceDto {

  @IsNotEmpty()
  @IsString()
  deviceId: string;

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

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true }) // Validates each item in the array as a string
  emailId?: string[];

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
