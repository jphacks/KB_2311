import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAILER_HOST,
        tls: {
          ciphers: 'SSLv3',
        },
        port: 465,
        secure: false,
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_AUTH_USER,
          pass: process.env.MAILER_AUTH_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAILER_DEFAULT_SENDER,
      },
      template: {
        dir: join(__dirname, '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
