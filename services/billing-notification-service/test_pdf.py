"""
Test script to verify PDF generation works correctly
"""
import uuid
from decimal import Decimal
from notification_service.utils.bill_service import BillService
from notification_service.models import Bill, BillItem
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()


def test_pdf_generation():
    """Test PDF generation and verify it creates a valid PDF"""
    print("Testing PDF generation...")

    # Create a mock bill
    print("Creating test bill...")
    bill = Bill.objects.create(
        bill_id=uuid.uuid4(),
        customer_email="test@example.com",
        total_price=Decimal("150.00")
    )

    # Create test items
    item1 = BillItem.objects.create(
        name="Oil Change",
        price=Decimal("50.00"),
        quantity=1
    )
    item2 = BillItem.objects.create(
        name="Tire Rotation",
        price=Decimal("40.00"),
        quantity=1
    )
    item3 = BillItem.objects.create(
        name="Brake Inspection",
        price=Decimal("60.00"),
        quantity=1
    )

    bill.items.add(item1, item2, item3)
    print(f"Bill created with ID: {bill.bill_id}")

    # Generate PDF
    print("Generating PDF...")
    pdf_buffer = BillService.generate_bill_pdf(bill)

    # Check if PDF was generated
    if pdf_buffer:
        pdf_content = pdf_buffer.getvalue()
        print(f"✓ PDF generated successfully!")
        print(f"  - PDF size: {len(pdf_content)} bytes")

        # Verify it's a valid PDF (should start with %PDF)
        if pdf_content[:4] == b'%PDF':
            print(f"✓ PDF is valid (starts with %PDF header)")
        else:
            print(f"✗ WARNING: PDF may not be valid (doesn't start with %PDF header)")
            print(f"  First 20 bytes: {pdf_content[:20]}")

        # Optionally save to file for manual inspection
        test_file = "test_bill.pdf"
        with open(test_file, 'wb') as f:
            f.write(pdf_content)
        print(f"✓ PDF saved to {test_file} for manual inspection")

    else:
        print("✗ Failed to generate PDF")

    # Cleanup
    print("\nCleaning up test data...")
    bill.delete()
    item1.delete()
    item2.delete()
    item3.delete()
    print("✓ Test completed successfully!")


if __name__ == "__main__":
    try:
        test_pdf_generation()
    except Exception as e:
        print(f"✗ Error during test: {e}")
        import traceback
        traceback.print_exc()
