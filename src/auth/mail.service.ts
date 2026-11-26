import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;
  private readonly sender: string;
  private readonly frontendUrl: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('MAIL_HOST') ?? config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('MAIL_PORT') ?? config.get<string>('SMTP_PORT', '587'));
    const secure = config.get<string>('MAIL_SECURE') ?? config.get<string>('SMTP_SECURE', 'false');
    const user = config.get<string>('MAIL_USER') ?? config.get<string>('SMTP_USER');
    const password = config.get<string>('MAIL_PASS') ?? config.get<string>('SMTP_PASSWORD');
    this.sender = config.get<string>('MAIL_FROM')
      ?? config.get<string>('SMTP_FROM')
      ?? user
      ?? '';
    this.frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:5173');
    this.transporter = host && user && password
      ? createTransport({
          host,
          port,
          secure: secure === 'true',
          auth: user
            ? {
                user,
                pass: password?.replace(/\s+/g, ''),
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

  async sendApprovedApplicantSetup(email: string, name: string, token: string): Promise<void> {
    if (!this.transporter || !this.sender) {
      throw new Error('El servicio de correo no tiene configuración SMTP.');
    }
    const link = new URL('/establecer-contrasena', this.frontendUrl);
    link.searchParams.set('token', token);
    const safeName = name.replace(/[<>]/g, '');
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: 'Solicitud aprobada - Casa Estudiantil San Mart\u00edn',
      text: `Hola ${safeName},\n\nLa residencia aprob\u00f3 tu solicitud de cupo. Para activar tu acceso al portal, configura tu contrase\u00f1a desde este enlace de un solo uso (v\u00e1lido por una hora):\n${link.toString()}\n\nSi necesitas ayuda, contacta a la administraci\u00f3n de Casa Estudiantil San Mart\u00edn.`,
      html: `<p>Hola ${safeName},</p><p>La residencia aprob\u00f3 tu solicitud de cupo. Para activar tu acceso al portal, configura tu contrase\u00f1a con este enlace de un solo uso; vence en una hora.</p><p><a href="${link.toString()}">Configurar acceso</a></p><p>Si necesitas ayuda, contacta a la administraci\u00f3n de Casa Estudiantil San Mart\u00edn.</p>`,
    });
  }

  async sendApplicationReceived(email: string, name: string, radicado: string): Promise<void> {
    if (!this.transporter || !this.sender) {
      throw new Error('El servicio de correo no tiene configuración SMTP.');
    }
    const safeName = name.replace(/[<>]/g, '');
    const statusUrl = new URL('/consultar-cupo', this.frontendUrl);
    statusUrl.searchParams.set('radicado', radicado);
    await this.transporter.sendMail({
      from: this.sender,
      to: email,
      subject: `Recibimos tu solicitud de cupo · Radicado ${radicado}`,
      text: `Hola ${safeName},\n\nRecibimos tu solicitud de cupo en Casa Estudiantil San Martín. Tu número de radicado es ${radicado}. Guárdalo para consultar el estado de tu solicitud junto con el correo registrado: ${statusUrl.toString()}\n\nTe enviaremos otro correo cuando haya una decisión.`,
      html: `<p>Hola ${safeName},</p><p>Recibimos tu solicitud de cupo en Casa Estudiantil San Martín.</p><p>Tu número de radicado es:</p><p><strong>${radicado}</strong></p><p>Guárdalo. Podrás consultar el estado con este radicado y el correo registrado.</p><p><a href="${statusUrl.toString()}">Consultar estado de mi solicitud</a></p><p>Te enviaremos otro correo cuando haya una decisión.</p>`,
    });
  }
}
