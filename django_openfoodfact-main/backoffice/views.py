# from django.shortcuts import render

# Create your views here.
# backoffice/views.py
from django.shortcuts import render
# from .models import Product

# def product_list(request):
#     products = Product.objects.all()
#     return render(request, 'backoffice/product_list.html', {'products': products})

from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import generics
from rest_framework import status
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny

import requests

class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Permettre l'accès sans authentification

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": RegisterSerializer(user, context=self.get_serializer_context()).data,
            "message": "User created successfully.",
        }, status=status.HTTP_201_CREATED)
    
from rest_framework.authtoken.models import Token
from .serializers import EmailAuthTokenSerializer

class ObtainAuthTokenByEmail(APIView):
    """
    Custom view for obtaining authentication token via email.
    """
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = EmailAuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Food, UserSearch
from django.contrib.auth.models import User

class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def get(self, request, *args, **kwargs):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Code parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the product is already in the database
        food, created = Food.objects.get_or_create(code=code, defaults={
            'product_name': '',
            'nutrition_grades': None,
            'image_front_url': None,
            'allergens_tags': None,
            'categories_tags': None,
            'nutriments': None
        })

        if created:
            # Fetch from OpenFoodFacts API if not already in the database
            url = f"https://fr.openfoodfacts.org/api/v2/product/{code}&fields=code,nutrition_grades,product_name,image_front_url,allergens_tags_fr,categories_tags_fr,nutriments"
            response = requests.get(url)
            if response.status_code != 200:
                return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

            product_data = response.json().get('product', {})

            # Update food data
            food.product_name = product_data.get('product_name', '')
            food.nutrition_grades = product_data.get('nutrition_grades')
            food.image_front_url = product_data.get('image_front_url')
            food.allergens_tags = product_data.get('allergens_tags_fr')
            food.categories_tags = product_data.get('categories_tags_fr')
            food.nutriments = product_data.get('nutriments')
            food.save()

        # Log the user's search if it doesn't already exist
        user_search, created = UserSearch.objects.get_or_create(user=request.user, food=food)

        # Return the product data
        return Response({
            "code": food.code,
            "product_name": food.product_name,
            "nutrition_grades": food.nutrition_grades,
            "image_front_url": food.image_front_url,
            "allergens_tags_fr": food.allergens_tags,
            "categories_tags_fr": food.categories_tags,
            "nutriments": food.nutriments
        }, status=status.HTTP_200_OK)
    
class UpdateSubstituteView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication

    def post(self, request, *args, **kwargs):
        search_id = request.data.get('search_id')
        substitute_code = request.data.get('substitute_code')

        if not search_id or not substitute_code:
            return Response({"error": "search_id and substitute_code are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_search = UserSearch.objects.get(id=search_id, user=request.user)
        except UserSearch.DoesNotExist:
            return Response({"error": "Search not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the substitute product is already in the database
        substitute, created = Food.objects.get_or_create(code=substitute_code, defaults={
            'product_name': '',
            'nutrition_grades': None,
            'image_front_url': None,
            'allergens_tags': None,
            'categories_tags': None,
            'nutriments': None
        })

        if created:
            # Fetch from OpenFoodFacts API if not already in the database
            url = f"https://fr.openfoodfacts.org/api/v2/product/{substitute_code}&fields=code,nutrition_grades,product_name,image_front_url,allergens_tags_fr,categories_tags_fr,nutriments"
            response = requests.get(url)
            if response.status_code != 200:
                return Response({"error": "Substitute product not found"}, status=status.HTTP_404_NOT_FOUND)

            product_data = response.json().get('product', {})

            # Update substitute data
            substitute.product_name = product_data.get('product_name', '')
            substitute.nutrition_grades = product_data.get('nutrition_grades')
            substitute.image_front_url = product_data.get('image_front_url')
            substitute.allergens_tags = product_data.get('allergens_tags_fr')
            substitute.categories_tags = product_data.get('categories_tags_fr')
            substitute.nutriments = product_data.get('nutriments')
            substitute.save()

        # Update the user's search with the substitute
        user_search.substitute = substitute
        user_search.save()

        return Response({"message": "Substitute updated successfully"}, status=status.HTTP_200_OK)

class ProductSearchView(APIView):
    permission_classes = [AllowAny]  # Permettre l'accès sans authentification

    def get(self, request, *args, **kwargs):
        categories_tags_fr = request.query_params.get('categories_tags_fr')
        nutrition_grades_tags = request.query_params.get('nutrition_grades_tags')
        page_size = request.query_params.get('page_size', 10)
        page = request.query_params.get('page', 1)

        if not categories_tags_fr or not nutrition_grades_tags:
            return Response({"error": "categories_tags_fr and nutrition_grades_tags parameters are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Construire l'URL de l'API OpenFoodFacts avec les paramètres
        url = f"https://fr.openfoodfacts.org/api/v2/search?categories_tags_fr={categories_tags_fr}&nutrition_grades_tags={nutrition_grades_tags}&page_size={page_size}&page={page}&fields=code,nutrition_grades,product_name,image_front_url,allergens_tags_fr,categories_tags_fr,nutriments"
        response = requests.get(url)

        if response.status_code != 200:
            return Response({"error": "Failed to fetch data from OpenFoodFacts"}, status=status.HTTP_502_BAD_GATEWAY)

        products_data = response.json()
        return Response(products_data, status=status.HTTP_200_OK)
    
    
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import UserSearch

class UserSearchDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = UserSearch.objects.all()

    def delete(self, request, *args, **kwargs):
        try:
            user_search = UserSearch.objects.get(id=kwargs['pk'], user=request.user)
            user_search.delete()
            return Response({"message": "Search deleted successfully"}, status=status.HTTP_200_OK)
        except UserSearch.DoesNotExist:
            return Response({"error": "Search not found"}, status=status.HTTP_404_NOT_FOUND)
        
class UserSearchDeleteAllView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        UserSearch.objects.filter(user=request.user).delete()
        return Response({"message": "All searches deleted successfully"}, status=status.HTTP_200_OK)
    

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import UserSearch
from .serializers import UserSearchSerializer

class UserSearchListView(generics.ListAPIView):
    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserSearch.objects.filter(user=self.request.user).order_by('-searched_at')
