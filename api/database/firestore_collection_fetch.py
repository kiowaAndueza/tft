from google.cloud import firestore
from api.config.firebase_credentials import FirebaseCredentials

class FirestoreCollectionFetcher:
    def __init__(self):
        self.credential_data = FirebaseCredentials().get_credentials()


    def get_user_doc_ref(self, uid, nameCollection):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection('users').document(
            'PovPWBud4GDNhXtx8Egk').collection(nameCollection).document(uid)
    
    
    def get_document_ref(self, collection_name, document_name):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection(collection_name).document(document_name)
    

    def get_document_data(self, collection_name, document_name):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection(collection_name).document(document_name).get().to_dict()

    def get_user_collection_ref(self, nameCollection):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection('users').document('PovPWBud4GDNhXtx8Egk').collection(nameCollection)
    

    def get_user_collection_doc_ref(self):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection('users').document('PovPWBud4GDNhXtx8Egk')


    def get_collection_ref(self, nameCollection):
        db = firestore.Client(credentials=self.credential_data)
        return db.collection(nameCollection)
    

    def get_docs_collection(self, nameCollection):
        db = firestore.Client(credentials=self.self.credential_data)
        collection_ref = db.collection(nameCollection)
        query = collection_ref.stream()
        return query
    