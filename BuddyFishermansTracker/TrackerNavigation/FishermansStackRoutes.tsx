import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FishermansTrackerCreateProfile from '../BuddyTrackerScreens/FishermansTrackerCreateProfile';
import FishermansTrackerLocationDetail from '../BuddyTrackerScreens/FishermansTrackerLocationDetail';
import FishermansTrackerLoader from '../BuddyTrackerScreens/FishermansTrackerLoader';
import FishermansTrackerMap from '../BuddyTrackerScreens/FishermansTrackerMap';
import FishermansTrackerOnboard from '../BuddyTrackerScreens/FishermansTrackerOnboard';
import FishermansTrackerProfile from '../BuddyTrackerScreens/FishermansTrackerProfile';
import FishermansTabsRoutes from './FishermansTabsRoutes';

export type TabParamList = {
  FishermansTrackerHome: undefined;
  FishermansTrackerLocations: undefined;
  FishermansTrackerNotes: undefined;
  FishermansTrackerRecipes: undefined;
};

export type StackList = {
  FishermansTrackerLoader: undefined;
  FishermansTrackerOnboard: undefined;
  FishermansTrackerCreateProfile: undefined;
  FishermansTabsRoutes: { screen?: keyof TabParamList } | undefined;
  FishermansTrackerProfile: undefined;
  FishermansTrackerLocationDetail: { locationId: string };
  FishermansTrackerMap: undefined;
};

const NativeStack = createStackNavigator<StackList>();

const FishermansStackRoutes: React.FC = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="FishermansTrackerLoader"
    >
      <NativeStack.Screen
        name="FishermansTrackerLoader"
        component={FishermansTrackerLoader}
      />
      <NativeStack.Screen
        name="FishermansTrackerOnboard"
        component={FishermansTrackerOnboard}
      />
      <NativeStack.Screen
        name="FishermansTrackerCreateProfile"
        component={FishermansTrackerCreateProfile}
      />
      <NativeStack.Screen
        name="FishermansTabsRoutes"
        component={FishermansTabsRoutes}
      />
      <NativeStack.Screen
        name="FishermansTrackerProfile"
        component={FishermansTrackerProfile}
      />
      <NativeStack.Screen
        name="FishermansTrackerLocationDetail"
        component={FishermansTrackerLocationDetail}
      />
      <NativeStack.Screen
        name="FishermansTrackerMap"
        component={FishermansTrackerMap}
      />
    </NativeStack.Navigator>
  );
};

export default FishermansStackRoutes;
