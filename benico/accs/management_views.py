"""Staff-only API for the Benico management application."""
from django import forms
from django.db import transaction
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from product.models import item, CATEGORY_CHOICES
from image.models import prod_image
from .models import order
import secrets

def serialize_product(product):
    return dict(id=product.id, title=product.title, description=product.description, materials_care=product.materials_care, size_guide=product.size_guide, category=product.category, price=product.price or 0,
        L_count=product.L_count or 0, XL_count=product.XL_count or 0, XXL_count=product.XXL_count or 0,
        images=[str(image.urlpid) for image in product.prod_image_set.all()])

def serialize_order(record):
    return dict(id=record.order_id, date=record.date, paid=record.paid, price=record.price,
        customer=record.user.username if record.user else 'Guest', fname=record.Fname, lname=record.Lname,
        address=record.address, city=record.city, state=record.state, phone=record.Phone_number,
        postal_code=record.PostalCode,
        products=[dict(id=line.product_id, title=line.product.title, quantity=line.Q, size=line.size) for line in record.products.all()])

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def overview(request):
    products = item.objects.prefetch_related('prod_image_set').order_by('-date')
    orders = order.objects.select_related('user').prefetch_related('products__product').order_by('-date')
    return Response({'user': {'username': request.user.username, 'is_staff': True},
        'products': [serialize_product(product) for product in products],
        'orders': [serialize_order(record) for record in orders]})

@api_view(['POST', 'PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def save_product(request, product_id=None):
    if request.method == 'DELETE':
        product = get_object_or_404(item, pk=product_id)
        if product.orderp_set.exists():
            return Response({'error': 'This product is part of an order and cannot be deleted. Set its stock to zero instead.'}, status=409)
        try:
            with transaction.atomic():
                product.delete()
        except IntegrityError:
            return Response({'error': 'This product is referenced by an order and cannot be deleted.'}, status=409)
        return Response({'deleted': product_id})
    if request.method == 'PATCH' and product_id is None:
        return Response({'error': 'Product ID is required'}, status=400)
    if request.method == 'POST' and product_id is not None:
        return Response({'error': 'Use PATCH to edit a product'}, status=405)
    product = get_object_or_404(item, pk=product_id) if product_id is not None else None
    values = {}
    errors = {}
    for field in ('title', 'category', 'price', 'L_count', 'XL_count', 'XXL_count'):
        value = request.data.get(field, getattr(product, field, None))
        if field == 'title':
            if not isinstance(value, str) or not value.strip() or len(value.strip()) > 255:
                errors[field] = 'Enter a title of 1–255 characters.'
            else:
                values[field] = value.strip()
        elif field == 'category':
            if value not in dict(CATEGORY_CHOICES):
                errors[field] = 'Choose a valid category.'
            else:
                values[field] = value
        else:
            if isinstance(value, bool) or not isinstance(value, int) or value < 0 or value > 2147483647:
                errors[field] = 'Enter a nonnegative whole number.'
            else:
                values[field] = value
    if errors:
        return Response({'error': 'Check the highlighted fields.', 'fields': errors}, status=400)
    for field in ('description', 'materials_care', 'size_guide'):
        value = request.data.get(field, getattr(product, field, ''))
        if not isinstance(value, str) or len(value) > 8000:
            return Response({'error': 'Keep product details within 8,000 characters.', 'fields': {field: 'Text must be within 8,000 characters.'}}, status=400)
        values[field] = value.strip()
    with transaction.atomic():
        if product is None:
            identifier = secrets.randbelow(900000) + 10000
            while item.objects.filter(pk=identifier).exists():
                identifier = secrets.randbelow(900000) + 10000
            product = item.objects.create(id=identifier, date=timezone.now(), **values)
        else:
            item.objects.filter(pk=product.pk).update(**values)
            product.refresh_from_db()
    return Response({'product': serialize_product(product)}, status=201 if request.method == 'POST' else 200)

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def upload_image(request, product_id):
    product = get_object_or_404(item, pk=product_id)
    uploaded = request.FILES.get('image')
    if uploaded is None or uploaded.size > 10 * 1024 * 1024:
        return Response({'error': 'Choose an image smaller than 10 MB.'}, status=400)
    try:
        checked = forms.ImageField().clean(uploaded)
    except forms.ValidationError:
        return Response({'error': 'Upload a valid image file.'}, status=400)
    image = prod_image.objects.create(prod=product, img=checked)
    return Response({'image': str(image.urlpid), 'product': serialize_product(product)}, status=201)

@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def delete_image(request, product_id, image_id):
    product = get_object_or_404(item, pk=product_id)
    image = get_object_or_404(prod_image, prod=product, urlpid=image_id)
    image.delete()
    return Response({'product': serialize_product(product)})
