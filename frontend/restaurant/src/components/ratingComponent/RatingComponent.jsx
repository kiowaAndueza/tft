import React, { useState } from 'react';
import Rating from 'react-rating-stars-component';
import Modal from 'react-bootstrap/Modal';
import "./RatingComponent.css";
import { addReview } from '../../services/apiService';
import { errorMessage, successfulMessage } from '../messages/Messages';
import { MinCharactersConstraint } from "../../validator/minCharactersConstraint";
import { MaxCharactersConstraint } from "../../validator/maxCharactersConstraint";

function RatingComponent({ show, handleClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const restaurantId = localStorage.getItem("idRestaurant");
  const uid = localStorage.getItem("userId");
  const type = localStorage.getItem("userType");
  const [errorMessages, setErrorMessages] = useState({
    comment: "",
    rating: ""
  });

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setErrorMessages({ ...errorMessages, rating: "" });
  };

  const handleCommentChange = (event) => {
    const value = event.target.value;
    setComment(value);

    const minCharsConstraintName = new MinCharactersConstraint(
      "El comentario",
      value.trim(),
      20
    );
    const maxCharsConstraintName = new MaxCharactersConstraint(
      "El comentario",
      value.trim(),
      500
    );
    setErrorMessages({
      ...errorMessages,
      comment: minCharsConstraintName.test() || maxCharsConstraintName.test(),
    });
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  const handleSave = async () => {
    setErrorMessages({ comment: "", rating: "" });

    if (type !== "client") {
      errorMessage("Solo los clientes registrados pueden realizar reseñas");
      handleClose();
      return;
    }

    if (comment.trim().length >= 20 && comment.trim().length <= 500 && rating > 0) {
      try {
        const response = await addReview(uid, {
          restaurantId: restaurantId,
          date: formattedDate,
          rating: rating,
          comment: comment,
        });
        if (response.data.message) {
          return errorMessage(response.data.message);
        }
        successfulMessage('Se ha añadido tu reseña correctamente');
        window.location.reload();
      } catch (error) {
        errorMessage("Debes iniciar sesión para realizar la reserva");
      }

      handleClose();
    } else {
      if (!comment.trim().length > 0 && !comment.trim().length <= 500) {
        setErrorMessages({
          comment: "El comentario debe tener de 20-500 caracteres.",
        });
      }

      if (rating <= 0) {
        setErrorMessages({
          rating: "Debes evaluar la calidad del servicio.",
        });
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Reseña</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div>
            <label>Calificación (*)</label>
            <div>
              <Rating
                count={5}
                size={30}
                value={rating}
                onChange={handleRatingChange}
              />
            </div>
          </div>
        </div>
        <div className="errorMessage">{errorMessages.rating}</div>

        <div className='row mt-3'>
          <label className='col-12'>Comentario (*)</label>
          <textarea
            className='col-11 ms-2 mt-3 rating-textarea'
            placeholder="Escribe tu comentario..."
            rows="8"
            value={comment}
            onChange={handleCommentChange}
          />
          <div className="errorMessage">{errorMessages.comment}</div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-primary col-12 btn-rating" onClick={handleSave}>
          Guardar
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default RatingComponent;
