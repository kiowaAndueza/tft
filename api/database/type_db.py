from .firestore_collection_fetch import FirestoreCollectionFetcher

class TypeDB:
    def get_types(self, collection_name, data_param):
        types_ref = FirestoreCollectionFetcher().get_collection_ref(collection_name)
        query = types_ref.stream()
        results = []
        for doc in query:
            data = doc.to_dict()
            name = data.get(data_param)    
            if name:
                results.append(name)
        sorted_results = sorted(results)
        return sorted_results
