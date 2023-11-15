from api.database.type_db import TypeDB

class AllergenTypesManager:
    def __init__(self):
        self.db = TypeDB()
    
    def get_allergen_types(self):
        allergens = self.db.get_types('allergens', 'name')
        if allergens:
            return allergens
