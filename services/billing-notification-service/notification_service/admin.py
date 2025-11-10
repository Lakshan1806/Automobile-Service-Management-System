from django.contrib import admin
from .models import Bill, BillItem, OTP


@admin.register(BillItem)
class BillItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity', 'get_total')
    search_fields = ('name',)
    list_filter = ('price',)

    def get_total(self, obj):
        """Display total price for the item"""
        return f"{obj.price * obj.quantity:.2f}"
    get_total.short_description = 'Total'


class BillItemInline(admin.TabularInline):
    model = Bill.items.through
    extra = 1


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('bill_id', 'customer_email',
                    'total_price', 'created_at', 'has_pdf')
    search_fields = ('bill_id', 'customer_email')
    readonly_fields = ('bill_id', 'created_at')
    inlines = [BillItemInline]
    exclude = ('items',)
    list_filter = ('created_at',)
    date_hierarchy = 'created_at'

    def has_pdf(self, obj):
        """Check if bill has PDF generated"""
        return bool(obj.pdf_path)
    has_pdf.boolean = True
    has_pdf.short_description = 'PDF'


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp_code', 'created_at',
                    'is_used', 'expires_at', 'is_valid_display')
    search_fields = ('email', 'otp_code')
    readonly_fields = ('created_at',)
    list_filter = ('is_used', 'created_at')
    date_hierarchy = 'created_at'

    def is_valid_display(self, obj):
        """Display if OTP is currently valid"""
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Valid'
