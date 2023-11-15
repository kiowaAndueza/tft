import React, { useEffect, useState } from "react";
import {
  addToMyFavoriteList,
  getRestaurantList,
  removeFromMyFavoriteList,
} from "../../services/apiService";
import defaultProfileImage from "../../assets/userDefault.jpg";
import { FaHeart } from "react-icons/fa";
import "./RestaurantList.css";
import { useNavigate } from "react-router-dom";
import {
  confirmationMessage,
  errorMessage,
  successfulMessage,
} from "../messages/Messages";
import SearchFilterComponent from "../filter/searchFilterComponent/SearchFilterComponent";
import RestFilterComponent from "../filter/restFilterComponent/RestFilterComponent";
import Rating from 'react-rating-stars-component';

function RestaurantList(props) {
  const userId = localStorage.getItem("userId");
  const typeUser = localStorage.getItem("userType");
  const [isLoading, setIsLoading] = useState(true);
  const [currentRestaurants, setCurrentRestaurants] = useState([]);
  const [initialRestaurants, setInitialRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 10;
  const visiblePages = 5;
  const [likedRestaurants, setLikedRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    localStorage.getItem("idRestaurant")
  );
  const [currentRestaurantIds, setCurrentRestaurantIds] = useState([]);
  const [initialRestaurantIds, setInitialRestaurantIds] = useState([]);

  const navigate = useNavigate();

  const redirectToPath = async (path) => {
    await navigate(path);
  };

  const formDataString = localStorage.getItem("formData");

  useEffect(() => {
    if (formDataString) {
      const formData = JSON.parse(formDataString);

      setIsLoading(true);

      getRestaurantList(
        formData.date,
        formData.time,
        formData.province,
        formData.numGuests
      )
        .then((response) => {
          if (
            response.data.restaurants &&
            response.data.restaurants.length > 0
          ) {
            const restaurantData = response.data.restaurants;
            setCurrentRestaurants(restaurantData);
            setInitialRestaurants(restaurantData);
            const restaurantIds = restaurantData.map(
              (restaurant) => restaurant.restaurant_id
            );
            setInitialRestaurantIds(restaurantIds);
            setCurrentRestaurantIds(restaurantIds);
          }

          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al obtener la lista de restaurantes:", error);
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    setSelectedRestaurant(localStorage.getItem("idRestaurant"));
  }, []);

  const handleLikeClick = (restaurantId, isLiked) => {
    if (isLiked) {
      confirmationMessage(
        "¿Estás seguro de que deseas eliminar este restaurante de tus favoritos?"
      ).then((result) => {
        if (result.isConfirmed) {
          removeFromMyFavoriteList(userId, restaurantId)
            .then((response) => {
              if (response.data.success) {
                const updatedLikedRestaurants = likedRestaurants.filter(
                  (id) => id !== restaurantId
                );
                setLikedRestaurants(updatedLikedRestaurants);
                successfulMessage(
                  "Se ha eliminado correctamente de tu lista de favoritos"
                );
              } else {
                errorMessage("No se ha podido eliminar de favoritos");
              }
            })
            .catch((error) => {
              console.log(error);
              errorMessage("No se ha podido eliminar de favoritos");
            });
        }
      });
    } else {
      addToMyFavoriteList(userId, restaurantId)
        .then((response) => {
          console.log(response);
          if (response.data.success) {
            const updatedLikedRestaurants = [...likedRestaurants, restaurantId];
            setLikedRestaurants(updatedLikedRestaurants);
            successfulMessage(
              "Se ha añadido correctamente a tu lista de favoritos"
            );
          } else {
            errorMessage("Ya se encuentra dentro de tu lista de favoritos");
          }
        })
        .catch((error) => {
          errorMessage("Ya se encuentra dentro de tu lista de favoritos");
        });
    }
  };

  const updateCurrentRestaurants = (newRestaurants) => {
    setCurrentRestaurants(newRestaurants);
  };

  const updateCurrentRestaurantIds = (newRestaurantIds) => {
    setCurrentRestaurantIds(newRestaurantIds);
  };

  const totalItems = currentRestaurants.length;
  const totalPages = Math.ceil(totalItems / restaurantsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagination = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    if (!(totalItems > restaurantsPerPage)) {
      return null;
    }

    const previous_page = currentPage > 1;
    const next_page = currentPage < totalPages;

    const handlePreviousPage = () => {
      if (previous_page) {
        handlePageChange(currentPage - 1);
      }
    };

    const handleNextPage = () => {
      if (next_page) {
        handlePageChange(currentPage + 1);
      }
    };

    pages.push(
      <li
        key="previous"
        className={`page-item ${previous_page ? "" : "disabled"}`}
      >
        <button
          className="page-link"
          onClick={handlePreviousPage}
          disabled={!previous_page}
        >
          Anterior
        </button>
      </li>
    );

    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <li
          key={page}
          className={`page-item ${currentPage === page ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(page)}>
            {page}
          </button>
        </li>
      );
    }

    pages.push(
      <li key="next" className={`page-item ${next_page ? "" : "disabled"}`}>
        <button
          className="page-link"
          onClick={handleNextPage}
          disabled={!next_page}
        >
          Siguiente
        </button>
      </li>
    );

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">{pages}</ul>
      </nav>
    );
  };

  const handleRestaurantSelection = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    localStorage.setItem("idRestaurant", restaurantId);

    if (restaurantId) {
      redirectToPath(`/restaurant/${restaurantId}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row d-flex justify-content-center ">
        <div className="col-12 col-md-12 col-lg-4 mb-5 mx-auto">
          <SearchFilterComponent
            className="mx-auto"
          />
          <RestFilterComponent
            currentRestaurantIds={initialRestaurantIds}
            updateCurrentRestaurants={updateCurrentRestaurants}
            updateCurrentRestaurantIds={updateCurrentRestaurantIds}
            initialRestaurants={initialRestaurants}
          />
        </div>

        <div className="col-12 col-xs-9 col-md-12 col-lg-12 card-margin">
          {isLoading ? (
            <div className="card card-list">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            </div>
          ) : currentRestaurants.length === 0 ? (
            <div className="alert alert-warning" role="alert">
              No hay ningún establecimiento que cumpla con el filtrado de
              búsqueda.
            </div>
          ) : (
            <>
              {currentRestaurants
                .slice(
                  (currentPage - 1) * restaurantsPerPage,
                  currentPage * restaurantsPerPage
                )
                .map((restaurant, index) => (
                  <div
                    key={index}
                    className="col-12 col-md-12 col-xs-12 col-lg-12 mb-2"
                  >
                    <div className="card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-0 col-md-5 col-lg-3 position-relative">
                            {userId && typeUser === "client" ? (
                              <FaHeart
                                className={`heart-icon ${likedRestaurants.includes(
                                  restaurant.restaurant_id
                                )
                                  ? "liked"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleLikeClick(
                                    restaurant.restaurant_id,
                                    likedRestaurants.includes(
                                      restaurant.restaurant_id
                                    )
                                  )
                                }
                              />
                            ) : null}
                            <img
                              src={
                                restaurant.photo_profile
                                  ? restaurant.photo_profile
                                  : defaultProfileImage
                              }
                              alt="Imagen restaurante"
                              className="img-fluid mb-0 custom-img d-none d-md-block"
                            />
                          </div>
                          <div className="col-11 col-xs-9 col-md-7 col-lg-9">
                            <div className="d-flex justify-content-between">
                              <div>
                                <button
                                  className="card-title m-0 custom-button-style"
                                  onClick={() =>
                                    handleRestaurantSelection(
                                      restaurant.restaurant_id
                                    )
                                  }
                                >
                                  <h5 className="m-0">
                                    {restaurant.restaurantName}
                                  </h5>
                                </button>
                                <div className="rating-restaurant-list">
                                  <Rating
                                    count={5}
                                    size={28}
                                    value={restaurant.average_rating}
                                    edit={false}
                                  />
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="info-box p-1 text-white rounded">
                                  <div className="info-value text-center">
                                    {parseFloat(restaurant.average_rating).toFixed(1)}
                                  </div>
                                </div>
                                <div className="text-muted opinions-text">
                                  {restaurant.total_comments !== undefined && restaurant.total_comments !== null && restaurant.total_comments !== 0
                                    ? `${restaurant.total_comments} Opiniones`
                                    : 'Sin opiniones'}
                                </div>
                              </div>
                            </div>
                            <div className="food-restriction mb-2">
                              {restaurant.cuisines &&
                                restaurant.cuisines !== "None" &&
                                restaurant.cuisines.map((cuisine, index) => (
                                  <span
                                    key={index}
                                    className="badge text-food-restriction me-2 m-1"
                                  >
                                    {cuisine}
                                  </span>
                                ))}
                            </div>
                            <span className="badge text-food-restriction me-2 alergen-badge">
                              {restaurant.alergens &&
                                restaurant.alergens !== "None" &&
                                restaurant.alergens.map((alergen, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-success me-2 m-1"
                                  >
                                    {alergen}
                                  </span>
                                ))}
                            </span>
                            <p className="card-text description-list-text text-justify">
                              {restaurant.description.length > 100
                                ? restaurant.description.slice(0, 100) + "..."
                                : restaurant.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {pagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RestaurantList;
