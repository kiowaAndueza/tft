from api.database.user_db import UserDB

class UserManager():
    def __init__(self):
        self.db = UserDB()


    def get_user_type(self, uid):
        try:
            user_type = self.db.get_user_type(uid)
            return user_type
        except Exception as e:
            return None