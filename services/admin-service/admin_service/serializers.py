from rest_framework import serializers
from .models import Branch, Employee

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
