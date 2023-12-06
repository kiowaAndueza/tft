import React, { useEffect } from "react";
import CommentList from "../commentList/CommentList";
import authProvider from "../../auth/authProvider";
import { useNavigate } from "react-router-dom";
import "./RestaurantReview.css";

function RestaurantReview() {
  const navigate = useNavigate();

  const redirectToPath = async (path) => {
    await navigate(path);
  };

  const checkPermission = async () => {
    const permissions = await authProvider.getPermissions();
    const hasPermission = permissions.includes("restaurantComment");

    if (!hasPermission) {
      redirectToPath("/home");
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return (
    <div className="m-5 restaurant-review-container container">
      <h1 className="reservation-title col-12 col-md-auto ms-3 mb-4">
        Reseñas
      </h1>
      <div className="comment-list-content col-10 ms-0">
        <CommentList />
      </div>
    </div>
  );
}

export default RestaurantReview;
