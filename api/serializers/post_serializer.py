from rest_framework import serializers
from .menu_serializer import MenuItemSerializer
from .opening_hours_serializer import OpeningHoursSerializer

class PostSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    description = serializers.CharField(min_length=20, max_length=1500, required=True)
    capacity = serializers.CharField(required=True)
    price = serializers.CharField(required=True)
    allergens = serializers.ListField(child=serializers.CharField(allow_blank=True), required=False)
    opening_hours = serializers.DictField(child=OpeningHoursSerializer(), required=True)
    cuisines = serializers.ListField(child=serializers.CharField(required=True), required=True)
    photos = serializers.ListField(child=serializers.ImageField(), required=True)
    menu = serializers.DictField(child=MenuItemSerializer(), required=True)