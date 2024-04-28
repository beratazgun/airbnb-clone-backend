import { PrismaService } from '@common/core/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}
}
