from rest_framework import serializers

class ReviewSerializers(serializers.Serializer):
    restaurantId = serializers.CharField(required=True)
    date = serializers.DateField(input_formats=['%Y-%m-%d'], required=True)
    rating = serializers.IntegerField(required=True, min_value=1, max_value=5)
    comment = serializers.CharField(required=True, max_length=500)