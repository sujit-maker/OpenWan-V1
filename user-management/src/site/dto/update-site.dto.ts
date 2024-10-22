import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateSiteDto {
  @IsOptional()
  customerId?: number; 

  @IsOptional()
  @IsString()
  siteName?: string;

  @IsOptional()
  @IsString()
  siteAddress?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}


