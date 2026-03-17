// stack navigator

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ThebudyyTrackerLoader from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerLoader';
import ThebudyyTrackerOnboard from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerOnboard';
import ThebudyyTrackerCreateProfile from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerCreateProfile';

import ThebudyyTrackerProfile from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerProfile';
import ThebudyyTrackerLocationDetail from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerLocationDetail';
import ThebudyyTrackerMap from './BuddystrkkrSrc/[BuddyTrackerScreens]/ThebudyyTrackerMap';
import Bottomtabsroutes from './BuddystrkkrSrc/[Trackerrnavvy]/Bottomtabsroutes';

export type TabParamList = {
  ThebudyyTrackerHome: undefined;
  ThebudyyTrackerLocations: undefined;
  ThebudyyTrackerNotes: undefined;
  ThebudyyTrackerRecipes: undefined;
};

export type StackList = {
  ThebudyyTrackerLoader: undefined;
  ThebudyyTrackerOnboard: undefined;
  ThebudyyTrackerCreateProfile: undefined;
  Bottomtabsroutes: { screen?: keyof TabParamList } | undefined;
  ThebudyyTrackerProfile: undefined;
  ThebudyyTrackerLocationDetail: { locationId: string };
  ThebudyyTrackerMap: undefined;
};

const NativeStack = createStackNavigator<StackList>();

const Stackkrouts: React.FC = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="ThebudyyTrackerLoader"
    >
      <NativeStack.Screen
        name="ThebudyyTrackerLoader"
        component={ThebudyyTrackerLoader}
      />
      <NativeStack.Screen
        name="ThebudyyTrackerOnboard"
        component={ThebudyyTrackerOnboard}
      />
      <NativeStack.Screen
        name="ThebudyyTrackerCreateProfile"
        component={ThebudyyTrackerCreateProfile}
      />
      <NativeStack.Screen
        name="Bottomtabsroutes"
        component={Bottomtabsroutes}
      />
      <NativeStack.Screen
        name="ThebudyyTrackerProfile"
        component={ThebudyyTrackerProfile}
      />
      <NativeStack.Screen
        name="ThebudyyTrackerLocationDetail"
        component={ThebudyyTrackerLocationDetail}
      />
      <NativeStack.Screen
        name="ThebudyyTrackerMap"
        component={ThebudyyTrackerMap}
      />
    </NativeStack.Navigator>
  );
};

export default Stackkrouts;
