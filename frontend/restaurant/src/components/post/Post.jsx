import React, { useEffect, useState } from "react";
import "./Post.css";
import { getPost } from "../../services/apiService";
import { errorMessage } from "../messages/Messages";
import { FaLocationDot, FaPhoneFlip } from "react-icons/fa6";
import { RiMoneyEuroBoxLine } from "react-icons/ri";
import { BiDish } from "react-icons/bi";
import { Carousel } from "react-bootstrap";
import { MapComponent } from "../map/Map";
import ReservationForm from "../reservationForm/ReservationForm";
import RatingComponent from "../ratingComponent/RatingComponent";
import CommentList from "../commentList/CommentList";
import Rating from 'react-rating-stars-component';


function Post(props) {
  const [post, setPost] = useState({
    restaurantName: "",
    street: "",
    number: "",
    province: "",
    city: "",
    price: "",
    cp: "",
    latitude: "",
    longitude: "",
    email: "",
    phone: "",
    description: "",
    allergens: [],
    cuisines: [],
    opening_hours: [],
    menu: [],
    photos: [],
  });

  const [showRatingModal, setShowRatingModal] = useState(false);

  const [isRestaurantLoaded, setIsRestaurantLoaded] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const idRestaurant = localStorage.getItem("idRestaurant");

  useEffect(() => {
    if (idRestaurant) {
      getPost(idRestaurant)
        .then((response) => {
          if (response.data.restaurant) {
            const restaurantData = response.data.restaurant;
            setTotalComments(restaurantData.total_comments);
            setAverageRating(restaurantData.average_rating);
            console.log(restaurantData);
            setPost({
              restaurantName: restaurantData.restaurantName,
              street: restaurantData.street,
              number: restaurantData.number,
              province: restaurantData.province,
              city: restaurantData.city,
              cp: restaurantData.cp,
              price: restaurantData.price,
              latitude: restaurantData.latitude,
              longitude: restaurantData.longitude,
              email: restaurantData.email,
              phone: restaurantData.phone,
              description: restaurantData.description,
              allergens: restaurantData.allergens,
              cuisines: restaurantData.cuisines,
              menu: restaurantData.menu,
              opening_hours: restaurantData.opening_hours,
              photos: restaurantData.photos,
            });
            setIsRestaurantLoaded(true);
          }
        })
        .catch((error) => {
          errorMessage("Error al obtener el post");
        });
    }
  }, [idRestaurant]);

  const handleShowRatingModal = () => {
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
  };


  return (
    <div className="container container-post mt-5">
      {isRestaurantLoaded ? (
        <div className="ms-2">
          <div className="row d-flex align-items-center flex-wrap">
            <h1 className="ms-1 col-12 col-sm-auto mt-1">{post.restaurantName}</h1>
            <div className="col-12 col-sm-auto">
              <Rating
                count={5}
                size={35}
                value={averageRating}
                edit={false}
              />
            </div>
          </div>
          <div className="row mt-1">
            <div className="col-12 col-sm-12 col-md-6 text-justify">
              <FaLocationDot className="icon-post ms-1" /> c/{post.street},{" "}
              {post.number}, {post.city}, {post.cp}, {post.province}
            </div>
            <div className="col-12 phone-post col-sm-12 col-md-6">
              <FaPhoneFlip className="icon-post me-1" />
              {post.phone}
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 col-sm-12 col-md-6 restriction-post">
              <BiDish className="icon-post me-1 ms-1" />
              {post.cuisines.map((cuisine, index) => (
                <span
                  className="badge text-food-restriction-post me-2"
                  key={index}
                >
                  {cuisine}
                  {index !== post.cuisines.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
            <div className="col-12 col-sm-12 col-md-6 restriction-post">
              <RiMoneyEuroBoxLine className="icon-post me-1" />
              {post.price}-{parseFloat(post.price) + 8}€
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12 col-sm-12 col-md-7 mt-3">
              <Carousel className="carousel">
                {post.photos.map((photo, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block image-carousel"
                      src={photo}
                      alt={`Imagen ${index}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
              <div className="row mt-3 mb-2">
                <div className="col-12 col-sm-12 col-md-6 restriction-post">
                  {post.allergens && post.allergens.length > 0 && (
                    <>
                      {post.allergens.map((allergen, index) => (
                        <span
                          className="badge text-food-restriction-post me-1"
                          key={index}
                        >
                          {allergen}
                          {index !== post.allergens.length - 1 ? " " : ""}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="row mb-3 text-justify">
                <div className="col-12 justify-content col-sm-12 col-md-12 text-justify">
                  {post.description}
                </div>
              </div>
              <div className="row mt-3 mb-2 hour-post-container">
                <h3 className="search-title-filter schedule">Horario:</h3>
                <div className="mt-0 warning-text">(las reservas se deben de realizar mínimo 1h previa al cierre)</div>
                <div className="col-12 col-sm-12 col-md-6 restriction-post">
                  {post.opening_hours.map((openingHour, index) => (
                    <div key={index}>
                      {openingHour.day}: {openingHour.start_time} - {openingHour.end_time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-5 reservation-container">
              <div className="row">
                <div className="col-12 mb-3">
                  <ReservationForm />
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <MapComponent
                    latitude={post.latitude}
                    longitude={post.longitude}
                    name={post.restaurantName}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-11 menu-post">
              <h2 className="m-3 col-12 mb-0">CARTA</h2>
              <ul className="list-group ms-3 ps-1">
                {post.menu
                  .sort((a, b) => {
                    const order = ["Entrantes", "Platos", "Postres", "Bebidas"];
                    const indexA = order.indexOf(a.category);
                    const indexB = order.indexOf(b.category);
                    return indexA - indexB;
                  })
                  .map((item, index, menu) => (
                    <div key={index}>
                      {index === 0 ||
                        menu[index - 1].category !== item.category ? (
                        <h4 className="mt-4 col-12 mb-2">{item.category}</h4>
                      ) : null}
                      <li className="list-group-item me-2">
                        <div className="row me-2">
                          <div className="col-12">
                            <span className="text-sm">
                              <strong>{item.name}</strong>
                            </span>
                          </div>
                          <div className="col-12 mt-1">
                            <span className="text-sm">{item.quantity}</span>
                          </div>
                          <div className="col-12 mt-1">
                            <span className="text-sm">{item.price}€</span>
                          </div>
                        </div>
                      </li>
                    </div>
                  ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="row mt-4">
              <div className="col-8 mt-3 total-comments">
                <small className="">Total:
                  {totalComments !== undefined && totalComments !== null && totalComments !== 0
                    ? `${totalComments}  Opiniones`
                    : ' Sin opiniones'}
                </small>
              </div>
              <div className="col-4 d-flex justify-content-end btn-comment-container">
                <button className="btn btn-primary btn-comment " onClick={handleShowRatingModal}>Calificar</button>
              </div>
            </div>
            <div>
              {showRatingModal && (
                <RatingComponent show={showRatingModal} handleClose={handleCloseRatingModal} />
              )}
            </div>

            <div>
              <CommentList />
            </div>

          </div>
        </div >

      ) : (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )
      }
    </div >
  );

}
export default Post;
