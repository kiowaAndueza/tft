from api.database.my_favorite_db import MyFavoriteListDB
from rest_framework.response import Response
from rest_framework import status

class MyFavoritListManager():
    def __init__(self):
        self.db = MyFavoriteListDB()

    def add(self, uid, idRestaurant):
        success = self.db.add_to_favorite_list(uid, idRestaurant)
        if not success:
            return Response({"success": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"success": True, "favorite": success}, status=status.HTTP_201_CREATED)
    
    def get_list(self, uid):
        list = self.db.get_favorite_list(uid)
        if list is None:
            return Response({"success": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return list

    def remove_favorite(self, uid, idRestaurant):
        success = self.db.remove_from_favorite_list(uid, idRestaurant)
        if not success:
            return Response({"success": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"success": True}, status=status.HTTP_200_OK)
