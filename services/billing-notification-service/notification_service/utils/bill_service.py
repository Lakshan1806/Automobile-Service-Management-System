from decimal import Decimal
from datetime import datetime
from io import BytesIO
from django.db import transaction
from ..models import Bill, BillItem
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch


class BillService:
    @staticmethod
    @transaction.atomic
    def generate_bill(customer_email, items):
        """
        Generate a bill with the specified items

        Args:
            customer_email (str): Email of the customer
            items (list): List of dictionaries containing item details:
                         [{'name': 'Item Name', 'price': 100.00, 'quantity': 1}, ...]

        Returns:
            Bill: Created bill object
        """
        # Calculate total price
        total_price = Decimal('0.00')
        bill_items = []

        # Create bill items
        for item_data in items:
            item_price = Decimal(str(item_data['price']))
            quantity = int(item_data.get('quantity', 1))

            item = BillItem.objects.create(
                name=item_data['name'],
                price=item_price,
                quantity=quantity
            )
            bill_items.append(item)
            total_price += item_price * quantity

        # Create bill
        bill = Bill.objects.create(
            customer_email=customer_email,
            total_price=total_price
        )

        # Add items to bill
        bill.items.add(*bill_items)

        return bill

    @staticmethod
    def generate_bill_pdf(bill):
        """
        Generate PDF for bill in memory using ReportLab

        Args:
            bill (Bill): Bill object to generate PDF for

        Returns:
            BytesIO: In-memory PDF file buffer
        """
        # Create an in-memory buffer for the PDF
        pdf_buffer = BytesIO()

        # Create PDF using ReportLab
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        styles = getSampleStyleSheet()
        elements = []

        # Add title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a1a'),
            spaceAfter=30,
            alignment=1,  # Center alignment
            fontName='Helvetica-Bold'
        )
        elements.append(Paragraph("Automobile Service Bill", title_style))
        elements.append(Spacer(1, 0.2 * inch))

        # Add bill information
        bill_info_style = ParagraphStyle(
            'BillInfo',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6
        )

        elements.append(
            Paragraph(f"<b>Bill ID:</b> {bill.bill_id}", bill_info_style))
        elements.append(
            Paragraph(f"<b>Customer Email:</b> {bill.customer_email}", bill_info_style))
        elements.append(Paragraph(
            f"<b>Date:</b> {bill.created_at.strftime('%B %d, %Y at %I:%M %p')}",
            bill_info_style
        ))
        elements.append(Spacer(1, 0.3 * inch))

        # Add items table
        items_data = [['Item', 'Price', 'Quantity', 'Subtotal']]

        for item in bill.items.all():
            subtotal = float(item.price) * item.quantity
            items_data.append([
                Paragraph(item.name, styles['Normal']),
                f"${float(item.price):.2f}",
                str(item.quantity),
                f"${subtotal:.2f}"
            ])

        # Add total row
        items_data.append([
            Paragraph('<b>Total</b>', styles['Normal']),
            '',
            '',
            Paragraph(f"<b>${float(bill.total_price):.2f}</b>",
                      styles['Normal'])
        ])

        # Create table with proper column widths
        table = Table(items_data, colWidths=[
                      3*inch, 1.5*inch, 1*inch, 1.5*inch])

        # Style the table
        table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a4a4a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),

            # Data rows styling
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),

            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.black),

            # Total row styling
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8e8e8')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 12),

            # Alternating row colors for better readability
            ('ROWBACKGROUNDS', (0, 1), (-1, -2),
             [colors.white, colors.HexColor('#f5f5f5')]),
        ]))

        elements.append(table)
        elements.append(Spacer(1, 0.5 * inch))

        # Add thank you message
        thank_you_style = ParagraphStyle(
            'ThankYou',
            parent=styles['Normal'],
            fontSize=12,
            alignment=1,  # Center alignment
            textColor=colors.HexColor('#4a4a4a')
        )
        elements.append(
            Paragraph("Thank you for choosing our automobile services!", thank_you_style))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(
            Paragraph("We appreciate your business!", thank_you_style))

        # Build PDF
        doc.build(elements)

        # Reset buffer position to the beginning
        pdf_buffer.seek(0)

        return pdf_buffer
