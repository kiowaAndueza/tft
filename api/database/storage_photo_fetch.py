from google.cloud import storage
from datetime import datetime, timedelta
from api.config.firebase_credentials import FirebaseCredentials
import uuid

class StoragePhotoFetcher:
    def __init__(self, bucket_name="restaurantdb-c67cf.appspot.com"):
        self.credential_data = FirebaseCredentials().get_credentials()
        self.bucket_name = bucket_name


    def get_blob(self, uid):
        storage_client = storage.Client(credentials=self.credential_data)
        bucket = storage_client.bucket(self.bucket_name)
        storage_path = f"user-profiles/{uid}/profile_image.jpg"
        blob = bucket.blob(storage_path)

        if blob.exists():
            return blob
        else:
            return None


    def list_blobs(self, uid):
        blob = self.get_blob(uid)
        if blob is None:
            return []
        folder_path = f"restaurant-images/{uid}/"
        return list(blob.bucket.list_blobs(prefix=folder_path))
    
    

    def get_profile_photo(self, uid):
        try:
            blob = self.get_blob(uid)
            if blob is None:
                return {"success": False, "message": "No se encontró la imagen de perfil", "image_url": ""}

            expires_at = datetime.now() + timedelta(hours=24)
            image_url = blob.generate_signed_url(expiration=expires_at, version="v4")
            return {"success": True, "image_url": image_url}
        except Exception as e:
            return {"success": False, "message": str(e), "image_url": ""}



    def update_profile_photo(self, uid, file_obj):
        try:
            blob = self.get_blob(uid)

            if blob is None:
                storage_client = storage.Client(credentials=self.credential_data)
                bucket = storage_client.bucket(self.bucket_name)
                storage_path = f"user-profiles/{uid}/profile_image.jpg"
                blob = bucket.blob(storage_path)

            blob.content_type = 'image/jpeg'
            file_obj.seek(0)
            blob.upload_from_file(file_obj)
            image_url = blob.public_url
            return {"success": True, "image_url": image_url}
        except Exception as e:
            print(e)
            return {"success": False, "message": str(e)}



    def get_photos(self, uid):
        try:
            folder_path = f"restaurant-images/{uid}/"
            storage_client = storage.Client(credentials=self.credential_data)
            bucket = storage_client.bucket(self.bucket_name)
            blobs = list(bucket.list_blobs(prefix=folder_path))
            photo_urls = []

            for blob in blobs:
                expires_at = datetime.now() + timedelta(hours=24)
                url = blob.generate_signed_url(expiration=expires_at, version="v4")
                photo_urls.append(url)

            return photo_urls
        except Exception as e:
            return []
        

    def update_photos(self, uid, file_objects):
        try:
            folder_path = f"restaurant-images/{uid}/"
            blobs = self.list_blobs(uid)

            storage_client = storage.Client(credentials=self.credential_data)
            bucket = storage_client.bucket(self.bucket_name)
            uploaded_urls = []

            if not blobs:
                self.create_empty_folder(uid)
            else:
                for blob in blobs:
                    blob.delete()

            for file_obj in file_objects:
                unique_filename = str(uuid.uuid4()) + ".jpg"
                storage_path = folder_path + unique_filename

                blob = bucket.blob(storage_path)
                blob.content_type = 'image/jpeg'
                file_obj.seek(0)
                blob.upload_from_file(file_obj)
                expires_at = datetime.now() + timedelta(hours=24)
                image_url = blob.generate_signed_url(expiration=expires_at, version="v4")
                uploaded_urls.append(image_url)

            return {"success": True, "image_urls": uploaded_urls}
        except Exception as e:
            print(e)
            return {"success": False, "message": str(e)}
        

    def delete_images_in_folder(self, uid):
        blobs = self.list_blobs(uid)
        for blob in blobs:
            blob.delete()


    def create_empty_folder(self, uid):
        folder_path = f"restaurant-images/{uid}/dummy-file.txt"
        storage_client = storage.Client(credentials=self.credential_data)
        blob = storage_client.bucket(self.bucket_name).blob(folder_path)
        blob.upload_from_string("dummy-content")

