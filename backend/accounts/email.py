import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

logger = logging.getLogger(__name__)


def send_password_reset_email(user, reset_url):
    """
    Sends a formatted HTML and plain-text password reset email to the user.
    Returns (True, None) on success or (False, error_str) on failure.
    """
    subject = "Password Reset Request — TKRCET Mega Job Mela 2026"
    from_email = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        "TKRCET Mega Job Mela 2026 <no-reply@tkrcetjobmela.in>",
    )
    to_email = user.email

    safe_name = escape(user.full_name or "Candidate")
    safe_reset_url = escape(reset_url)

    # Plain text fallback
    text_content = f"""Hello {user.full_name or 'Candidate'},

We received a request to reset the password for your TKRCET Mega Job Mela 2026 account.

Please click the link below (or copy and paste it into your browser) to choose a new password:
{reset_url}

This password reset link is valid for 1 hour.

If you did not request a password reset, please ignore this email. Your password will remain unchanged and your account is secure.

Best regards,
TKRCET Job Mela 2026 Organizing Committee
TKR College of Engineering & Technology, Hyderabad
Website: https://www.tkrcetjobmela.in
"""

    # Rich responsive HTML template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - TKRCET Job Mela 2026</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }}
    .email-container {{
      max-width: 580px;
      margin: 24px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }}
    .badge {{
      display: inline-block;
      background: #f59e0b;
      color: #0f172a;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }}
    .header h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .content {{
      padding: 32px 28px;
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
    }}
    .greeting {{
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
    }}
    .btn-container {{
      text-align: center;
      margin: 32px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 13px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25);
    }}
    .url-fallback {{
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      font-size: 13px;
      color: #64748b;
      word-break: break-all;
      margin-top: 20px;
    }}
    .security-note {{
      margin-top: 24px;
      padding: 12px 16px;
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      border-radius: 4px;
      font-size: 13px;
      color: #92400e;
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="badge">Official Account Notification</div>
      <h1>TKRCET Mega Job Mela 2026</h1>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">TKR College of Engineering & Technology, Hyderabad</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello {safe_name},</div>
      <p>
        We received a request to change the password for your account associated with <strong>{escape(to_email)}</strong>.
      </p>
      <p>
        Please click the button below to set a new password. This link will safely expire in <strong>1 hour</strong>.
      </p>
      
      <div class="btn-container">
        <a href="{safe_reset_url}" target="_blank" class="btn">Reset My Password</a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 6px;">
        If the button above does not work, copy and paste the following URL into your browser:
      </p>
      <div class="url-fallback">
        <a href="{safe_reset_url}" style="color: #2563eb; text-decoration: underline;">{safe_reset_url}</a>
      </div>

      <div class="security-note">
        <strong>Security Notice:</strong> If you did not request this password change, you can safely ignore this email. No changes have been made to your account.
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 6px;">
        &copy; 2026 TKRCET Mega Job Mela. All rights reserved.
      </p>
      <p style="margin: 0;">
        Medbowli, Meerpet, Balapur, Hyderabad, Telangana 500097
      </p>
    </div>
  </div>
</body>
</html>
"""

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[to_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info("Password reset email dispatched successfully to: %s", to_email)
        return True, None
    except Exception as exc:
        logger.warning(
            "Failed to send password reset email to %s: %s",
            to_email,
            str(exc),
            exc_info=True,
        )
        return False, str(exc)
