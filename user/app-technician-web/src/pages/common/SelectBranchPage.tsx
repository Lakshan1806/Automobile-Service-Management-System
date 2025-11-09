
import React from 'react';

const SelectBranchPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Select Your Branch</h2>
          <p className="mt-2 text-sm text-gray-600">Choose the branch you want to manage for this session.</p>
        </div>
        {/* Branch selection logic would go here */}
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Branch selection feature coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default SelectBranchPage;
