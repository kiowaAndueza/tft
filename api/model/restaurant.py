from .user import User

class Restaurant(User):
    def __init__(self, name, username, number, email, password, restaurantName, cif, city, cp, street, latitude, longitude, type, province):
        super().__init__(name, username, email, password, type)
        self.restaurantName = restaurantName
        self.cif = cif
        self.city = city
        self.cp = cp
        self.street = street
        self.latitude = latitude
        self.longitude = longitude
        self.number = number
        self.province = province
