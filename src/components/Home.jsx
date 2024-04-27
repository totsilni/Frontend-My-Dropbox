import React from 'react';
import AuthWrapper from './AuthWrapper';
import UserHome from './UserHome';

const Home = () => {
  return (
    <AuthWrapper>
      <UserHome />
    </AuthWrapper>
  );
};

export default Home;
