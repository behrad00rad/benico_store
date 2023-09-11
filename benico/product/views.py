import json
from django.http import HttpResponse
from django.shortcuts import render
from .models import item
from image.models import prod_image
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
# Create your views here.
def all(request):
    res = []
    items = item.objects.all().order_by('-date')[:20]
    for i in items:
        res.append({
        "title":i.title,
        "id" :i.id,
        "price" : i.price,
        "L_count": i.L_count,
        "XL_count" : i.XL_count,
        "XXL_count" : i.XXL_count,
        "category ": i.category,
        "images" : [str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()],
        }) 


    return HttpResponse(json.dumps({"data":res}))

def filtered(request,id):
    res = []
    i = item.objects.all().get(id=id)
    res.append({
        "title":i.title,
        "id" :i.id,
        "price" : i.price,
        "L_count": i.L_count,
        "XL_count" : i.XL_count,
        "XXL_count" : i.XXL_count,
        "category": i.category,
        "images" : [str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()],
        }) 
    return HttpResponse(json.dumps({"data":res})) 


def filteredCat(request,Cat,offset):
    offset = 1 if offset<1 else offset
    res = []
    allitems = item.objects.all().filter(category=Cat).order_by('-date')[offset*8-8:offset*8]
    for i in allitems:
        res.append({
                "title":i.title,
                "id" :i.id,
                "price" : i.price,
                "L_count": i.L_count,
                "XL_count" : i.XL_count,
                "XXL_count" : i.XXL_count,
                "category": i.category,
                "images" : [str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()],
                }) 
    return HttpResponse(json.dumps({"data":res})) 

def recomended(request):


    
    res = []
    items = item.objects.all().order_by('-date')[:4]
    for i in items:
        res.append({
        "title":i.title,
        "id" :i.id,
        "price" : i.price,
        "L_count": i.L_count,
        "XL_count" : i.XL_count,
        "XXL_count" : i.XXL_count,
        "category ": i.category,
        "images" : [str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()],
        }) 


    return HttpResponse(json.dumps({"data":res}))
