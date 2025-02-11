import React from 'react';
import { useNavigate } from 'react-router-dom';

const InfoCard = ({ onNGORegistered }) => {
  const navigate = useNavigate();

  const handleVolunteerClick = () => {
    navigate('/volunteer-form');
  };

  const handleNGOClick = () => {
    navigate('/ngo-registration');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Our Mission Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:bg-purple-600 hover:text-white transition-all duration-300 group">
          <div className="mb-4">
            <svg 
              className="w-12 h-12 mx-auto text-purple-600 group-hover:text-white transition-colors duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-white">Our Mission</h3>
          <p className="text-gray-600 mb-4 group-hover:text-white">
            To create a world where no one goes hungry or without basic necessities. 
            We connect donors with those in need, making it easier for communities 
            to support each other through direct assistance.
          </p>
        </div>

        {/* Become a Volunteer Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:bg-purple-600 hover:text-white transition-all duration-300 group">
          <div className="mb-4">
            <svg 
              className="w-12 h-12 mx-auto text-purple-600 group-hover:text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4">Become a Volunteer</h3>
          <p className="text-gray-600 mb-4 group-hover:text-white">
            Join our community of dedicated volunteers who make a difference. 
            Help collect and distribute donations, coordinate with donors, 
            and support those in need.
          </p>
          <button 
            onClick={handleVolunteerClick}
            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-300 group-hover:bg-white group-hover:text-purple-600"
          >
            Join Us
          </button>
        </div>

        {/* NGO Partnership Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:bg-purple-600 hover:text-white transition-all duration-300 group">
          <div className="mb-4">
            <svg 
              className="w-12 h-12 mx-auto text-purple-600 group-hover:text-white transition-colors duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-white">NGOs Partnership</h3>
          <p className="text-gray-600 mb-4 group-hover:text-white">
            Partner with us to expand your reach and impact. We provide a platform 
            for NGOs to connect with donors and volunteers, streamlining the 
            process of helping those in need.
          </p>
          <button 
            onClick={handleNGOClick}
            className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition-colors duration-300 group-hover:bg-white group-hover:text-purple-600"
          >
            Register NGO
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;