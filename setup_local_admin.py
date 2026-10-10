"""One-off local account and clearly labeled catalog samples."""
import os
import secrets
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'benico'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'benico.settings')
import django
django.setup()
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.core.files import File
from django.utils import timezone
from accs.models import userinfo
from product.models import item
from image.models import prod_image

username = 'benico_admin'
user = User.objects.filter(username=username).first()
if user is None:
    password = secrets.token_urlsafe(18)
    user = User.objects.create_superuser(username=username, email='admin@benico.local', password=password)
    (ROOT / 'LOCAL_ADMIN_ACCESS.txt').write_text(f'Local Benico admin\nURL: http://127.0.0.1:2000/admin/\nLogin: http://127.0.0.1:2000/accounts/\nUsername: {username}\nPassword: {password}\n\nProduct tools: /admin/?section=products\nOrders: /admin/?section=orders\nThis account belongs to the local database only.\n', encoding='utf-8')
token, _ = Token.objects.get_or_create(user=user)
userinfo.objects.get_or_create(user=user, defaults={'token': token.key})

samples = [
    (8101, '[SAMPLE] Washed X-Ray Hoodie', 'hoodie', 590, 'Washed_Streetwear_hoodie_Finger_X-Ray_Oversize_Unisex_Harajuku_Casual_Punk_Clothing.jpeg'),
    (8102, '[SAMPLE] Everyday Sweatshirt', 'sweatshirt', 450, 'Sweatshirt_mit_rundem_Kragen_Thermal_Futter.webp'),
    (8103, '[SAMPLE] Infinite Graphic Tee', 't-shirt', 290, 'infinite.jpg'),
]
for identifier, title, category, price, filename in samples:
    product, created = item.objects.get_or_create(id=identifier, defaults={'title': title, 'category': category, 'price': price, 'L_count': 5, 'XL_count': 5, 'XXL_count': 3, 'date': timezone.now()})
    if created:
        image = prod_image(prod=product)
        with (ROOT / 'benico' / filename).open('rb') as asset:
            image.img.save('sample_' + filename, File(asset), save=True)
print('Local admin ready. Credentials: LOCAL_ADMIN_ACCESS.txt. Sample IDs: 8101, 8102, 8103.')
