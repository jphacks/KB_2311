import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async send(input: {
    to: string;
    subject: string;
    template: string;
    context: {
      receiverName: string;
      houseName: string;
      userName?: string;
    };
  }) {
    await this.mailerService.sendMail(input);
  }
}
