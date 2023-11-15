from api.database.post_db import PostDB
from api.model.post import Post
from rest_framework.response import Response
from rest_framework import status

class PostManager():
    def __init__(self):
        self.db = PostDB()

    def create(self, uid, post: Post):
        post_data = post.to_json()
        success = self.db.create_post(post_data, uid)
        if not success:
            return Response({"success": False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"success": True, "post": post_data}, status=status.HTTP_201_CREATED)
    
    def get_post(self, uid):
        post_data = self.db.get_post(uid)
        return post_data
    

    def get_all_information_post(self, uid):
        post = self.db.get_all_information_post(uid)
        return post
    

    def get_post_by_filters(self, ids, filters):
        if isinstance(ids, list):
            ids_string = ids[0]
            ids_list = ids_string.split(',')
        else:
            ids_list = ids.split(',')
        post_data = self.db.get_post_by_filters(ids_list, filters)
        return post_data
