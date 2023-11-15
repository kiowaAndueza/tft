from api.database.type_db import TypeDB

class ProvincesManager():
    def __init__(self):
        self.db = TypeDB()
    
    def get_name_provinces(self):
        provinces = self.db.get_types('provinces', 'province')
        if provinces:
            return provinces