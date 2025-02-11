import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false); // Close dropdown
    navigate('/settings');
  };

  const handleLoginClick = () => {
    setIsOpen(false); // Close mobile menu if open
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Donations', path: '/donations' },
    { name: 'My Donations', path: '/my-donations' },
    { name: 'Free Food', path: '/free-food' },
  ];

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              onClick={handleHomeClick}
              className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Wall of Humanity
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  <span>Welcome, {user?.name || 'User'}</span>
                  <FiChevronDown className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser className="mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/my-donations"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser className="mr-3" />
                      My Donations
                    </Link>
                    <Link
                      to="/free-food"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser className="mr-3" />
                      Free Food
                    </Link>
                    <button
                      onClick={handleSettingsClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                    >
                      <FiSettings className="mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                    >
                      <FiLogOut className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Login
                </button>
                <Link
                  to="/register"
                  className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-purple-600 focus:outline-none"
            >
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            onClick={(e) => {
              handleHomeClick(e);
              setIsOpen(false);
            }}
            className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Profile
              </Link>
              <Link
                to="/my-donations"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                My Donations
              </Link>
              <Link
                to="/free-food"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Free Food
              </Link>
              <button
                onClick={handleSettingsClick}
                className="text-gray-600 hover:text-purple-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-purple-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Login
              </button>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;