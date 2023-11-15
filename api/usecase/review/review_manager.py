from api.model.review import Review
from api.database.review_db import ReviewDB

class ReviewManager():
    def __init__(self):
        self.db = ReviewDB()

    def add_review(self, review: Review, uid):
        review_data = {
            'restaurantId': review.restaurantId,
            'date': review.date.strftime('%Y-%m-%d'),
            'rating': review.rating,
            'comment': review.comment,
        }
        
        return self.db.add_review(review_data, uid)
    

    def get_review_restaurant(self, restaurantId, uid):
        reviews = self.db.get_review_restaurant(restaurantId, uid)
        return reviews
    

    def get_review_client(self, uid):
        reviews = self.db.get_review_client(uid)
        return reviews
    

    def delete_review(self, uid, idRestaurant):
        review = self.db.delete_review(uid, idRestaurant, 'reviewsClient', 'restaurantId')
        if review:
            return True
        else:
            return False
