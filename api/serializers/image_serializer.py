from PIL import Image
from rest_framework import serializers

class ImageSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        max_size = 4 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError()
        try:
            img = Image.open(value)
            if img.format.lower() not in ['jpeg', 'jpg', 'png', 'gif']:
                raise serializers.ValidationError()
        except Exception as e:
            raise serializers.ValidationError()
        
        return value
