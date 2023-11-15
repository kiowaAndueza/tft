import json

class Post:
    def __init__(self, phone, description, capacity, price, allergens, opening_hours, cuisines, photos, menu):
        self.phone = phone
        self.description = description
        self.capacity = capacity
        self.price = price
        self.allergens = allergens
        self.opening_hours = opening_hours
        self.cuisines = cuisines
        self.photos = photos
        self.menu = menu

    def to_json(self):
        opening_hours = json.loads(self.opening_hours) if isinstance(self.opening_hours, str) else self.opening_hours
        menu = json.loads(self.menu) if isinstance(self.menu, str) else self.menu

        return {
            'phone': self.phone,
            'description': self.description,
            'capacity': self.capacity,
            'price': self.price,
            'allergens': self.allergens,
            'opening_hours': opening_hours,
            'cuisines': self.cuisines,
            'photos': self.photos,
            'menu': menu
        }