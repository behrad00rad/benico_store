from django.db import models
import datetime
# Create your models here.
from django.db import models
import random

CATEGORY_CHOICES = (("t-shirt","t-shirt"),("hoodie","hoodie"),('sweatshirt','sweatshirt'),("accessory","accessory"))

class item(models.Model):
    date = models.DateTimeField(default=datetime.datetime.now())
    id = models.IntegerField(unique=True,primary_key=True,default=random.randint(1000,9999))
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=255,choices=CATEGORY_CHOICES)
    L_count = models.IntegerField(default=0,null=True,blank=True)
    XL_count = models.IntegerField(default=0,null=True,blank=True)
    XXL_count = models.IntegerField(default=0,null=True,blank=True)
    price = models.IntegerField(default=0,null=True,blank=True)

    def __str__(self) :
        return str(self.id)+" "+self.title


