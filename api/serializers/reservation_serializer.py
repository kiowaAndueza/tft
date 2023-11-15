from rest_framework import serializers

class ReservationSerializer(serializers.Serializer):
    restaurantId = serializers.CharField(required=True)
    date = serializers.DateField(input_formats=['%Y-%m-%d'], required=True)
    clientId = serializers.CharField(required=True)
    numGuests = serializers.IntegerField(required=True)
    hour = serializers.TimeField(required=True)
