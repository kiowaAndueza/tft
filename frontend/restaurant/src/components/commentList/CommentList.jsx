import React, { useState, useEffect } from 'react';
import { get_comment_restaurant, removeReview } from '../../services/apiService';
import "./CommentList.css";
import defaultProfileImage from '../../assets/userDefault.jpg';
import Rating from 'react-rating-stars-component';
import { FaTrash } from "react-icons/fa";
import { confirmationMessage, errorMessage, successfulMessage } from '../messages/Messages';

function CommentList() {
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentsPerPage] = useState(10);
    const restaurantId = localStorage.getItem('idRestaurant');
    const type = localStorage.getItem("userType");
    let uid = null;

    if (type === "client") {
        uid = localStorage.getItem('userId');
    }

    useEffect(() => {
        get_comment_restaurant(restaurantId, uid)
            .then((response) => {
                if (response.data.length === 0) {
                    setComments([]);
                } else {
                    setComments(response.data);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }, [restaurantId, uid]);

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);

    const pagination = () => {
        const totalItems = comments.length;
        const totalPages = Math.ceil(totalItems / commentsPerPage);

        const handlePageChange = (page) => {
            setCurrentPage(page);
        };

        const visiblePages = 5;
        const pages = [];
        const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        const endPage = Math.min(totalPages, startPage + visiblePages - 1);

        if (!(totalItems > commentsPerPage)) {
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
            <li key="previous" className={`page-item ${previous_page ? "" : "disabled"}`}>
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
                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
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


    const handleDelete = () => {
        confirmationMessage("¿Estás seguro de que deseas eliminar este comentario?")
            .then((result) => {
                if (result.isConfirmed) {
                    removeReview(uid, restaurantId)
                        .then(() => {
                            get_comment_restaurant(restaurantId, uid)
                                .then((response) => {
                                    if (response.data.length === 0) {
                                        setComments([]);
                                    } else {
                                        setComments(response.data);
                                    }
                                    successfulMessage("La reseña ha sido eliminada correctamente");
                                    window.location.reload();
                                })
                                .catch((error) => {
                                    errorMessage("Error al obtener los comentarios");
                                });
                        })
                        .catch((error) => {
                            errorMessage("Error al eliminar la reseña");
                        });
                }
            });
    };

    return (
        <div className='m-2'>
            {currentComments.length === 0 ? (
                <div className="mt-3 col-12">
                    <div className="alert alert-warning review-none-text" role="alert">
                        No hay reseñas.
                    </div>
                </div>
            ) : (
                <div className="comment-list">
                    {currentComments.map((comment, index) => (
                        <div className="card mt-3 card-review-restaurant" key={index}>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-1">
                                        <div className="rounded-image-container">
                                            <img
                                                src={comment.imageClient || defaultProfileImage}
                                                className="align-self-start image-comment rounded"
                                                alt="Imagen de perfil del cliente"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-11">
                                        <div className="media">
                                            <div className="media-body">
                                                <div className="row">
                                                    <h5 className="card-title col-6">{comment.nameClient}</h5>
                                                    <p className="card-text col-6 d-flex justify-content-end">Fecha: {comment.date}</p>
                                                </div>
                                                <div className='rating-comment-client'>
                                                    <Rating
                                                        count={5}
                                                        size={22}
                                                        value={comment.rating}
                                                        edit={false}
                                                    />
                                                </div>
                                                <p className="card-text">{comment.comment}</p>
                                                <div className="row">
                                                    {comment.clientId === uid && (
                                                        <button
                                                            className="btn btn-link text-danger card-text col-12 d-flex justify-content-end"
                                                            onClick={() => handleDelete()}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className='mt-4'>
                {comments.length > commentsPerPage && pagination()}
            </div>
        </div>
    );
}

export default CommentList;
