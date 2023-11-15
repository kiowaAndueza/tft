from api.model.restaurant import Restaurant
from api.database.user_db import UserDB
from api.database.storage_photo_fetch import StoragePhotoFetcher

class RestaurantManager():
    def __init__(self):
        self.db = UserDB()

    def create_user(self, email, password):
        uid = self.db.new_user(email, password)
        if uid is None:
            return {"success": False, "message": "El email ya se encuentra registrado"}
        return {"success": True, "uid": uid}

    def register(self, restaurant: Restaurant):
        if self.db.check_username_exists(restaurant.username):
            return {"success": False, "message": "El nombre de usuario ya existe"}
        elif self.db.check_cif_exists(restaurant.cif):
            return {"success": False, "message": "El cif ya se encuentra registrado"}

        user_result = self.create_user(restaurant.email, restaurant.password)
        if not user_result["success"]:
            return user_result

        uid = user_result["uid"]

        restaurant_data = {
            'name': restaurant.name,
            'username': restaurant.username,
            'email': restaurant.email,
            'restaurantName': restaurant.restaurantName,
            'number': restaurant.number,
            'cif': restaurant.cif,
            'cp': restaurant.cp,
            'street': restaurant.street,
            'city': restaurant.city,
            'latitude': restaurant.latitude,
            'longitude': restaurant.longitude,
            'type': restaurant.type,
            'province': restaurant.province
        }
        success = self.db.save_user(restaurant_data, uid, 'restaurants')
        if not success:
            return {"success": False}
        return {"success": True, "restaurant": restaurant_data}
    
    def get_restaurant(self, uid):
        result = self.db.get_user(uid, 'restaurants')
        return result
    
    def update_restaurant(self, uid, data):
        return self.db.update_user_data(uid, data, "restaurant")
    

    def update_image(self, uid, image_path):
        return StoragePhotoFetcher().update_profile_photo(uid, image_path)
    