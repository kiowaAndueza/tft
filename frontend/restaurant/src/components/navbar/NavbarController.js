import React from "react";
import ClientNavbar from "./ClientNavbar";
import RestaurantNavbar from "./RestaurantNavbar";
import UserNavbar from "./UserNavbar";

const getMenuByUserType = (userType) => {
  switch (userType) {
    case "restaurant":
      return <RestaurantNavbar />;
    case "client":
      return <ClientNavbar />;
    default:
      return <UserNavbar />;
  }
};

export default getMenuByUserType;
