import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { User } from "@prisma/client";
import * as fs from "fs";
import * as moment from "moment";
import * as nodemailer from "nodemailer";
import * as path from "path";
import { ConfigService } from "src/config/config.service";

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}
  private readonly logger = new Logger(EmailService.name);

  getTransporter() {
    if (!this.config.get("smtp.enabled"))
      throw new InternalServerErrorException("SMTP is disabled");

    const username = this.config.get("smtp.username");
    const password = this.config.get("smtp.password");

    return nodemailer.createTransport({
      host: this.config.get("smtp.host"),
      port: this.config.get("smtp.port"),
      secure: this.config.get("smtp.port") == 465,
      auth:
        username || password ? { user: username, pass: password } : undefined,
      tls: {
        rejectUnauthorized: !this.config.get(
          "smtp.allowUnauthorizedCertificates",
        ),
      },
    });
  }

  private loadTemplate(name: string): string {
    const templatePath = path.join(__dirname, "templates", `${name}.html`);
    return fs.readFileSync(templatePath, "utf-8");
  }

  private async sendMail(
    email: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    await this.getTransporter()
      .sendMail({
        from: `"${this.config.get("general.appName")}" <${this.config.get(
          "smtp.email",
        )}>`,
        to: email,
        subject,
        text,
        html,
      })
      .catch((e) => {
        this.logger.error(e);
        throw new InternalServerErrorException("Failed to send email");
      });
  }

  async sendMailToShareRecipients(
    recipientEmail: string,
    shareId: string,
    creator?: User,
    description?: string,
    expiration?: Date,
  ) {
    if (!this.config.get("email.enableShareEmailRecipients"))
      throw new InternalServerErrorException("Email service disabled");

    const shareUrl = `${this.config.get("general.appUrl")}/s/${shareId}`;

    const text = this.config
      .get("email.shareRecipientsMessage")
      .replaceAll("\\n", "\n")
      .replaceAll("{creator}", creator?.username ?? "Someone")
      .replaceAll("{creatorEmail}", creator?.email ?? "")
      .replaceAll("{shareUrl}", shareUrl)
      .replaceAll("{desc}", description ?? "No description")
      .replaceAll(
        "{expires}",
        moment(expiration).unix() != 0
          ? moment(expiration).fromNow()
          : "in: never",
      );

    const html = this.loadTemplate("share-recipients")
      .replaceAll("{creator}", creator?.username ?? "Someone")
      .replaceAll("{creatorEmail}", creator?.email ?? "")
      .replaceAll("{shareUrl}", shareUrl)
      .replaceAll("{desc}", description ?? "No description")
      .replaceAll(
        "{expires}",
        moment(expiration).unix() != 0
          ? moment(expiration).fromNow()
          : "in: never",
      );

    await this.sendMail(
      recipientEmail,
      this.config.get("email.shareRecipientsSubject"),
      text,
      html,
    );
  }

  async sendMailToReverseShareCreator(recipientEmail: string, shareId: string) {
    const shareUrl = `${this.config.get("general.appUrl")}/s/${shareId}`;

    const text = this.config
      .get("email.reverseShareMessage")
      .replaceAll("\\n", "\n")
      .replaceAll("{shareUrl}", shareUrl);

    const html = this.loadTemplate("reverse-share")
      .replaceAll("{shareUrl}", shareUrl);

    await this.sendMail(
      recipientEmail,
      this.config.get("email.reverseShareSubject"),
      text,
      html,
    );
  }

  async sendResetPasswordEmail(recipientEmail: string, token: string) {
    const resetPasswordUrl = `${this.config.get(
      "general.appUrl",
    )}/auth/resetPassword/${token}`;

    const text = this.config
      .get("email.resetPasswordMessage")
      .replaceAll("\\n", "\n")
      .replaceAll("{url}", resetPasswordUrl);

    const html = this.loadTemplate("reset-password")
      .replaceAll("{url}", resetPasswordUrl);

    await this.sendMail(
      recipientEmail,
      this.config.get("email.resetPasswordSubject"),
      text,
      html,
    );
  }

  async sendInviteEmail(recipientEmail: string, password: string) {
    const loginUrl = `${this.config.get("general.appUrl")}/auth/signIn`;

    const text = this.config
      .get("email.inviteMessage")
      .replaceAll("{url}", loginUrl)
      .replaceAll("{password}", password)
      .replaceAll("{email}", recipientEmail);

    const html = this.loadTemplate("invite")
      .replaceAll("{url}", loginUrl)
      .replaceAll("{password}", password)
      .replaceAll("{email}", recipientEmail);

    await this.sendMail(
      recipientEmail,
      this.config.get("email.inviteSubject"),
      text,
      html,
    );
  }

  async sendTestMail(recipientEmail: string) {
    await this.getTransporter()
      .sendMail({
        from: `"${this.config.get("general.appName")}" <${this.config.get(
          "smtp.email",
        )}>`,
        to: recipientEmail,
        subject: "Test email",
        text: "This is a test email",
      })
      .catch((e) => {
        this.logger.error(e);
        throw new InternalServerErrorException(e.message);
      });
  }
}
