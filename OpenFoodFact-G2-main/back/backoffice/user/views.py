# views.py

from rest_framework import status,generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Product
from .serializers import ProductSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        if username and password:
            user = User.objects.create(
                username=username,
                password=make_password(password)
            )
            user.save()
            return Response({'status': 'account created'}, status=status.HTTP_201_CREATED)
        return Response({'error': 'missing username or password'}, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Obtient l'utilisateur à partir du token JWT

        # Récupérer les recherches associées à l'utilisateur
        products = Product.objects.filter(user=user)
        product_serializer = ProductSerializer(products, many=True)

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'products': product_serializer.data  # Inclure les recherches et les produits dans la réponse
        })
    

class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductDeleteView(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)    
    
class UserProductsListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)