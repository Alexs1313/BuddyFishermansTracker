import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FishermansTrackerCreateProfile from '../FishermansTrackerScreens/FishermansTrackerCreateProfile';
import FishermansTrackerLocationDetail from '../FishermansTrackerScreens/FishermansTrackerLocationDetail';
import FishermansTrackerLoader from '../FishermansTrackerScreens/FishermansTrackerLoader';
import FishermansTrackerMap from '../FishermansTrackerScreens/FishermansTrackerMap';
import FishermansTrackerOnboard from '../FishermansTrackerScreens/FishermansTrackerOnboard';
import FishermansTrackerProfile from '../FishermansTrackerScreens/FishermansTrackerProfile';
import FishermansTabsRoutes from './FishermansTabsRoutes';

export type StackList = {
  FishermansTrackerLoader: undefined;
  FishermansTrackerOnboard: undefined;
  FishermansTrackerCreateProfile: undefined;
  FishermansTabsRoutes: undefined;
  FishermansTrackerProfile: undefined;
  FishermansTrackerLocationDetail: { locationId: string };
  FishermansTrackerMap: undefined;
};

const Stack = createStackNavigator<StackList>();

const FishermansStackRoutes: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="FishermansTrackerLoader"
    >
      <Stack.Screen
        name="FishermansTrackerLoader"
        component={FishermansTrackerLoader}
      />
      <Stack.Screen
        name="FishermansTrackerOnboard"
        component={FishermansTrackerOnboard}
      />
      <Stack.Screen
        name="FishermansTrackerCreateProfile"
        component={FishermansTrackerCreateProfile}
      />
      <Stack.Screen
        name="FishermansTabsRoutes"
        component={FishermansTabsRoutes}
      />
      <Stack.Screen
        name="FishermansTrackerProfile"
        component={FishermansTrackerProfile}
      />
      <Stack.Screen
        name="FishermansTrackerLocationDetail"
        component={FishermansTrackerLocationDetail}
      />
      <Stack.Screen
        name="FishermansTrackerMap"
        component={FishermansTrackerMap}
      />
    </Stack.Navigator>
  );
};

export default FishermansStackRoutes;
