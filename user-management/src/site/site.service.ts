import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  // Create a new Site
  async create(createSiteDto: CreateSiteDto) {
    const { customerId, siteName, siteAddress, contactName, contactNumber, contactEmail } = createSiteDto;

    // Ensure customerId is provided and valid
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }

    // Check if the customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} does not exist.`);
    }

    return this.prisma.site.create({
      data: {
        customer: {
          connect: { id: customerId },
        },
        siteName,
        siteAddress,
        contactName,
        contactNumber,
        contactEmail,
      },
    });
  }

  async findAll() {
    return this.prisma.site.findMany({
      include: {
        customer: {
          select: {
            customerName: true,  
          },
        },
      },
    });
  }

  // Fetch a Specific Site by ID with Customer Name
  async findOne(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            customerName: true, 
          },
        },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }

    return site;
  }

  // Update a Site
  async update(id: number, updateSiteDto: UpdateSiteDto) {
    const { customerId, siteName, siteAddress, contactName, contactNumber, contactEmail } = updateSiteDto;

    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} does not exist.`);
      }
    }

    return this.prisma.site.update({
      where: { id },
      data: {
        siteName,
        siteAddress,
        contactName,
        contactNumber,
        contactEmail,
        customer: customerId
          ? {
              connect: { id: customerId },
            }
          : undefined, 
      },
    });
  }

  // Delete a Site
  async remove(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { tasks: true },  
    });
  
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} does not exist.`);
    }
  
    if (site.tasks.length > 0) {
      await this.prisma.task.deleteMany({
        where: { siteId: id },
      });
    }
  
    return this.prisma.site.delete({
      where: { id },
    });
  }
  
}
