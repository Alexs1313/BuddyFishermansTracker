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
  const navigation =
    useNavigation<
      StackNavigationProp<StackList, 'FishermansTrackerLocationDetail'>
    >();
  const route = useRoute<DetailRoute>();
  const { locationId } = route.params;
  const [location, setLocation] = useState<LocationItem | null>(null);
  const [isSessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const loadBuddyProfileUnit = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { unit?: string };
        setWeightUnit(data.unit === 'lb' ? 'lb' : 'kg');
      } else {
        setWeightUnit('kg');
      }
    } catch (err) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: loadProfileUnit failed',
          err,
        );
      }
      setWeightUnit('kg');
    }
  };

  const loadBuddyFsrmnLocation = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as LocationItem[];
        const found = list.find(l => l.id === locationId);
        setLocation(found ?? null);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: loadLocation failed',
          err,
        );
      }
      setLocation(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBuddyProfileUnit();
      loadBuddyFsrmnLocation();
    }, [locationId]),
  );

  useEffect(() => {
    if (isSessionActive && sessionStartTime !== null) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSessionActive, sessionStartTime]);

  const saveLocation = async (updated: LocationItem) => {
    setLocation(updated);
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as LocationItem[]) : [];
      const next = list.map(l => (l.id === updated.id ? updated : l));
      await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocationDetail: saveLocation failed',
          err,
        );
      }
    }
  };

  const handleBuddyFsrBack = () => {
    if (isSessionActive) {
      Alert.alert(
        'End Fishing Session?',
        'If you leave now, the timer will stop and the current session time will be lost',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const displayTitle = location?.catches?.[0]?.title ?? location?.title ?? '';

  const handleShare = () => {
    if (!location) return;
    const titleForShare = location.catches?.[0]?.title ?? location.title;
    const message = `${titleForShare}\n${location.date}\nhttps://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    Share.share({ message, title: titleForShare });
  };

  if (!location) {
    return (
      <View style={styles.centeredBox}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.fshCnt}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerFshCnt}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.headerFsh}
          />
          <TouchableOpacity
            style={styles.backButtn}
            onPress={handleBuddyFsrBack}
            activeOpacity={0.8}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/backArrow.png')}
            />
            <Text style={styles.backButtnTxt}>Back</Text>
          </TouchableOpacity>
          <Image
            source={require('../FishermansTrackerAssets/images/headerImg.png')}
            style={styles.headerImg}
          />
        </View>

        <View style={{ paddingHorizontal: 20, width: '100%' }}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrap}>
                <Image
                  source={require('../FishermansTrackerAssets/images/anchor.png')}
                />
              </View>
              <View style={styles.titleBody}>
                <Text style={styles.titleText}>{displayTitle}</Text>
                <Text style={styles.dateText}>{location.date}</Text>
              </View>
            </View>

            {(location.totalSessionSeconds != null ||
              (location.catches && location.catches.length > 0)) && (
              <>
                {location.totalSessionSeconds != null && (
                  <View style={styles.summaryBar}>
                    <Text style={styles.summaryBarText}>
                      Time of fishing:{' '}
                      {formatSessionTime(location.totalSessionSeconds)}
                    </Text>
                  </View>
                )}
                {location.catches && location.catches.length > 0 && (
                  <View style={styles.summaryBar}>
                    <Text style={styles.summaryBarText}>
                      Kilograms of fish:{' '}
                      {totalWeightKg(location.catches).toFixed(1)}{' '}
                      {weightUnit === 'lb' ? 'lb' : 'kg'}
                    </Text>
                  </View>
                )}
                {location.catches && location.catches.length > 0 && (
                  <View style={styles.catchesSection}>
                    {location.catches.map((c, index) => (
                      <View key={c.id} style={styles.catchCard}>
                        <View style={styles.catchCardLeft}>
                          {c.imageUri ? (
                            <Image
                              source={{ uri: c.imageUri }}
                              style={styles.catchCardAvatar}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.catchCardAvatarPlaceholder}>
                              <Text style={styles.catchCardAvatarEmoji}>
                                🐟
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.catchCardBody}>
                          <Text style={styles.catchCardTitle} numberOfLines={1}>
                            {index === 0
                              ? 'First fish caught'
                              : index === 1
                              ? 'Second fish caught'
                              : c.title}
                          </Text>
                          <Text style={styles.catchCardMeta} numberOfLines={1}>
                            {[c.species, c.equipment]
                              .filter(Boolean)
                              .join(' • ') || '—'}
                          </Text>
                          <Text
                            style={styles.catchCardWeather}
                            numberOfLines={2}
                          >
                            {c.weatherConditions || '—'}
                          </Text>
                        </View>
                        <View style={styles.catchCardWeightBadge}>
                          <Text style={styles.catchCardWeightText}>
                            {c.weight
                              ? `${c.weight} ${
                                  weightUnit === 'lb' ? 'Lb' : 'Kg'
                                }`
                              : '—'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            <View style={styles.mapWrap}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                >
                  <Image
                    source={require('../FishermansTrackerAssets/images/marker.png')}
                  />
                </Marker>
              </MapView>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.8}
              style={styles.shareButtonContainer}
            >
              <LinearGradient
                colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shareButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/share.png')}
                />
                <Text style={styles.shareButtonText}>Share</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  fshCnt: {
    flex: 1,
  },
  centeredBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7EC8E3',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
  },
  headerFshCnt: {
    width: '100%',
    marginBottom: 0,
  },
  headerFsh: {
    width: '100%',
    height: 150,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerImg: {
    position: 'absolute',
    right: 20,
    bottom: -10,
  },
  backButtn: {
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
  backButtnTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  timerWrp: {
    marginHorizontal: 20,
    marginTop: -24,
    marginBottom: 8,
    backgroundColor: '#286E42',
    borderRadius: 60,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  titleBody: {
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#FFC813',
    marginTop: 3,
  },
  summaryBar: {
    backgroundColor: '#FFC813',
    borderRadius: 60,
    paddingVertical: 5,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  summaryBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#286E42',
    textAlign: 'center',
  },
  catchesSection: {
    marginBottom: 16,
  },
  catchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
  },
  catchCardLeft: {
    marginRight: 12,
  },
  catchCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  catchCardAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5A8F7A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catchCardAvatarEmoji: {
    fontSize: 24,
  },
  catchCardBody: {
    flex: 1,
  },
  catchCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  catchCardMeta: {
    fontSize: 12,
    color: '#FFFFFFB2',
    marginBottom: 4,
  },
  catchCardWeather: {
    fontSize: 12,
    color: '#FFFFFFB2',
  },
  catchCardWeightBadge: {
    backgroundColor: '#FFC813',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  catchCardWeightText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a3a4a',
  },
  mapWrap: {
    width: '100%',
    height: 144,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  shareButtonContainer: {
    width: '100%',
  },
  shareButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 36,
    backgroundColor: '#286E42',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  placeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addCatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC813',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    gap: 6,
  },
  addCatchPlus: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a3a4a',
  },
  addCatchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3a4a',
  },
  startButtonContainer: {
    width: '100%',
  },
  startButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  endButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  catchImageCircle: {
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
  catchImage: {
    width: '100%',
    height: '100%',
  },
  catchImagePlus: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '300',
  },
  modalInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  weightInput: {
    flex: 1,
    marginBottom: 0,
  },
  unitLabel: {
    fontSize: 16,
    color: '#FFFFFFB2',
    minWidth: 28,
  },
  saveCatchButtonContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  saveCatchButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveCatchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFFB2',
    fontWeight: '500',
  },
});

export default FishermansTrackerLocationDetail;
