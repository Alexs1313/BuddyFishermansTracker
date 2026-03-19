// loading screen

import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
} from 'react-native';

import { StackList } from '../../Stackkrouts';

const ThebudyyTrackerLoader: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'ThebudyyTrackerLoader'>>();

  const buddyTrckrDrive = useRef(new Animated.Value(0)).current;

  const buddyTrckrScale = buddyTrckrDrive.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.08, 0.96],
  });

  useEffect(() => {
    const buddyTrckrPulse = Animated.loop(
      Animated.timing(buddyTrckrDrive, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: -1, resetBeforeIteration: true },
    );

    buddyTrckrPulse.start();

    return () => buddyTrckrPulse.stop();
  }, [buddyTrckrDrive]);

  useEffect(() => {
    const buddyTrckrTimer = setTimeout(() => {
      buddyTrckrNavigation.replace('ThebudyyTrackerOnboard');
    }, 6000);

    return () => clearTimeout(buddyTrckrTimer);
  }, [buddyTrckrNavigation]);

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/loaderbg.png')}
      style={styles.buddyTrckrContainer}
    >
      <Animated.View
        style={[
          styles.buddyTrckrImageWrap,
          { transform: [{ scale: buddyTrckrScale }] },
        ]}
      >
        <Image
          source={require('../FishermansTrackerAssets/images/buddyfsrmnloade.png')}
          style={{ width: 96, height: 96 }}
          resizeMode="contain"
        />
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrContainer: {
    flex: 1,
  },
  buddyTrckrImageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyTrckrImage: {
    width: 220,
    height: 220,
    borderRadius: 52,
  },
});

export default ThebudyyTrackerLoader;
