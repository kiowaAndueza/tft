import './FavoriteList.css';
import authProvider from "../../auth/authProvider";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getMyFavoriteList, removeFromMyFavoriteList } from '../../services/apiService';
import { confirmationMessage, errorMessage, successfulMessage } from '../messages/Messages';
import { FaHeart } from 'react-icons/fa';
import defaultProfileImage from "../../assets/userDefault.jpg";
import Rating from 'react-rating-stars-component';


function FavoriteList() {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const [myFavoriteList, setMyFavoriteList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const visiblePages = 5;
    const restaurantsPerPage = 10;
    const [isLoading, setIsLoading] = useState(true);

    const redirectToPath = async (path) => {
        await navigate(path);
    };

    const checkPermission = async () => {
        const permissions = await authProvider.getPermissions();
        const hasPermission = permissions.includes("myFavoriteList");

        if (!hasPermission) {
            redirectToPath("/home");
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    useEffect(() => {
        let isFetchingData = false;

        async function fetchData() {
            if (isFetchingData) {
                return;
            }

            try {
                isFetchingData = true;
                setIsLoading(true);
                const myListResponse = await getMyFavoriteList(userId);

                if (myListResponse.data.length > 0) {
                    const restaurants = myListResponse.data.map((item) => item.restaurant);
                    setMyFavoriteList(restaurants);
                } else {
                    console.log("La lista de favoritos está vacía.");
                }
            } catch (error) {
                errorMessage('Error al obtener tu lista de favoritos');
            } finally {
                isFetchingData = false;
                setIsLoading(false);
            }
        }

        fetchData();
    }, [userId]);



    const handleRestaurantSelection = (restaurantId) => {
        localStorage.setItem("idRestaurant", restaurantId);
        setTimeout(() => {
            redirectToPath(`/restaurant/${restaurantId}`);
        }, 0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const totalItems = myFavoriteList.length;
    const totalPages = Math.ceil(totalItems / restaurantsPerPage);

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
                className={`page-item ${previous_page ? "" : "disabled"} mt-2`}
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
                    className={`page-item ${currentPage === page ? "active" : ""} mt-2`}
                >
                    <button className="page-link" onClick={() => handlePageChange(page)}>
                        {page}
                    </button>
                </li>
            );
        }

        pages.push(
            <li key="next" className={`page-item ${next_page ? "" : "disabled"} mt-2`}>
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

    const handleDeleteFav = (restaurantId, name) => {
        confirmationMessage(`¿Estás seguro de que deseas eliminar ${name} de tus favoritos?`).then((result) => {
            if (result.isConfirmed) {
                removeFromMyFavoriteList(userId, restaurantId)
                    .then((response) => {
                        if (response.data.success) {
                            successfulMessage(
                                "Se ha eliminado correctamente de tu lista de favoritos"
                            );

                            getMyFavoriteList(userId)
                                .then((myListResponse) => {
                                    const restaurants = myListResponse.data.map((item) => item.restaurant);
                                    setMyFavoriteList(restaurants);
                                })
                                .catch((error) => {
                                    errorMessage('Error al obtener tu lista de favoritos');
                                });
                        } else {
                            errorMessage("No se ha podido eliminar de favoritos");
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                        errorMessage("No se ha podido eliminar de favoritos");
                    });
            }
        });
    }


    return (
        <div className="container mt-5">
            <h1 className="mb-3 box-favorite-title">
                <span className="display-6">Mis Favoritos</span>
                <FaHeart className="heart-title" />
            </h1>
            <div className="row">
                {isLoading ? (
                    <div className="col-12">
                        <div className="card card-list">
                            <div className="card-body text-center">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : myFavoriteList.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-warning" role="alert">
                            No hay favoritos añadidos a la lista.
                        </div>
                    </div>
                ) : (
                    myFavoriteList
                        .slice((currentPage - 1) * restaurantsPerPage, currentPage * restaurantsPerPage)
                        .map((restaurant, index) => (
                            <div key={index} className="col-12 mb-2">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-2 col-md-2 position-relative">
                                                <FaHeart className="heart-myfavorite"
                                                    onClick={() =>
                                                        handleDeleteFav(
                                                            restaurant.uid,
                                                            restaurant.restaurantName
                                                        )
                                                    }
                                                />
                                                <img
                                                    src={
                                                        restaurant.photo.image_url
                                                            ? restaurant.photo.image_url
                                                            : defaultProfileImage
                                                    }
                                                    alt="Imagen restaurante"
                                                    className="img-fluid mb-0 custom-img d-none d-md-block"
                                                />
                                            </div>
                                            <div className="col-10 col-md-10">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <button
                                                            className="card-title m-0 custom-button-style"
                                                            onClick={() =>
                                                                handleRestaurantSelection(
                                                                    restaurant.uid
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
                                                                value={parseInt(restaurant.average_rating)}
                                                                edit={false}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="info-box p-1 text-white rounded">
                                                            <div className="info-value text-center">
                                                                { restaurant.average_rating}
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
                        ))
                )}
            </div>
            {pagination()}
        </div>
    );
}

export default FavoriteList;
