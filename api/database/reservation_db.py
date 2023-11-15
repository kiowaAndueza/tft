from .user_db import UserDB
from .post_db import PostDB
from datetime import datetime
from api.utils.date_utils import get_day_english
from .firestore_collection_fetch import FirestoreCollectionFetcher
import re

class ReservationDB:
    def add_reservation(self, data, document_name):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reservation', document_name)
        capacity = FirestoreCollectionFetcher().get_document_data('post', data['restaurantId']).get('capacity')
        try:
            if doc_ref.get().exists:
                return self.update_reservation(doc_ref, data)
            else:
                return self.create_reservation(doc_ref, data, int(capacity))
        except Exception as e:
            return False

    def create_reservation(self, doc_ref, data, capacity):
        day_of_week_english = get_day_english(data.get('date').strftime('%A'))
        time_zones = PostDB().create_time_zones(data.get('restaurantId'), day_of_week_english)
        reservation_hour = data.get('hour').strftime('%H:%M')
        capacity_list = [{"hour": time_zone, "capacity": capacity} for time_zone in time_zones]

        for i in range(len(time_zones) - 1):
            print("no llega???")
            if time_zones[i] <= reservation_hour < time_zones[i + 1]:
                free_capacity = int(capacity) - int(data.get('numGuests'))
                
                if free_capacity < 0:
                    return "Error. Aforo insuficiente"

                capacity_list[i]['capacity'] = free_capacity
                reservation = self.create_reservation_data(data, capacity_list)
                doc_ref.set(reservation)
                document_name = f"{data.get('clientId')}"
                doc_ref_my_reservations = FirestoreCollectionFetcher().get_document_ref('myReservations', document_name)

                if doc_ref_my_reservations.get().exists:
                    return self.update_myReservations_file(data, doc_ref_my_reservations)
                else:
                    return self.create_myReservations_file(data, doc_ref_my_reservations)

        return f"No se encontró una franja horaria para {reservation_hour}"
    

    def create_reservation_data(self, data, capacity_list):
        return {
            "freeCapacity": capacity_list,
            "reservations": [
                {
                    "reservationMade": datetime.now().strftime('%Y-%m-%d %H:%M'),
                    "clientID": data.get('clientId'),
                    "numGuests": data.get('numGuests'),
                    "hour": data.get('hour').strftime('%H:%M:%S'),
                    "state": "confirm"
                }
            ]
        }


    def update_reservation(self, doc_ref, data):
        client_id = data.get('clientId')

        if self.client_has_reservation(doc_ref, client_id):
            return "Error. Dispones de una reserva para esa fecha"

        reservation_data = doc_ref.get().to_dict()
        reservation_hour = data.get('hour').strftime('%H:%M')

        if not reservation_data:
            return "Error. No se encontró la reserva"

        reservations = reservation_data.get('reservations', [])
        capacity_list = reservation_data.get('freeCapacity', [])
        new_guests = int(data.get('numGuests'))

        for i in range(len(capacity_list) - 1):
            if capacity_list[i]['hour'] <= reservation_hour < capacity_list[i+1]['hour']:
                if int(capacity_list[i]['capacity']) >= new_guests:
                    reservations.append({
                        "reservationMade": datetime.now().strftime('%Y-%m-%d %H:%M'),
                        "clientID": data.get('clientId'),
                        "numGuests": new_guests,
                        "hour": data.get('hour').strftime('%H:%M:%S'),
                        "state": "confirm"
                    })
                    new_capacity = int(capacity_list[i]['capacity']) - new_guests
                    capacity_list[i]['capacity'] = new_capacity
                    doc_ref.update({'reservations': reservations, 'freeCapacity': capacity_list})
                    break
                else:
                    return "Error. Aforo insuficiente. Prueba otra fecha u horario"

        document_name = f"{data.get('clientId')}"
        doc_ref_my_reservations = FirestoreCollectionFetcher().get_document_ref('myReservations', document_name)

        if doc_ref_my_reservations.get().exists:
            result = self.update_myReservations_file(data, doc_ref_my_reservations)
        else:
            result = self.create_myReservations_file(data, doc_ref_my_reservations)

        return result

   
    def create_myReservations_file(self, data, doc):
        reservation = {
            "date": data.get('date').isoformat(),
            "reservationMade": datetime.now().strftime('%Y-%m-%d %H:%M'),
            "restaurantID": data.get('restaurantId'),
            "numGuests": data.get('numGuests'),
            "hour": data.get('hour').strftime('%H:%M:%S'),
            "state": "confirm"
        }
        
        initial_data = {"reservations": [reservation]}
        doc.set(initial_data)
        return True


    def update_myReservations_file(self, data, doc):
        reservation_data = doc.get().to_dict()
        
        if reservation_data:
            reservations = reservation_data.get('reservations', [])
            new_reservation = {
                "reservationMade": datetime.now().strftime('%Y-%m-%d %H:%M'),
                "date": data.get('date').isoformat(),
                "restaurantID": data.get('restaurantId'),
                "numGuests": data.get('numGuests'),
                "hour": data.get('hour').strftime('%H:%M:%S'),
                "state": "confirm"
            }
            reservations.append(new_reservation)
            doc.update({'reservations': reservations})
            return True
        else:
            return False


    def client_has_reservation(self, doc_ref, client_id):
        reservation_data = doc_ref.get().to_dict()
        
        if reservation_data:
            reservations = reservation_data.get('reservations', [])
            return any(reservation['clientID'] == client_id and reservation['state'] == 'confirm' for reservation in reservations)
        return True


    def get_reservation_restaurant(self, uid, document_name, date):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reservation', document_name)
        result = []

        if not doc_ref.get().exists:
            capacity_list = self.create_slots_fich(doc_ref, uid, date)
            if capacity_list:
                return [{"capacity": capacity_list}]

        reservation_data = doc_ref.get().to_dict()
        capacity_list = reservation_data.get("freeCapacity", [])
        confirmed_reservations = [res for res in reservation_data.get("reservations", []) if res.get("state") == "confirm"]
        confirmed_reservations.sort(key=lambda res: res.get("hour"))

        for res in confirmed_reservations:
            client_info = UserDB().get_name_and_email_user(res["clientID"], 'clients')
            if client_info["name"] is not None:
                result.append({
                    "restaurantID": uid,
                    "clientID": res["clientID"],
                    "name": client_info["name"],
                    "email": client_info["email"],
                    "hour": res["hour"],
                    "date": date,
                    "numGuests": res["numGuests"],
                    "reservationMade": res["reservationMade"],
                    "capacity": capacity_list
                })

        return result or [{"capacity": capacity_list}]
        

    def get_reservation_client(self, uid):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('myReservations', uid)
        result = {"present": [], "past": [], "cancel": []}

        if not doc_ref.get().exists:
            return result

        reservation_data = doc_ref.get().to_dict()
        current_time = datetime.now()

        for res in reservation_data.get("reservations", []):
            date_str = res.get("date")
            time_str = res.get("hour")
            reservation_datetime = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M:%S")
            days_difference = (reservation_datetime - current_time).days
            restaurant_info = UserDB().get_name_and_email_user(res["restaurantID"], 'restaurants')

            reservation_item = {
                "restaurantID": res["restaurantID"],
                "date": res["date"],
                "name": restaurant_info["name"],
                "hour": res["hour"],
                "numGuests": res["numGuests"],
                "reservationMade": res["reservationMade"]
            }

            if res.get("state") == "confirm" and 0 <= days_difference <= 30:
                result["present"].append(reservation_item)
            elif res.get("state") == "confirm" and -30 <= days_difference <= -1:
                result["past"].append(reservation_item)
            elif 0 <= days_difference <= 30:
                result["cancel"].append(reservation_item)
            elif -30 <= days_difference <= -1:
                result["cancel"].append(reservation_item)

        return result


    def cancel_reservation_client(self, uid, date, reservationMade):
        doc_ref_myReservations = FirestoreCollectionFetcher().get_document_ref('myReservations', uid)
        if doc_ref_myReservations.get().exists:
            reservation_data_client = doc_ref_myReservations.get().to_dict()
            reservationsClient = reservation_data_client.get('reservations', [])
            for retervationClient in reservationsClient:
                if date == retervationClient['date'] and reservationMade == retervationClient['reservationMade']:
                    retervationClient['state'] = 'cancel'
                    doc_ref_myReservations.update({'reservations': reservationsClient})
                    return True
        return "No existe dicha reserva"


    def cancel_reservation(self, uid, document_name, date, numGuests, hour, reservationMade):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reservation', document_name)
        if doc_ref.get().exists:
            reservation_data = doc_ref.get().to_dict()
            if reservation_data:
                reservations = reservation_data.get('reservations', [])
                capacity_list = reservation_data.get('freeCapacity', [])

                for reservation in reservations:
                    if reservation['clientID'] == uid and reservation['state'] == 'confirm':
                        reservation['state'] = 'cancel'
                for i in range(len(capacity_list)):
                    if  capacity_list[i]['hour'] <= hour and hour < capacity_list[i + 1]['hour']:
                        new_capacity = capacity_list[i]['capacity'] + int(numGuests)
                        capacity_list[i]['capacity'] = new_capacity
                        break

                doc_ref.update({
                    'reservations': reservations,
                    'freeCapacity': capacity_list,
                })

                return self.cancel_reservation_client(uid, date, reservationMade)

        return "No existe dicha reserva"
    

    def create_slots_fich(self, doc_ref, uid, date):
        capacity = int(PostDB().get_capacity(uid))
        day_of_week_english = get_day_english(datetime.strptime(date, '%Y-%m-%d').strftime('%A'))
        time_zones = PostDB().create_time_zones(uid, day_of_week_english)

        if isinstance(time_zones, str):
            return {}

        capacity_list = [
            {"hour": time_zone, "capacity": capacity}
            for time_zone in time_zones
        ]

        doc_ref.set({"freeCapacity": capacity_list})
        return capacity_list



    def update_capacity(self, document_name, capacity):
        doc_ref = FirestoreCollectionFetcher().get_document_ref('reservation', document_name)
        if doc_ref.get().exists:
            doc_ref.update(capacity)
            return True
        else:
            print(f"Document with name {document_name} does not exist.")
            return False
        

    def delete_reservation_restaurant(self, idRestaurant):
        regex = r'^\d{4}-\d{2}-\d{2}_' + re.escape(idRestaurant) + '$'
        query = FirestoreCollectionFetcher().get_docs_collection('reservation')

        deleted_count = 0
        for document in query:
            document_name = document.id
            if re.match(regex, document_name):
                document.reference.delete()
                deleted_count += 1

        if deleted_count > 0:
            query2 = FirestoreCollectionFetcher().get_docs_collection('myReservations')

            for doc in query2:
                doc_data = doc.to_dict()
                reservations = doc_data.get('reservations', [])
                
                updated_reservations = [r for r in reservations if r.get('restaurantID') != idRestaurant]
                doc.reference.update({'reservations': updated_reservations})