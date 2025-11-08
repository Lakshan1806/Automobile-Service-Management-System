import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6 sm:p-12 text-center">
        <UserCircleIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300" />
        <h2 className="mt-4 text-lg sm:text-xl font-semibold text-gray-700">Profile Management Coming Soon</h2>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          Here you will be able to view and update your skills, certifications, availability blocks, and personal contact information.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;