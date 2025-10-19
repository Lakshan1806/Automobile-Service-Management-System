import os
from decimal import Decimal
from datetime import datetime
from django.conf import settings
from django.db import transaction
from ..models import Bill, BillItem


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
        Generate PDF for bill

        Args:
            bill (Bill): Bill object to generate PDF for

        Returns:
            str: Path to generated PDF file
        """
        # In a real implementation, you would use a library like ReportLab or WeasyPrint
        # For this example, we'll just create a fake PDF path

        # Create directory for bills if it doesn't exist
        bills_dir = os.path.join(settings.BASE_DIR, 'bills')
        os.makedirs(bills_dir, exist_ok=True)

        # Generate PDF filename
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = f"bill_{bill.bill_id}_{timestamp}.pdf"
        pdf_path = os.path.join(bills_dir, filename)

        # TODO: Implement actual PDF generation
        # For now, just create an empty file
        with open(pdf_path, 'w') as f:
            f.write(f"Bill {bill.bill_id}\n")
            f.write(f"Customer: {bill.customer_email}\n")
            f.write(f"Date: {bill.created_at}\n\n")
            f.write("Items:\n")

            for item in bill.items.all():
                item_total = item.price * item.quantity
                f.write(
                    f"- {item.name}: ${item.price} x {item.quantity} = ${item_total}\n")

            f.write(f"\nTotal: ${bill.total_price}")

        # Update bill with PDF path
        bill.pdf_path = pdf_path
        bill.save()

        return pdf_path
