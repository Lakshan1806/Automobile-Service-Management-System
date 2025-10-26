from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone  # Add this import for timezone-aware handling
import json
import random
import datetime
import logging

from .models import Bill, OTP
from .utils import OTPService, BillService, EmailService

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def generate_otp(request):
    """
    Generate OTP for the specified email address
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return JsonResponse({'error': 'Email address is required'}, status=400)

        logger.info(f"[GENERATE] Generating OTP for email: {email}")

        # Generate OTP
        otp_code = OTPService.generate_otp(email)
        logger.info(f"[GENERATE] Successfully generated OTP: {otp_code}")

        return JsonResponse({
            'success': True,
            'message': 'OTP generated successfully',
            # In production, don't return the OTP in response
            # Only returning for development purposes
            'otp': otp_code if __debug__ else None
        })

    except Exception as e:
        logger.error(f"[GENERATE] Error generating OTP: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def verify_otp(request):
    """
    Verify OTP for the specified email address
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        otp_code = data.get('otp_code')

        if not email or not otp_code:
            return JsonResponse({'error': 'Email and OTP code are required'}, status=400)

        logger.info(f"[VERIFY] Verifying OTP: {otp_code} for email: {email}")

        # Verify OTP
        if OTPService.validate_otp(email, otp_code):
            logger.info(f"[VERIFY] OTP validated successfully")
            return JsonResponse({
                'success': True,
                'message': 'OTP verified successfully'
            })
        else:
            logger.info(f"[VERIFY] OTP validation failed")
            return JsonResponse({
                'success': False,
                'message': 'Invalid or expired OTP'
            }, status=400)

    except Exception as e:
        logger.error(f"[VERIFY] Error verifying OTP: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def send_otp_email(request):
    """
    Send OTP to the specified email address
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return JsonResponse({'error': 'Email address is required'}, status=400)

        logger.info(f"[SEND-EMAIL] Searching for OTP for email: {email}")

        # Try to get the latest OTP for this email
        try:
            # Use timezone.now() for timezone-aware datetime comparison
            now = timezone.now()

            logger.info(f"[SEND-EMAIL] Current time (timezone-aware): {now}")

            # Find valid, unused OTPs with timezone-aware comparison
            otp = OTP.objects.filter(
                email=email,
                is_used=False,
                expires_at__gt=now
            ).order_by('-created_at').first()

            if otp:
                logger.info(f"[SEND-EMAIL] Found valid OTP: {otp.otp_code}")
                otp_code = otp.otp_code
            else:
                logger.info(
                    f"[SEND-EMAIL] No valid OTP found, getting most recent OTP")
                # Try to get most recent OTP regardless of status
                otp = OTP.objects.filter(email=email).order_by(
                    '-created_at').first()

                if otp:
                    logger.info(
                        f"[SEND-EMAIL] Using most recent OTP: {otp.otp_code}, expires: {otp.expires_at}")
                    # Extend expiration time
                    otp.expires_at = now + timezone.timedelta(minutes=10)
                    otp.is_used = False
                    otp.save()
                    logger.info(
                        f"[SEND-EMAIL] Extended OTP expiration to: {otp.expires_at}")
                    otp_code = otp.otp_code
                else:
                    logger.info(
                        f"[SEND-EMAIL] No OTP found for {email}, generating new")
                    otp_code = OTPService.generate_otp(email)
                    logger.info(f"[SEND-EMAIL] Generated new OTP: {otp_code}")

        except Exception as e:
            logger.error(f"[SEND-EMAIL] Error retrieving OTP: {e}")
            # Generate new OTP as fallback
            otp_code = OTPService.generate_otp(email)
            logger.info(f"[SEND-EMAIL] Generated fallback OTP: {otp_code}")

        # Send OTP via email
        logger.info(
            f"[SEND-EMAIL] Attempting to send OTP: {otp_code} to {email}")
        success = EmailService.send_otp_email(email, otp_code)

        if success:
            logger.info(
                f"[SEND-EMAIL] Email sent successfully with OTP: {otp_code}")
            return JsonResponse({
                'success': True,
                'message': 'OTP sent successfully to email',
                'otp': otp_code
            })
        else:
            logger.error(
                f"[SEND-EMAIL] Failed to send email with OTP: {otp_code}")
            return JsonResponse({
                'success': False,
                'message': 'Failed to send OTP email'
            }, status=500)

    except Exception as e:
        logger.error(f"[SEND-EMAIL] Error in send_otp_email: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def generate_bill(request):
    """
    Generate bill with specified items
    """
    try:
        data = json.loads(request.body)
        customer_email = data.get('customer_email')
        items = data.get('items', [])

        if not customer_email or not items:
            return JsonResponse({
                'error': 'Customer email and at least one item are required'
            }, status=400)

        # Generate bill
        bill = BillService.generate_bill(customer_email, items)

        return JsonResponse({
            'success': True,
            'message': 'Bill generated successfully',
            'bill_id': str(bill.bill_id),
            'total_price': str(bill.total_price),
            'created_at': bill.created_at.isoformat()
        })

    except Exception as e:
        logger.error(f"Error generating bill: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def send_bill_email(request):
    """
    Send bill to the specified email address
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        bill_id = data.get('bill_id')

        if not email or not bill_id:
            return JsonResponse({
                'error': 'Email and bill_id are required'
            }, status=400)

        try:
            bill = Bill.objects.get(bill_id=bill_id)
        except Bill.DoesNotExist:
            return JsonResponse({
                'error': 'Bill not found'
            }, status=404)

        # Send bill via email
        success = EmailService.send_bill_email(email, bill)

        if success:
            return JsonResponse({
                'success': True,
                'message': 'Bill sent successfully to email'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to send bill email'
            }, status=500)

    except Exception as e:
        logger.error(f"Error sending bill email: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_bill(request, bill_id):
    """
    Get bill details
    """
    try:
        logger.info(f"[GET-BILL] Retrieving bill with ID: {bill_id}")

        try:
            bill = Bill.objects.get(bill_id=bill_id)
            logger.info(f"[GET-BILL] Found bill for {bill.customer_email}")
        except Bill.DoesNotExist:
            logger.error(f"[GET-BILL] Bill not found with ID: {bill_id}")
            return JsonResponse({
                'error': 'Bill not found'
            }, status=404)

        # Get bill items
        items = []
        for item in bill.items.all():
            items.append({
                'name': item.name,
                'price': str(item.price),
                'quantity': item.quantity,
                'total': str(item.price * item.quantity)
            })

        # Also send the bill by email
        success = EmailService.send_bill_email(bill.customer_email, bill)
        email_status = "Email sent successfully" if success else "Failed to send email"
        logger.info(f"[GET-BILL] {email_status} to {bill.customer_email}")

        return JsonResponse({
            'bill_id': str(bill.bill_id),
            'customer_email': bill.customer_email,
            'total_price': str(bill.total_price),
            'created_at': bill.created_at.isoformat(),
            'items': items,
            'email_sent': success,
            'email_status': email_status
        })

    except Exception as e:
        logger.error(f"[GET-BILL] Error getting bill: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def get_and_send_bill(request, bill_id):
    """
    Get bill details and send to customer email
    """
    try:
        logger.info(
            f"[GET-SEND-BILL] Retrieving and sending bill with ID: {bill_id}")

        try:
            bill = Bill.objects.get(bill_id=bill_id)
            logger.info(
                f"[GET-SEND-BILL] Found bill for {bill.customer_email}")
        except Bill.DoesNotExist:
            logger.error(f"[GET-SEND-BILL] Bill not found with ID: {bill_id}")
            return JsonResponse({
                'error': 'Bill not found'
            }, status=404)

        # Get bill items
        items = []
        for item in bill.items.all():
            items.append({
                'name': item.name,
                'price': str(item.price),
                'quantity': item.quantity,
                'total': str(item.price * item.quantity)
            })

        # Send the bill by email to the customer email from the bill
        success = EmailService.send_bill_email(bill.customer_email, bill)
        email_status = "Email sent successfully" if success else "Failed to send email"
        logger.info(f"[GET-SEND-BILL] {email_status} to {bill.customer_email}")

        return JsonResponse({
            'success': success,
            'message': f"Bill details retrieved and {email_status.lower()}",
            'bill_id': str(bill.bill_id),
            'customer_email': bill.customer_email,
            'total_price': str(bill.total_price),
            'created_at': bill.created_at.isoformat(),
            'items': items
        })

    except Exception as e:
        logger.error(f"[GET-SEND-BILL] Error processing bill: {e}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def send_bill_notification(request, bill_id):
    """
    View to send bill notification with OTP
    """
    try:
        # Parse request body
        data = json.loads(request.body)

        # Check for either 'email' or 'customer_email' in the request
        customer_email = data.get('email') or data.get('customer_email')

        # Get bill amount from either 'amount' or 'total_amount'
        bill_amount = data.get('amount') or data.get('total_amount', 0)

        if not customer_email:
            return JsonResponse({'error': 'Customer email is required'}, status=400)

        # Generate OTP - 6 digits
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Log the OTP to verify it's the same one sent in the email
        logger.info(f"Generated OTP for bill {bill_id}: {otp}")

        # Create an itemized bill summary if items are provided
        items_summary = ""
        items = data.get('items', [])
        if items:
            items_summary = "\nItemized Bill:\n"
            for item in items:
                name = item.get('name', 'Item')
                price = item.get('price', 0)
                quantity = item.get('quantity', 1)
                subtotal = item.get('subtotal', price * quantity)
                items_summary += f"- {name}: ${price} x {quantity} = ${subtotal}\n"

        # Email subject and message
        subject = 'Your Automobile Service Bill Payment OTP'
        message = f"""
Dear Customer,

Your bill amount is ${bill_amount}.
{items_summary}
Use this OTP to confirm your payment: {otp}

This OTP is valid for 10 minutes.

Thank you for choosing our service!
        """

        # Send email using Django's send_mail - store the result
        email_sent = send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,  # From email
            [customer_email],  # To email
            fail_silently=False,
        )

        if email_sent:
            # Return success response with the same OTP that was sent
            return JsonResponse({
                'success': True,
                'message': 'OTP sent successfully',
                'otp': otp,  # Include the exact same OTP in response
                'email': customer_email
            })
        else:
            return JsonResponse({'error': 'Failed to send email'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error sending bill notification: {str(e)}")
        return JsonResponse({'error': f'Failed to send OTP: {str(e)}'}, status=500)
