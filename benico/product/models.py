from django.db import models
import datetime
# Create your models here.
from django.db import models
import random
import uuid

CATEGORY_CHOICES = (("t-shirt","t-shirt"),("hoodie","hoodie"),('sweatshirt','sweatshirt'),("accessory","accessory"))

class item(models.Model):
    date = models.DateTimeField(default=datetime.datetime.now())
    id = models.IntegerField(unique=True,primary_key=True,default=random.randint(1000,9999))
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    materials_care = models.TextField(blank=True, default='')
    category = models.CharField(max_length=255,choices=CATEGORY_CHOICES)
    L_count = models.IntegerField(default=0,null=True,blank=True)
    XL_count = models.IntegerField(default=0,null=True,blank=True)
    XXL_count = models.IntegerField(default=0,null=True,blank=True)
    price = models.IntegerField(default=0,null=True,blank=True)

    def __str__(self) :
        return str(self.id)+" "+self.title


class StoreContent(models.Model):
    content = models.JSONField(default=dict)
    revision = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)


class ContentImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image = models.ImageField(upload_to='content/')


