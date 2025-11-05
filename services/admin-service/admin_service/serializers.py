from rest_framework import serializers
from .models import Branch, Employee, Service, Product

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"
        read_only_fields = ("invite_token", "is_activated")

class BranchSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.name', read_only=True)
    manager_email = serializers.CharField(source='manager.email', read_only=True)

    class Meta:
        model = Branch
        fields = ['branch_id', 'name', 'location', 'manager', 'manager_name', 'manager_email']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['product_id', 'name', 'description', 'price', 'stock', 'image', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
