// stack navigator

import FishermansTrackerCreateProfile from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerCreateProfile';

import FishermansTrackerLocationDetail from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerLocationDetail';
import FishermansTrackerLoader from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerLoader';
import FishermansTrackerMap from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerMap';
import FishermansTrackerOnboard from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerOnboard';
import FishermansTrackerProfile from './BuddyfishermanstrkkrSrc/[BuddyTrackerScreens]/FishermansTrackerProfile';
import FishermansTabsRoutes from './BuddyfishermanstrkkrSrc/[Trackerrnavvy]/FishermansTabsRoutes';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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

const Fishermanstackkrouts: React.FC = () => {
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

export default Fishermanstackkrouts;
