from api.utils.date_utils import get_day_english
from datetime import datetime
from .user_db import UserDB
from .review_db import ReviewDB
from datetime import datetime, timedelta
from api.utils.geolocation_utils import calculate_distance
from .firestore_collection_fetch import FirestoreCollectionFetcher
from .storage_photo_fetch import StoragePhotoFetcher

class PostDB:
    def create_post(self, data, uid):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('post', uid)
        try:
            photos = data.get("photos", [])
            data.pop("photos", None)
            
            if doc_ref.get().exists:
                doc_ref.update(data)
            else:
                doc_ref.set(data)
                
            if photos:
                image_result = StoragePhotoFetcher().update_photos(uid, photos)
                if image_result["success"]:
                    if "images" in data:
                        data["images"].extend(image_result["image_urls"])
                    else:
                        data["images"] = image_result["image_urls"]
                else:
                    return False
            return True
        except Exception as e:
            print(e)
            return False


    def get_post(self, uid):
        post_data = FirestoreCollectionFetcher().get_document_ref('post', uid).get().to_dict()
        return post_data
    
    
    def get_restaurant_by_province(self, province):
        user_ref = FirestoreCollectionFetcher().get_user_collection_ref('restaurants')
        user_query = user_ref.where('province', '==', province)
        user_documents = user_query.stream()
        restaurant_data = []

        for user in user_documents:
            restaurant_id = user.id
            restaurant_info = user.to_dict()
            rating_info = ReviewDB().get_rating_restaurant(restaurant_id)

            restaurant_info["average_rating"] = rating_info["average_rating"]
            restaurant_info["total_comments"] = rating_info["total_comments"]

            restaurant_data.append((restaurant_id, restaurant_info))

        return restaurant_data


    def get_restaurants_by_filters(self, restaurant_data, day, hour, numGuests):
        result_restaurants = []
        hour_time = datetime.strptime(hour, '%H:%M').time()
        for restaurant_id, restaurant_document in restaurant_data:
            if self.check_filters(restaurant_id, day, hour_time, numGuests):
                restaurant_info = self.get_restaurant_info(restaurant_id, restaurant_document)
                result_restaurants.append(restaurant_info)
        
        return result_restaurants

    def check_filters(self, restaurant_id, day, hour, numGuests):
        date_obj = datetime.strptime(str(day), '%Y-%m-%d')
        print(type(hour))

        day_of_week_english = date_obj.strftime('%A')
        day_of_week_english = get_day_english(day_of_week_english)
        
        post_data = FirestoreCollectionFetcher().get_document_ref('post', restaurant_id).get().to_dict()
        
        if post_data:
            opening_hours = post_data.get('opening_hours', [])
            for schedule in opening_hours:
                start_time = datetime.strptime(schedule['start_time'], '%H:%M').time()
                end_time = datetime.strptime(schedule['end_time'], '%H:%M').time()
                capacity = int(post_data.get('capacity', 0))
                
                if (
                    schedule.get('day') == day_of_week_english and
                    start_time <= hour <= end_time and
                    capacity >= int(numGuests)
                ):
                    return True
        return False
    

    def get_restaurant_info(self, restaurant_id, restaurant_document):
        post_data = self.get_post(restaurant_id)
        
        if not post_data:
            return None
        
        additional_data = restaurant_document
        photo_profile_data = StoragePhotoFetcher().get_profile_photo(restaurant_id)
        rating_data = ReviewDB().get_rating_restaurant(restaurant_id)
        
        restaurant_info = {**post_data, **additional_data, 'restaurant_id': restaurant_id, 'average_rating': rating_data['average_rating'], 'total_comments': rating_data['total_comments']}
        
        if photo_profile_data["success"]:
            restaurant_info['photo_profile'] = photo_profile_data["image_url"]
        
        return restaurant_info


    def get_all(self, date, hour, province, numGuests):
        day = get_day_english(date)
        restaurant_data = UserDB().get_restaurant_by_province(province)
        restaurants = self.get_restaurants_by_filters(restaurant_data, day, hour, numGuests)
        if restaurants:
            return {"success": True, "restaurants": restaurants}
        else:
            return {"success": False, "error": "Restaurante no encontrado"}
        

        
    def get_all_information_post(self, uid):
        restaurant_doc = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'restaurants')
        restaurant_data = restaurant_doc.get().to_dict()
        restaurant_details_data = self.get_post(uid)
        photos = StoragePhotoFetcher().get_photos(uid)
        review_data = ReviewDB().get_rating_restaurant(uid)
        restaurant_info = {
            "restaurantName": restaurant_data["restaurantName"],
            "street": restaurant_data["street"],
            "number": restaurant_data["number"],
            "province": restaurant_data["province"],
            "city": restaurant_data["city"],
            "cp": restaurant_data["cp"],
            "price": restaurant_details_data["price"],
            "latitude": restaurant_data["latitude"],
            "longitude": restaurant_data["longitude"],
            "email": restaurant_data["email"],
            "phone": restaurant_details_data["phone"],
            "description": restaurant_details_data["description"],
            "allergens": restaurant_details_data["allergens"],
            "cuisines": restaurant_details_data["cuisines"],
            "opening_hours": restaurant_details_data["opening_hours"],
            "menu": restaurant_details_data["menu"],
            "photos": photos,
            "total_comments": review_data["total_comments"],
            "average_rating": review_data["average_rating"]
        }
        if restaurant_info:
            return {"success": True, "restaurant": restaurant_info}
        else:
            return {"success": False, "error": "Error al obtener los datos"}


    def get_information_post(self, uid):
        restaurant_doc = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'restaurants')
        restaurant_data = restaurant_doc.get().to_dict()
        restaurant_details_data = self.get_post(uid)
        photo = StoragePhotoFetcher().get_profile_photo(uid)
        restaurant_info = {
            "restaurantName": restaurant_data["restaurantName"],
            "description": restaurant_details_data["description"],
            "allergens": restaurant_details_data["allergens"],
            "cuisines": restaurant_details_data["cuisines"],
            "photo": photo,
            "uid": uid
        }
        if restaurant_info:
            return {"success": True, "restaurant": restaurant_info}
        else:
            return {"success": False, "error": "Error al obtener los datos"}
        
    
    def get_post_by_filters(self, ids, filters):
        restaurants = []
        
        for restaurant_id in ids:
            post_data = self.get_post(restaurant_id)

            if post_data:
                passes_filters = True

                if filters['price']:
                    try:
                        restaurant_price = int(post_data['price'])
                        filter_price = int(filters['price'])
                        if restaurant_price > filter_price:
                            passes_filters = False
                    except ValueError:
                        passes_filters = False

                if filters['cuisines'] and not any(cuisine in post_data['cuisines'] for cuisine in filters['cuisines']):
                    passes_filters = False

                if filters['allergens']:
                    if post_data['allergens'] is not None:
                        if not any(allergen in post_data['allergens'] for allergen in filters['allergens']):
                            passes_filters = False
                    else:
                        passes_filters = False
                if filters['location']:
                    latitude = float(filters['location']['latitude'])
                    longitude = float(filters['location']['longitude'])
                    rangeValueKm = float(filters['location']['rangeValueKm'])
                    restaurant_doc = FirestoreCollectionFetcher().get_user_doc_ref(restaurant_id, 'restaurants')
                    restaurant_data_filter = restaurant_doc.get().to_dict()
                    result = calculate_distance(float(restaurant_data_filter["latitude"]), float(restaurant_data_filter["longitude"]), latitude, longitude)

                    if result > rangeValueKm:
                        passes_filters = False

                if passes_filters:
                    restaurant_doc = FirestoreCollectionFetcher().get_user_doc_ref(restaurant_id, 'restaurants')
                    restaurant_data = restaurant_doc.get().to_dict()
                    photo_profile_data = StoragePhotoFetcher().get_profile_photo(restaurant_id)
                    rating_data = ReviewDB().get_rating_restaurant(restaurant_id)
                    restaurant_info = {
                        "restaurant_id": restaurant_id,
                        "restaurantName": restaurant_data["restaurantName"],
                        "description": post_data["description"],
                        "allergens": post_data["allergens"],
                        "cuisines": post_data["cuisines"],
                        "photo_profile": photo_profile_data["image_url"],
                        "average_rating": rating_data['average_rating'],
                        "total_comments": rating_data['total_comments']
                    }
                    restaurants.append(restaurant_info)
        return restaurants


    def get_capacity(self, uid):
        try:
            post_ref = FirestoreCollectionFetcher().get_document_ref('post', uid)
            post_doc = post_ref.get()
            if post_doc.exists:
                    post_data = post_doc.to_dict()
                    restaurant_capacity = post_data.get('capacity')
                    return restaurant_capacity
            else:
                return None
        
        except Exception as e:
            return e


    def create_time_zones(self, uid, reservation_day):
        post_ref = FirestoreCollectionFetcher().get_document_ref('post', uid)
        post_doc = post_ref.get()
        if post_doc.exists:
            post_data = post_doc.to_dict()
            opening_hours = post_data.get('opening_hours')

            day_hours = next((day for day in opening_hours if day['day'] == reservation_day), None)

            if day_hours:
                start_time = datetime.strptime(day_hours['start_time'], '%H:%M')
                end_time = datetime.strptime(day_hours['end_time'], '%H:%M')
                time_zones = []
                
                while start_time < end_time:
                    time_zones.append(start_time.strftime('%H:%M'))
                    start_time += timedelta(hours=1)
                
                return time_zones
            else:
                return f"No se encontraron horarios de apertura para {reservation_day}"
        else:
            return "No se encontró el documento"

    
