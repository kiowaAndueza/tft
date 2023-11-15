import json
from google.oauth2 import service_account
import os

class FirebaseCredentials:
    def __init__(self):
        with open(os.environ['FIREBASE_CREDENTIALS'], 'r') as f:
            credentials_dict = json.load(f)
        self.credentials = service_account.Credentials.from_service_account_info(
            credentials_dict)

    def get_credentials(self):
        return self.credentials
