import React, { useState, useEffect } from 'react';
import { managerService } from '../../services/api';
import { Technician, PaginatedResponse } from '../../types';
import StatusChip from '../../components/ui/StatusChip';

const TechniciansPage: React.FC = () => {
  const [techResponse, setTechResponse] = useState<PaginatedResponse<Technician> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        const response = await managerService.getTechnicians(1, 10);
        setTechResponse(response);
      } catch (err) {
        setError('Failed to fetch technicians.');
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Technicians</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            {loading && <p className="p-4">Loading...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}
            {techResponse && (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Load</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointed Works</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {techResponse.data.map((tech) => (
                    <tr key={tech.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={tech.photo} alt={tech.name} />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{tech.name}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={tech.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tech.todayLoad} jobs</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {tech.appointedWorks.length === 0 ? (
                            <span className="text-gray-400">No active appointments</span>
                        ) : (
                            <div className="space-y-1">
                                {tech.appointedWorks.map((work) => (
                                    <div key={`${work.startDate}-${work.endDate}`}>
                                        {work.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default TechniciansPage;
