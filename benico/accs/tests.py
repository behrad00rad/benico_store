from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from product.models import item
from .models import order, userinfo

class StoreFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser('manager', 'manager@example.com', 'test-password-123')
        self.product = item.objects.create(id=8101, title='Sample tee', category='t-shirt', price=290, L_count=3)
        self.delivery = dict(address='Test street', state='Test state', city='Test city', fname='Test', lname='Buyer', PostalCode='1234567890', phoneNumber='09123456789')

    def payload(self, quantities):
        return {**self.delivery, 'products': [[{'productId':8101, 'productQ':quantity, 'productS':'L'}] for quantity in quantities]}

    def test_admin_can_login_to_store_and_has_profile(self):
        response = self.client.post('/auth/loginn/', {'email':'manager', 'password':'test-password-123'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['redirect'], '/admin/')
        self.assertTrue(userinfo.objects.filter(user=self.user).exists())
        self.assertTrue(self.client.login(username='manager', password='test-password-123'))
        self.assertEqual(self.client.get('/django-admin/product/item/add/').status_code, 200)
        self.assertEqual(self.client.get('/django-admin/accs/order/').status_code, 200)

    def test_unconfigured_reset_does_not_change_password(self):
        response = self.client.post('/auth/reset-password/', {'email':'manager@example.com'}, format='json')
        self.assertEqual(response.status_code, 503)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('test-password-123'))

    def test_overselling_rolls_back_duplicate_lines(self):
        response = self.client.post('/auth/submit_order/', self.payload([2,2]), format='json')
        self.assertEqual(response.status_code, 409)
        self.product.refresh_from_db()
        self.assertEqual(self.product.L_count, 3)
        self.assertEqual(order.objects.count(), 0)

    def test_negative_and_fractional_quantities_rejected(self):
        for quantity in [-1, 0, 1.5, True]:
            response = self.client.post('/auth/submit_order/', self.payload([quantity]), format='json')
            self.assertEqual(response.status_code, 400)
        self.assertEqual(order.objects.count(), 0)

    def test_valid_order_is_unpaid_and_visible_only_to_owner(self):
        token = Token.objects.create(user=self.user)
        userinfo.objects.create(user=self.user, token=token.key)
        response = self.client.post('/auth/submit_order/', {**self.payload([2]), 'token':token.key}, format='json')
        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.L_count, 1)
        response = self.client.post('/auth/get_order/', {'token':token.key}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['orders'][0]['paid'])
        self.assertEqual(response.data['orders'][0]['products'], ['Sample tee x 2 (L)'])
        self.assertEqual(response.data['orders'][0]['price'], 580)
        self.assertEqual(self.client.post('/auth/get_order/', {'token':'invalid'}, format='json').status_code, 401)

class ManagementApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user('staff', password='test-password-123', is_staff=True)
        self.customer = User.objects.create_user('customer', password='test-password-123')
        self.staff_token = Token.objects.create(user=self.staff)
        self.customer_token = Token.objects.create(user=self.customer)
        self.product = item.objects.create(id=8101, title='Test piece', category='t-shirt', price=290, L_count=3)

    def authorize(self, token):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

    def test_staff_access_is_required_for_every_endpoint(self):
        paths = [('/auth/manage/overview/', 'get'), ('/auth/manage/products/', 'post'), ('/auth/manage/products/8101/', 'patch'), ('/auth/manage/products/8101/images/', 'post')]
        for token, expected in [(None, 401), (self.customer_token, 403)]:
            self.client.credentials()
            if token:
                self.authorize(token)
            for path, method in paths:
                self.assertEqual(getattr(self.client, method)(path).status_code, expected)

    def test_staff_can_create_update_and_view_products(self):
        self.authorize(self.staff_token)
        values = dict(title='New piece', category='hoodie', price=590, L_count=4, XL_count=2, XXL_count=1, description='Description', materials_care='Care instructions')
        response = self.client.post('/auth/manage/products/', values, format='json')
        self.assertEqual(response.status_code, 201)
        identifier = response.data['product']['id']
        response = self.client.patch(f'/auth/manage/products/{identifier}/', {'L_count':9}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['product']['L_count'], 9)
        self.assertEqual(response.data['product']['description'], 'Description')
        self.assertEqual(response.data['product']['materials_care'], 'Care instructions')
        response = self.client.get('/auth/manage/overview/')
        self.assertEqual(len(response.data['products']), 2)
        self.assertEqual(response.data['user']['username'], 'staff')

    def test_invalid_stock_price_and_category_rejected(self):
        self.authorize(self.staff_token)
        for values in [{'L_count':-1}, {'price':1.5}, {'category':'invalid'}]:
            self.assertEqual(self.client.patch('/auth/manage/products/8101/', values, format='json').status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.L_count, 3)

    def test_image_upload_validates_and_associates_product(self):
        import base64, tempfile
        from django.core.files.uploadedfile import SimpleUploadedFile
        from django.test import override_settings
        from django.conf import settings
        self.authorize(self.staff_token)
        with tempfile.TemporaryDirectory(dir=settings.BASE_DIR, prefix='test-media-') as media, override_settings(MEDIA_ROOT=media):
            valid = SimpleUploadedFile('tiny.gif', base64.b64decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), content_type='image/gif')
            response = self.client.post('/auth/manage/products/8101/images/', {'image':valid}, format='multipart')
            self.assertEqual(response.status_code, 201)
            self.assertEqual(len(response.data['product']['images']), 1)
            invalid = SimpleUploadedFile('bad.jpg', b'not an image', content_type='image/jpeg')
            self.assertEqual(self.client.post('/auth/manage/products/8101/images/', {'image':invalid}, format='multipart').status_code, 400)

    def test_regular_login_redirects_to_customer_dashboard(self):
        response = self.client.post('/auth/loginn/', {'email':'customer','password':'test-password-123'}, format='json')
        self.assertEqual(response.data['redirect'], '/dashboard/detail/')
        self.assertFalse(response.data['user']['is_staff'])
