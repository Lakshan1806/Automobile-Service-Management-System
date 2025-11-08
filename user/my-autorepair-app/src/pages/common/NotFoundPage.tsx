
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-brand-blue">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link 
        to="/"
        className="mt-6 px-6 py-2 text-sm font-medium text-white bg-brand-blue rounded-md hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
