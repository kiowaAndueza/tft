import React, { useEffect, useState } from 'react';
import authProvider from "../../auth/authProvider";
import { useNavigate } from 'react-router-dom';
import "./ClientReview.css";
import Rating from 'react-rating-stars-component';
import { get_comment_client, removeReview } from '../../services/apiService';
import { confirmationMessage, errorMessage, successfulMessage } from '../messages/Messages';
import { FaTrash } from "react-icons/fa";


function ClientReview() {
    const navigate = useNavigate();

    const redirectToPath = async (path) => {
        await navigate(path);
    };

    const checkPermission = async () => {
        const permissions = await authProvider.getPermissions();
        const hasPermission = permissions.includes("clientComment");

        if (!hasPermission) {
            redirectToPath("/home");
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);


    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentsPerPage] = useState(10);

    const uid = localStorage.getItem('userId');

    useEffect(() => {
        get_comment_client(uid)
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
    }, [uid]);

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



    const handleDelete = (restaurantId) => {
        confirmationMessage("¿Estás seguro de que deseas eliminar este comentario?")
            .then((result) => {
                if (result.isConfirmed) {
                    removeReview(uid, restaurantId)
                        .then(() => {
                            get_comment_client(uid)
                                .then((response) => {
                                    if (response.data.length === 0) {
                                        setComments([]);
                                    } else {
                                        setComments(response.data);
                                    }
                                    successfulMessage("La reseña ha sido eliminada correctamente");
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
        <div className='m-5 restaurant-review-container container ms-4'>
            <h1 className="reservation-title col-12  ms-5 mb-4">Mis Reseñas</h1>
            <div className='comment-list-content'>
                <div className='m-2'>
                    {currentComments.length === 0 ? (
                        <div className="mt-3 col-12">
                            <div className="alert alert-warning review-none-text" role="alert">
                                No hay reseñas.
                            </div>
                        </div>
                    ) : (
                        <div className="comment-list-content col-10 col-md-12 ms-0">
                            {currentComments.map((comment, index) => (
                                <div className="card mt-3 card-review-restaurant" key={index}>
                                    <div className="card-body">
                                        <div className="row m-1">
                                            <div className="col-12">
                                                <div className="media">
                                                    <div className="media-body">
                                                        <div className="row">
                                                            <h5 className="card-title col-md-6">{comment.nameRestaurant}</h5>
                                                            <p className="card-text col-md-6 d-flex justify-content-md-end">Fecha: {comment.date}</p>
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
                                                            <button
                                                                className="btn btn-link text-danger card-text col-12 d-flex justify-content-md-end"
                                                                onClick={() => handleDelete(comment.restaurantId)}
                                                            >
                                                                <FaTrash />
                                                            </button>
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
            </div>
        </div>

    );
}

export default ClientReview;