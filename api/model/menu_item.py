from .user import User

class MenuItem():
    def __init__(self, category, name, price, quantity):
        self.category = category
        self.name = name
        self.price = price
        self.quantity = quantity
