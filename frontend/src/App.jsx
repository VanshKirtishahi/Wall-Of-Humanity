import React from 'react'
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ScrollToTop from './utils/ScrollToTop';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import InfoCard from './components/home/InfoCard';
import WhoWeAre from './components/home/WhoWeAre';
import About from './components/About';
import ContactForm from './components/forms/ContactForm';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Settings from './components/Settings';
import DonationForm from './components/forms/DonationForm';
import RequestForm from './components/forms/RequestForm';
import MyDonations from './components/donations/MyDonations';
import VolunteerForm from './components/forms/VolunteerForm';
import NGOForm from './components/forms/NGOForm';
import DonationCart from './components/donations/DonationCart';
import PrivateRoute from './components/auth/PrivateRoute';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import FreeFoodForm from './components/forms/FreeFoodForm';
import FreeFoodListings from './components/listings/FreeFoodListings';
import FreeFoodCart from './components/donations/FreeFoodCart';
// import '../config/emailjs';

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <InfoCard />
                <WhoWeAre />
                <FreeFoodCart />
                <DonationCart />
              </>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/settings" element={<Settings />} />
            <Route 
              path="/donation-form" 
              element={
                <PrivateRoute>
                  <DonationForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/donation-form/:id" 
              element={
                <PrivateRoute>
                  <DonationForm />
                </PrivateRoute>
              } 
            />
            <Route path="/request-form" element={<RequestForm />} />
            <Route 
              path="/my-donations" 
              element={
                <PrivateRoute>
                  <MyDonations />
                </PrivateRoute>
              } 
            />
            <Route path="/volunteer-form" element={<VolunteerForm />} />
            <Route path="/ngo-registration" element={<NGOForm />} />
            <Route path="/donation-cart" element={<DonationCart />} />
            <Route path="/free-food" element={<FreeFoodListings />} />
            <Route path="/free-food/new" element={<PrivateRoute><FreeFoodForm /></PrivateRoute>} />
            <Route path="/free-food/edit/:id" element={<PrivateRoute><FreeFoodForm /></PrivateRoute>} />
            <Route path="/free-food-form" element={
              <PrivateRoute>
                <FreeFoodForm />
              </PrivateRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App




