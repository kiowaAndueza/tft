from api.database.post_db import PostDB

class RestaurantListManager():
    def __init__(self):
        self.db = PostDB()

    def get_all(self, date, hour, province, numGuests):
        return self.db.get_all(date, hour, province, numGuests)