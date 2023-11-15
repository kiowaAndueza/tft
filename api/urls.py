from django.urls import path
from api import views

urlpatterns = [
    path('users/authRestaurant', views.AuthRestaurant.as_view()),
    path('users/authClient', views.AuthClient.as_view()),
    path('users/getTypeUser', views.GetTypeUser.as_view()),
    path('mapSearch', views.MapSearchView.as_view()),
    path('searchProvince', views.ProvinceNames.as_view()),
    path('getCuisines', views.CuisineTypes.as_view()),
    path('getAllergens', views.AllergenTypes.as_view()),
    path('post', views.PostDetailsView.as_view()),
    path('getRestaurantList', views.RestaurantListView.as_view()),
    path('getPost', views.PostView.as_view()),
    path('myFavoriteList', views.MyFavoriteListView.as_view()),
    path('filteredRestaurants', views.FilterView.as_view()),
    path('reservation', views.ReservationView.as_view()),
    path('reservationRestaurant', views.RestaurantReservationView.as_view()),
    path('reservationClient', views.ClientReservationView.as_view()),
    path('reviewClient', views.ReviewClientView.as_view()),
    path('reviewRestaurant', views.ReviewRestaurantView.as_view()),
    path('contact', views.ContactView.as_view())
]
