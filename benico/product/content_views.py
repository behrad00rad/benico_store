"""Bilingual storefront content, with staff-only editing and validated images."""
import copy
import re
import uuid
from django import forms
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from .models import StoreContent, ContentImage

DEFAULT_CONTENT = {
    'hero': {'eyebrow': 'THE BENICO EDIT', 'title_fa': 'روزمره را به سبک خودت بپوش', 'title_en': 'Beyond the everyday',
             'button_fa': 'دیدن مجموعه', 'button_en': 'Explore the collection', 'link': '/products/t-shirt/1/',
             'image': '', 'alt_fa': 'استایل بنیکو روی صندلی کرومی در استودیوی خاکستری', 'alt_en': 'Benico floating outfit on a chrome chair in a gray studio', 'position': 'center'},
    'intro': {'title_fa': 'ساده بپوش. خودت باش.', 'title_en': 'Wear your own perspective',
              'text_fa': 'تی‌شرت، هودی و دورس؛ برای ترکیب‌های ساده و روزهایی که می‌خواهی خودت باشی. از مجموعه‌های بنیکو، چیزی را انتخاب کن که به سلیقه‌ات نزدیک است.', 'text_en': 'Individual expression, everyday essentials. Discover Benico.'},
    'editorial_one': {'eyebrow': 'THE INFINITE EDIT', 'title_fa': 'تی‌شرت‌های بنیکو', 'title_en': 'The T-shirt edit',
                      'button_fa': 'مشاهده مجموعه', 'button_en': 'Discover the collection', 'link': '/products/t-shirt/1/', 'image': '',
                      'alt_fa': 'تی‌شرت Infinite بنیکو', 'alt_en': 'Benico Infinite T-shirt', 'enabled': True},
    'editorial_two': {'eyebrow': 'IN THE DETAILS', 'title_fa': 'جزئیات، از نزدیک', 'title_en': 'A closer look',
                      'button_fa': 'دیدن محصول', 'button_en': 'Explore the piece', 'link': '/item/7000/', 'image': '',
                      'alt_fa': 'نمای نزدیک طرح سیاره و بافت پارچه', 'alt_en': 'Close-up of the Saturn print and cotton texture', 'enabled': True},
    'story': {'eyebrow': 'THE WORLD OF BENICO', 'title_fa': 'سلیقهٔ تو، امضای استایل تو.', 'title_en': 'Your personality. Your signature.',
              'button_fa': 'گفت‌وگو با بنیکو', 'button_en': 'Meet Benico', 'link': '/contact-us/', 'enabled': True},
}

def content_payload(record=None):
    record = record or StoreContent.objects.filter(pk=1).first()
    content = copy.deepcopy(DEFAULT_CONTENT)
    if record:
        for section, values in record.content.items():
            if section in content:
                content[section].update(values)
    return {'content': content, 'revision': record.revision if record else 0}

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def public_content(request):
    return Response(content_payload())

@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def manage_content(request):
    if request.method == 'GET':
        return Response(content_payload())
    value = request.data.get('content')
    revision = request.data.get('revision')
    if not isinstance(value, dict) or set(value) != set(DEFAULT_CONTENT) or type(revision) is not int:
        return Response({'error': 'Invalid content or revision.'}, status=400)
    errors = {}
    for section, defaults in DEFAULT_CONTENT.items():
        fields = value.get(section)
        if not isinstance(fields, dict) or set(fields) != set(defaults):
            errors[section] = 'Include all content fields.'
            continue
        for key, default in defaults.items():
            text = fields[key]
            invalid = type(text) is not bool if type(default) is bool else not isinstance(text, str) or len(text) > 2000
            if not invalid and key == 'link':
                invalid = not re.fullmatch(r'/(?:products(?:/(?:t-shirt|hoodie|sweatshirt|accessory)(?:/[1-9][0-9]*)?)?|item/[0-9]+|contact-us)/?', text)
            if not invalid and key == 'position':
                invalid = text not in ('top', 'center', 'bottom')
            if not invalid and key == 'image' and text:
                match = re.fullmatch(r'/product/content/image/([0-9a-f-]{36})/', text)
                try:
                    identifier = uuid.UUID(match.group(1)) if match else None
                    invalid = identifier is None or not ContentImage.objects.filter(pk=identifier).exists()
                except ValueError:
                    invalid = True
            if invalid:
                errors[f'{section}.{key}'] = 'Enter a valid value (text up to 2,000 characters; links must lead to a store page).'
    if errors:
        return Response({'error': 'Check the content fields.', 'fields': errors}, status=400)
    with transaction.atomic():
        record, _ = StoreContent.objects.get_or_create(pk=1)
        updated = StoreContent.objects.filter(pk=1, revision=revision).update(content=value, revision=revision + 1, updated_at=timezone.now())
        if not updated:
            return Response({'error': 'Content was changed elsewhere. Reload the saved version before saving.'}, status=409)
        record.refresh_from_db()
    return Response(content_payload(record))

@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def upload_content_image(request):
    uploaded = request.FILES.get('image')
    if uploaded is None or uploaded.size > 10 * 1024 * 1024:
        return Response({'error': 'Choose an image smaller than 10 MB.'}, status=400)
    try:
        checked = forms.ImageField().clean(uploaded)
    except forms.ValidationError:
        return Response({'error': 'Upload a valid image.'}, status=400)
    image = ContentImage.objects.create(image=checked)
    return Response({'url': f'/product/content/image/{image.pk}/'}, status=201)

def content_image(request, image_id):
    image = get_object_or_404(ContentImage, pk=image_id)
    try:
        response = FileResponse(image.image.open('rb'))
    except FileNotFoundError:
        from django.http import Http404
        raise Http404
    response['X-Content-Type-Options'] = 'nosniff'
    return response
