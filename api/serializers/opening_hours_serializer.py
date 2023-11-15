from rest_framework import serializers

class OpeningHoursSerializer(serializers.Serializer):
    day = serializers.CharField(required=True)
    start_time = serializers.TimeField(format='%H:%M', required=True)
    end_time = serializers.TimeField(format='%H:%M', required=True)