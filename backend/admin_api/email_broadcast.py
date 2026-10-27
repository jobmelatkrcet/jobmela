import logging
from django.conf import settings
from django.core.mail import get_connection, EmailMultiAlternatives
from django.utils.html import escape
from django.utils import timezone

logger = logging.getLogger(__name__)

WHATSAPP_GROUP_LINK = (
    "https://chat.whatsapp.com/FPlYlj8NqzSLDcZzS44Oi0?s=cl&p=a&mlu=4&ilr=4&iam=2"
)


def build_broadcast_html(
    student_name,
    subject,
    message_text,
    include_whatsapp=True,
    whatsapp_url=WHATSAPP_GROUP_LINK,
):
    """
    Renders an official responsive HTML email template for TKRCET Job Mela 2026 announcements.
    """
    safe_name = escape(student_name or "Candidate")
    safe_subject = escape(subject)

    # Format plain text message into HTML paragraphs
    paragraphs = [p.strip() for p in message_text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [escape(message_text.strip())]
    else:
        paragraphs = [
            "<p style='margin: 0 0 14px 0; line-height: 1.65; color: #334155; font-size: 15px;'>"
            + escape(p).replace("\n", "<br/>")
            + "</p>"
            for p in paragraphs
        ]
    formatted_body = "".join(paragraphs)

    whatsapp_section = ""
    if include_whatsapp:
        safe_wa_url = escape(whatsapp_url or WHATSAPP_GROUP_LINK)
        whatsapp_section = f"""
        <div style="margin: 28px 0; background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px solid #86efac; border-radius: 12px; padding: 20px 22px; text-align: center; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.08);">
          <div style="display: inline-block; background-color: #22c55e; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 10px; border-radius: 9999px; margin-bottom: 10px;">
            Official Candidates Community
          </div>
          <h3 style="margin: 0 0 8px 0; color: #065f46; font-size: 18px; font-weight: 700;">
            Join TKRCET Job Mela WhatsApp Group
          </h3>
          <p style="margin: 0 0 16px 0; font-size: 13.5px; line-height: 1.5; color: #047857;">
            Get real-time announcements on company arrivals, interview call schedules, and spot shortlists directly on your phone.
          </p>
          <a href="{safe_wa_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #16a34a 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14.5px; padding: 11px 26px; border-radius: 8px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.35);">
            👉 Join WhatsApp Group Now
          </a>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{safe_subject}</title>
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
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #091e42 0%, #1e3a8a 100%);
      padding: 30px 24px;
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
      margin-bottom: 10px;
    }}
    .header h1 {{
      margin: 0 0 6px 0;
      font-size: 21px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }}
    .content {{
      padding: 30px 26px;
    }}
    .event-card {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
      margin: 24px 0 16px 0;
      font-size: 13.5px;
      line-height: 1.6;
      color: #475569;
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
      <div class="badge">Official Announcement</div>
      <h1>TKRCET Mega Job Mela 2026</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9; color: #bfdbfe;">
        TKR College of Engineering &amp; Technology (Autonomous) • Hyderabad
      </p>
    </div>

    <div class="content">
      <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
        Dear {safe_name},
      </div>

      {formatted_body}

      {whatsapp_section}

      <div class="event-card">
        <div style="font-weight: 700; color: #1e293b; margin-bottom: 8px; font-size: 14px;">
          📌 Event Quick Details:
        </div>
        <div>🗓 <strong>Date:</strong> Saturday, 31 October 2026</div>
        <div>📍 <strong>Venue:</strong> TKRCET Campus, Medbowli, Meerpet, Hyderabad - 500097</div>
        <div>📞 <strong>Helpline:</strong> 9949139414 / 7075450757</div>
        <div>🌐 <strong>Portal:</strong> <a href="https://www.tkrcetjobmela.in" style="color: #2563eb;">www.tkrcetjobmela.in</a></div>
      </div>

      <div style="margin-top: 24px; font-size: 14px; color: #64748b; line-height: 1.5;">
        Best regards,<br/>
        <strong style="color: #0f172a;">Training &amp; Placement Cell</strong><br/>
        TKR College of Engineering &amp; Technology, Hyderabad
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px;">
        You are receiving this official communication as a registered participant of TKRCET Mega Job Mela 2026.
      </p>
      <p style="margin: 0;">
        &copy; 2026 TKR College of Engineering &amp; Technology. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
"""
    return html


def build_broadcast_plain(student_name, subject, message_text, include_whatsapp=True, whatsapp_url=WHATSAPP_GROUP_LINK):
    """
    Renders plain text fallback for email clients without HTML support.
    """
    wa_text = ""
    if include_whatsapp:
        wa_text = f"""
--------------------------------------------------
OFFICIAL CANDIDATES WHATSAPP GROUP:
Join our WhatsApp group for live company calls and interview updates:
{whatsapp_url or WHATSAPP_GROUP_LINK}
--------------------------------------------------
"""

    return f"""Hello {student_name or 'Candidate'},

{subject}

{message_text.strip()}

{wa_text}
Event Details:
- Date: Saturday, 31 October 2026
- Venue: TKR College of Engineering & Technology, Medbowli, Meerpet, Hyderabad
- Helplines: 9949139414 / 7075450757
- Website: https://www.tkrcetjobmela.in

Best regards,
Training & Placement Cell
TKR College of Engineering & Technology
"""


def dispatch_broadcast_emails(
    subject,
    message_text,
    recipients,
    from_email=None,
    include_whatsapp=True,
    whatsapp_url=WHATSAPP_GROUP_LINK,
    batch_size=50,
):
    """
    Dispatches personalized emails to a list of (email, name) tuples using persistent SMTP connection.
    Returns dict with dispatch statistics.
    """
    if not recipients:
        return {
            "success": True,
            "total_recipients": 0,
            "sent_count": 0,
            "failed_count": 0,
            "errors": [],
        }

    default_from = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        "TKRCET Mega Job Mela 2026 <jobmela@tkrcetjobmela.in>",
    )
    sender = from_email or default_from

    total_recipients = len(recipients)
    sent_count = 0
    failed_count = 0
    errors = []

    try:
        connection = get_connection()
        connection.open()
    except Exception as exc:
        logger.error("Failed to establish SMTP email connection: %s", exc, exc_info=True)
        return {
            "success": False,
            "total_recipients": total_recipients,
            "sent_count": 0,
            "failed_count": total_recipients,
            "errors": [f"Email connection error: {str(exc)}"],
        }

    try:
        # Build list of messages
        messages = []
        for to_email, full_name in recipients:
            if not to_email:
                continue
            html_body = build_broadcast_html(
                student_name=full_name,
                subject=subject,
                message_text=message_text,
                include_whatsapp=include_whatsapp,
                whatsapp_url=whatsapp_url,
            )
            plain_body = build_broadcast_plain(
                student_name=full_name,
                subject=subject,
                message_text=message_text,
                include_whatsapp=include_whatsapp,
                whatsapp_url=whatsapp_url,
            )

            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_body,
                from_email=sender,
                to=[to_email],
                connection=connection,
            )
            msg.attach_alternative(html_body, "text/html")
            messages.append(msg)

        # Send in batches with serverless execution timeout guard (e.g. Vercel 10s-15s limit)
        import time
        start_time = time.time()
        max_duration_seconds = 8.5

        for i in range(0, len(messages), batch_size):
            if time.time() - start_time > max_duration_seconds:
                remaining = len(messages) - sent_count
                logger.warning(
                    "Approaching serverless timeout after %d sent. Halting batch loop (%d remaining).",
                    sent_count,
                    remaining,
                )
                if remaining > 0 and len(errors) < 5:
                    errors.append(
                        f"Serverless execution limit reached after sending {sent_count} emails. Please dispatch remaining {remaining} in subsequent batches."
                    )
                break

            chunk = messages[i : i + batch_size]
            try:
                num_sent = connection.send_messages(chunk)
                sent_count += num_sent
            except Exception as batch_exc:
                logger.error(
                    "Error sending email batch %d-%d: %s",
                    i,
                    i + len(chunk),
                    batch_exc,
                    exc_info=True,
                )
                failed_count += len(chunk)
                if len(errors) < 5:
                    errors.append(str(batch_exc))

    except Exception as general_exc:
        logger.error("General error during broadcast dispatch: %s", general_exc, exc_info=True)
        errors.append(str(general_exc))
    finally:
        try:
            connection.close()
        except Exception:
            pass

    return {
        "success": sent_count > 0 or failed_count == 0,
        "total_recipients": total_recipients,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "errors": errors,
    }


def dispatch_campaign_batch(
    campaign,
    batch_size=50,
    from_email=None,
    whatsapp_url=WHATSAPP_GROUP_LINK,
    max_duration_seconds=22.0,
):
    """
    Safely dispatches the next batch of pending recipients for a BroadcastCampaign.
    Tracks each recipient's status ('sent' or 'failed') individually with timestamps and error details.
    Guarantees duplicate-send protection via DB status checking and unique constraints.
    Returns a dict with execution progress and remaining recipient count.
    """
    import time

    pending_recipients_qs = campaign.recipients.filter(status="pending").order_by("id")
    pending_count_total = pending_recipients_qs.count()

    if pending_count_total == 0:
        campaign.status = "completed"
        campaign.save(update_fields=["status", "updated_at"])
        return {
            "success": True,
            "campaign_id": campaign.id,
            "is_completed": True,
            "total_recipients": campaign.total_recipients,
            "sent_count": campaign.sent_count,
            "failed_count": campaign.failed_count,
            "batch_sent": 0,
            "batch_failed": 0,
            "remaining_count": 0,
            "status": "completed",
            "errors": [],
        }

    # Fetch this batch
    batch_recipients = list(pending_recipients_qs[:batch_size])
    if not batch_recipients:
        campaign.status = "completed"
        campaign.save(update_fields=["status", "updated_at"])
        return {
            "success": True,
            "campaign_id": campaign.id,
            "is_completed": True,
            "total_recipients": campaign.total_recipients,
            "sent_count": campaign.sent_count,
            "failed_count": campaign.failed_count,
            "batch_sent": 0,
            "batch_failed": 0,
            "remaining_count": 0,
            "status": "completed",
            "errors": [],
        }

    campaign.status = "in_progress"
    campaign.save(update_fields=["status", "updated_at"])

    default_from = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        "TKRCET Mega Job Mela 2026 <jobmela@tkrcetjobmela.in>",
    )
    sender = from_email or default_from
    errors = []
    batch_sent = 0
    batch_failed = 0

    try:
        connection = get_connection(timeout=getattr(settings, "EMAIL_TIMEOUT", 10))
        connection.open()
    except Exception as exc:
        logger.error(
            "Failed to establish SMTP email connection for campaign %s: %s",
            campaign.id,
            exc,
            exc_info=True,
        )
        return {
            "success": False,
            "campaign_id": campaign.id,
            "is_completed": False,
            "total_recipients": campaign.total_recipients,
            "sent_count": campaign.sent_count,
            "failed_count": campaign.failed_count,
            "batch_sent": 0,
            "batch_failed": 0,
            "remaining_count": pending_count_total,
            "status": campaign.status,
            "errors": [f"SMTP Connection Error: {str(exc)}"],
        }

    start_time = time.time()
    try:
        for recipient in batch_recipients:
            # Serverless execution limit guard
            if time.time() - start_time > max_duration_seconds:
                logger.warning(
                    "Campaign %s reached max duration limit (%ss). Halting current batch.",
                    campaign.id,
                    max_duration_seconds,
                )
                break

            to_email = recipient.email.strip() if recipient.email else ""
            if not to_email:
                recipient.status = "failed"
                recipient.error_message = "Missing recipient email address."
                recipient.save(update_fields=["status", "error_message"])
                batch_failed += 1
                continue

            html_body = build_broadcast_html(
                student_name=recipient.full_name or "Candidate",
                subject=campaign.subject,
                message_text=campaign.message,
                include_whatsapp=campaign.include_whatsapp,
                whatsapp_url=whatsapp_url,
            )
            plain_body = build_broadcast_plain(
                student_name=recipient.full_name or "Candidate",
                subject=campaign.subject,
                message_text=campaign.message,
                include_whatsapp=campaign.include_whatsapp,
                whatsapp_url=whatsapp_url,
            )

            msg = EmailMultiAlternatives(
                subject=campaign.subject,
                body=plain_body,
                from_email=sender,
                to=[to_email],
                connection=connection,
            )
            msg.attach_alternative(html_body, "text/html")

            try:
                sent = connection.send_messages([msg])
                if sent > 0:
                    recipient.status = "sent"
                    recipient.sent_at = timezone.now()
                    recipient.error_message = ""
                    recipient.save(update_fields=["status", "sent_at", "error_message"])
                    batch_sent += 1
                else:
                    recipient.status = "failed"
                    recipient.error_message = "SMTP returned 0 sent messages."
                    recipient.save(update_fields=["status", "error_message"])
                    batch_failed += 1
            except Exception as send_err:
                logger.warning(
                    "Failed to deliver campaign email to %s: %s",
                    to_email,
                    send_err,
                )
                recipient.status = "failed"
                recipient.error_message = str(send_err)[:500]
                recipient.save(update_fields=["status", "error_message"])
                batch_failed += 1
                if len(errors) < 5:
                    errors.append(f"{to_email}: {str(send_err)}")
    finally:
        try:
            connection.close()
        except Exception:
            pass

    # Update aggregate totals on campaign
    total_sent = campaign.recipients.filter(status="sent").count()
    total_failed = campaign.recipients.filter(status="failed").count()
    remaining = campaign.recipients.filter(status="pending").count()

    campaign.sent_count = total_sent
    campaign.failed_count = total_failed
    if remaining == 0:
        campaign.status = "completed"
    else:
        campaign.status = "in_progress"
    campaign.save(update_fields=["sent_count", "failed_count", "status", "updated_at"])

    return {
        "success": batch_sent > 0 or (batch_failed == 0 and total_sent > 0),
        "campaign_id": campaign.id,
        "is_completed": (remaining == 0),
        "total_recipients": campaign.total_recipients,
        "sent_count": total_sent,
        "failed_count": total_failed,
        "batch_sent": batch_sent,
        "batch_failed": batch_failed,
        "remaining_count": remaining,
        "status": campaign.status,
        "errors": errors,
    }

