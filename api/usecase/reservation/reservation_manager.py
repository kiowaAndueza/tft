from api.database.reservation_db import ReservationDB
from api.model.reservation import Reservation
from api.database.post_db import PostDB

class ReservationManager():
    def __init__(self):
        self.db = ReservationDB()

    def add_reservation(self, reservation: Reservation):
        result = PostDB().check_filters(reservation.restaurantId, reservation.date, reservation.hour, reservation.numGuests)
        if result:
            nameReservation = f"{reservation.date}_{reservation.restaurantId}"
            reservation_data = {
                'clientId': reservation.clientId,
                'date': reservation.date,
                'hour': reservation.hour,
                'restaurantId': reservation.restaurantId,
                'numGuests': reservation.numGuests
            }
            success = self.db.add_reservation(reservation_data, nameReservation)
            if success == True:
                return True
            else:
                return success

        return 'Error al realizar la reserva. Consulta los horarios'
    
    

    def get_reservation_restaurant(self, uid, date):
        nameReservation = f"{date}_{uid}"
        reservations = self.db.get_reservation_restaurant(uid, nameReservation, date)
        return reservations
    


    def get_reservation_client(self, uid):
        reservations = self.db.get_reservation_client(uid)
        return reservations
    


    def update_reservation(self, uid, restaurantId, date, numGuests, hour, reservationMade):
        nameReservation = f"{date}_{restaurantId}"
        reservation = self.db.cancel_reservation(uid, nameReservation, date, numGuests, hour, reservationMade)
        return reservation
    



    def update_capacity(self, uid, date, hours, capacities):
        nameReservation = f"{date}_{uid}"
        hours = hours.split(",")
        capacities = capacities.split(",")

        formattedFreeCapacity = []
        for i in range(len(hours)):

            formattedCapacity = {
                'hour': hours[i],
                'capacity': int(capacities[i])
            }
            
            formattedFreeCapacity.append(formattedCapacity)

        capacity = {
            "freeCapacity": formattedFreeCapacity,
        }

        update = self.db.update_capacity(nameReservation, capacity)
        return update