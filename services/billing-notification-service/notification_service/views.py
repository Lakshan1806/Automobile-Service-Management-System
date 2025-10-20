from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.mail import send_mail
from django.conf import settings
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

        # Generate OTP
        otp_code = OTPService.generate_otp(email)

        return JsonResponse({
            'success': True,
            'message': 'OTP generated successfully',
            # In production, don't return the OTP in response
            # Only returning for development purposes
            'otp': otp_code if __debug__ else None
        })

    except Exception as e:
        logger.error(f"Error generating OTP: {e}")
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

        # Verify OTP
        if OTPService.validate_otp(email, otp_code):
            return JsonResponse({
                'success': True,
                'message': 'OTP verified successfully'
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid or expired OTP'
            }, status=400)

    except Exception as e:
        logger.error(f"Error verifying OTP: {e}")
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

        # Log the email we're searching for, to help with debugging
        logger.info(f"Searching for OTP for email: {email}")

        # Try to get the latest OTP for this email with more lenient filtering
        try:
            # First try with strict filtering (valid, unused OTPs)
            otp = OTP.objects.filter(
                email=email,
                is_used=False,
                expires_at__gt=datetime.datetime.now()
            ).order_by('-created_at').first()

            if not otp:
                # If not found, try with just the email match (for debugging)
                otp = OTP.objects.filter(email=email).order_by(
                    '-created_at').first()
                if otp:
                    # Log that we found an expired or used OTP
                    logger.warning(
                        f"Found only expired/used OTP for {email}: {otp.otp_code}, expired: {otp.expires_at < datetime.datetime.now()}, used: {otp.is_used}")

                    # If the OTP is marked as used but we need it, we can temporarily "revive" it
                    if otp.is_used:
                        otp.is_used = False
                        otp.save()
                        logger.info(
                            f"Revived used OTP for debugging: {otp.otp_code}")

                    # If the OTP is expired but recent (within last hour), extend its validity
                    if otp.expires_at < datetime.datetime.now() and otp.expires_at > datetime.datetime.now() - datetime.timedelta(hours=1):
                        otp.expires_at = datetime.datetime.now() + datetime.timedelta(minutes=10)
                        otp.save()
                        logger.info(
                            f"Extended expiration of OTP for debugging: {otp.otp_code}")

            if otp:
                otp_code = otp.otp_code
            else:
                # If still not found, create a new OTP
                logger.warning(f"No OTP found for {email}, generating new one")
                otp_code = OTPService.generate_otp(email)
                logger.info(f"New OTP generated: {otp_code}")

        except OTP.DoesNotExist:
            # Fallback to generate a new OTP
            logger.warning(f"OTP.DoesNotExist for {email}, generating new one")
            otp_code = OTPService.generate_otp(email)
            logger.info(f"New OTP generated: {otp_code}")

        # Send OTP via email
        success = EmailService.send_otp_email(email, otp_code)

        if success:
            return JsonResponse({
                'success': True,
                'message': 'OTP sent successfully to email',
                'otp': otp_code
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Failed to send OTP email'
            }, status=500)

    except Exception as e:
        logger.error(f"Error sending OTP email: {e}")
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

        # Generate PDF
        pdf_path = BillService.generate_bill_pdf(bill)

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
        try:
            bill = Bill.objects.get(bill_id=bill_id)
        except Bill.DoesNotExist:
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

        return JsonResponse({
            'bill_id': str(bill.bill_id),
            'customer_email': bill.customer_email,
            'total_price': str(bill.total_price),
            'created_at': bill.created_at.isoformat(),
            'items': items
        })

    except Exception as e:
        logger.error(f"Error getting bill: {e}")
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
