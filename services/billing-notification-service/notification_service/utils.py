from django.utils import timezone
from django.core.mail import EmailMessage
from django.conf import settings
from .models import OTP, Bill, BillItem
import random
import uuid
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


class OTPService:
    @staticmethod
    def generate_otp(email):
        """Generate a new OTP for the given email"""
        # Generate a 6-digit OTP
        otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Use timezone.now() for timezone-aware datetime
        now = timezone.now()
        expires_at = now + timezone.timedelta(minutes=10)

        # Save OTP to database
        otp = OTP(
            email=email,
            otp_code=otp_code,
            created_at=now,
            expires_at=expires_at,
            is_used=False
        )
        otp.save()

        return otp_code

    @staticmethod
    def validate_otp(email, otp_code):
        """Validate the OTP for the given email"""
        try:
            # Use timezone.now() for timezone-aware comparison
            otp = OTP.objects.get(
                email=email,
                otp_code=otp_code,
                is_used=False,
                expires_at__gt=timezone.now()
            )

            # Mark OTP as used after validation
            otp.is_used = True
            otp.save()

            return True
        except OTP.DoesNotExist:
            return False


class BillService:
    @staticmethod
    def generate_bill(customer_email, items):
        """
        Generate a bill with the specified items
        """
        # Create a new bill
        bill = Bill(
            bill_id=uuid.uuid4(),
            customer_email=customer_email,
            created_at=timezone.now(),
            total_price=0
        )
        bill.save()

        # Calculate total price
        total_price = 0

        # Add items to bill
        for item in items:
            price = float(item['price'])
            quantity = int(item['quantity'])
            subtotal = price * quantity
            total_price += subtotal

            bill_item = BillItem(
                bill=bill,
                name=item['name'],
                price=price,
                quantity=quantity
            )
            bill_item.save()

        # Update total price
        bill.total_price = total_price
        bill.save()

        return bill

    @staticmethod
    def generate_bill_pdf(bill):
        """
        Generate a PDF for the specified bill in memory
        """
        # Create an in-memory buffer for the PDF
        pdf_buffer = BytesIO()

        # Create PDF using ReportLab
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Add title
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            alignment=1,  # Center alignment
            spaceAfter=12
        )
        elements.append(Paragraph(f"Automobile Service Bill", title_style))
        elements.append(Spacer(1, 12))

        # Add bill info
        bill_info_style = styles["Normal"]
        elements.append(
            Paragraph(f"<b>Bill ID:</b> {bill.bill_id}", bill_info_style))
        elements.append(
            Paragraph(f"<b>Customer Email:</b> {bill.customer_email}", bill_info_style))
        elements.append(Paragraph(
            f"<b>Date:</b> {bill.created_at.strftime('%Y-%m-%d %H:%M:%S')}", bill_info_style))
        elements.append(Spacer(1, 12))

        # Add items table
        items_data = [['Item', 'Price', 'Quantity', 'Subtotal']]
        for item in bill.items.all():
            subtotal = item.price * item.quantity
            items_data.append([
                item.name,
                f"{item.price:.2f}",
                str(item.quantity),
                f"{subtotal:.2f}"
            ])

        # Add total row
        items_data.append(
            ['', '', '<b>Total</b>', f"<b>{bill.total_price:.2f}</b>"])

        # Create table
        table = Table(items_data, colWidths=[200, 100, 100, 100])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 20))

        # Add thank you message
        elements.append(
            Paragraph("Thank you for choosing our services!", styles["Normal"]))

        # Build PDF
        doc.build(elements)

        # Reset buffer position to the beginning
        pdf_buffer.seek(0)

        return pdf_buffer


class EmailService:
    @staticmethod
    def send_otp_email(email, otp_code):
        """Send OTP via email"""
        subject = "Your One-Time Password"
        message = f"Your OTP code is: {otp_code}"
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]

        try:
            from django.core.mail import send_mail
            send_mail(subject, message, email_from,
                      recipient_list, fail_silently=False)
            return True
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error sending OTP email: {e}")
            return False

    @staticmethod
    def send_bill_email(email, bill):
        """Send bill via email with PDF attachment"""
        try:
            # Generate PDF in memory
            pdf_buffer = BillService.generate_bill_pdf(bill)

            # Prepare email
            subject = f"Your Automobile Service Bill #{bill.bill_id}"
            message = f"""
Dear Customer,

Thank you for choosing our service. Your bill is attached.

Bill Details:
- Bill ID: {bill.bill_id}
- Total Amount: {bill.total_price:.2f}
- Date: {bill.created_at.strftime('%Y-%m-%d %H:%M:%S')}

If you have any questions, please contact us.

Thank you!
"""
            email_from = settings.DEFAULT_FROM_EMAIL

            # Create EmailMessage object
            email_obj = EmailMessage(
                subject=subject,
                body=message,
                from_email=email_from,
                to=[email]
            )

            # Attach PDF file from memory buffer
            email_obj.attach(
                f"bill_{bill.bill_id}.pdf", pdf_buffer.read(), 'application/pdf')

            # Send email
            email_obj.send(fail_silently=False)
            return True

        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error sending bill email: {e}")
            return False
