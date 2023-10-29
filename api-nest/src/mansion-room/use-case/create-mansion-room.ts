import { Injectable } from '@nestjs/common';
import { MansionService } from '../../mansion/mansion.service';
import { MansionRoomService } from 'src/mansion-room/mansion-room.service';
import { PhotoService } from 'src/photo/photo.service';
import { CreateMansionRoomSystemInput } from '../dto/create-mansion-room-system-input';
import { RentalHouseService } from 'src/rental-house/rental-house.service';

@Injectable()
export class CreateMansionRoom {
  constructor(
    private readonly mansionRoomService: MansionRoomService,
    private readonly photoService: PhotoService,
    private readonly rentalHouseService: RentalHouseService,
    private readonly mansionService: MansionService,
  ) {}

  async handle({
    input,
    rental_house_id,
  }: {
    input: CreateMansionRoomSystemInput;
    rental_house_id: string;
  }): Promise<{ id: string }> {
    const { mansion_room_photos, ...rest } = input;
    const rentalHouse = await this.rentalHouseService.findOne(rental_house_id);
    const mansion = await this.mansionService.findOneByRentalHouseId(
      rentalHouse.id,
    );
    const mansionRoom = await this.mansionRoomService.create(rest, mansion.id);

    //写真を生成する
    await Promise.all(
      mansion_room_photos.map(async (photo: string) => {
        await this.photoService.createWithMansionRoom({
          mansion_room_id: mansionRoom.id,
          image: photo,
        });
      }),
    ).catch(async () => {
      //rentalHouseを削除する
      await this.mansionRoomService.delete(mansionRoom.id);
    });

    return { id: rentalHouse.id };
  }
}
