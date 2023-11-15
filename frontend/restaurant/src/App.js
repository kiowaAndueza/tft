import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/home/Home';
import Footer from './components/footer/Footer';
import Navbar from './components/navbar/Navbar';
import RegistrationSelection from './components/registrationSelection/RegistrationSelection';
import LoginForm from './components/loginForm/LoginForm';
import { ClientForm } from './components/clientForm/ClientForm';
import { RestaurantForm } from './components/restaurantForm/RestaurantForm';
import RestaurantProfile from './components/restaurantProfile/RestaurantProfile';
import ClientProfile from './components/clientProfile/ClientProfile';
import PageNotFound from './components/pageNotFound/PageNotFound';
import RestaurantDetailsForm from './components/restaurantDetailsForm/RestaurantDetailsForm';
import RestaurantList from './components/restaurantList/RestaurantList';
import Post from './components/post/Post';
import FavoriteList from './components/favoriteList/FavoriteList';
import ReservationList from './components/reservationList/ReservationList';
import RestaurantReview from './components/restaurantReview/RestaurantReview';
import ClientReview from './components/clientReview/ClientReview';
import ContactForm from './components/contactForm/ContactForm'

function App() {
  const userId = localStorage.getItem('userId');

  return (
    <div className='app'>
      <Navbar />
      <main>
        <Router>
          <Routes>
            <Route path='/' element={<Navigate to="/home" />} />
            <Route exact path='/home' element={<Home />}></Route>
            <Route exact path="/register" element={<RegistrationSelection />} />
            <Route exact path="/register/client" element={<ClientForm />} />
            <Route exact path="/register/restaurant" element={<RestaurantForm />} />
            <Route exact path="/login" element={<LoginForm />} />
            <Route exact path="/restaurant/details" element={<RestaurantDetailsForm />} />
            <Route exact path={`/restaurant/profile/${userId}`} element={<RestaurantProfile />} />
            <Route exact path="/search_restaurants" element={<RestaurantList />} />
            <Route exact path="/myFavoriteList" element={<FavoriteList />} />
            <Route exact path={`/client/profile/${userId}`} element={<ClientProfile />} />
            <Route exact path='/restaurant/:restaurantId' element={<Post />} />
            <Route exact path={`/reviews/${userId}`} element={<RestaurantReview />} />
            <Route exact path={`/my-reviews/${userId}`} element={<ClientReview />} />
            <Route exact path='/reservations' element={<ReservationList />} />
            <Route exact path='/contact' element={<ContactForm />} />
            <Route exact path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </main>
      <Footer />
    </div >
  );
}

export default App;
