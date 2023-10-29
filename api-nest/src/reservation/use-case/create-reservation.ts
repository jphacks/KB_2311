import { Injectable } from '@nestjs/common';
import { CreateReservationInput } from '../dto/create-reservation.input';
import { MansionRoomService } from 'src/mansion-room/mansion-room.service';
import { CheckDateInAvailableDates } from '../policy/check-date-in-available-dates';
import { ReservationService } from '../reservation.service';
import { MailService } from 'src/mail/mail.service';
import { MansionService } from 'src/mansion/mansion.service';
import { RentalHouseService } from 'src/rental-house/rental-house.service';
import { OwnerService } from 'src/owner/owner.service';

@Injectable()
export class CreateReservation {
  constructor(
    private readonly mansionRoomService: MansionRoomService,
    private readonly checkDateInAvailableDates: CheckDateInAvailableDates,
    private readonly reservationService: ReservationService,
    private readonly mailService: MailService,
    private readonly mansionService: MansionService,
    private readonly rentalHouseService: RentalHouseService,
    private readonly ownerService: OwnerService,
  ) {}

  async handle({
    input,
    mansion_room_id,
  }: {
    input: CreateReservationInput;
    mansion_room_id: string;
  }) {
    const mansionRoom = await this.mansionRoomService.findOne(mansion_room_id);
    //予約したい日がavailable_datesに存在するかチェックする
    await this.checkDateInAvailableDates.handle({
      available_dates: mansionRoom.available_dates,
      stay_date: input.stay_date,
    });
    //reservationを作成する
    const reservation = await this.reservationService.create({
      input,
      mansion_room_id,
    });

    //mansion_roomのavailable_datesから予約が確定した日を削除する
    //失敗したら作成したreservationを削除してエラー
    const re_available_dates = (mansionRoom.available_dates =
      mansionRoom.available_dates.filter(
        (date) => date !== reservation.stay_date,
      ));
    await this.mansionRoomService
      .systemUpdate({ id: mansionRoom.id, available_dates: re_available_dates })
      .catch(async () => {
        await this.reservationService.delete(reservation.id);
      });

    const mansion = await this.mansionService.findOne(mansionRoom.mansion_id);
    const rentalHouse = await this.rentalHouseService.findOne(
      mansion.rental_house_id,
    );

    const userName = `${input.last_name} ${input.first_name}`;
    const userMailInput = {
      to: input.email,
      subject: '申請の確認',
      template: './confirmation-to-user',
      context: {
        receiverName: userName,
        houseName: rentalHouse.name,
      },
    };
    this.mailService.send(userMailInput);

    const owner = await this.ownerService.findOne(rentalHouse.owner_id);
    const ownerName = `${owner.last_name} ${owner.first_name}`;
    const ownerMailInput = {
      to: owner.email,
      subject: '新しい申請',
      template: './confirmation-to-owner',
      context: {
        receiverName: ownerName,
        houseName: rentalHouse.name,
        userName: userName,
      },
    };
    this.mailService.send(ownerMailInput);
  }
}
