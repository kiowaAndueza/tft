import axios from "axios";
import CryptoJS from "crypto-js";
import { authentication } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, signOut, updatePassword } from "firebase/auth";

const domain = "http://127.0.0.1:8000/api/";
let request;
let url;

const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export const restaurantRegister = (formData) => {
  request = "users/authRestaurant";
  url = domain + request;
  const { confirmPassword, password, ...data } = formData;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Password": hashPassword(password),
    },
  };
  console.log(data)
  return axios.post(url, JSON.stringify(data), config);
};


export const getRestaurant = (uid) => {
  request = "users/authRestaurant";
  url = domain + request
  const config = {
    params: {
      uid: uid,
    },
  };
  return axios.get(url, config);

}


export const getUserType = (uid) => {
  request = "users/getTypeUser";
  url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };
  return axios.get(url, config);
};

export const clientRegister = (formData) => {
  request = "users/authClient";
  url = domain + request;
  const { confirmPassword, password, ...data } = formData;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Password": hashPassword(password),
    },
  };
  return axios.post(url, JSON.stringify(data), config);
};

export const getClient = (uid) => {
  request = "users/authClient";
  url = domain + request
  const config = {
    params: {
      uid: uid,
    },
  };
  return axios.get(url, config);

}

export const login = async (email, password) => {
  try {
    const response = await signInWithEmailAndPassword(authentication, email, hashPassword(password));
    return response.user;
  } catch (error) {
    
  }
};

export const logout = async () => {
  try {
    await signOut(authentication);
    return { status: 200 };
  } catch (error) {
    throw error;
  }
};


export const updateRestaurant = async (uid, formData) => {
  const request = "users/authRestaurant";
  const url = domain + request;
  const config = {
    params: {
      uid: uid,
    },
  };
  console.log(formData.get('profileImage'));
  return axios.put(url, formData, config);
};



export const changePassword = async (newPassword) => {
  const user = authentication.currentUser;
  try {
    await updatePassword(user, hashPassword(newPassword));
    return newPassword;
  } catch (error) {
    console.log(error)
  };
}


export const updateClient = async (uid, formData) => {
  const request = "users/authClient";
  const url = domain + request;
  const data = formData;
  const config = {
    params: {
      uid: uid,
    },
  };
  return axios.put(url, data, config);
};