from django.contrib import admin
from .models import Product
import json
from django.utils.html import format_html

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'display_data')

    def display_data(self, obj):
        # Format the JSON data for display
        pretty_data = json.dumps(obj.data, indent=2)
        return format_html('<pre>{}</pre>', pretty_data)

    display_data.short_description = 'Data'
