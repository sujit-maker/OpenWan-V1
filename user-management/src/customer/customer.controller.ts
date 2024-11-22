import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(@Query('adminId') adminId?: string) {
    try {
      if (adminId) {
        const adminIdInt = parseInt(adminId, 10);  // Convert to integer
        if (isNaN(adminIdInt)) {
          throw new BadRequestException('adminId must be a valid number');
        }
        return await this.customerService.findByAdminId(adminIdInt);  // Pass as integer
      }
      return await this.customerService.findAll();  // No filter
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
