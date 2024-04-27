import { useState, useEffect } from 'react';
import { auth, storage } from '../firebase/config'; // Import your Firebase auth and storage instances

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { currentUser, auth, storage }; // Return currentUser, auth, and storage from the hook
};

export default useAuth;
