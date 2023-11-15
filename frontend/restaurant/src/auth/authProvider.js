
export const authProvider = {
  getPermissions: async () => {
    const userType = localStorage.getItem("userType") || "";

    let permissions = [];
    if (userType === "restaurant") {
      permissions = ["logout", "details", "reservations", "restaurantComment"];
    } else if (userType === "client") {
      permissions = ["logout", "myFavoriteList", "reservations", "clientComment"];
    } else if (userType === "") {
      permissions = ["register", "login"];
    }

    return Promise.resolve(permissions);
  },
};


export default authProvider;
