from rest_framework import serializers
from .models import Bill, BillItem, OTP


class BillItemSerializer(serializers.ModelSerializer):
    """Serializer for BillItem model"""
    total = serializers.SerializerMethodField()

    class Meta:
        model = BillItem
        fields = ['id', 'name', 'price', 'quantity', 'total']
        read_only_fields = ['id']

    def get_total(self, obj):
        """Calculate total price for the item"""
        return float(obj.price * obj.quantity)


class BillSerializer(serializers.ModelSerializer):
    """Serializer for Bill model"""
    items = BillItemSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = ['bill_id', 'customer_email', 'items',
                  'total_price', 'created_at', 'pdf_path']
        read_only_fields = ['bill_id', 'created_at']


class BillCreateSerializer(serializers.Serializer):
    """Serializer for creating a new bill"""
    customer_email = serializers.EmailField(required=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        required=True,
        allow_empty=False
    )

    def validate_items(self, value):
        """Validate items list"""
        if not value:
            raise serializers.ValidationError("At least one item is required")

        for item in value:
            if 'name' not in item or 'price' not in item:
                raise serializers.ValidationError(
                    "Each item must have 'name' and 'price'")

            try:
                float(item['price'])
            except (ValueError, TypeError):
                raise serializers.ValidationError(
                    "Item price must be a valid number")

            if 'quantity' in item:
                try:
                    quantity = int(item['quantity'])
                    if quantity < 1:
                        raise serializers.ValidationError(
                            "Item quantity must be at least 1")
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        "Item quantity must be a valid integer")

        return value


class OTPSerializer(serializers.ModelSerializer):
    """Serializer for OTP model"""
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = OTP
        fields = ['id', 'email', 'otp_code', 'created_at',
                  'expires_at', 'is_used', 'is_valid']
        read_only_fields = ['id', 'created_at']

    def get_is_valid(self, obj):
        """Check if OTP is still valid"""
        return obj.is_valid()


class OTPGenerateSerializer(serializers.Serializer):
    """Serializer for generating OTP"""
    email = serializers.EmailField(required=True)


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6, min_length=6)


class SendEmailSerializer(serializers.Serializer):
    """Serializer for sending email"""
    email = serializers.EmailField(required=True)


class SendBillEmailSerializer(serializers.Serializer):
    """Serializer for sending bill email"""
    email = serializers.EmailField(required=True)
    bill_id = serializers.UUIDField(required=True)


class BillNotificationSerializer(serializers.Serializer):
    """Serializer for bill notification with OTP"""
    email = serializers.EmailField(required=False)
    customer_email = serializers.EmailField(required=False)
    amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False)
    total_amount = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False)
    items = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        allow_empty=True
    )

    def validate(self, data):
        """Validate that at least one email field is provided"""
        if not data.get('email') and not data.get('customer_email'):
            raise serializers.ValidationError(
                "Either 'email' or 'customer_email' is required")
        return data
