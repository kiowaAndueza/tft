import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


export const authConfig = {
  apiKey: "AIzaSyDXUjaLXojOILuEIShtzTmWR79eApMLGyY",
  authDomain: "restaurantdb-c67cf.firebaseapp.com",
  projectId: "restaurantdb-c67cf",
  storageBucket: "restaurantdb-c67cf.appspot.com",
  messagingSenderId: "519650639726",
  appId: "1:519650639726:web:f9a1843c21101fc8c68b7f",
  measurementId: "G-48C2GNH4G7"
};

export const firebaseApp = initializeApp(authConfig);

export const authentication = getAuth();

export default firebaseApp;