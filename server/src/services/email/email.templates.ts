export function renderDigestEmailHtml(
  title: string,
  summary: string,
  recipientName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .title { font-size: 20px; font-weight: 600; color: #f8fafc; margin-top: 12px; }
    .content { font-size: 15px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap; background-color: #1e293b40; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
    .btn { display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Froncort.ai Enterprise</div>
      <div class="title">${title}</div>
    </div>
    <p>Hello ${recipientName},</p>
    <p>Here is your automated AI Activity Briefing:</p>
    <div class="content">${summary}</div>
    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/digest" class="btn">View Executive Digest Console</a>
    </div>
    <div class="footer">
      <p>Sent by Froncort.ai Unified Organization Workspace</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderInstantEventEmailHtml(
  title: string,
  message: string,
  recipientName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; padding: 32px; }
    .header { font-size: 18px; font-weight: bold; color: #6366f1; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 600; color: #f8fafc; margin-bottom: 12px; }
    .message { font-size: 15px; color: #cbd5e1; line-height: 1.6; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">⚡ Important Workspace Alert</div>
    <div class="title">${title}</div>
    <p>Hi ${recipientName},</p>
    <div class="message">${message}</div>
    <div class="footer">Froncort.ai Enterprise Notifications</div>
  </div>
</body>
</html>
  `;
}
