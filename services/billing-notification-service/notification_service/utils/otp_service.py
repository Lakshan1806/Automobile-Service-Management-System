import random
import string
import datetime
from django.utils import timezone
from ..models import OTP


class OTPService:
    @staticmethod
    def generate_otp(email, expiry_minutes=10):
        """
        Generate a 6-digit OTP for the given email address

        Args:
            email (str): Email address to generate OTP for
            expiry_minutes (int): Minutes until OTP expires

        Returns:
            str: Generated OTP code
        """
        # Generate a random 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))

        # Calculate expiry time
        expires_at = timezone.now() + datetime.timedelta(minutes=expiry_minutes)

        # Invalidate any existing OTPs for this email
        OTP.objects.filter(email=email, is_used=False).update(is_used=True)

        # Create new OTP
        otp = OTP.objects.create(
            email=email,
            otp_code=otp_code,
            expires_at=expires_at
        )

        return otp_code

    @staticmethod
    def validate_otp(email, otp_code):
        """
        Validate if the provided OTP is correct and not expired

        Args:
            email (str): Email address associated with OTP
            otp_code (str): OTP code to validate

        Returns:
            bool: True if OTP is valid, False otherwise
        """
        try:
            otp = OTP.objects.filter(
                email=email,
                otp_code=otp_code,
                is_used=False
            ).latest('created_at')

            # Check if OTP is valid
            if otp and otp.is_valid():
                otp.is_used = True
                otp.save()
                return True

        except OTP.DoesNotExist:
            pass

        return False
