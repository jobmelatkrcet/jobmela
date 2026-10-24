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
        "TKRCET Mega Job Mela 2026 <jobmela@tkrcetjobmela.in>",
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


WHATSAPP_GROUP_LINK = (
    "https://chat.whatsapp.com/GeBF7GJKkIJHdKsW4YZlsj?s=cl&p=a&mlu=4&ilr=4"
)


def send_registration_welcome_email(user):
    """
    Sends an immediate official registration confirmation email to newly registered candidates.
    Includes candidate credentials summary, mandatory event guidelines, documents checklist,
    reporting schedule, and the official Candidates WhatsApp Group link.
    Returns (True, None) on success or (False, error_str) on failure.
    """
    subject = "Registration Confirmed — TKRCET Mega Job Mela 2026"
    from_email = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        "TKRCET Mega Job Mela 2026 <jobmela@tkrcetjobmela.in>",
    )
    to_email = user.email

    safe_name = escape(user.full_name or "Candidate")
    safe_email = escape(to_email or "")
    safe_mobile = escape(getattr(user, "mobile", "") or "Provided during registration")
    safe_qual = escape(getattr(user, "qualification", "") or "Registered Candidate")
    safe_college = escape(getattr(user, "college", "") or "TKR College of Engineering & Technology")
    portal_url = getattr(settings, "FRONTEND_URL", "https://www.tkrcetjobmela.in")
    login_url = f"{portal_url.rstrip('/')}/login"

    # Plain text version
    text_content = f"""Hello {user.full_name or 'Candidate'},

Congratulations! Your registration for the TKRCET Mega Job Mela 2026 has been successfully confirmed.

CANDIDATE REGISTRATION DETAILS:
• Candidate Name: {user.full_name or 'Candidate'}
• Registered Email: {to_email}
• Mobile Number: {safe_mobile}
• Qualification: {safe_qual}
• College / Institution: {safe_college}

--------------------------------------------------
OFFICIAL CANDIDATES WHATSAPP COMMUNITY:
Join the official WhatsApp group now to receive live updates, company arrival notices, interview calls, and spot shortlists during the Job Mela:
{WHATSAPP_GROUP_LINK}
--------------------------------------------------

EVENT SCHEDULE & VENUE DETAILS:
• Date: Saturday, 31 October 2026
• Reporting Time: Gates open at 8:30 AM (Interviews begin at 9:30 AM)
• Venue: TKR College of Engineering & Technology (TKRCET Campus)
  Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana — 500097
• Dress Code: Formal / professional attire mandatory

CHECKLIST OF DOCUMENTS TO BRING:
1. 3 to 5 printed hard copies of your updated resume
2. 3 passport-size color photographs
3. Government photo ID proof (Aadhaar / Voter ID / Driving License)
4. Photocopies of all educational marksheets & certificates
5. Writing pad and blue/black pens

STUDENT PORTAL ACCESS:
Login to your candidate account anytime to view 150+ participating companies and submit direct applications:
{login_url}

PLACEMENT HELPLINE COORDINATORS:
Phone: 9949139414 / 7075450757 / 8121449141
Website: https://www.tkrcetjobmela.in

Best regards,
Training & Placement Cell
TKR College of Engineering & Technology (Autonomous)
Medbowli, Meerpet, Hyderabad
"""

    # Rich responsive HTML template
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - TKRCET Job Mela 2026</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }}
    .email-container {{
      max-width: 600px;
      margin: 24px auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #091e42 0%, #1e3a8a 100%);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }}
    .badge {{
      display: inline-block;
      background: #22c55e;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 14px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }}
    .header h1 {{
      margin: 0 0 6px 0;
      font-size: 23px;
      font-weight: 800;
      letter-spacing: -0.4px;
    }}
    .content {{
      padding: 32px 28px;
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
    }}
    .card-box {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin: 20px 0;
      font-size: 14px;
    }}
    .whatsapp-card {{
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border: 1.5px solid #86efac;
      border-radius: 12px;
      padding: 22px 20px;
      text-align: center;
      margin: 26px 0;
      box-shadow: 0 4px 14px rgba(34, 197, 94, 0.1);
    }}
    .whatsapp-btn {{
      display: inline-block;
      background: linear-gradient(135deg, #25D366 0%, #16a34a 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 15px;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(37, 211, 102, 0.35);
      margin-top: 12px;
    }}
    .login-btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 11px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25);
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 22px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="badge">&#10003; Registration Confirmed</div>
      <h1>TKRCET Mega Job Mela 2026</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.92; color: #bfdbfe;">
        TKR College of Engineering &amp; Technology (Autonomous) • Hyderabad
      </p>
    </div>

    <div class="content">
      <div style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
        Hello {safe_name},
      </div>

      <p style="margin: 0 0 16px;">
        Congratulations! Your registration for the <strong>TKRCET Mega Job Mela 2026</strong> has been successfully recorded. You are now officially registered to participate and interview with <strong>150+ premier multinational companies and recruiters</strong>.
      </p>

      <!-- Candidate Registration Summary -->
      <div class="card-box">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          &#128100; Your Candidate Registration Details
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.6;">
          <tr>
            <td style="color: #64748b; width: 38%; padding: 3px 0;"><strong>Full Name:</strong></td>
            <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">{safe_name}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 3px 0;"><strong>Registered Email:</strong></td>
            <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">{safe_email}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 3px 0;"><strong>Mobile:</strong></td>
            <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">{safe_mobile}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 3px 0;"><strong>Qualification:</strong></td>
            <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">{safe_qual}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 3px 0;"><strong>College:</strong></td>
            <td style="color: #0f172a; font-weight: 600; padding: 3px 0;">{safe_college}</td>
          </tr>
        </table>
      </div>

      <!-- Official WhatsApp Community Callout Box -->
      <div class="whatsapp-card">
        <span style="display: inline-block; background-color: #22c55e; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 10px; border-radius: 9999px;">
          Mandatory for Candidates
        </span>
        <h3 style="margin: 8px 0 6px; color: #065f46; font-size: 19px; font-weight: 800;">
          Join the Official WhatsApp Group
        </h3>
        <p style="margin: 0 0 14px; font-size: 13.5px; line-height: 1.5; color: #047857;">
          Stay informed with real-time company arrivals, interview schedules, round shortlists, and spot allocations during the Job Mela.
        </p>
        <a href="{WHATSAPP_GROUP_LINK}" target="_blank" class="whatsapp-btn">
          &#128073; Click Here to Join WhatsApp Group
        </a>
        <div style="margin-top: 10px; font-size: 12px; color: #059669;">
          Or copy link: <a href="{WHATSAPP_GROUP_LINK}" style="color: #047857; word-break: break-all;">{WHATSAPP_GROUP_LINK}</a>
        </div>
      </div>

      <!-- Event Schedule & Guidelines -->
      <div class="card-box" style="background-color: #f8fafc; border-left: 4px solid #2563eb;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: 14px;">
          &#128197; Event Schedule &amp; Venue
        </div>
        <div style="font-size: 13.5px; line-height: 1.6; color: #334155;">
          <div>&#128197; <strong>Date:</strong> Saturday, 31 October 2026</div>
          <div>&#9200; <strong>Reporting Time:</strong> Gates open at 8:30 AM (Interviews begin at 9:30 AM)</div>
          <div>&#128205; <strong>Venue:</strong> TKR College of Engineering &amp; Technology (TKRCET Campus)</div>
          <div style="margin-left: 20px; color: #64748b; font-size: 12.5px;">
            Medbowli, Meerpet, Saroornagar, Hyderabad, Telangana — 500097
          </div>
          <div>&#128084; <strong>Dress Code:</strong> Formal / professional attire mandatory</div>
        </div>
      </div>

      <!-- Mandatory Checklist -->
      <div class="card-box" style="background-color: #fffbeb; border: 1px solid #fde68a;">
        <div style="font-weight: 700; color: #92400e; margin-bottom: 6px; font-size: 14px;">
          &#128203; Mandatory Documents to Bring:
        </div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #78350f; line-height: 1.6;">
          <li>3 to 5 printed copies of your updated resume</li>
          <li>3 passport-size color photographs</li>
          <li>Government Photo ID proof (Aadhaar / Voter ID / Driving License)</li>
          <li>Photocopies of academic certificates &amp; marksheets</li>
          <li>Writing pad and blue/black pens</li>
        </ul>
      </div>

      <!-- Candidate Portal Login Action -->
      <div style="text-align: center; margin: 26px 0 16px;">
        <a href="{login_url}" target="_blank" class="login-btn">
          Login to Student Portal &rarr;
        </a>
        <div style="font-size: 12.5px; color: #64748b; margin-top: 8px;">
          Browse 150+ participating companies and submit direct applications.
        </div>
      </div>

      <div style="margin-top: 24px; font-size: 13.5px; color: #64748b; line-height: 1.5;">
        For queries, reach our Placement Helpline: <strong>9949139414</strong> / <strong>7075450757</strong><br/>
        Best regards,<br/>
        <strong style="color: #0f172a;">Training &amp; Placement Cell</strong><br/>
        TKR College of Engineering &amp; Technology, Hyderabad
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
        logger.info("Registration welcome email dispatched successfully to: %s", to_email)
        return True, None
    except Exception as exc:
        logger.warning(
            "Failed to send registration welcome email to %s: %s",
            to_email,
            str(exc),
            exc_info=True,
        )
        return False, str(exc)
