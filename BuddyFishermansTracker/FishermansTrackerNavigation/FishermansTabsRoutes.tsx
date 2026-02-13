import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, View } from 'react-native';
import FishermansTrackerHome from '../FishermansTrackerScreens/FishermansTrackerHome';
import FishermansTrackerLocations from '../FishermansTrackerScreens/FishermansTrackerLocations';
import FishermansTrackerNotes from '../FishermansTrackerScreens/FishermansTrackerNotes';
import FishermansTrackerRecipes from '../FishermansTrackerScreens/FishermansTrackerRecipes';

const Tab = createBottomTabNavigator();

const FishermansTabsRoutes = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.bottomTabBar,
        tabBarActiveTintColor: '#FFC813',
        tabBarInactiveTintColor: '#FFF',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
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
      <Tab.Screen
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
      <Tab.Screen
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
      <Tab.Screen
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
    </Tab.Navigator>
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
