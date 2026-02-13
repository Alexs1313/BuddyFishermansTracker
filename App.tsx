import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import FishermansStackRoutes from './BuddyFishermansTracker/FishermansTrackerNavigation/FishermansStackRoutes';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <FishermansStackRoutes />
    </NavigationContainer>
  );
};

export default App;
