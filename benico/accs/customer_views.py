"""Authenticated customer account and address endpoints."""
import secrets
import re
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import addresses, order
from .management_views import serialize_order

def normalize_digits(value):
    return str(value).translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789'))

def delivery_values(data):
    values = {}
    errors = {}
    for field, limit in [('fname',255),('lname',255),('address',1024),('city',255),('state',255)]:
        value = data.get(field)
        if not isinstance(value, str) or not value.strip() or len(value.strip()) > limit:
            errors[field] = f'Enter text of 1–{limit} characters.'
        else:
            values[field] = value.strip()
    for field, count in [('PostalCode',10),('phoneNumber',11)]:
        value = normalize_digits(data.get(field, ''))
        if not re.fullmatch(r'[0-9]{%d}' % count, value):
            errors[field] = f'Enter {count} digits.'
        else:
            values[field] = value
    return values, errors

def serialize_address(record):
    return dict(id=record.id, fname=record.Fname, lname=record.Lname, address=record.address,
                state=record.state, city=record.city, phone_number=record.Phone_number,
                postal_code=str(record.PostalCode).zfill(10))

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    first = addresses.objects.filter(user=user).first()
    return Response({'username':user.username, 'email':user.email,
                     'fname':user.first_name or (first.Fname if first else ''),
                     'lname':user.last_name or (first.Lname if first else ''),
                     'phone':first.Phone_number if first else '', 'is_staff':user.is_staff})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def customer_orders(request):
    records = order.objects.filter(user=request.user).prefetch_related('products__product').order_by('-date')
    return Response({'orders':[serialize_order(record) for record in records]})

@api_view(['GET','POST','PATCH','DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def address_book(request, address_id=None):
    if address_id is None and request.method == 'GET':
        return Response({'addresses':[serialize_address(a) for a in addresses.objects.filter(user=request.user).order_by('id')]})
    if address_id is None and request.method != 'POST':
        return Response({'error':'Address ID is required.'},status=400)
    if address_id is not None and request.method == 'POST':
        return Response({'error':'Use PATCH to edit an address.'},status=405)
    record = get_object_or_404(addresses, user=request.user, pk=address_id) if address_id else None
    if request.method == 'GET':
        return Response({'address':serialize_address(record)})
    if request.method == 'DELETE':
        record.delete()
        return Response(status=204)
    values, errors = delivery_values(request.data)
    if errors:
        return Response({'error':'Check the delivery fields.', 'fields':errors},status=400)
    if record is None:
        identifier = secrets.randbelow(900000)+10000
        while addresses.objects.filter(pk=identifier).exists():
            identifier = secrets.randbelow(900000)+10000
        record = addresses(id=identifier,user=request.user)
    record.Fname,record.Lname = values['fname'], values['lname']
    record.address,record.state,record.city = values['address'],values['state'],values['city']
    record.Phone_number,record.PostalCode = values['phoneNumber'],values['PostalCode']
    record.save()
    return Response({'address':serialize_address(record)}, status=201 if request.method=='POST' else 200)
