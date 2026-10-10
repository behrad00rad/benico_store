from django.db import models
from django.contrib.auth.models import User
from product.models import item
from datetime import datetime
# Create your models here.

class OrderP(models.Model):

     order_id = models.IntegerField()
     product = models.ForeignKey(item,on_delete=models.DO_NOTHING)
     Q = models.IntegerField()
     size = models.CharField(max_length=225,default='')
     def __str__(self) :
        return str(self.order_id) + " | " + str(self.product) + "  x " + str(self.Q )

class addresses(models.Model):
    id = models.IntegerField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    address = models.CharField(max_length=1024)
    Fname = models.CharField(max_length=255)
    Lname = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    city  = models.CharField(max_length=255)

    Phone_number = models.CharField(max_length=255)
    PostalCode = models.BigIntegerField()
    def __str__(self) :
        return str(self.user)

class order(models.Model):

    order_id = models.IntegerField(unique=True,primary_key=True)
    user = models.ForeignKey(User,on_delete=models.DO_NOTHING,null=True)
    products = models.ManyToManyField(OrderP)
    price = models.IntegerField(default=0)
    date = models.DateTimeField(default=datetime.now,blank=True)
    address = models.CharField(max_length=1024,null=True)
    Fname = models.CharField(max_length=255,null=True)
    Lname = models.CharField(max_length=255,null=True)
    state = models.CharField(max_length=255,null=True)
    city  = models.CharField(max_length=255,null=True)
    Phone_number = models.BigIntegerField(null=True)
    PostalCode = models.BigIntegerField(null=True)
    paid=models.BooleanField(default=False)
    checkout_key = models.UUIDField(null=True, blank=True, unique=True)
    checkout_fingerprint = models.CharField(max_length=64, blank=True, default='')
    def __str__(self) :
        return str(self.order_id)

class userinfo(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    orders = models.ManyToManyField(order,null=True,blank=True)  # Allow null values for orders field
    token = models.CharField(max_length=255)
    address = models.ForeignKey(addresses,on_delete=models.SET_NULL,null=True)

    def __str__(self) :
        return str(self.user)




