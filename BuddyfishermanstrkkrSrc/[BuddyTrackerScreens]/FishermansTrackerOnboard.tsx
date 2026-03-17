// onboarding screens - shows 3 screens with info about the app and a button to continue to the next screen, also has pagination dots at the bottom to indicate which screen is currently active
import { StackList } from '../../Fishermanstackkrouts';
import LinearGradient from 'react-native-linear-gradient';
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

const buddyTrckrBGradients = ['#A2E8D5', '#FFFAD0', '#2CCCE7'];
const buddyTrckrBGradStart = { x: 0, y: 0 };
const buddyTrckrBGradEnd = { x: 1, y: 0 };
const buddyTrckrBgPath = '../FishermansTrackerAssets/images/onboarding/bg.png';
const buddyTrckrFramePath =
  '../FishermansTrackerAssets/images/onboarding/frame.png';
const buddyTrckrOnbim1Path =
  '../FishermansTrackerAssets/images/onboarding/onbim1.png';
const buddyTrckrOnbim2Path =
  '../FishermansTrackerAssets/images/onboarding/onbim2.png';
const buddyTrckrOnbim3Path =
  '../FishermansTrackerAssets/images/onboarding/onbim3.png';

const buddyTrckrOnboardImages: ImageSourcePropType[] = [
  require(buddyTrckrOnbim1Path),
  require(buddyTrckrOnbim2Path),
  require(buddyTrckrOnbim3Path),
];

const buddyTrckrTrackerTxts: {
  title: string;
  subtitle: string;
  btnTxt: string;
}[] = [
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

const buddyTrckrBreakpointCompact = 400;
const buddyTrckrBreakpointWide = 600;

const FishermansTrackerOnboard: React.FC = () => {
  const [buddyTrckrCurrentIndex, setBuddyTrckrCurrentIndex] = useState(0);
  const { width: buddyTrckrScrnWidth, height: buddyTrckrScrnHeight } =
    useWindowDimensions();
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerOnboard'>>();

  const buddyTrckrShortSide = Math.min(
    buddyTrckrScrnWidth,
    buddyTrckrScrnHeight,
  );
  const buddyTrckrIsCompact = buddyTrckrShortSide < buddyTrckrBreakpointCompact;
  const buddyTrckrIsWide =
    buddyTrckrScrnWidth >= buddyTrckrBreakpointWide ||
    buddyTrckrScrnWidth > buddyTrckrScrnHeight;
  const buddyTrckrSc = buddyTrckrIsCompact ? 0.9 : buddyTrckrIsWide ? 1.08 : 1;
  const buddyTrckrButtonWidth = Math.min(buddyTrckrScrnWidth * 0.9, 420);
  const buddyTrckrBottomPadding = Math.max(24, Math.min(55, 55 * buddyTrckrSc));

  const buddyTrckrHandleNextBoard = () => {
    setBuddyTrckrCurrentIndex(buddyTrckrPrev => {
      const buddyTrckrNext = buddyTrckrPrev + 1;
      if (buddyTrckrNext > 2) {
        buddyTrckrNavigation.navigate('FishermansTrackerCreateProfile');
      }
      return Math.min(buddyTrckrNext, 2);
    });
  };

  return (
    <ImageBackground
      source={require(buddyTrckrBgPath)}
      style={styles.buddyTrckrBackground}
    >
      <ScrollView
        contentContainerStyle={styles.buddyTrckrScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: buddyTrckrBottomPadding,
          }}
        >
          <Image
            source={buddyTrckrOnboardImages[buddyTrckrCurrentIndex]}
            style={{ top: 10 }}
          />

          <View>
            <ImageBackground
              source={require(buddyTrckrFramePath)}
              style={styles.buddyTrckrTextboard}
            >
              <View style={styles.buddyTrckrTextboardContent}>
                <Text style={styles.buddyTrckrTextboardText}>
                  {buddyTrckrTrackerTxts[buddyTrckrCurrentIndex].title}
                </Text>
                <Text style={styles.buddyTrckrTextboardSubText}>
                  {buddyTrckrTrackerTxts[buddyTrckrCurrentIndex].subtitle}
                </Text>
              </View>
            </ImageBackground>

            <View style={styles.buddyTrckrPagination}>
              {[1, 2, 3].map(buddyTrckrItem => (
                <View
                  key={buddyTrckrItem}
                  style={[
                    styles.buddyTrckrPaginationItem,
                    buddyTrckrCurrentIndex === buddyTrckrItem - 1 &&
                      styles.buddyTrckrPaginationItemActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={buddyTrckrHandleNextBoard}
            activeOpacity={0.8}
            style={[
              styles.buddyTrckrButtonContainer,
              {
                width: buddyTrckrButtonWidth,
                marginTop: 20 * buddyTrckrSc,
              },
            ]}
          >
            <LinearGradient
              colors={buddyTrckrBGradients}
              start={buddyTrckrBGradStart}
              end={buddyTrckrBGradEnd}
              style={[
                styles.buddyTrckrButton,
                {
                  height: 51 * buddyTrckrSc,
                  borderRadius: 25.5 * buddyTrckrSc,
                },
              ]}
            >
              <Text
                style={[
                  styles.buddyTrckrButtonText,
                  { fontSize: 16 * buddyTrckrSc },
                ]}
              >
                {buddyTrckrTrackerTxts[buddyTrckrCurrentIndex].btnTxt}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrBackground: {
    flex: 1,
  },
  buddyTrckrScrollContent: {
    flexGrow: 1,
  },
  buddyTrckrButtonContainer: {
    alignSelf: 'center',
  },
  buddyTrckrButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrTextboardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  buddyTrckrButtonText: {
    fontWeight: '500',
    color: '#007083',
  },
  buddyTrckrTextboard: {
    width: 361,
    height: 266,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  buddyTrckrTextboardContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrTextboardSubText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  buddyTrckrPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  buddyTrckrPaginationItem: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 2.4,
    backgroundColor: '#FFFFFFB0',
  },
  buddyTrckrPaginationItemActive: {
    backgroundColor: '#fff',
  },
  buddyTrckrPaginationItemInactive: {
    backgroundColor: '#fff',
  },
});

export default FishermansTrackerOnboard;
