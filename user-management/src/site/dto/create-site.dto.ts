import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty()
  customerId: number; 

  @IsString()
  @IsNotEmpty()
  siteName: string;

  @IsString()
  @IsNotEmpty()
  siteAddress: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsEmail()
  contactEmail: string;
}
