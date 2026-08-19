import React, { createContext, useContext, useState } from 'react';

const GymContext = createContext();

export const GymProvider = ({ children }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 4000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.id === toast?.id ? null : current));
    }, duration);
  };

  const closeToast = () => setToast(null);

  return (
    <GymContext.Provider
      value={{
        isScannerOpen,
        setIsScannerOpen,
        isKioskOpen,
        setIsKioskOpen,
        toast,
        showToast,
        closeToast,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => useContext(GymContext);
