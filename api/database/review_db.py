from .user_db import UserDB
from .firestore_collection_fetch import FirestoreCollectionFetcher
from .storage_photo_fetch import StoragePhotoFetcher
from api.config.firebase_credentials import FirebaseCredentials

class ReviewDB:
    def __init__(self):
        self.credential_data = FirebaseCredentials().get_credentials()

    def add_review(self, review_data, uid):
        new_review = {
            'date': review_data['date'],
            'rating': review_data['rating'],
            'comment': review_data['comment'],
            'clientId': uid,
        }
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reviewsRestaurant', review_data['restaurantId'])
        if doc_ref.get().exists:
            return self.update_review(doc_ref, review_data['restaurantId'], uid, new_review)
        else:
            return self.create_review(doc_ref, review_data['restaurantId'], uid, new_review)
        

    def create_review(self, doc_ref, restaurantId, uid, new_review):
        doc_ref.set({'reviews': [new_review]})
        doc_ref_client = FirestoreCollectionFetcher().get_document_ref('reviewsClient', uid)
        new_review['restaurantId'] = restaurantId
        if 'clientId' in new_review:
            del new_review['clientId']

        if doc_ref_client.get().exists:
            return self.update_review_client(doc_ref_client, new_review)
        return self.create_review_client(doc_ref_client, new_review)


    def update_review(self, doc_ref, restaurantId, uid, new_review):
        data = doc_ref.get().to_dict()
        reviews = data.get('reviews', [])
        
        for review in reviews:
            if 'clientId' in review and review['clientId'] == uid:
                return "Ya has realizado una reseña en este restaurante."
                            
        reviews.append(new_review)
        doc_ref.update({'reviews': reviews})
        new_review['restaurantId'] = restaurantId
        if 'clientId' in new_review:
            del new_review['clientId']

        doc_ref_client = FirestoreCollectionFetcher().get_document_ref('reviewsClient', uid)
        if doc_ref_client.get().exists:
            return self.update_review_client(doc_ref_client, new_review)
        return self.create_review_client(doc_ref_client, new_review)
    


    def update_review_client(self, doc_ref_client, new_review):
        current_reviews = doc_ref_client.get().to_dict()
        if current_reviews and 'reviews' in current_reviews:
            existing_reviews = current_reviews['reviews']
        else:
            existing_reviews = []
        
        existing_reviews.append(new_review)

        doc_ref_client.update({'reviews': existing_reviews})
        return True


    def create_review_client(self, doc_ref_client, new_review):
        current_reviews = doc_ref_client.get().to_dict()
        if current_reviews and 'reviews' in current_reviews:
            existing_reviews = current_reviews['reviews']
        else:
            existing_reviews = []

        existing_reviews.append(new_review)

        doc_ref_client.set({'reviews': existing_reviews})
        return True


    def get_review_restaurant(self, restaurantId, uid):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reviewsRestaurant', restaurantId)
        result = []
        if not doc_ref.get().exists:
            return result

        reviews = doc_ref.get().to_dict().get('reviews', [])
        reviews.sort(key=lambda x: x["date"])

        for review in reviews:
            photo_profile = StoragePhotoFetcher().get_profile_photo(review["clientId"])
            client_data = UserDB().get_name_and_email_user(review["clientId"], "clients")
            
            review_entry = {
                "nameClient": "Tú (propietario)" if review["clientId"] == uid else client_data["name"],
                "imageClient": photo_profile["image_url"],
                "clientId": review["clientId"],
                "comment": review["comment"],
                "date": review["date"],
                "rating": review["rating"]
            }

            if review["clientId"] == uid:
                result.insert(0, review_entry)
            else:
                result.append(review_entry)

        return result


    def get_review_client(self, uid):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reviewsClient', uid)
        result = []

        if not doc_ref.get().exists:
            return result

        reviews = doc_ref.get().to_dict().get('reviews', [])
        reviews.sort(key=lambda x: x["date"])
        
        for review in reviews:
            restaurant_info = UserDB().get_name_and_email_user(review["restaurantId"], 'restaurants')
            result.append({
                "nameRestaurant": restaurant_info["name"],
                "restaurantId": review["restaurantId"],
                "comment": review["comment"],
                "date": review["date"],
                "rating": review["rating"]
            })

        return result


    def get_rating_restaurant(self, restaurantId):
        doc_data = FirestoreCollectionFetcher().get_document_data('reviewsRestaurant', restaurantId)
        
        result = {
            "total_ratings": 0,
            "average_rating": 0.0,
            "total_comments": 0
        }
        if doc_data is None:
            return result
        reviews = doc_data.get('reviews', [])
        if len(reviews) > 0:
            total_ratings = sum(review.get("rating", 0) for review in reviews)
            total_comments = len(reviews)

            if total_comments > 0:
                result["total_ratings"] = total_ratings
                result["total_comments"] = total_comments
                result["average_rating"] = total_ratings / total_comments

        return result
    

    def delete_review(self, uid, target_id, collection_name, param_name):
        target_doc = FirestoreCollectionFetcher().get_document_ref(collection_name, uid)
        target_data = FirestoreCollectionFetcher().get_document_data(collection_name, uid)
        updated_reviews = []
        deleted = False

        if target_data and 'reviews' in target_data:
            reviews = target_data['reviews']
            for review in reviews:
                if param_name in review and review[param_name] == target_id:
                    continue
                updated_reviews.append(review)

            if len(updated_reviews) < len(reviews):
                deleted = True

            target_doc.update({'reviews': updated_reviews})

        if collection_name == 'reviewsClient':
            return self.delete_review(target_id, uid, 'reviewsRestaurant', 'clientId')
        elif collection_name == 'reviewsRestaurant':
            return deleted
    
    
    def delete_all_reviews_restaurant(self, idRestaurant):
        review_data_doc = FirestoreCollectionFetcher().get_document_ref('reviewsRestaurant', idRestaurant)
        if review_data_doc.get().exists:
            review_data_doc.delete()
        query = FirestoreCollectionFetcher().get_docs_collection('reviewsClient')
        for doc in query:
            doc_data = doc.to_dict()
            reviews = doc_data.get('reviews', [])
            updated_reviews = [r for r in reviews if r.get('restaurantId') != idRestaurant]

            if len(updated_reviews) < len(reviews):
                doc.reference.update({'reviews': updated_reviews})



