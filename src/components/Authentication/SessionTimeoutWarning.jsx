import React from 'react';
import useIdleTimeout from '../../hooks/useIdleTimeout';

export default function SessionTimeoutWarning() {
  const { showWarning, remaining, stayLoggedIn, logout } = useIdleTimeout();

  if (!showWarning) return null;

  const totalSeconds = Math.ceil((remaining || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-xl max-w-md w-11/12 shadow-2xl text-center">
        <h3 className="text-xl font-bold text-gray-900">Session Expiring</h3>
        <p className="mt-2 text-gray-600">
          You have been inactive for a while. Your session will expire in 2 minutes.
        </p>
        <p className="mt-4 font-semibold text-red-600 text-lg">
          Session expires in {formattedTime}
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            onClick={stayLoggedIn}
          >
            Cancel
          </button>
          <button
            className="bg-white text-gray-700 border border-gray-300 px-5 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium"
            onClick={() => logout(true)}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
