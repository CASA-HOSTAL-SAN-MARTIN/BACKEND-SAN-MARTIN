import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;
  private readonly sender: string;
  private readonly frontendUrl: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT', '587'));
    this.sender = config.get<string>('SMTP_FROM', config.get<string>('SMTP_USER', ''));
    this.frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    this.transporter = host
      ? createTransport({
          host,
          port,
          secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
          auth: config.get<string>('SMTP_USER')
            ? {
                user: config.get<string>('SMTP_USER'),
                pass: config.get<string>('SMTP_PASSWORD'),
              }
            : undefined,
        })
      : null;
  }

  async sendPasswordSetup(email: string, name: string, token: string): Promise<void> {
    if (!this.transporter || !this.sender) {
      throw new Error('El servicio de correo no tiene configuración SMTP.');
    }

    const link = new URL('/establecer-contrasena', this.frontendUrl);
    link.searchParams.set('token', token);
    const safeName = name.replace(/[<>]/g, '');
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: 'Configura el acceso a Casa Estudiantil San Martín',
      text: `Hola ${safeName},\n\nConfigura o restablece tu contraseña desde este enlace de un solo uso (válido por una hora):\n${link.toString()}\n\nSi no solicitaste este mensaje, puedes ignorarlo.`,
      html: `<p>Hola ${safeName},</p><p>Usa el siguiente enlace de un solo uso para configurar o restablecer tu contraseña. El enlace vence en una hora.</p><p><a href="${link.toString()}">Configurar contraseña</a></p><p>Si no solicitaste este mensaje, puedes ignorarlo.</p>`,
    });
  }
}
