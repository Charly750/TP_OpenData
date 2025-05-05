from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# class Product(models.Model):
#     name = models.CharField(max_length=100)
#     price = models.FloatField()
#     description = models.TextField()

#     def __str__(self):
#         return self.name

class Food(models.Model):
    code = models.CharField(max_length=100, unique=True)
    product_name = models.CharField(max_length=255)
    nutrition_grades = models.CharField(max_length=1, null=True, blank=True)
    image_front_url = models.URLField(max_length=500, null=True, blank=True)
    allergens_tags = models.JSONField(null=True, blank=True)
    categories_tags = models.JSONField(null=True, blank=True)
    nutriments = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.product_name

class UserSearch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(Food, related_name='main_food', on_delete=models.CASCADE)
    substitute = models.ForeignKey(Food, related_name='substitute_food', null=True, blank=True, on_delete=models.SET_NULL)
    searched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} searched for {self.food.code} at {self.searched_at}"