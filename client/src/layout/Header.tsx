// src/components/layout/Header.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- NEW: Import useAuth hook
import { useScreeningLoading } from '../context/ScreenLoadingContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  // 1. Get authentication status and actions from the global context
  const { isAuthenticated, user, logout } = useAuth();
  const { isScreeningLoading } = isAuthenticated ? useScreeningLoading() : { isScreeningLoading: false };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        {/* Logo/Title: Use Link to navigate back to the home page */}
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-3xl font-extrabold text-blue-600 transition duration-150">
            ResumeWise
          </h1>
        </Link>
        
        <div className='flex items-center space-x-6'>
            <nav className="hidden md:block">
                <ul className="flex space-x-8">
                    {/* Use Link or smooth scrolling to sections */}
                    {!isAuthenticated && (
                      <li><a href="#" className="text-gray-600 hover:text-blue-600 font-medium">Features</a></li>
                    )}
                    {!isAuthenticated && (
                      <li><a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium">Testimonials</a></li>
                    )}
                </ul>
            </nav>
            
            {/* 2. Conditional Rendering for Auth Buttons */}
            <div className="hidden md:block">
                {isAuthenticated ? (
                    // --- Logged In State ---
                    <div className="flex items-center space-x-3">
                        {/* Display User Information (Name/Email) */}

                        {user && (<div className="text-right leading-snug">
                            <p className="text-md font-semibold text-gray-800">Hi, {user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>)}
                        
                        {/* Logout Button */}
                        <Button 
                            variant="outline" 
                            onClick={logout} // Call the logout function from context
                            className="text-red-600 border-red-400 hover:bg-red-50"
                            isLoading={isScreeningLoading} // <-- Use the global loading state
                            message='Logout'
                            logout={true}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    // --- Logged Out State ---
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/auth')}
                    >
                        Login / Signup
                    </Button>
                )}
            </div>
        </div>
        {/* Mobile menu button could go here */}
      </div>
    </header>
  );
};

export default Header;