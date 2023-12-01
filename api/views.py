from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json
from .model.restaurant import Restaurant
from .model.client import Client
from .model.post import Post
from .model.reservation import Reservation
from .model.review import Review
from .serializers.user_serializer import UserSerializers as user_serial
from .serializers.restaurant_serializer import RestaurantSerializers as restaurant_serial
from .serializers.image_serializer import ImageSerializer as image_serial
from .serializers.post_serializer import PostSerializer as post_serial
from .serializers.reservation_serializer import ReservationSerializer as reservation_serial
from .serializers.review_serializer import ReviewSerializers as review_serial
from .usecase.restaurant.restaurant_manager import RestaurantManager as restaurant_mng
from .usecase.list.restaurant_list_manager import RestaurantListManager as list_mng
from .usecase.client.client_manager import ClientManager as client_mng
from .usecase.user.user_manager import UserManager as user_mng
from .usecase.post.post_manager import PostManager as post_mng
from .usecase.reservation.reservation_manager import ReservationManager as reservation_mng
from .usecase.review.review_manager import ReviewManager as review_mng
from .usecase.contact.contact_manager import ContactManager as contact_mng
from .repository.map_service import MapService as map_service
from .usecase.restrictions.cuisines_manager import CuisineTypesManager as cuisine_types
from .usecase.restrictions.allergens_manager import AllergenTypesManager as allergen_types
from .usecase.restrictions.provinces_manager import ProvincesManager as provinces
from .usecase.myFavoriteList.my_favorite_list_manager import MyFavoriteListDB as favorite_list_mng


class AuthRestaurant(APIView):

    def post(self, request):
        data = request.data.copy()
        data['password'] = request.headers.get('Password')

        user_serializer = user_serial(data=data)
        restaurant_serializer = restaurant_serial(data=data)

        if user_serializer.is_valid() and restaurant_serializer.is_valid():
            user_data = user_serializer.validated_data
            restaurant_data = restaurant_serializer.validated_data
            name = user_data.get('name')
            username = user_data.get('username')
            email = user_data.get('email')
            password = user_data.get('password')
            restaurantName = restaurant_data.get('restaurantName')
            cif = restaurant_data.get('cif')
            cp = restaurant_data.get('cp')
            city = restaurant_data.get('city')
            street = restaurant_data.get('street')
            latitude = restaurant_data.get('latitude')
            longitude = restaurant_data.get('longitude')
            type = user_data.get('type')
            number = restaurant_data.get('number')
            province = restaurant_data.get('province')

            restaurant = Restaurant(name, username, number, email, password, restaurantName, cif, city, cp, street, latitude, longitude, type, province)
            result = restaurant_mng().register(restaurant)

            if result["success"]:
                return Response(result)
            else:
                if "message" in result and "email" in result["message"]:
                    return Response({"error": "El email ya se encuentra registrado"}, status=status.HTTP_400_BAD_REQUEST)
                elif "message" in result and "username" in result["message"]:
                    return Response({"error": "El nombre de usuario ya existe"}, status=status.HTTP_400_BAD_REQUEST)
                elif "message" in result and "cif" in result["message"]:
                    return Response({"error": "El cif ya se encuentra registrado"}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response(result, status=status.HTTP_400_BAD_REQUEST)
        else:
            errors = {}
            errors.update(user_serializer.errors)
            errors.update(restaurant_serializer.errors)
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request):
        uid = request.query_params.get("uid")
        restaurant_data = restaurant_mng().get_restaurant(uid)
        
        if restaurant_data:
            return Response(restaurant_data)
        else:
            return Response({"error": "Restaurante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        

    def put(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        restaurant_data = request.data.copy()

        if 'address' in restaurant_data:
            del restaurant_data['address']

        if 'profileImage' in restaurant_data:
            image = image_serial(data={'image': restaurant_data['profileImage']})

            if not image:
                return Response(image.errors, status=status.HTTP_400_BAD_REQUEST)
            
            result = restaurant_mng().update_image(uid, restaurant_data['profileImage'])
            del restaurant_data['profileImage']

        if restaurant_data:
            result = restaurant_mng().update_restaurant(uid, restaurant_data)

        if result.get("success"):
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class AuthClient(APIView):
    def post(self, request):
            data = request.data.copy()
            data['password'] = request.headers.get('Password')

            user_serializer = user_serial(data=data)

            if user_serializer.is_valid():
                user_data = user_serializer.validated_data
                name = user_data.get('name')
                username = user_data.get('username')
                email = user_data.get('email')
                password = user_data.get('password')
                type = user_data.get('type')
                client = Client(name, username, email, password, type)
                result = client_mng().register(client)

                if result["success"]:
                    return Response(result)
                else:
                    if "message" in result and "email" in result["message"]:
                        return Response({"error": "El email ya se encuentra registrado"}, status=status.HTTP_400_BAD_REQUEST)
                    elif "message" in result and "username" in result["message"]:
                        return Response({"error": "El nombre de usuario ya existe"}, status=status.HTTP_400_BAD_REQUEST)
                    else:
                        return Response(result, status=status.HTTP_400_BAD_REQUEST)
            else:
                errors = {}
                errors.update(user_serializer.errors)
                errors.update(user_serializer.errors)
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            
    def get(self, request):
        uid = request.query_params.get("uid")
        client_data = client_mng().get_client(uid)
        
        if client_data:
            return Response(client_data)
        else:
            return Response({"error": "Cliente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        client_data = request.data.copy()
        if 'profileImage' in client_data:
            image = image_serial(data={'image': client_data['profileImage']})

            if not image.is_valid():
                return Response(image.errors, status=status.HTTP_400_BAD_REQUEST)
            
            result = client_mng().update_image(uid, client_data['profileImage'])
            del client_data['profileImage']

        if client_data:
            result = client_mng().update_client(uid, client_data)

        if result.get("success"):
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class GetTypeUser(APIView):
    def get(self, request):
        uid = request.query_params.get("uid")
        if uid is None:
            return Response({"error": "Falta el parametro 'uid'"}, status=status.HTTP_400_BAD_REQUEST)
        user_type = user_mng().get_user_type(uid)

        if user_type is not None:
            return Response({"user_type": user_type}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
        

class MapSearchView(APIView):
    def get(self, request):
        text = request.query_params.get("address")
        if not text:
            return Response("Falta el parámetro 'address' en la solicitud", status=status.HTTP_400_BAD_REQUEST)
        data = map_service().get_places(text)
        
        if not data:
            return Response(f"No se encontraron resultados para la dirección '{text}'")
        
        return Response(data, status=status.HTTP_200_OK)
    

class ProvinceNames(APIView):
    def get(self, request):
        data = provinces().get_name_provinces()
        if not data:
            return Response({"error": "No se encontraron las provincias"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(sorted(data), status=status.HTTP_200_OK)



class CuisineTypes(APIView):
    def get(self, request):
        cuisines = cuisine_types().get_cuisine_types()
        if not cuisines:
            return Response({"error": "No se encontraron tipos de cocina"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(cuisines, status=status.HTTP_200_OK)

class AllergenTypes(APIView):
    def get(self, request):
        allergens = allergen_types().get_allergen_types()
        if not allergens:
            return Response({"error": "No se encontraron tipos de alérgenos"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(allergens, status=status.HTTP_200_OK)
    


class PostDetailsView(APIView):
    def post(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = request.data
            post_serializer = post_serial(data=data)
            if post_serializer.is_valid():
                post_data = post_serializer.validated_data
                phone = post_data.get('phone')
                description = post_data.get('description')
                capacity = post_data.get('capacity')
                price = post_data.get('price')
                allergens = post_data.get('allergens')
                opening_hours = request.data.get('opening_hours', {})
                cuisines = post_data.get('cuisines')
                photos = post_data.get('photos')
                menu = request.data.get('menu')
                post = Post(phone, description, capacity, price, allergens, opening_hours, cuisines, photos, menu)
                result = post_mng().create(uid, post)

                if result:
                    return Response({'success': True}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'success': False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print("Errores del serializador:", post_serializer.errors)
                return Response(post_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def get(self, request):
        uid = request.query_params.get("uid")
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)
        post_data = post_mng().get_post(uid)
        if post_data:
            return Response(post_data, status=status.HTTP_200_OK)
        else:
            return Response({}, status=status.HTTP_200_OK)
    

class RestaurantListView(APIView):
    def get(self, request):
        date = request.query_params.get("date")
        hour = request.query_params.get("hour")
        province = request.query_params.get("province")
        numGuests = request.query_params.get("numGuests")

        data = list_mng().get_all(date, hour, province, numGuests)
        if data:
            return Response(data)
        else:
            return Response({"error": "Restaurante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        

class PostView(APIView):
    def get(self, request):
        uid = request.query_params.get("uid")
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)
        post= post_mng().get_all_information_post(uid)
        if post:
            return Response(post)
        else:
            return Response({"error": "Restaurante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        


class MyFavoriteListView(APIView):
    def get(self, request):
        uid = request.query_params.get("uid")

        if not uid:
            return Response({'error': 'Faltan el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        list = favorite_list_mng().get_favorite_list(uid)
        if list:
            return Response(list)
        else:
            return Response([])
    


    def post(self, request):
        uid = request.query_params.get("uid")
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        id_restaurant = request.data.get("idRestaurant")

        if not id_restaurant:
            return Response({'error': 'Falta el parámetro idRestaurant en el FormData'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = favorite_list_mng().add_to_favorite_list(uid, id_restaurant)

        if result:
            return Response({'success': True}, status=status.HTTP_201_CREATED)
        else:
            return Response({'success': False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete(self, request):
        uid = request.data.get("uid")
        id_restaurant = request.data.get("idRestaurant")

        if not uid or not id_restaurant:
            return Response({'error': 'Faltan parámetros en el cuerpo de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)

        result = favorite_list_mng().remove_from_favorite_list(uid, id_restaurant)

        if result:
            return Response({'success': True}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FilterView(APIView):
    def get(self, request):
        restaurants_id = request.query_params.getlist('restaurants_id')
        filters_param = request.query_params.get('filters', '{}')
        filters_data = json.loads(filters_param)
        if not restaurants_id:
            return Response({'error': 'No se ha enviado la lista de IDs de los restaurantes'}, status=status.HTTP_400_BAD_REQUEST)

        if not filters_data:
            return Response({'error': 'No se ha enviado ningún filtrado de búsqueda'}, status=status.HTTP_400_BAD_REQUEST)

        result = post_mng().get_post_by_filters(restaurants_id, filters_data)
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
        

class ReservationView(APIView):
    def post(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'message': 'Debes iniciar sesión para realizar reservas'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            data = request.data
            data['clientId'] = uid
            reservation_serializer = reservation_serial(data=data)
            if reservation_serializer.is_valid():
                reservation_data = reservation_serializer.validated_data
                restaurantId = reservation_data.get('restaurantId')
                date = reservation_data.get('date')
                clientId = reservation_data.get('clientId')
                numGuests = reservation_data.get('numGuests')
                hour = reservation_data.get('hour')
                reservation = Reservation(restaurantId, date, clientId, numGuests, hour)
                result = reservation_mng().add_reservation(reservation)
                if result==True:
                    return Response({'success': True}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': result}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            else:
                return Response(reservation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'message': 'Error al realizar la reserva. Consulta los horarios'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




class RestaurantReservationView(APIView):
    def get(self, request):
        uid = request.query_params.get("uid")
        date = request.query_params.get("date")

        if not uid or not date:
            return Response({'error': 'Faltan parámetros en el cuerpo de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = reservation_mng().get_reservation_restaurant(uid, date)
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
        
    
    def put(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        result = reservation_mng().update_capacity(uid, data['date'], data['hours'], data['capacities'])
        if result:
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        

class ClientReservationView(APIView):
    def get(self, request):
        uid = request.query_params.get("uid")
        if not uid:
            return Response({'error': 'Faltan parámetros en el cuerpo de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = reservation_mng().get_reservation_client(uid)
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
    

    def put(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'Falta el parámetro uid'}, status=status.HTTP_400_BAD_REQUEST)

        reservation_data = request.data.copy()
        result = reservation_mng().update_reservation(uid, reservation_data['restaurantID'], reservation_data['date'], reservation_data['numGuests'], reservation_data['hour'], reservation_data['reservationMade'])
        if result:
            return Response(result)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


class ReviewClientView(APIView):
    def post(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'message': 'Debes iniciar sesión para añadir reseñas'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            data = request.data
            review_serializer = review_serial(data=data)
            if review_serializer.is_valid():
                review_data = review_serializer.validated_data
                restaurantId = review_data.get('restaurantId')
                date = review_data.get('date')
                rating = review_data.get('rating')
                comment = review_data.get('comment')
                review = Review(restaurantId, date, rating, comment)
                result = review_mng().add_review(review, uid)
                if result==True:
                    return Response({'success': True}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': result})
                    
            else:
                return Response(review_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'message': 'Error al agregar la reseña'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

    def get(self, request):
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'message': 'Error al obtener las reseñas'}, status=status.HTTP_400_BAD_REQUEST)
        result = review_mng().get_review_client(uid)
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)
    

    def delete(self, request):
        uid = request.data.get("uid")
        id_restaurant = request.data.get("idRestaurant")

        if not uid or not id_restaurant:
            return Response({'error': 'Faltan parámetros en el cuerpo de la solicitud'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = review_mng().delete_review(uid, id_restaurant)

        if result:
            return Response({'success': True}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class ReviewRestaurantView(APIView):
    def get(self, request):
        restaurantId = request.query_params.get('restaurantId')
        uid = request.query_params.get('uid')
        if not restaurantId:
            return Response({'message': 'Error al obtener las reseñas'}, status=status.HTTP_400_BAD_REQUEST)
        result = review_mng().get_review_restaurant(restaurantId, uid)
        if result:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response([], status=status.HTTP_200_OK)



class ContactView(APIView):
    def post(self, request):
        try:
            data = request.data
            origin = data.get('origin')
            subject = data.get('subject')
            message = data.get('message')

            result = contact_mng().send_email(origin, subject, message)

            if result:
                return Response({'success': True}, status=status.HTTP_200_OK)
            else:
                return Response({'success': False}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            print(e)
            return Response({'message': 'Error al enviar el correo'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

        