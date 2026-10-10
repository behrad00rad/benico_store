from django.urls import path,include
from . import views
urlpatterns =[ 
    path('all/',views.all,name='item'),
    path('search/',views.search_items,name='item'),
    path('recommend/',views.recomended,name='item'),
    path('first/',views.firstPage,name='item'),
    path('filtered/<slug:id>/',views.filtered,name=''),
    path('category/<slug:Cat>/<int:offset>',views.filteredCat,name=''),
]  