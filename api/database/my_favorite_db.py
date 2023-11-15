from google.cloud import firestore
from .post_db import PostDB
from .firestore_collection_fetch import FirestoreCollectionFetcher
from api.config.firebase_credentials import FirebaseCredentials
from .review_db import ReviewDB

class MyFavoriteListDB:
    def get_favorite_list(self, uid):
        list_data_doc = FirestoreCollectionFetcher().get_document_ref('myFavoriteList', uid)
        list_data = list_data_doc.get().to_dict()

        if list_data and 'myFavoriteList' in list_data:
            restaurant_ids = list_data['myFavoriteList']
            favorite_posts = []

            for restaurant_id in restaurant_ids:
                rating_data = ReviewDB().get_rating_restaurant(restaurant_id)
                post = PostDB().get_information_post(restaurant_id)

                if post:
                    post['restaurant']['average_rating'] = rating_data.get('average_rating')
                    post['restaurant']['total_comments'] = rating_data.get('total_comments')

                    favorite_posts.append(post)

            return favorite_posts
        else:
            return []



    def create_favorite_list_doc(self, uid):
        db = FirestoreCollectionFetcher().get_document_ref('myFavoriteList', uid)
        db.set({'myFavoriteList': []})


    def add_to_favorite_list(self, uid, restaurant_id):
        try:
            list_data_doc = FirestoreCollectionFetcher().get_document_ref('myFavoriteList', uid)
            list_data = list_data_doc.get().to_dict()

            if not list_data:
                self.create_favorite_list_doc(uid)
                list_data = {'myFavoriteList': []}

            if 'myFavoriteList' in list_data:
                restaurant_ids = list_data['myFavoriteList']

                if restaurant_id not in restaurant_ids:
                    restaurant_ids.append(restaurant_id)
                    list_data_doc.update({'myFavoriteList': restaurant_ids})
                    return True
        except Exception as e:
            return False


    def remove_from_favorite_list(self, uid, restaurant_id):
        list_data_doc = FirestoreCollectionFetcher().get_document_ref('myFavoriteList', uid)
        list_data = list_data_doc.get().to_dict()

        if list_data and 'myFavoriteList' in list_data:
            restaurant_ids = list_data['myFavoriteList']

            if restaurant_id in restaurant_ids:
                restaurant_ids.remove(restaurant_id)
                list_data_doc.update({'myFavoriteList': restaurant_ids})
                return True
        
        return False
    

    def get_documents_collection(self, nameCollection):
        credential_data = FirebaseCredentials().get_credentials()
        db = firestore.Client(credentials=credential_data)
        collection_ref = db.collection(nameCollection)
        query = collection_ref.stream()
        return query


    def delete_favorite(self, idRestaurant):
        query = self.get_documents_collection('myFavoriteList')

        for doc in query:
            doc_data = doc.to_dict()
            favorites = doc_data.get('myFavoriteList', [])

            if idRestaurant in favorites:
                favorites.remove(idRestaurant)
                doc.reference.update({'myFavoriteList': favorites})
