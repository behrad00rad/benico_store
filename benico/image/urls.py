from django.urls import path,include
from . import views
urlpatterns =[
    path('item/<slug:id>/',views.get_items_image,name='item image'),
    path('get_image/<slug:id>/',views.get_image_url,name='item image'),
] 