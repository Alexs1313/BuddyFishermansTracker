import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../TrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';

const bGradients = ['#A2E8D5', '#FFFAD0', '#2CCCE7'];
const bGradStart = { x: 0, y: 0 };
const bGradEnd = { x: 1, y: 0 };
const bgPath = '../FishermansTrackerAssets/images/onboarding/bg.png';
const framePath = '../FishermansTrackerAssets/images/onboarding/frame.png';
const onbim1Path = '../FishermansTrackerAssets/images/onboarding/onbim1.png';
const onbim2Path = '../FishermansTrackerAssets/images/onboarding/onbim2.png';
const onbim3Path = '../FishermansTrackerAssets/images/onboarding/onbim3.png';

const onboardImages: ImageSourcePropType[] = [
  require(onbim1Path),
  require(onbim2Path),
  require(onbim3Path),
];

const trackerTxts: { title: string; subtitle: string; btnTxt: string }[] = [
  {
    title: 'Meet Your Fishing Buddy',
    btnTxt: 'Continue',
    subtitle:
      'Buddy is always ready for the next cast. Log your trips, save your best spots, and keep every catch in one clean timeline — so nothing good gets forgotten',
  },
  {
    title: 'Pin Spots. Track the Moment',
    btnTxt: 'Continue',
    subtitle:
      'Open the map and drop a pin where the action happens. Track your session time, add weather details, and build a personal map of waters you know — with Buddy tagging along',
  },
  {
    title: 'From Catch to Kitchen',
    btnTxt: 'Let’s Go Fishing',
    subtitle:
      'Turn your catch into something memorable. Save notes on what worked, then browse simple recipes for the fish you’ve logged — with Buddy’s favorites ready when you are',
  },
];

const BREAKPOINT_COMPACT = 400;
const BREAKPOINT_WIDE = 600;

const FishermansTrackerOnboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: scrnWidth, height: scrnHeight } = useWindowDimensions();
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerOnboard'>>();

  const shortSide = Math.min(scrnWidth, scrnHeight);
  const isCompact = shortSide < BREAKPOINT_COMPACT;
  const isWide = scrnWidth >= BREAKPOINT_WIDE || scrnWidth > scrnHeight;
  const sc = isCompact ? 0.9 : isWide ? 1.08 : 1;
  const buttonWidth = Math.min(scrnWidth * 0.9, 420);
  const bottomPadding = Math.max(24, Math.min(55, 55 * sc));

  const handleNextBoard = () => {
    setCurrentIndex(prev => {
      const next = prev + 1;
      if (next > 2) navigation.navigate('FishermansTrackerCreateProfile');
      return Math.min(next, 2);
    });
  };

  return (
    <ImageBackground source={require(bgPath)} style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: bottomPadding,
          }}
        >
          <Image source={onboardImages[currentIndex]} style={{ top: 10 }} />
          <View>
            <ImageBackground
              source={require(framePath)}
              style={styles.textboard}
            >
              <View style={styles.textboardContent}>
                <Text style={styles.textboardText}>
                  {trackerTxts[currentIndex].title}
                </Text>
                <Text style={styles.textboardSubText}>
                  {trackerTxts[currentIndex].subtitle}
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
            onPress={handleNextBoard}
            activeOpacity={0.8}
            style={[
              styles.buttonContainer,
              { width: buttonWidth, marginTop: 20 * sc },
            ]}
          >
            <LinearGradient
              colors={bGradients}
              start={bGradStart}
              end={bGradEnd}
              style={[
                styles.button,
                { height: 51 * sc, borderRadius: 25.5 * sc },
              ]}
            >
              <Text style={[styles.buttonText, { fontSize: 16 * sc }]}>
                {trackerTxts[currentIndex].btnTxt}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  buttonContainer: {
    alignSelf: 'center',
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textboardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonText: {
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textboardSubText: {
    fontSize: 15,
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
