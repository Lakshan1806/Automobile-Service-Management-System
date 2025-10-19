from django.contrib import admin
from .models import Bill, BillItem, OTP


@admin.register(BillItem)
class BillItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity')
    search_fields = ('name',)


class BillItemInline(admin.TabularInline):
    model = Bill.items.through
    extra = 1


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('bill_id', 'customer_email', 'total_price', 'created_at')
    search_fields = ('bill_id', 'customer_email')
    readonly_fields = ('bill_id', 'created_at')
    inlines = [BillItemInline]
    exclude = ('items',)


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp_code', 'created_at', 'is_used', 'expires_at')
    search_fields = ('email', 'otp_code')
    readonly_fields = ('created_at',)
    list_filter = ('is_used',)
