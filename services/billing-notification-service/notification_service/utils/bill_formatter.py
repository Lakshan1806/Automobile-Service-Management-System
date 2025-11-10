"""
Bill Formatting Utilities
Formats bill data for email body (text or HTML)
"""


def format_bill_text(bill):
    """
    Format bill details as plain text for email body

    Args:
        bill: Bill object with items

    Returns:
        str: Formatted bill text
    """
    text = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        AUTOMOBILE SERVICE INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice ID: {bill.bill_id}
Date: {bill.created_at.strftime('%B %d, %Y at %I:%M %p')}
Customer Email: {bill.customer_email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS & SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""

    # Add items
    for item in bill.items.all():
        item_total = item.price * item.quantity
        text += f"""
{item.name}
  Unit Price: {item.price:.2f}
  Quantity: {item.quantity}
  Total: {item_total:.2f}

"""

    text += f"""━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL AMOUNT DUE: {bill.total_price:.2f}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for choosing our service!

For any queries, please contact us with your invoice ID.

Best regards,
Automobile Service Management Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    return text.strip()


def format_bill_html(bill):
    """
    Format bill details as HTML for email body

    Args:
        bill: Bill object with items

    Returns:
        str: Formatted bill HTML
    """
    items_html = ""
    for item in bill.items.all():
        item_total = item.price * item.quantity
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">{item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">{item.price:.2f}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">{item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">{item_total:.2f}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">AUTOMOBILE SERVICE</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Invoice</p>
        </div>
        
        <!-- Invoice Info -->
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0;"><strong>Invoice ID:</strong></td>
                    <td style="padding: 8px 0; text-align: right; color: #667eea; font-family: monospace;">{bill.bill_id}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Date:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">{bill.created_at.strftime('%B %d, %Y at %I:%M %p')}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;"><strong>Customer:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">{bill.customer_email}</td>
                </tr>
            </table>
        </div>
        
        <!-- Items Table -->
        <div style="margin-top: 30px;">
            <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Items & Services</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #667eea;">Description</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #667eea;">Price</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #667eea;">Qty</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #667eea;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
        </div>
        
        <!-- Total -->
        <div style="margin-top: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: right;">
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">TOTAL AMOUNT DUE</p>
            <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold;">{bill.total_price:.2f}</p>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: center;">
            <p style="margin: 0; color: #666;">Thank you for choosing our service!</p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">For any queries, please contact us with your invoice ID.</p>
            <p style="margin: 20px 0 0 0; color: #667eea; font-weight: bold;">Automobile Service Management Team</p>
        </div>
        
        <!-- Legal Notice -->
        <div style="margin-top: 20px; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0;">This is an automatically generated invoice.</p>
            <p style="margin: 5px 0 0 0;">Please keep this for your records.</p>
        </div>
        
    </body>
    </html>
    """

    return html.strip()
