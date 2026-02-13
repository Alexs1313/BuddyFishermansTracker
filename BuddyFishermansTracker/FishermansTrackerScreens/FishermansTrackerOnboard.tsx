import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../FishermansTrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';

const onboardImages: ImageSourcePropType[] = [
  require('../FishermansTrackerAssets/images/onboarding/onbim1.png'),
  require('../FishermansTrackerAssets/images/onboarding/onbim2.png'),
  require('../FishermansTrackerAssets/images/onboarding/onbim3.png'),
];

const onboardTexts = [
  {
    title: 'Meet Your Fishing Buddy',
    subtitle:
      'Buddy is always ready for the next cast. Log your trips, save your best spots, and keep every catch in one clean timeline — so nothing good gets forgotten',
  },
  {
    title: 'Pin Spots. Track the Moment',
    subtitle:
      'Open the map and drop a pin where the action happens. Track your session time, add weather details, and build a personal map of waters you know — with Buddy tagging along',
  },
  {
    title: 'From Catch to Kitchen',
    subtitle:
      'Turn your catch into something memorable. Save notes on what worked, then browse simple recipes for the fish you’ve logged — with Buddy’s favorites ready when you are',
  },
];

const FishermansTrackerOnboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerOnboard'>>();

  const handleRainBornNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next > 2) navigation.navigate('FishermansTrackerCreateProfile');
      return Math.min(next, 2);
    });
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/onboarding/bg.png')}
      style={styles.background}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 55,
        }}
      >
        <Image source={onboardImages[currentIndex]} style={{ top: 10 }} />
        <View>
          <ImageBackground
            source={require('../FishermansTrackerAssets/images/onboarding/frame.png')}
            style={styles.textboard}
          >
            <View style={styles.textboardContent}>
              <Text style={styles.textboardText}>
                {onboardTexts[currentIndex].title}
              </Text>
              <Text style={styles.textboardSubText}>
                {onboardTexts[currentIndex].subtitle}
              </Text>
            </View>
          </ImageBackground>
          <View style={styles.pagination}>
            {[1, 2, 3].map(item => (
              <View
                key={item}
                style={[
                  styles.paginationItem,
                  currentIndex === item - 1 && styles.paginationItemActive,
                ]}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRainBornNext}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textboardText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  textboard: {
    width: 361,
    height: 266,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  textboardContent: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textboardSubText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  paginationItem: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 2.4,
    backgroundColor: '#FFFFFFB0',
  },
  paginationItemActive: {
    backgroundColor: '#fff',
  },
  paginationItemInactive: {
    backgroundColor: '#fff',
  },
});

export default FishermansTrackerOnboard;
