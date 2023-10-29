import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { CreateReservation } from './use-case/create-reservation';
import { CheckDateInAvailableDates } from './policy/check-date-in-available-dates';
import { PrismaService } from 'src/prisma.service';
import { MansionRoomService } from 'src/mansion-room/mansion-room.service';
import { MailModule } from 'src/mail/mail.module';
import { MansionModule } from 'src/mansion/mansion.module';
import { RentalHouseModule } from 'src/rental-house/rental-house.module';
import { OwnerModule } from 'src/owner/owner.module';

@Module({
  imports: [MailModule, MansionModule, RentalHouseModule, OwnerModule],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    CreateReservation,
    CheckDateInAvailableDates,
    PrismaService,
    MansionRoomService,
  ],
})
export class ReservationModule {}
