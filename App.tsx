import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import FishermansStackRoutes from './BuddyFishermansTracker/TrackerNavigation/FishermansStackRoutes';
import { StorageProvider } from './BuddyFishermansTracker/FishermansStore/fishermansContxt';
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <StorageProvider>
        <FishermansStackRoutes />
        <Toast position="top" topOffset={45} visibilityTime={1500} />
      </StorageProvider>
    </NavigationContainer>
  );
};

export default App;
