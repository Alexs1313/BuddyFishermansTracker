// location details screen - shows map, catches and session summary for a specific location

import LinearGradient from 'react-native-linear-gradient';
import type { LocationItem } from './FishermansTrackerLocations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../../Fishermanstackkrouts';

import {
  LOCATIONS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  formatSessionTime,
  totalWeightKg,
} from '../fishermansUtils';

type DetailRoute = RouteProp<StackList, 'FishermansTrackerLocationDetail'>;

const FishermansTrackerLocationDetail: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<
      StackNavigationProp<StackList, 'FishermansTrackerLocationDetail'>
    >();
  const buddyTrckrRoute = useRoute<DetailRoute>();
  const { locationId: buddyTrckrLocationId } = buddyTrckrRoute.params;

  const [buddyTrckrLocation, setBuddyTrckrLocation] =
    useState<LocationItem | null>(null);
  const [buddyTrckrIsSessionActive, setBuddyTrckrSessionActive] =
    useState(false);
  const [buddyTrckrSessionStartTime, setBuddyTrckrSessionStartTime] = useState<
    number | null
  >(null);
  const [buddyTrckrTimerSeconds, setBuddyTrckrTimerSeconds] = useState(0);
  const buddyTrckrTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [buddyTrckrWeightUnit, setBuddyTrckrWeightUnit] = useState<'kg' | 'lb'>(
    'kg',
  );

  const buddyTrckrLoadBuddyProfileUnit = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrData = JSON.parse(buddyTrckrRaw) as { unit?: string };
        setBuddyTrckrWeightUnit(buddyTrckrData.unit === 'lb' ? 'lb' : 'kg');
      } else {
        setBuddyTrckrWeightUnit('kg');
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: loadProfileUnit failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrWeightUnit('kg');
    }
  };

  const buddyTrckrLoadBuddyFsrmnLocation = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrList = JSON.parse(buddyTrckrRaw) as LocationItem[];
        const buddyTrckrFound = buddyTrckrList.find(
          buddyTrckrItem => buddyTrckrItem.id === buddyTrckrLocationId,
        );
        setBuddyTrckrLocation(buddyTrckrFound ?? null);
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: loadLocation failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrLocation(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyTrckrLoadBuddyProfileUnit();
      buddyTrckrLoadBuddyFsrmnLocation();
    }, [buddyTrckrLocationId]),
  );

  useEffect(() => {
    if (buddyTrckrIsSessionActive && buddyTrckrSessionStartTime !== null) {
      buddyTrckrTimerRef.current = setInterval(() => {
        setBuddyTrckrTimerSeconds(
          Math.floor((Date.now() - buddyTrckrSessionStartTime) / 1000),
        );
      }, 1000);
    }

    return () => {
      if (buddyTrckrTimerRef.current) {
        clearInterval(buddyTrckrTimerRef.current);
        buddyTrckrTimerRef.current = null;
      }
    };
  }, [buddyTrckrIsSessionActive, buddyTrckrSessionStartTime]);

  const buddyTrckrSaveLocation = async (buddyTrckrUpdated: LocationItem) => {
    setBuddyTrckrLocation(buddyTrckrUpdated);
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      const buddyTrckrList = buddyTrckrRaw
        ? (JSON.parse(buddyTrckrRaw) as LocationItem[])
        : [];
      const buddyTrckrNext = buddyTrckrList.map(buddyTrckrItem =>
        buddyTrckrItem.id === buddyTrckrUpdated.id
          ? buddyTrckrUpdated
          : buddyTrckrItem,
      );
      await AsyncStorage.setItem(
        LOCATIONS_STORAGE_KEY,
        JSON.stringify(buddyTrckrNext),
      );
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: saveLocation failed',
          buddyTrckrErr,
        );
      }
    }
  };

  const buddyTrckrHandleBuddyFsrBack = () => {
    if (buddyTrckrIsSessionActive) {
      Alert.alert(
        'End Fishing Session?',
        'If you leave now, the timer will stop and the current session time will be lost',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => buddyTrckrNavigation.goBack(),
          },
        ],
      );
    } else {
      buddyTrckrNavigation.goBack();
    }
  };

  const buddyTrckrDisplayTitle =
    buddyTrckrLocation?.catches?.[0]?.title ?? buddyTrckrLocation?.title ?? '';

  const buddyTrckrHandleShare = () => {
    if (!buddyTrckrLocation) return;
    const buddyTrckrTitleForShare =
      buddyTrckrLocation.catches?.[0]?.title ?? buddyTrckrLocation.title;
    const buddyTrckrMessage = `${buddyTrckrTitleForShare}\n${buddyTrckrLocation.date}\nhttps://www.google.com/maps?q=${buddyTrckrLocation.latitude},${buddyTrckrLocation.longitude}`;
    Share.share({
      message: buddyTrckrMessage,
      title: buddyTrckrTitleForShare,
    });
  };

  if (!buddyTrckrLocation) {
    return (
      <View style={styles.buddyTrckrCenteredBox}>
        <Text style={styles.buddyTrckrLoadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.buddyTrckrFshCnt}
    >
      <ScrollView
        style={styles.buddyTrckrScroll}
        contentContainerStyle={styles.buddyTrckrScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.buddyTrckrHeaderFshCnt}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.buddyTrckrHeaderFsh}
          />
          <TouchableOpacity
            style={styles.buddyTrckrBackButtn}
            onPress={buddyTrckrHandleBuddyFsrBack}
            activeOpacity={0.8}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/backArrow.png')}
            />
            <Text style={styles.buddyTrckrBackButtnTxt}>Back</Text>
          </TouchableOpacity>
          <Image
            source={require('../FishermansTrackerAssets/images/headerImg.png')}
            style={styles.buddyTrckrHeaderImg}
          />
        </View>

        <View style={{ paddingHorizontal: 20, width: '100%' }}>
          <View style={styles.buddyTrckrCard}>
            <View style={styles.buddyTrckrTitleRow}>
              <View style={styles.buddyTrckrIconWrap}>
                <Image
                  source={require('../FishermansTrackerAssets/images/anchor.png')}
                />
              </View>
              <View style={styles.buddyTrckrTitleBody}>
                <Text style={styles.buddyTrckrTitleText}>
                  {buddyTrckrDisplayTitle}
                </Text>
                <Text style={styles.buddyTrckrDateText}>
                  {buddyTrckrLocation.date}
                </Text>
              </View>
            </View>

            {(buddyTrckrLocation.totalSessionSeconds != null ||
              (buddyTrckrLocation.catches &&
                buddyTrckrLocation.catches.length > 0)) && (
              <>
                {buddyTrckrLocation.totalSessionSeconds != null && (
                  <View style={styles.buddyTrckrSummaryBar}>
                    <Text style={styles.buddyTrckrSummaryBarText}>
                      Time of fishing:{' '}
                      {formatSessionTime(
                        buddyTrckrLocation.totalSessionSeconds,
                      )}
                    </Text>
                  </View>
                )}

                {buddyTrckrLocation.catches &&
                  buddyTrckrLocation.catches.length > 0 && (
                    <View style={styles.buddyTrckrSummaryBar}>
                      <Text style={styles.buddyTrckrSummaryBarText}>
                        Kilograms of fish:{' '}
                        {totalWeightKg(buddyTrckrLocation.catches).toFixed(1)}{' '}
                        {buddyTrckrWeightUnit === 'lb' ? 'lb' : 'kg'}
                      </Text>
                    </View>
                  )}

                {buddyTrckrLocation.catches &&
                  buddyTrckrLocation.catches.length > 0 && (
                    <View style={styles.buddyTrckrCatchesSection}>
                      {buddyTrckrLocation.catches.map(
                        (buddyTrckrCatch, buddyTrckrIndex) => (
                          <View
                            key={buddyTrckrCatch.id}
                            style={styles.buddyTrckrCatchCard}
                          >
                            <View style={styles.buddyTrckrCatchCardLeft}>
                              {buddyTrckrCatch.imageUri ? (
                                <Image
                                  source={{ uri: buddyTrckrCatch.imageUri }}
                                  style={styles.buddyTrckrCatchCardAvatar}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View
                                  style={
                                    styles.buddyTrckrCatchCardAvatarPlaceholder
                                  }
                                >
                                  <Text
                                    style={
                                      styles.buddyTrckrCatchCardAvatarEmoji
                                    }
                                  >
                                    🐟
                                  </Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.buddyTrckrCatchCardBody}>
                              <Text
                                style={styles.buddyTrckrCatchCardTitle}
                                numberOfLines={1}
                              >
                                {buddyTrckrIndex === 0
                                  ? 'First fish caught'
                                  : buddyTrckrIndex === 1
                                  ? 'Second fish caught'
                                  : buddyTrckrCatch.title}
                              </Text>
                              <Text
                                style={styles.buddyTrckrCatchCardMeta}
                                numberOfLines={1}
                              >
                                {[
                                  buddyTrckrCatch.species,
                                  buddyTrckrCatch.equipment,
                                ]
                                  .filter(Boolean)
                                  .join(' • ') || '—'}
                              </Text>
                              <Text
                                style={styles.buddyTrckrCatchCardWeather}
                                numberOfLines={2}
                              >
                                {buddyTrckrCatch.weatherConditions || '—'}
                              </Text>
                            </View>

                            <View style={styles.buddyTrckrCatchCardWeightBadge}>
                              <Text
                                style={styles.buddyTrckrCatchCardWeightText}
                              >
                                {buddyTrckrCatch.weight
                                  ? `${buddyTrckrCatch.weight} ${
                                      buddyTrckrWeightUnit === 'lb'
                                        ? 'Lb'
                                        : 'Kg'
                                    }`
                                  : '—'}
                              </Text>
                            </View>
                          </View>
                        ),
                      )}
                    </View>
                  )}
              </>
            )}

            <View style={styles.buddyTrckrMapWrap}>
              <MapView
                style={styles.buddyTrckrMap}
                initialRegion={{
                  latitude: buddyTrckrLocation.latitude,
                  longitude: buddyTrckrLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: buddyTrckrLocation.latitude,
                    longitude: buddyTrckrLocation.longitude,
                  }}
                >
                  <Image
                    source={require('../FishermansTrackerAssets/images/marker.png')}
                  />
                </Marker>
              </MapView>
            </View>

            <TouchableOpacity
              onPress={buddyTrckrHandleShare}
              activeOpacity={0.8}
              style={styles.buddyTrckrShareButtonContainer}
            >
              <LinearGradient
                colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buddyTrckrShareButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/share.png')}
                />
                <Text style={styles.buddyTrckrShareButtonText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrFshCnt: {
    flex: 1,
  },
  buddyTrckrCenteredBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7EC8E3',
  },
  buddyTrckrLoadingText: {
    fontSize: 16,
    color: '#fff',
  },
  buddyTrckrHeaderFshCnt: {
    width: '100%',
    marginBottom: 0,
  },
  buddyTrckrHeaderFsh: {
    width: '100%',
    height: 150,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  buddyTrckrHeaderImg: {
    position: 'absolute',
    right: 20,
    bottom: -10,
  },
  buddyTrckrBackButtn: {
    position: 'absolute',
    left: 15,
    top: 50,
    backgroundColor: '#286E42',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buddyTrckrBackButtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrTimerWrp: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 8,
    backgroundColor: '#286E42',
    borderRadius: 60,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  buddyTrckrTimerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  buddyTrckrScroll: {
    flex: 1,
  },
  buddyTrckrScrollContent: {
    paddingBottom: 20,
  },
  buddyTrckrCard: {
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: 20,
  },
  buddyTrckrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buddyTrckrIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buddyTrckrIconText: {
    fontSize: 24,
  },
  buddyTrckrTitleBody: {
    flex: 1,
  },
  buddyTrckrTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrDateText: {
    fontSize: 14,
    color: '#FFC813',
    marginTop: 3,
  },
  buddyTrckrSummaryBar: {
    backgroundColor: '#FFC813',
    borderRadius: 60,
    paddingVertical: 5,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  buddyTrckrSummaryBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#286E42',
    textAlign: 'center',
  },
  buddyTrckrCatchesSection: {
    marginBottom: 16,
  },
  buddyTrckrCatchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  buddyTrckrCatchCardLeft: {
    marginRight: 12,
  },
  buddyTrckrCatchCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buddyTrckrCatchCardAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5A8F7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrCatchCardAvatarEmoji: {
    fontSize: 24,
  },
  buddyTrckrCatchCardBody: {
    flex: 1,
  },
  buddyTrckrCatchCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  buddyTrckrCatchCardMeta: {
    fontSize: 12,
    color: '#FFFFFFB2',
    marginBottom: 4,
  },
  buddyTrckrCatchCardWeather: {
    fontSize: 12,
    color: '#FFFFFFB2',
  },
  buddyTrckrCatchCardWeightBadge: {
    backgroundColor: '#FFC813',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  buddyTrckrCatchCardWeightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a3a4a',
  },
  buddyTrckrMapWrap: {
    width: '100%',
    height: 144,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  buddyTrckrMap: {
    width: '100%',
    height: '100%',
  },
  buddyTrckrShareButtonContainer: {
    width: '100%',
  },
  buddyTrckrShareButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buddyTrckrShareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  buddyTrckrBottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: '#286E42',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  buddyTrckrPlaceTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrAddCatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC813',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    gap: 6,
  },
  buddyTrckrAddCatchPlus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a4a',
  },
  buddyTrckrAddCatchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3a4a',
  },
  buddyTrckrStartButtonContainer: {
    width: '100%',
  },
  buddyTrckrStartButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrStartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  buddyTrckrEndButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrEndButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buddyTrckrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  buddyTrckrModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buddyTrckrCatchImageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#799930',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  buddyTrckrCatchImage: {
    width: '100%',
    height: '100%',
  },
  buddyTrckrCatchImagePlus: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
  },
  buddyTrckrModalInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  buddyTrckrWeightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  buddyTrckrWeightInput: {
    flex: 1,
    marginBottom: 0,
  },
  buddyTrckrUnitLabel: {
    fontSize: 16,
    color: '#FFFFFFB2',
    minWidth: 28,
  },
  buddyTrckrSaveCatchButtonContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  buddyTrckrSaveCatchButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrSaveCatchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  buddyTrckrCancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  buddyTrckrCancelButtonText: {
    fontSize: 16,
    color: '#FFFFFFB2',
    fontWeight: '500',
  },
});

export default FishermansTrackerLocationDetail;
