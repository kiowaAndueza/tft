from api.database.type_db import TypeDB

class CuisineTypesManager():
    def __init__(self):
        self.db = TypeDB()
    
    def get_cuisine_types(self):
        cuisines = self.db.get_types('cuisines', 'name')
        if cuisines:
            return cuisines

