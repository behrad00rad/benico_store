import uuid
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .models import addresses,userinfo,order
from product.models import item


class CustomerAccountTests(TestCase):
    def setUp(self):
        self.client=APIClient()
        self.user=User.objects.create_user('buyer',email='buyer@example.com')
        self.token=Token.objects.create(user=self.user)
        self.other=User.objects.create_user('other')
        self.delivery=dict(fname='Test',lname='Buyer',state='Test province',city='Test city',address='Test street',PostalCode='0123456789',phoneNumber='09123456789')
        self.client.credentials(HTTP_AUTHORIZATION='Token '+self.token.key)

    def test_address_validation_and_owner_scoping(self):
        invalid={**self.delivery,'PostalCode':'12'}
        self.assertEqual(self.client.post('/auth/customer/addresses/',invalid,format='json').status_code,400)
        response=self.client.post('/auth/customer/addresses/',self.delivery,format='json')
        self.assertEqual(response.status_code,201)
        identifier=response.data['address']['id']
        self.assertEqual(response.data['address']['postal_code'],'0123456789')
        self.assertEqual(self.client.patch(f'/auth/customer/addresses/{identifier}/',{**self.delivery,'city':'Updated'},format='json').status_code,200)
        self.assertEqual(self.client.get('/auth/customer/addresses/').data['addresses'][0]['city'],'Updated')
        other_token=Token.objects.create(user=self.other)
        self.client.credentials(HTTP_AUTHORIZATION='Token '+other_token.key)
        for method in ['get','patch','delete']:
            self.assertEqual(getattr(self.client,method)(f'/auth/customer/addresses/{identifier}/',self.delivery,format='json').status_code,404)
        self.assertEqual(self.client.get('/auth/customer/addresses/').data['addresses'],[])

    def test_deleting_address_preserves_profile_and_token(self):
        a=addresses.objects.create(id=99001,user=self.user,Fname='Test',Lname='Buyer',state='State',city='City',address='Street',Phone_number='09123456789',PostalCode=1234567890)
        profile=userinfo.objects.create(user=self.user,token=self.token.key,address=a)
        self.assertEqual(self.client.delete('/auth/customer/addresses/99001/').status_code,204)
        profile.refresh_from_db();self.assertIsNone(profile.address)
        self.assertEqual(self.client.get('/auth/customer/profile/').data['email'],'buyer@example.com')

    def test_customer_routes_require_login_and_orders_are_private(self):
        order.objects.create(order_id=887711,user=self.other,price=100)
        self.assertEqual(self.client.get('/auth/customer/orders/').data['orders'],[])
        self.client.credentials()
        for path in ['profile/','addresses/','orders/']:
            self.assertEqual(self.client.get('/auth/customer/'+path).status_code,401)

    def test_repeated_checkout_reserves_stock_only_once(self):
        userinfo.objects.create(user=self.user,token=self.token.key)
        product=item.objects.create(id=99881,title='Test product',category='hoodie',price=100,L_count=4)
        payload={**self.delivery,'token':self.token.key,'checkout_key':str(uuid.uuid4()),'products':[[{'productId':product.pk,'productQ':2,'productS':'L'}]]}
        first=self.client.post('/auth/submit_order/',payload,format='json')
        second=self.client.post('/auth/submit_order/',payload,format='json')
        self.assertEqual(first.status_code,201);self.assertEqual(second.status_code,201)
        self.assertEqual(first.data['order_id'],second.data['order_id'])
        product.refresh_from_db();self.assertEqual(product.L_count,2)
        self.assertEqual(order.objects.count(),1)
        changed={**payload,'products':[[{'productId':product.pk,'productQ':1,'productS':'L'}]]}
        self.assertEqual(self.client.post('/auth/submit_order/',changed,format='json').status_code,409)
        product.refresh_from_db();self.assertEqual(product.L_count,2)
