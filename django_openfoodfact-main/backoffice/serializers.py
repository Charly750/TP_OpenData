from rest_framework import serializers

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class EmailAuthTokenSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                msg = {'detail': 'No user with this email address.'}
                raise serializers.ValidationError(msg, code='authorization')

            user = authenticate(username=user.username, password=password)
            if user is None:
                msg = {'detail': 'Unable to log in with provided credentials.'}
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = {'detail': 'Must include "email" and "password".'}
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs
    
from rest_framework import serializers
from .models import UserSearch, Food

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ['code', 'product_name', 'nutrition_grades', 'image_front_url', 'allergens_tags', 'categories_tags', 'nutriments']

class UserSearchSerializer(serializers.ModelSerializer):
    food = FoodSerializer()
    substitute = FoodSerializer()

    class Meta:
        model = UserSearch
        fields = ['id', 'food', 'substitute', 'searched_at']