from django.urls import path,include
from . import views
urlpatterns =[
    path('login/',views.login,name='item'),
    path('register/',views.register,name='item'),
    path('get_info/',views.get_user_info,name='item'),
    path('get_detail/',views.get_user_detail,name='item'),
    path('get_address/',views.get_user_address ,name='item'),
    path('get_address_id/',views.get_address ,name='item'),
    path('delete_address/',views.delete_address ,name='item'),
    path('add_address/',views.add_address ,name='item'),
    path('edit_address/',views.edit_address ,name='item'),
    path('get_loc/',views.get_loc ,name='item'), 
    path('get_order/',views.get_orders ,name='item'),
    path('submit_order/',views.submit_order ,name='item'),
] 