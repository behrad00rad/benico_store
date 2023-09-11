from django.http import FileResponse
from django.shortcuts import render
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.db import models
import json
from .models import *
 
# Create your views here.
  
def get_items_image(request,id):
        m = prod_image.objects.get(urlpid=id)
        res = m.img
        return FileResponse(res)
     
def get_image_url(request,id):
        m = prod_image.objects.filter(prod__id=id).all()
        res = []
        for i in m :
                res.append(str(i.urlpid))
        print(res)
        return HttpResponse(json.dumps({'data':res}))
 