from rest_framework import serializers

class MenuItemSerializer(serializers.Serializer):
    category = serializers.CharField()
    name = serializers.CharField()
    price = serializers.CharField()
    quantity = serializers.CharField()