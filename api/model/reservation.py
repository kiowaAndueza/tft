import json

class Reservation:
    def __init__(self, restaurantId, date, clientId, numGuests, hour):
        self.restaurantId = restaurantId
        self.date = date
        self.clientId = clientId
        self.numGuests = numGuests
        self.hour = hour