from django.db import models
from product.models import item
# Create your models here.
import uuid

class prod_image(models.Model):
    urlpid= models.UUIDField(unique=True, default = uuid.uuid4,null=True,blank=True)
    prod = models.ForeignKey(item,on_delete=models.CASCADE)
    img = models.ImageField(default=None)
    def __str__(self):
        return f"{self.prod.title}-{self.prod.id}"
 