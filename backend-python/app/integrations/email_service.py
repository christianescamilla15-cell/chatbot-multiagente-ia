"""Email integration via Resend for notifications and reports."""

import os
import logging
import httpx

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "MultiAgente <onboarding@resend.dev>"


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send email via Resend API."""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — email not sent")
        return False

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json={"from": FROM_EMAIL, "to": [to], "subject": subject, "html": html_body},
                timeout=10,
            )
            if resp.status_code == 200:
                logger.info("Email sent to %s: %s", to, subject)
                return True
            logger.error("Resend error %d: %s", resp.status_code, resp.text)
            return False
    except Exception as e:
        logger.error("Email send failed: %s", e)
        return False


async def send_ticket_notification(resident_email: str, resident_name: str, ticket_ref: str, subject: str, category: str, priority: str) -> bool:
    """Send ticket creation notification."""
    html = f"""
    <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E40AF; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 20px;">Residencial Las Palmas</h1>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Ticket de Soporte</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <p>Hola <strong>{resident_name}</strong>,</p>
            <p>Tu ticket ha sido creado exitosamente:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Ticket</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{ticket_ref}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Asunto</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{subject}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Categoria</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">{category}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Prioridad</td><td style="padding: 8px;">{priority}</td></tr>
            </table>
            <p style="color: #64748b; font-size: 13px;">Te notificaremos cuando haya actualizaciones.</p>
        </div>
    </div>
    """
    return await send_email(resident_email, f"Ticket {ticket_ref}: {subject}", html)


async def send_otp_email(resident_email: str, resident_name: str, code: str) -> bool:
    """Send OTP verification code via email as backup."""
    html = f"""
    <div style="font-family: Arial; max-width: 400px; margin: 0 auto; text-align: center;">
        <div style="background: #1E40AF; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0;">Codigo de Verificacion</h2>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
            <p>Hola {resident_name},</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1E40AF; margin: 20px 0; padding: 16px; background: white; border-radius: 8px; border: 2px dashed #1E40AF;">{code}</div>
            <p style="color: #64748b; font-size: 13px;">Valido por 5 minutos. No compartas este codigo.</p>
        </div>
    </div>
    """
    return await send_email(resident_email, f"Codigo de verificacion: {code}", html)
