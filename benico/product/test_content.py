import copy
import io
import tempfile
import importlib
from pathlib import Path
from PIL import Image
from django.conf import settings
from django.apps import apps
from django.db import connection
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .content_views import DEFAULT_CONTENT
from .models import StoreContent


class ContentManagementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = Token.objects.create(user=User.objects.create_user('editor',is_staff=True))
        self.customer = Token.objects.create(user=User.objects.create_user('customer'))

    def authorize(self,token):
        self.client.credentials(HTTP_AUTHORIZATION='Token '+token.key)

    def test_copy_refresh_preserves_custom_content_and_runs_once(self):
        migration = importlib.import_module('product.migrations.0013_refresh_persian_store_copy')
        content = copy.deepcopy(DEFAULT_CONTENT)
        content['story']['title_fa'] = 'شخصیت شما، امضای شما.'
        content['hero']['title_fa'] = 'مجموعه اختصاصی'
        record = StoreContent.objects.create(content=content, revision=3)
        editor = connection.schema_editor(atomic=False)
        migration.refresh_copy(apps, editor)
        migration.refresh_copy(apps, editor)
        record.refresh_from_db()
        self.assertEqual(record.content['hero']['title_fa'], 'مجموعه اختصاصی')
        self.assertEqual(record.content['story']['title_fa'], DEFAULT_CONTENT['story']['title_fa'])
        self.assertEqual(record.revision, 4)

    def test_defaults_are_public_and_writes_require_staff(self):
        self.assertEqual(self.client.get('/product/content/').data['content'],DEFAULT_CONTENT)
        for path,method in [('/auth/manage/content/','get'),('/auth/manage/content/','put'),('/auth/manage/content/images/','post')]:
            self.assertEqual(getattr(self.client,method)(path).status_code,401)
            self.authorize(self.customer)
            self.assertEqual(getattr(self.client,method)(path).status_code,403)
            self.client.credentials()

    def test_bilingual_changes_persist_and_stale_revision_is_rejected(self):
        self.authorize(self.staff)
        content=copy.deepcopy(DEFAULT_CONTENT)
        content['hero'].update(title_en='New collection',title_fa='مجموعه جدید')
        payload={'content':content,'revision':0}
        response=self.client.put('/auth/manage/content/',payload,format='json')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.data['revision'],1)
        self.assertEqual(self.client.get('/product/content/').data['content']['hero']['title_fa'],'مجموعه جدید')
        self.assertEqual(self.client.put('/auth/manage/content/',payload,format='json').status_code,409)

    def test_unsafe_links_and_invalid_images_are_rejected_without_changes(self):
        self.authorize(self.staff)
        for value in ['javascript:alert(1)','//example.com','/../private','https://example.com']:
            content=copy.deepcopy(DEFAULT_CONTENT);content['hero']['link']=value
            self.assertEqual(self.client.put('/auth/manage/content/',{'content':content,'revision':0},format='json').status_code,400)
        content=copy.deepcopy(DEFAULT_CONTENT);content['hero']['image']='/product/content/image/'+'-'*36+'/'
        self.assertEqual(self.client.put('/auth/manage/content/',{'content':content,'revision':0},format='json').status_code,400)
        self.assertFalse(StoreContent.objects.exists())

    def test_uploaded_image_can_be_saved_and_served(self):
        self.authorize(self.staff)
        with tempfile.TemporaryDirectory(dir=settings.BASE_DIR,prefix='test-content-') as media:
            with override_settings(MEDIA_ROOT=media):
                stream=io.BytesIO();Image.new('RGB',(5,5),'white').save(stream,format='PNG')
                response=self.client.post('/auth/manage/content/images/',{'image':SimpleUploadedFile('hero.png',stream.getvalue(),content_type='image/png')},format='multipart')
                self.assertEqual(response.status_code,201)
                url=response.data['url'];content=copy.deepcopy(DEFAULT_CONTENT);content['hero']['image']=url
                self.assertEqual(self.client.put('/auth/manage/content/',{'content':content,'revision':0},format='json').status_code,200)
                served=self.client.get(url);self.assertEqual(served.status_code,200);served.close()
                self.assertEqual(self.client.post('/auth/manage/content/images/',{'image':SimpleUploadedFile('bad.png',b'not an image')},format='multipart').status_code,400)
