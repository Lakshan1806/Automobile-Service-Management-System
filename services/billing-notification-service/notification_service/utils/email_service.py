from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from email.mime.application import MIMEApplication
from .bill_service import BillService


class EmailService:
    @staticmethod
    def send_otp_email(email, otp_code):
        """
        Send OTP code to specified email address

        Args:
            email (str): Recipient email address
            otp_code (str): OTP code to send

        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        subject = 'Your One-Time Password (OTP) for Automobile Service'
        message = f'Your OTP code is: {otp_code}. It will expire in 10 minutes.'
        html_message = f'''
        <html>
        <body>
            <h2>Your One-Time Password</h2>
            <p>Your OTP code is: <strong>{otp_code}</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
        </body>
        </html>
        '''

        try:
            email_message = EmailMultiAlternatives(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email]
            )
            email_message.attach_alternative(html_message, "text/html")
            email_message.send()
            return True
        except Exception as e:
            print(f"Failed to send OTP email: {e}")
            return False

    @staticmethod
    def send_bill_email(email, bill):
        """
        Send bill to specified email address

        Args:
            email (str): Recipient email address
            bill (Bill): Bill object to send

        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        subject = f'Your Automobile Service Bill #{bill.bill_id}'
        message = f'Please find attached your bill for services rendered.'
        html_message = f'''
        <html>
        <body>
            <h2>Your Automobile Service Bill</h2>
            <p>Thank you for choosing our service. Please find attached your bill.</p>
            <p>Bill Details:</p>
            <ul>
                <li><strong>Bill ID:</strong> {bill.bill_id}</li>
                <li><strong>Date:</strong> {bill.created_at.strftime('%Y-%m-%d')}</li>
                <li><strong>Total Amount:</strong> ${bill.total_price}</li>
            </ul>
            <p>If you have any questions about this bill, please contact our customer service.</p>
        </body>
        </html>
        '''

        try:
            email_message = EmailMultiAlternatives(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email]
            )
            email_message.attach_alternative(html_message, "text/html")

            # Generate and attach PDF from memory
            pdf_buffer = BillService.generate_bill_pdf(bill)
            pdf_attachment = MIMEApplication(pdf_buffer.read(), _subtype="pdf")
            pdf_attachment.add_header(
                'content-disposition',
                'attachment',
                filename=f"bill_{bill.bill_id}.pdf"
            )
            email_message.attach(pdf_attachment)

            email_message.send()
            return True
        except Exception as e:
            print(f"Failed to send bill email: {e}")
            return False
