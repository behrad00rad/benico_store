from django.test import TestCase

from .models import item


class CatalogAvailabilityTests(TestCase):
    def test_negative_inventory_is_unavailable(self):
        item.objects.create(id=9001, title='Unavailable', category='t-shirt',
                            L_count=0, XL_count=-12, XXL_count=-4, price=25)
        response = self.client.get('/product/all/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['data'][0]['out'])

    def test_any_positive_size_is_available(self):
        item.objects.create(id=9002, title='Available', category='t-shirt',
                            L_count=1, XL_count=-12, XXL_count=0, price=25)
        response = self.client.get('/product/all/')
        self.assertFalse(response.json()['data'][0]['out'])
