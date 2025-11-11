import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LocationMap from './tracking/LocationMap';
import { useLocationWatcher } from './tracking/PollTechnicianLocation';
import { useCustomerLocation } from './tracking/PollCustomerLocation';

const TrackPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();

  const technicianId = user?.id || '';
  const currentLocation = useLocationWatcher({ requestId: requestId || '', technicianId });
  const customerLocation = useCustomerLocation({ requestId: requestId || '' });

  if (!requestId) {
    return <div className="p-4 text-red-600">Missing request id for tracking.</div>;
  }

  return (
    <div className="h-dvh">
      <LocationMap currentLocation={currentLocation} customerLocation={customerLocation} />
    </div>
  );
};

export default TrackPage;

