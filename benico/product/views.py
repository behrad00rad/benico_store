import json
from django.http import HttpResponse,JsonResponse
from django.shortcuts import render
from .models import item
from django.db import models

from image.models import prod_image
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.

def search_items(request):
    # Get the search query from the request
    search_query = request.GET.get('q', '')  # 'q' is the parameter for the search query

    # Implement your search logic here
    # In this example, we search by ID or title using a case-insensitive filter
    if len(search_query) > 0 :
        search_results = item.objects.filter(
        models.Q(id__icontains=search_query) | models.Q(title__icontains=search_query)
        )
    else:
        search_results=[]

    # Convert the queryset to a list of dictionaries for JSON response
    results_list = [
        {
            'id': result.id,
            'title': result.title,
            "image" : [str(f.urlpid) for f in prod_image.objects.filter(prod__id=result.id)[:1]],
        }
        for result in search_results
    ] 

    # Return the search results as JSON
    return JsonResponse({'results': results_list})

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
        "out" : not any((count or 0) > 0 for count in (i.L_count, i.XL_count, i.XXL_count))
        }) 


    return JsonResponse({"data":res})

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
        "out" : not any((count or 0) > 0 for count in (i.L_count, i.XL_count, i.XXL_count))
        }) 
    return JsonResponse({"data":res}) 


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
                "out" : not any((count or 0) > 0 for count in (i.L_count, i.XL_count, i.XXL_count))
                }) 
    return JsonResponse({"data":res}) 
@api_view(["GET"])
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
        "out" : not any((count or 0) > 0 for count in (i.L_count, i.XL_count, i.XXL_count))
        }) 

    return Response({'data':res},status=status.HTTP_200_OK)

@api_view(["GET"])
def firstPage(request):
    res = {"hoodie": [], "T": [], 'accessory':[],'sweatshirt':[]}  # Initialize an empty dictionary

    # Fetch the latest hoodie and t-shirt items
    hoodies = item.objects.filter(category="hoodie").order_by('-date')[:1]
    Tis = item.objects.filter(category="t-shirt").order_by('-date')[:1]
    accessory = item.objects.filter(category='accessory').order_by('-date')[:1]
    sweatshirt = item.objects.filter(category='sweatshirt').order_by('-date')[:1]

    # Add hoodie data to the 'res' dictionary
    for i in hoodies:
        res["hoodie"].append([str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()[:1]])

    # Add t-shirt data to the 'res' dictionary
    for i in Tis:
        res["T"].append([str(f.urlpid) for f in prod_image.objects.filter(prod__id=i.id).all()[:1]])

    print(res)


    return JsonResponse({"data":res})

