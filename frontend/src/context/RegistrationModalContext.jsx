import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationModalContext = createContext({
  isOpen: false,
  openRegistrationModal: () => {},
  closeRegistrationModal: () => {},
});

export const RegistrationModalProvider = ({ children }) => {
  const navigate = useNavigate();

  const openRegistrationModal = () => {
    navigate('/register');
  };
  const closeRegistrationModal = () => {};

  return (
    <RegistrationModalContext.Provider
      value={{
        isOpen: false,
        openRegistrationModal,
        closeRegistrationModal,
      }}
    >
      {children}
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
