import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { sendEmailDto } from 'src/email/dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('PORT'),
      secure: false, // Change to true if using port 465
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    console.log('Transporter created with host:', this.configService.get<string>('EMAIL_HOST'), 'and port:', this.configService.get<number>('PORT'));

    return transporter;
  }

  async sendEmail(dto: sendEmailDto) {
    const { recipients, subject, html } = dto;

    const transport = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: recipients,
      subject: subject,
      html: html,
    };

    try {
      await transport.sendMail(options);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending mail: ', error);
    }
  }
}
