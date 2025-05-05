from django.urls import path
from .views import OpenFactFoodBarCode,OpenFactFoodSearch

urlpatterns = [
    path('openfactfood/search/<str:search>/', OpenFactFoodSearch.as_view(), name='openfactfood-search'),
    path('openfactfood/<str:product_code>/', OpenFactFoodBarCode.as_view(), name='openfactfood-barcode'),
]
