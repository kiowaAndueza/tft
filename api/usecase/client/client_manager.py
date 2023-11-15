from api.model.client import Client
from api.database.user_db import UserDB
from api.database.storage_photo_fetch import StoragePhotoFetcher

class ClientManager():
    def __init__(self):
        self.db = UserDB()

    def create_user(self, email, password):
        uid = self.db.new_user(email, password)
        if uid is None:
            return {"success": False, "message": "El email ya se encuentra registrado"}
        return {"success": True, "uid": uid}
    

    def register(self, client: Client):
        if self.db.check_username_exists(client.username):
            return {"success": False, "message": "El nombre de usuario ya existe"}
        
        user_result = self.create_user(client.email, client.password)
        if not user_result["success"]:
            return user_result
        
        uid = user_result["uid"]
        
        client_data = {
            'name': client.name,
            'username': client.username,
            'email': client.email,
            'type': client.type
        }
        success = self.db.save_user(client_data, uid, 'clients')
        if not success:
            return {"success": False}
        return {"success": True, "client": client_data}
    
    def get_client(self, uid):
        result = self.db.get_user(uid, 'clients')
        return result

    def update_client(self, uid, data):
        return self.db.update_user_data(uid, data, "client")
    
    def update_image(self, uid, image_path):
        return StoragePhotoFetcher().update_profile_photo(uid, image_path)
    
