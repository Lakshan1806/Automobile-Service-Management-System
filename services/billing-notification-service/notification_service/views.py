from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
import random
import logging

from .models import Bill, BillItem, OTP
from .serializers import (
    BillCreateSerializer,
    OTPGenerateSerializer,
    OTPVerifySerializer,
    SendEmailSerializer,
    SendBillEmailSerializer,
    BillNotificationSerializer,
    SendNotificationSerializer  # New unified serializer
)
from .utils import OTPService, BillService, EmailService

logger = logging.getLogger(__name__)


class GenerateOTPView(APIView):
    """API view to generate OTP for email address"""

    def post(self, request):
        serializer = OTPGenerateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            logger.info(f"[GENERATE] Generating OTP for email: {email}")
            otp_code = OTPService.generate_otp(email)
            logger.info(f"[GENERATE] Successfully generated OTP: {otp_code}")

            return Response({
                'success': True,
                'message': 'OTP generated successfully',
                'otp': otp_code if __debug__ else None
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"[GENERATE] Error generating OTP: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPView(APIView):
    """API view to verify OTP for email address"""

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']

        try:
            logger.info(
                f"[VERIFY] Verifying OTP: {otp_code} for email: {email}")

            if OTPService.validate_otp(email, otp_code):
                logger.info(f"[VERIFY] OTP validated successfully")
                return Response({
                    'success': True,
                    'message': 'OTP verified successfully'
                }, status=status.HTTP_200_OK)
            else:
                logger.info(f"[VERIFY] OTP validation failed")
                return Response({
                    'success': False,
                    'message': 'Invalid or expired OTP'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"[VERIFY] Error verifying OTP: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendOTPEmailView(APIView):
    """API view to send OTP to email address"""

    def post(self, request):
        serializer = SendEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            logger.info(f"[SEND-EMAIL] Searching for OTP for email: {email}")

            try:
                now = timezone.now()
                logger.info(
                    f"[SEND-EMAIL] Current time (timezone-aware): {now}")

                otp = OTP.objects.filter(
                    email=email,
                    is_used=False,
                    expires_at__gt=now
                ).order_by('-created_at').first()

                if otp:
                    logger.info(
                        f"[SEND-EMAIL] Found valid OTP: {otp.otp_code}")
                    otp_code = otp.otp_code
                else:
                    logger.info(
                        f"[SEND-EMAIL] No valid OTP found, getting most recent OTP")
                    otp = OTP.objects.filter(email=email).order_by(
                        '-created_at').first()

                    if otp:
                        logger.info(
                            f"[SEND-EMAIL] Using most recent OTP: {otp.otp_code}, expires: {otp.expires_at}")
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
                        logger.info(
                            f"[SEND-EMAIL] Generated new OTP: {otp_code}")

            except Exception as e:
                logger.error(f"[SEND-EMAIL] Error retrieving OTP: {e}")
                otp_code = OTPService.generate_otp(email)
                logger.info(f"[SEND-EMAIL] Generated fallback OTP: {otp_code}")

            logger.info(
                f"[SEND-EMAIL] Attempting to send OTP: {otp_code} to {email}")
            success = EmailService.send_otp_email(email, otp_code)

            if success:
                logger.info(
                    f"[SEND-EMAIL] Email sent successfully with OTP: {otp_code}")
                return Response({
                    'success': True,
                    'message': 'OTP sent successfully to email',
                    'otp': otp_code
                }, status=status.HTTP_200_OK)
            else:
                logger.error(
                    f"[SEND-EMAIL] Failed to send email with OTP: {otp_code}")
                return Response({
                    'success': False,
                    'message': 'Failed to send OTP email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"[SEND-EMAIL] Error in send_otp_email: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateBillView(APIView):
    """API view to generate bill from service_id and product_ids"""

    def post(self, request):
        serializer = BillCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        service_id = serializer.validated_data['service_id']
        customer_email = serializer.validated_data['customer_email']
        products = serializer.validated_data['products']

        try:
            # Import admin_service models
            from admin_service.models import Service, Part

            # Get service details
            try:
                service = Service.objects.get(id=service_id)
                logger.info(
                    f"[GENERATE-BILL] Found service: {service.service_number}")
            except Service.DoesNotExist:
                logger.error(
                    f"[GENERATE-BILL] Service not found: {service_id}")
                return Response({
                    'error': 'Service not found',
                    'service_id': str(service_id)
                }, status=status.HTTP_404_NOT_FOUND)

            # Calculate bill
            bill_items_data = []
            total_amount = 0

            # Add service cost
            service_cost = float(
                service.estimated_cost) if service.estimated_cost else 0
            if service_cost > 0:
                bill_items_data.append({
                    'name': f'Service: {service.title}',
                    'price': service_cost,
                    'quantity': 1
                })
                total_amount += service_cost
                logger.info(f"[GENERATE-BILL] Service cost: {service_cost}")

            # Add products/parts
            for product in products:
                product_id = product['product_id']
                quantity = int(product['quantity'])

                try:
                    part = Part.objects.get(id=product_id)
                    product_price = float(part.unit_price)
                    product_total = product_price * quantity

                    bill_items_data.append({
                        'name': f'{part.name} ({part.part_number})',
                        'price': product_price,
                        'quantity': quantity
                    })
                    total_amount += product_total
                    logger.info(
                        f"[GENERATE-BILL] Product: {part.name} x{quantity} = {product_total}")

                except Part.DoesNotExist:
                    logger.warning(
                        f"[GENERATE-BILL] Product not found: {product_id}")
                    return Response({
                        'error': 'Product not found',
                        'product_id': str(product_id)
                    }, status=status.HTTP_404_NOT_FOUND)

            # Create bill
            bill = Bill.objects.create(
                customer_email=customer_email,
                total_price=total_amount
            )

            # Create bill items
            for item_data in bill_items_data:
                bill_item = BillItem.objects.create(
                    name=item_data['name'],
                    price=item_data['price'],
                    quantity=item_data['quantity']
                )
                bill.items.add(bill_item)

            logger.info(
                f"[GENERATE-BILL] Bill created: {bill.bill_id}, Total: {total_amount}")

            return Response({
                'success': True,
                'message': 'Bill generated successfully',
                'bill_id': str(bill.bill_id),
                'service_number': service.service_number,
                'total_price': str(total_amount),
                'items': bill_items_data,
                'created_at': bill.created_at.isoformat()
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"[GENERATE-BILL] Error generating bill: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendBillEmailView(APIView):
    """API view to send bill to email address"""

    def post(self, request):
        serializer = SendBillEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        bill_id = serializer.validated_data['bill_id']
        email = serializer.validated_data.get('email')  # Optional

        try:
            try:
                bill = Bill.objects.get(bill_id=bill_id)
            except Bill.DoesNotExist:
                return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

            # Use provided email or bill's customer email
            recipient_email = email or bill.customer_email

            logger.info(
                f"[SEND-BILL] Sending bill {bill_id} to {recipient_email}")
            success = EmailService.send_bill_email(recipient_email, bill)

            if success:
                return Response({
                    'success': True,
                    'message': 'Bill sent successfully to email',
                    'bill_id': str(bill.bill_id),
                    'email': recipient_email
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send bill email'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error sending bill email: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetBillView(APIView):
    """API view to get bill details"""

    def get(self, request, bill_id):
        try:
            logger.info(f"[GET-BILL] Retrieving bill with ID: {bill_id}")

            try:
                bill = Bill.objects.get(bill_id=bill_id)
                logger.info(f"[GET-BILL] Found bill for {bill.customer_email}")
            except Bill.DoesNotExist:
                logger.error(f"[GET-BILL] Bill not found with ID: {bill_id}")
                return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

            items = []
            for item in bill.items.all():
                items.append({
                    'name': item.name,
                    'price': str(item.price),
                    'quantity': item.quantity,
                    'total': str(item.price * item.quantity)
                })

            success = EmailService.send_bill_email(bill.customer_email, bill)
            email_status = "Email sent successfully" if success else "Failed to send email"
            logger.info(f"[GET-BILL] {email_status} to {bill.customer_email}")

            return Response({
                'bill_id': str(bill.bill_id),
                'customer_email': bill.customer_email,
                'total_price': str(bill.total_price),
                'created_at': bill.created_at.isoformat(),
                'items': items,
                'email_sent': success,
                'email_status': email_status
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"[GET-BILL] Error getting bill: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAndSendBillView(APIView):
    """API view to get bill details and send to customer email"""

    def get(self, request, bill_id):
        return self._process_bill(bill_id)

    def post(self, request, bill_id):
        return self._process_bill(bill_id)

    def _process_bill(self, bill_id):
        try:
            logger.info(
                f"[GET-SEND-BILL] Retrieving and sending bill with ID: {bill_id}")

            try:
                bill = Bill.objects.get(bill_id=bill_id)
                logger.info(
                    f"[GET-SEND-BILL] Found bill for {bill.customer_email}")
            except Bill.DoesNotExist:
                logger.error(
                    f"[GET-SEND-BILL] Bill not found with ID: {bill_id}")
                return Response({'error': 'Bill not found'}, status=status.HTTP_404_NOT_FOUND)

            items = []
            for item in bill.items.all():
                items.append({
                    'name': item.name,
                    'price': str(item.price),
                    'quantity': item.quantity,
                    'total': str(item.price * item.quantity)
                })

            success = EmailService.send_bill_email(bill.customer_email, bill)
            email_status = "Email sent successfully" if success else "Failed to send email"
            logger.info(
                f"[GET-SEND-BILL] {email_status} to {bill.customer_email}")

            return Response({
                'success': success,
                'message': f"Bill details retrieved and {email_status.lower()}",
                'bill_id': str(bill.bill_id),
                'customer_email': bill.customer_email,
                'total_price': str(bill.total_price),
                'created_at': bill.created_at.isoformat(),
                'items': items
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"[GET-SEND-BILL] Error processing bill: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendBillNotificationView(APIView):
    """API view to send bill notification with OTP"""

    def post(self, request, bill_id):
        serializer = BillNotificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        customer_email = serializer.validated_data.get(
            'email') or serializer.validated_data.get('customer_email')
        bill_amount = serializer.validated_data.get(
            'amount') or serializer.validated_data.get('total_amount', 0)

        try:
            otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            logger.info(f"Generated OTP for bill {bill_id}: {otp}")

            items_summary = ""
            items = serializer.validated_data.get('items', [])
            if items:
                items_summary = "\nItemized Bill:\n"
                for item in items:
                    name = item.get('name', 'Item')
                    price = item.get('price', 0)
                    quantity = item.get('quantity', 1)
                    subtotal = item.get('subtotal', price * quantity)
                    items_summary += f"- {name}: {price} x {quantity} = {subtotal}\n"

            subject = 'Your Automobile Service Bill Payment OTP'
            message = f"""
Dear Customer,

Your bill amount is {bill_amount}.
{items_summary}
Use this OTP to confirm your payment: {otp}

This OTP is valid for 10 minutes.

Thank you for choosing our service!
            """

            email_sent = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [customer_email],
                fail_silently=False,
            )

            if email_sent:
                return Response({
                    'success': True,
                    'message': 'OTP sent successfully',
                    'otp': otp,
                    'email': customer_email
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error sending bill notification: {str(e)}")
            return Response({'error': f'Failed to send OTP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SendNotificationView(APIView):
    """
    Unified notification endpoint for sending emails with flexible content.

    POST /api/notification/send/
    Request body:
    {
        "to": "recipient@example.com",
        "subject": "Email Subject",
        "body": "Email content (text or HTML)",
        "is_html": false,  // Optional, default false
        "bill_id": "uuid-here",  // Optional, for invoice PDF
        "attach_invoice": true  // Optional, generates and attaches PDF if bill_id provided
    }
    """

    def post(self, request):
        """
        Send a notification email to specified recipient.
        This unified endpoint replaces multiple specialized notification endpoints.
        Supports optional PDF invoice attachment when bill_id and attach_invoice=true.
        """
        try:
            # Validate request data
            serializer = SendNotificationSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'error': 'Invalid request data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract validated data
            recipient = serializer.validated_data['to']
            subject = serializer.validated_data['subject']
            body = serializer.validated_data['body']
            is_html = serializer.validated_data.get('is_html', False)
            bill_id = serializer.validated_data.get('bill_id')
            attach_invoice = serializer.validated_data.get(
                'attach_invoice', False)

            # Send email using Django's send_mail
            from_email = settings.EMAIL_HOST_USER

            # Check if PDF invoice should be attached
            if attach_invoice and bill_id:
                try:
                    # Get the bill from database
                    bill = Bill.objects.prefetch_related(
                        'items').get(bill_id=bill_id)

                    # Generate PDF in memory
                    from .utils import BillService
                    pdf_buffer = BillService.generate_bill_pdf(bill)

                    # Send HTML email with PDF attachment
                    from django.core.mail import EmailMultiAlternatives
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=body,  # Plain text fallback
                        from_email=from_email,
                        to=[recipient]
                    )

                    if is_html:
                        email.attach_alternative(body, "text/html")

                    # Attach PDF
                    email.attach(
                        f'invoice_{bill_id}.pdf',
                        pdf_buffer.getvalue(),
                        'application/pdf'
                    )

                    email_sent = email.send()

                    if email_sent:
                        logger.info(
                            f"Email with PDF invoice sent successfully to {recipient}")
                        return Response({
                            'success': True,
                            'message': 'Email with invoice sent successfully',
                            'to': recipient,
                            'subject': subject,
                            'invoice_attached': True,
                            'bill_id': str(bill_id)
                        }, status=status.HTTP_200_OK)
                    else:
                        logger.error(
                            f"Failed to send email with invoice to {recipient}")
                        return Response({
                            'error': 'Failed to send email with invoice'
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                except Bill.DoesNotExist:
                    return Response({
                        'error': f'Bill with ID {bill_id} not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                except Exception as pdf_error:
                    logger.error(
                        f"Error generating or attaching PDF: {str(pdf_error)}")
                    return Response({
                        'error': 'Failed to generate or attach invoice PDF',
                        'details': str(pdf_error)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Regular email without PDF attachment
                if is_html:
                    # Send HTML email
                    from django.core.mail import EmailMultiAlternatives
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=body,  # Plain text fallback
                        from_email=from_email,
                        to=[recipient]
                    )
                    email.attach_alternative(body, "text/html")
                    email_sent = email.send()
                else:
                    # Send plain text email
                    email_sent = send_mail(
                        subject=subject,
                        message=body,
                        from_email=from_email,
                        recipient_list=[recipient],
                        fail_silently=False
                    )

                if email_sent:
                    logger.info(f"Email sent successfully to {recipient}")
                    return Response({
                        'success': True,
                        'message': 'Email sent successfully',
                        'to': recipient,
                        'subject': subject
                    }, status=status.HTTP_200_OK)
                else:
                    logger.error(f"Failed to send email to {recipient}")
                    return Response({
                        'error': 'Failed to send email'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return Response({
                'error': 'Failed to send notification',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
