from rest_framework import serializers

class RestaurantSerializers(serializers.Serializer):
    restaurantName = serializers.CharField(min_length=1, required=True)
    cif = serializers.CharField(min_length=9, max_length=9, required=True)
    city = serializers.CharField(required=True)
    cp = serializers.IntegerField(required=True)
    street = serializers.CharField(required=True)
    latitude = serializers.CharField(required=True)
    longitude= serializers.CharField(required=True)
    number = serializers.IntegerField(required=True)
    province = serializers.CharField(required=True)
