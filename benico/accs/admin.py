from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(userinfo)
admin.site.register(addresses)
@admin.register(order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'date', 'user', 'price', 'paid', 'line_count')
    list_filter = ('paid', 'date')
    search_fields = ('=order_id', 'user__username', 'Fname', 'Lname')
    ordering = ('-date',)
    readonly_fields = ('order_id', 'date', 'products', 'price', 'user')
    filter_horizontal = ('products',)

    @admin.display(description='Order lines')
    def line_count(self, obj):
        return obj.products.count()

    def has_add_permission(self, request):
        return False

@admin.register(OrderP)
class OrderLineAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'product', 'size', 'Q')
    search_fields = ('=order_id', 'product__title')
    readonly_fields = ('order_id', 'product', 'size', 'Q')

    def has_add_permission(self, request):
        return False
