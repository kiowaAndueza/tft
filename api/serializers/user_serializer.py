from rest_framework import serializers

class UserSerializers(serializers.Serializer):
    name = serializers.CharField(min_length=2, max_length=40, required=True)
    username = serializers.CharField(min_length=2, max_length=16, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    type = serializers.CharField(required=True)
