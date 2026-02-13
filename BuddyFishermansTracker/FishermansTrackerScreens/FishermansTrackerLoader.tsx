import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../FishermansTrackerNavigation/FishermansStackRoutes';

const FishermansTrackerLoader: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerLoader'>>();
  const drive = useRef(new Animated.Value(0)).current;

  const scale = drive.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.08, 0.96],
  });

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.timing(drive, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: -1, resetBeforeIteration: true },
    );
    pulse.start();
    return () => pulse.stop();
  }, [drive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('FishermansTrackerOnboard');
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/loaderbg.png')}
      style={styles.container}
    >
      <Animated.View style={[styles.imageWrap, { transform: [{ scale }] }]}>
        <Image
          source={require('../FishermansTrackerAssets/images/loaderimg.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    marginTop: 120,
  },
  image: {
    width: 270,
    height: 270,
  },
});

export default FishermansTrackerLoader;
