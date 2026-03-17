import Toast from 'react-native-toast-message';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StorageProvider } from './BuddystrkkrSrc/thebuddstrrre/thebuddcontxt';
import Stackkrouts from './Stackkrouts';

const FsrmansCorr: React.FC = () => {
  return (
    <NavigationContainer>
      <StorageProvider>
        <Stackkrouts />
        <Toast position="top" topOffset={45} visibilityTime={1500} />
      </StorageProvider>
    </NavigationContainer>
  );
};

export default FsrmansCorr;
