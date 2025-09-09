# SMTP Email Configuration

This document explains how to configure SMTP settings for sending welcome emails to interns.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# SMTP Server Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Base URL for generating login links
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Gmail SMTP Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Navigate to Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS` (not your regular Gmail password)

## Other SMTP Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
Use your provider's specific SMTP settings.

## Testing Email Configuration

You can test your SMTP configuration by creating a simple test endpoint or using the `testEmailConfiguration` function from `utils/emailService.js`.

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of your main email password
- Consider using a dedicated email account for sending system emails
- For production, consider using email services like SendGrid, Mailgun, or AWS SES

## Email Template

The system sends a professional welcome email to interns containing:
- Welcome message
- Intern details (name, department, role)
- Generated Intern ID
- Login URL with company ID
- Instructions for accessing the portal

The email is sent automatically when a new intern is added through the system.


