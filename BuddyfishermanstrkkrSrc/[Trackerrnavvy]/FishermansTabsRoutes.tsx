import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import FishermansTrackerHome from '../[BuddyTrackerScreens]/FishermansTrackerHome';
import FishermansTrackerLocations from '../[BuddyTrackerScreens]/FishermansTrackerLocations';
import FishermansTrackerNotes from '../[BuddyTrackerScreens]/FishermansTrackerNotes';
import FishermansTrackerRecipes from '../[BuddyTrackerScreens]/FishermansTrackerRecipes';

const BottomTab = createBottomTabNavigator();

const FishermansTabsRoutes = () => {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.bottomTabBar,
        tabBarActiveTintColor: '#FFC813',
        tabBarInactiveTintColor: '#FFF',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <BottomTab.Screen
        name="FishermansTrackerHome"
        component={FishermansTrackerHome}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../FishermansTrackerAssets/tabicons/home.png')}
              style={{ tintColor: color }}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="FishermansTrackerLocations"
        component={FishermansTrackerLocations}
        options={{
          tabBarLabel: 'Locations',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../FishermansTrackerAssets/tabicons/locations.png')}
              style={{ tintColor: color }}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="FishermansTrackerNotes"
        component={FishermansTrackerNotes}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../FishermansTrackerAssets/tabicons/notes.png')}
              style={{ tintColor: color }}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="FishermansTrackerRecipes"
        component={FishermansTrackerRecipes}
        options={{
          tabBarLabel: 'Recipes',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('../FishermansTrackerAssets/tabicons/rec.png')}
              style={{ tintColor: color }}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    position: 'absolute',
    elevation: 0,
    backgroundColor: '#286E42',
    paddingTop: 10,
    paddingHorizontal: 10,
    height: 90,
    borderColor: '#fff',
    borderTopWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderBottomWidth: 0,
  },
  tabActive: {
    padding: 9,
    backgroundColor: '#F21D16',
    borderRadius: 12,
    alignSelf: 'center',
  },
  tabBarLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default FishermansTabsRoutes;
