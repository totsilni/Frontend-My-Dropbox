import React from 'react';
import { auth } from '../firebase/config'; // Import Firebase config

const AuthWrapper = ({ children }) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    // Redirect to login page if user is not authenticated
    // You can implement your own logic for handling redirects
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
