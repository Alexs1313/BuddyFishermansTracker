// App

import { StorageProvider } from './BuddyfishermanstrkkrSrc/FishermansStore/fishermansContxt';
import Toast from 'react-native-toast-message';

import Fishermanstackkrouts from './Fishermanstackkrouts';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

const FsrmansCorr: React.FC = () => {
  return (
    <NavigationContainer>
      <StorageProvider>
        <Fishermanstackkrouts />
        <Toast position="top" topOffset={45} visibilityTime={1500} />
      </StorageProvider>
    </NavigationContainer>
  );
};

export default FsrmansCorr;
