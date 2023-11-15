from geopy.geocoders import Nominatim

class MapService:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="my_app", timeout=10)

    def get_places(self, text):
        places_address = self.geolocator.geocode(text, addressdetails=True, country_codes="ES", exactly_one=False)
        print(places_address)

        results = places_address
        data = []

        for place in results:
            if place:
                address_data = {}
                address = place.raw.get('address', {})

                address_data['street'] = address.get('road')
                address_data['number'] = address.get('house_number')
                address_data['cp'] = address.get('postcode')
                address_data['city'] = address.get('city') 
                address_data['province'] = address.get('state_district') or address.get('city') or address.get('province')
                address_data['latitude'] = place.latitude
                address_data['longitude'] = place.longitude

                data.append(address_data)
        return data
    
