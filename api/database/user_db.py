from firebase_admin import auth, exceptions
from .firestore_collection_fetch import FirestoreCollectionFetcher
from .storage_photo_fetch import StoragePhotoFetcher

class UserDB:
    def new_user(self, email, password):
        try:
            auth.get_user_by_email(email)
            return None
        except auth.UserNotFoundError:
            user = auth.create_user(email=email, password=password)
            return user.uid
        except exceptions.FirebaseError as e:
            return None


    def save_user(self, user, uid, collection_name):
        doc_ref = FirestoreCollectionFetcher().get_user_doc_ref(uid, collection_name)
        try:
            result = doc_ref.set(user)
            print(result)
            return True
        except Exception as e:
            return False


    def get_user_type(self, uid):
        try:
            user_ref = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'clients')
            user_doc = user_ref.get()
            if user_doc.exists:
                return user_doc.get('type')

            restaurant_ref = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'restaurants')
            restaurant_doc = restaurant_ref.get()
            if restaurant_doc.exists:
                return restaurant_doc.get('type')

            return None
        except Exception as e:
            return None


    def get_user(self, uid, collection_name):
        user_doc_ref = FirestoreCollectionFetcher().get_user_doc_ref(uid, collection_name)
        image_profile_result = StoragePhotoFetcher().get_profile_photo(uid)
        if image_profile_result["success"]:
            image_profile = image_profile_result["image_url"]
        else:
            image_profile = None
        user_data = user_doc_ref.get().to_dict()
        user_data["imageProfile"] = image_profile
        return user_data


    def check_username_exists(self, username):
        users_ref = FirestoreCollectionFetcher().get_user_collection_doc_ref()
        restaurants_query = users_ref.collection('restaurants').where('username', '==', username).limit(1).get()
        clients_query = users_ref.collection('clients').where('username', '==', username).limit(1).get()

        return len(restaurants_query) > 0 or len(clients_query) > 0


    def check_cif_exists(self, cif):
        users_ref = FirestoreCollectionFetcher().get_user_collection_doc_ref()
        restaurants_query = users_ref.collection('restaurants').where('cif', '==', cif).limit(1).get()

        return len(restaurants_query) > 0


    def update_user_data(self, uid, data, user_type):
        if user_type == "restaurant":
            user = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'restaurants')
        elif user_type == "client":
            user = FirestoreCollectionFetcher().get_user_doc_ref(uid, 'clients')
        else:
            return {"success": False, "message": "Tipo de usuario no válido"}
        try:
            user.update(data)
            print(data)
            if 'email' in data:
                user_auth = auth.get_user(uid)
                auth.update_user(uid, email=data['email'], display_name=user_auth.display_name)
            return {"success": True}
        except Exception as e:
            return {"success": False, "message": str(e)}


    def get_restaurant_by_province(self, province):
        user_ref = FirestoreCollectionFetcher().get_user_collection_ref('restaurants')
        user_query = user_ref.where('province', '==', province)
        user_documents = user_query.stream()
        restaurant_data = [(user.id, user.to_dict()) for user in user_documents]
        return restaurant_data


    def get_name_and_email_user(self, uid, collection_name):
        try:
            user_ref = FirestoreCollectionFetcher().get_user_doc_ref(uid, collection_name)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                email = user_data.get('email')
                if collection_name == 'clients':
                    name = user_data.get('name')
                else:
                    name = user_data.get('restaurantName')

                return {"name": name, "email": email}
            return {"name": None, "email": None}
        except Exception as e:
            return {"name": None, "email": None}
