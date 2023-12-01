import axios from "axios";

const domain = "http://127.0.0.1:8000/api/";
let request;
let url;

export const mapSearch = (text) => {
  request = "mapSearch";
  url = domain + request;
  const config = {
    params: {
      address: text.trim(),
    },
  };
  return axios.get(url, config);
};

export const searchProvince = () => {
  request = "searchProvince";
  url = domain + request;

  return axios.get(url);
};

export const getCuisines = () => {
  request = "getCuisines";
  url = domain + request;

  return axios.get(url);
};

export const getAllergens = () => {
  request = "getAllergens";
  url = domain + request;

  return axios.get(url);
};

export const addDetails = async (uid, formData) => {
  const request = "post";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };
  return await axios.post(url, formData, config);
};

export const getDetails = async (uid) => {
  const request = "post";
  const url = domain + request;

  const config = {
    params: {
      uid: uid,
    },
  };
  return await axios.get(url, config);
};

export const getRestaurantList = async (date, hour, province, numGuests) => {
  const request = "getRestaurantList";
  const url = domain + request;

  const config = {
    params: {
      date: date,
      hour: hour,
      province: province,
      numGuests: numGuests,
    },
  };

  return await axios.get(url, config);
};


export const getPost = async (uid) => {
  const request = "getPost";
  const url = domain + request;

  const config = {
    params: {
      uid: uid,
    },
  };

  return await axios.get(url, config);
};


export const addToMyFavoriteList = async (uid, idRestaurant) => {
  const request = "myFavoriteList";
  const url = domain + request;

  const formData = new FormData();
  formData.append("idRestaurant", idRestaurant);
  const config = {
    params: {
      uid: uid,
    },
  };
  return await axios.post(url, formData, config);
};

export const removeFromMyFavoriteList = async (uid, idRestaurant) => {
  const request = "myFavoriteList";
  const url = domain + request;

  const formData = new FormData();
  formData.append("idRestaurant", idRestaurant);
  formData.append("uid", uid);

  return await axios.delete(url, { data: formData });
};

export const getMyFavoriteList = async (uid) => {
  const request = "myFavoriteList";
  const url = domain + request;

  const config = {
    params: {
      uid: uid,
    },
  };

  return await axios.get(url, config);
};

export const getRestaurants_by_filters = async (restaurants_id, filters) => {
  const request = "filteredRestaurants";
  const url = domain + request;
  const config = {
    params: {
      restaurants_id: restaurants_id.join(','),
      filters: JSON.stringify(filters),
    },
  };

  return axios.get(url, config);
};


export const addReservation = async (uid, formData) => {
  const request = "reservation";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };
  const requestData = {
    restaurantId: formData.restaurantId,
    date: formData.date,
    numGuests: parseInt(formData.numGuests),
    hour: formData.hour,
  };
  return await axios.post(url, requestData, config);
};



export const get_reservation_restaurant = async (uid, date) => {
  const request = "reservationRestaurant";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
      date: date,
    },
  };

  return axios.get(url, config);
};


export const update_capacity = async (uid, formattedDate, hours, capacities) => {
  const request = "reservationRestaurant";
  const url = domain + request;
  const config = {
    "params": {
      "uid": uid,
    },
  }

  const formData = new FormData();

  formData.append("date", formattedDate);
  formData.append("hours", hours);
  formData.append("capacities", capacities);

  const data = formData;

  return axios.put(url, data, config);
};



export const get_reservation_client = async (uid) => {
  const request = "reservationClient";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };

  return axios.get(url, config);
};



export const cancel_reservation_client = async (uid, restaurantID, date, numGuests, hour, reservationMade) => {
  request = "reservationClient";
  url = domain + request;
  const formData = new FormData();

  formData.append("restaurantID", restaurantID);
  formData.append("date", date);
  formData.append("numGuests", numGuests);
  formData.append("hour", hour);
  formData.append("reservationMade", reservationMade)
  const data = formData;


  const config = {
    "params": {
      "uid": uid,
    },
  }
  return axios.put(url, data, config);
};




export const addReview = async (uid, formData) => {
  const request = "reviewClient";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };
  const requestData = {
    restaurantId: formData.restaurantId,
    date: formData.date,
    rating: parseInt(formData.rating),
    comment: formData.comment,
  };

  return await axios.post(url, requestData, config);
};



export const get_comment_restaurant = async (restaurantId, uid) => {
  const request = "reviewRestaurant";
  const url = domain + request;
  const config = {
    params: {
      restaurantId: restaurantId,
      uid: uid,
    },
  };

  return axios.get(url, config);
};


export const get_comment_client = async (uid) => {
  const request = "reviewClient";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };

  return axios.get(url, config);
};


export const removeReview = async (uid, idRestaurant) => {
  const request = "reviewClient";
  const url = domain + request;

  const formData = new FormData();
  formData.append("idRestaurant", idRestaurant);
  formData.append("uid", uid);

  return await axios.delete(url, { data: formData });
};



export const sendContact = async (formData) => {
  const request = "contact";
  const url = domain + request;

  return await axios.post(url, formData);
};


export const removeFilter = async (restaurants_id) => {
  const request = 'removedRestaurants';
  const url = domain + request;
  const config = {
    params: {
      restaurants_id: restaurants_id.join(','),
    },
  };

  return axios.get(url, config);
};