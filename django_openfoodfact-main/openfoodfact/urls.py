"""
URL configuration for openfoodfact project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
# import frontoffice.views 
from rest_framework.authtoken.views import obtain_auth_token
from backoffice.views import RegisterView, ProductDetailView, ObtainAuthTokenByEmail, ProductSearchView, UpdateSubstituteView, UserSearchDeleteView, UserSearchDeleteAllView, UserSearchListView

urlpatterns = [
        path("admin/", admin.site.urls),
        path('api-token-auth/', ObtainAuthTokenByEmail.as_view(), name='api_token_auth_by_email'),
        path('api/register/', RegisterView.as_view(), name='register'),
        path('api/product/', ProductDetailView.as_view(), name='product_detail'),
        path('api/product-search/', ProductSearchView.as_view(), name='product_search'),
        path('api/update-substitute/', UpdateSubstituteView.as_view(), name='update_substitute'),
        path('api/user-searche/<int:pk>/', UserSearchDeleteView.as_view(), name='user_search_delete'),
        path('api/user-searches/delete-all/', UserSearchDeleteAllView.as_view(), name='user_search_delete_all'),
        path('api/user-searches/', UserSearchListView.as_view(), name='user_search_list'),
    ]