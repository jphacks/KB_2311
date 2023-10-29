import { Module } from '@nestjs/common';
import { MansionService } from './mansion.service';
import { PrismaService } from 'src/prisma.service';
import { PhotoService } from 'src/photo/photo.service';

@Module({
  providers: [MansionService, PrismaService, PhotoService],
})
export class MansionModule {}
