// src/components/layout/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex justify-between items-center">
        <p>&copy; {new Date().getFullYear()} ResumeWise. All rights reserved.</p>
        <div className="flex justify-center space-x-6 text-sm items-center">
          <a href="#" className="hover:text-blue-400">Privacy Policy</a>
          <a href="#" className="hover:text-blue-400">Terms of Service</a>
          <a href="#" className="hover:text-blue-400">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;