import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCustomerDto) {
    try {
      
      return await this.prisma.customer.create({
        data: {
          ...data,
          contactNumber: data.contactNumber.toString(), 
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create customer');
    }
  }

  async findAll() {
    try {
      return await this.prisma.customer.findMany();
    } catch (error) {
      throw new BadRequestException('Failed to fetch customers');
    }
  }

  async findOne(id: number) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return customer;
    } catch (error) {
      throw new NotFoundException(`Failed to fetch customer with ID ${id}`);
    }
  }

  async update(id: number, data: UpdateCustomerDto) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      
      return await this.prisma.customer.update({
        where: { id },
        data: {
          ...data,
          contactNumber: data.contactNumber?.toString(), 
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update customer');
    }
  }

  async remove(id: number) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Failed to delete customer');
    }
  }
}
