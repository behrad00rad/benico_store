from django.urls import path,include
from . import views
from . import management_views
urlpatterns =[
    path('manage/overview/', management_views.overview),
    path('manage/products/', management_views.save_product),
    path('manage/products/<int:product_id>/', management_views.save_product),
    path('manage/products/<int:product_id>/images/', management_views.upload_image),
    path('loginn/',views.login,name=''),
    path('register/',views.register,name=''),
    path('get_info/',views.get_user_info,name=''),
    path('get_detail/',views.get_user_detail,name=''),
    path('get_address/',views.get_user_address ,name=''),
    path('get_address_id/',views.get_address ,name=''),
    path('delete_address/',views.delete_address ,name=''),
    path('add_address/',views.add_address ,name=''),
    path('edit_address/',views.edit_address ,name=''),
    path('get_loc/',views.get_loc ,name=''), 
    path('get_order/',views.get_orders ,name=''),
    path('verify/',views.verify ,name=''),
    path('submit_order/',views.submit_order ,name=''),
    path("reset-password/", views.PasswordReset, name="reset-password"),
] 
