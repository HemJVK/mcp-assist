import base64
from email.mime.text import MIMEText
from app.services.google_base import GoogleBaseService
from typing import Dict, Any

class GmailService(GoogleBaseService):
    def __init__(self):
        super().__init__('gmail', 'v1')

    def send_email(self, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Sends an email using the Gmail API.
        """
        if not self.service:
            return {"error": "Gmail service not initialized"}

        try:
            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            body = {'raw': raw_message}

            message = self.service.users().messages().send(userId='me', body=body).execute()
            return {"status": "SENT", "message_id": message.get('id')}

        except Exception as e:
            print(f"Error sending email: {e}")
            return {"error": str(e)}
