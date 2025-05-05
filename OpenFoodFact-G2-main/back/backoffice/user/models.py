from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    data = models.JSONField()  # Utilisez JSONField pour des données flexibles

    def __str__(self):
        return f'{self.id}: {str(self.data)[:20]}'
