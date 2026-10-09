import React, { createContext, useContext, useState } from 'react';
import RegistrationClosedModal from '../components/RegistrationClosedModal';

const RegistrationModalContext = createContext({
  isOpen: false,
  openRegistrationModal: () => {},
  closeRegistrationModal: () => {},
});

export const RegistrationModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openRegistrationModal = () => setIsOpen(true);
  const closeRegistrationModal = () => setIsOpen(false);

  return (
    <RegistrationModalContext.Provider
      value={{
        isOpen,
        openRegistrationModal,
        closeRegistrationModal,
      }}
    >
      {children}
      <RegistrationClosedModal isOpen={isOpen} onClose={closeRegistrationModal} />
    </RegistrationModalContext.Provider>
  );
};

export const useRegistrationModal = () => {
  const context = useContext(RegistrationModalContext);
  if (!context) {
    return {
      isOpen: false,
      openRegistrationModal: () => {},
      closeRegistrationModal: () => {},
    };
  }
  return context;
};
