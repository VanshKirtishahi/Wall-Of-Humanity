import React, { useState, useEffect } from 'react';
import donationService from '../services/donation.service';

const About = () => {
  const [stats, setStats] = useState({
    totalDonations: 0,
    ngoCount: 0,
    volunteerCount: 0,
    userCount: 0,
    requestCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await donationService.getStats();
        
        if (statsData) {
          setStats({
            totalDonations: parseInt(statsData.totalDonations) || 0,
            ngoCount: parseInt(statsData.ngoCount) || 0,
            volunteerCount: parseInt(statsData.volunteerCount) || 0,
            userCount: parseInt(statsData.userCount) || 0,
            requestCount: parseInt(statsData.requestCount) || 0
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array to run only once on mount

  const impactStats = [
    {
      title: 'Total Donations',
      value: stats.totalDonations,
      description: 'Items donated through our platform'
    },
    {
      title: 'NGOs',
      value: stats.ngoCount,
      description: 'Organizations helping the community'
    },
    {
      title: 'Volunteers',
      value: stats.volunteerCount,
      description: 'Active volunteers making a difference'
    },
    {
      title: 'Total Users',
      value: stats.userCount,
      description: 'Members in our community'
    },
    {
      title: 'Request Count',
      value: stats.requestCount,
      description: 'Number of requests made through our platform'
    }
  ];

  const defaultAvatar = (
    <svg 
      className="w-full h-full text-gray-400"
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  );

  const teamMembers = [
    {
      name: "Vansh Kirtishahi",
      role: "Team Lead & Full Stack Developer",
      description: "Leading the technical development and architecture"
    },
    {
      name: "Adinath Jadhav",
      role: "Backend Developer",
      description: "Managing server-side operations and database"
    },
    {
      name: "Varad Gotkhindkar",
      role: "Community Manager",
      description: "Creating responsive and intuitive user interfaces"
    },
    {
      name: "Shreyash Rakhunde",
      role: "UI/UX Designer",
      description: "Designing user experience and visual elements"
    }
  ];

  return (
    <div className="bg-white pt-16">
      {/* Hero Section */}
      <div className="bg-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            About Wall of Humanity
          </h1>
          <p className="text-xl text-center text-purple-200 max-w-3xl mx-auto">
            Making a difference in people's lives through compassion and support
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Founded in 2025, Wall of Humanity began with a simple idea: creating a platform 
              where compassion meets action. We believe that everyone deserves access to basic 
              necessities and opportunities for a better life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">The Beginning</h3>
              <p className="text-gray-600">
                Started as a small community initiative to help local families in need, 
                we've grown into a platform that connects donors, volunteers, and NGOs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Our Growth</h3>
              <p className="text-gray-600">
                Through partnerships with NGOs and dedicated volunteers, we've expanded 
                our reach to help thousands of people across multiple cities.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-600 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Looking Forward</h3>
              <p className="text-gray-600">
                We continue to innovate and expand our services, always focusing on 
                making help more accessible to those who need it most.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Impact</h2>
          {error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {impactStats.map((stat) => (
                <div key={stat.title} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900">{stat.title}</h3>
                  <div className="mt-2 text-3xl font-bold text-purple-600">
                    {loading ? (
                      <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{stat.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-purple-600 mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                To create a world where everyone has access to basic necessities and 
                opportunities for growth. Through our platform, we connect donors with 
                those in need, making it easier for communities to support each other.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Facilitating direct assistance to those in need
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Building sustainable community support systems
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Empowering local communities through collaboration
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-purple-600 mb-6">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We envision a future where no one has to struggle for basic necessities, 
                where communities are empowered to help each other, and where technology 
                bridges the gap between those who want to help and those who need it.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Creating a self-sustaining support ecosystem
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Expanding our reach to more cities and communities
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                  Leveraging technology for maximum social impact
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden relative">
                <img
                  src="/images/team/vansh.jpeg"
                  alt="Vansh - Founder & CEO"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Vansh Kirtishahi</h3>
              <p className="text-purple-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden relative">
                <img
                  src="/images/team/Shreyash.jpg"
                  alt="Shreyash - UI/UX Designer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Shreyash Rakhunde</h3>
              <p className="text-purple-600">UI/UX Designer</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden relative">
                <img
                  src="/images/team/Adinath.jpeg" // image takaychi ahe 
                  alt="Adinath - Community Manager"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Adinath Jadhav</h3>
              <p className="text-purple-600">Backend Developer</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden relative">
                <img
                  src="/images/team/varad.jpeg"
                  alt="Vedant - Backend Developer"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Varad Gotkhindkar</h3>
              <p className="text-purple-600">Community Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

