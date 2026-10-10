from django.contrib import admin
from .models import item
from image.models import prod_image
from django.utils.html import format_html
from django import forms
from django.utils import timezone
import random

class ProductForm(forms.ModelForm):
    class Meta:
        model = item
        fields = '__all__'

    def clean(self):
        cleaned = super().clean()
        for field in ('price', 'L_count', 'XL_count', 'XXL_count'):
            if (cleaned.get(field) or 0) < 0:
                self.add_error(field, 'Use zero or a positive number.')
        return cleaned

class ProductImageInline(admin.TabularInline):
    model = prod_image
    extra = 1
    fields = ('img', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.pk and obj.img:
            return format_html('<img src="/image/item/{}/" width="70" style="max-height:90px;object-fit:contain" />', obj.urlpid)
        return 'Save an image to preview it.'

@admin.register(item)
class ProductAdmin(admin.ModelAdmin):
    form = ProductForm
    list_display = ('id', 'title', 'category', 'price', 'L_count', 'XL_count', 'XXL_count', 'stock_status')
    list_filter = ('category',)
    search_fields = ('title', '=id')
    ordering = ('-date',)
    inlines = (ProductImageInline,)
    readonly_fields = ('date',)
    def get_changeform_initial_data(self, request):
        identifier = random.randint(1000, 9999)
        while item.objects.filter(pk=identifier).exists():
            identifier = random.randint(1000, 9999)
        return {'id': identifier}

    def save_model(self, request, obj, form, change):
        if not change:
            obj.date = timezone.now()
        super().save_model(request, obj, form, change)
    fieldsets = (
        ('Product', {'fields': ('id', 'title', 'category', 'date')}),
        ('Price and stock', {'fields': ('price', 'L_count', 'XL_count', 'XXL_count'), 'description': 'Price is stored in thousands of toman: 590 means 590,000 toman. Sample products are labeled [SAMPLE].'}),
    )

    @admin.display(description='Availability')
    def stock_status(self, obj):
        counts = (obj.L_count or 0, obj.XL_count or 0, obj.XXL_count or 0)
        if any(count < 0 for count in counts):
            return 'Needs stock correction'
        return 'In stock' if any(count > 0 for count in counts) else 'Sold out'

admin.site.site_header = 'Benico management'
admin.site.site_title = 'Benico admin'
admin.site.index_title = 'Products, customers and orders'
