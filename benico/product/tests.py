from django.test import TestCase

from .models import item


class CatalogAvailabilityTests(TestCase):
    def test_details_and_missing_product(self):
        item.objects.create(id=9003, title='Detailed piece', category='hoodie', price=25,
                            description='Product description', materials_care='Read the label')
        data = self.client.get('/product/filtered/9003/').json()['data'][0]
        self.assertEqual(data['description'], 'Product description')
        self.assertEqual(data['materials_care'], 'Read the label')
        self.assertEqual(self.client.get('/product/filtered/999999/').status_code, 404)

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
