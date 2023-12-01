import math


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0

    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    distance_lat = lat2 - lat1
    distance_lon = lon2 - lon1

    a = math.sin(distance_lat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(distance_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    distance = R * c

    return distance