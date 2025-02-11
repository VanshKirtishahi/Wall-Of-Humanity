import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleDonateClick = () => {
    if (!user || !isAuthenticated) {
      if (window.confirm('Please login or register to donate. Would you like to login now?')) {
        navigate('/login');
      }
      return;
    }
    navigate('/donation-form');
  };

  return (
    <div className="relative h-[70vh]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          alt="Donation"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full">
        <div className="flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Make a difference with</span>
              <span className="block text-purple-300">your donation</span>
            </h1>
            <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
              Join us in helping those in need. Your donations can change lives and bring hope to communities.
            </p>
            <div className="mt-5 sm:mt-8 flex justify-center">
              <div className="rounded-md shadow">
                <button
                  onClick={handleDonateClick}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10"
                >
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;