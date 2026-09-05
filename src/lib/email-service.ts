import { readFileSync } from 'fs'
import { join } from 'path'
import Handlebars from 'handlebars'
import { logger } from './logger'
import { sendEmail } from './email-provider'

interface EmailOptions {
  to: string | string[]
  subject: string
  template: string
  data: Record<string, unknown>
}

class EmailService {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map()

  constructor() {
    this.loadTemplates()
  }

  private loadTemplates() {
    const templateFiles = [
      'welcome.html',
      'credentials.html',
      'password-reset.html',
      'invoice.html',
      'subscription-renewal.html',
      'trial-ending.html',
      'incident-alert.html',
    ]

    for (const file of templateFiles) {
      try {
        const path = join(process.cwd(), 'src/lib/emails/templates', file)
        const source = readFileSync(path, 'utf-8')
        const template = Handlebars.compile(source)
        const name = file.replace('.html', '')
        this.templates.set(name, template)
      } catch (error) {
        logger.warn(`Failed to load email template: ${file}`, { error })
      }
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const template = this.templates.get(options.template)

    // If template file not found, build a simple inline HTML instead of failing
    const html = template
      ? template({ ...options.data, year: new Date().getFullYear() })
      : this.buildFallbackHtml(options.subject, options.data)

    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to
    const result = await sendEmail({ to, subject: options.subject, html })
    if (!result.sent) {
      logger.info(`Email not sent (${result.method}): ${options.subject} → ${to}`)
    }
    return result.sent
  }

  /** Simple inline HTML for when Handlebars template files are missing */
  private buildFallbackHtml(subject: string, data: Record<string, unknown>): string {
    const rows = Object.entries(data)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;color:#6b7280;font-size:13px">${k}</td><td style="padding:4px 8px;color:#111827;font-family:monospace;font-size:13px">${v}</td></tr>`)
      .join('')
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="color:#1e40af;margin-bottom:16px">${subject}</h2>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">© ElimuNova AI</p>
      </div>`
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    return this.sendEmail({ to, subject: 'Welcome to ElimuNova AI!', template: 'welcome', data: { firstName } })
  }

  async sendCredentialsEmail(to: string, firstName: string, username: string, password: string) {
    return this.sendEmail({
      to,
      subject: 'Your Credentials for ElimuNova AI',
      template: 'credentials',
      data: { firstName, username, password, loginUrl: `${process.env.NEXTAUTH_URL || 'https://elimunova-ai.vercel.app'}/auth/signin` },
    })
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetUrl: string) {
    return this.sendEmail({ to, subject: 'Reset Your ElimuNova AI Password', template: 'password-reset', data: { firstName, resetUrl } })
  }

  async sendInvoiceEmail(to: string, firstName: string, invoiceNumber: string, planName: string, amount: number, dueDate: string, status: string, paymentUrl: string) {
    return this.sendEmail({ to, subject: `Invoice ${invoiceNumber} from ElimuNova AI`, template: 'invoice', data: { firstName, invoiceNumber, planName, amount, dueDate, status, paymentUrl } })
  }

  async sendSubscriptionRenewalEmail(to: string, firstName: string, planName: string, amount: number, renewalDate: string, billingUrl: string) {
    return this.sendEmail({ to, subject: 'Subscription Renewal Reminder', template: 'subscription-renewal', data: { firstName, planName, amount, renewalDate, billingUrl } })
  }

  async sendTrialEndingEmail(to: string, firstName: string, planName: string, daysRemaining: number, trialEndDate: string, billingUrl: string) {
    return this.sendEmail({ to, subject: 'Your Free Trial is Ending Soon', template: 'trial-ending', data: { firstName, planName, daysRemaining, trialEndDate, billingUrl } })
  }

  async sendIncidentAlertEmail(to: string, firstName: string, incidentTitle: string, incidentMessage: string, severity: string) {
    return this.sendEmail({ to, subject: `[${severity}] Incident Alert: ${incidentTitle}`, template: 'incident-alert', data: { firstName, incidentTitle, incidentMessage, severity } })
  }

  async sendNotificationEmail(to: string, firstName: string, title: string, message: string, actionUrl?: string, actionText?: string) {
    return this.sendEmail({ to, subject: title, template: 'notification', data: { firstName, notificationTitle: title, notificationMessage: message, actionUrl, actionText } })
  }
}

export const emailService = new EmailService()