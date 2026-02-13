import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { launchImageLibrary } from 'react-native-image-picker';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../FishermansTrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';
import type { CatchItem, LocationItem } from './FishermansTrackerLocations';

const LOCATIONS_STORAGE_KEY = '@FishermansTracker/locations';
const PROFILE_STORAGE_KEY = '@FishermansTracker/profile';

type DetailRoute = RouteProp<StackList, 'FishermansTrackerLocationDetail'>;

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSessionTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')} : ${String(m).padStart(
    2,
    '0',
  )} : ${String(s).padStart(2, '0')}`;
}

function totalWeightKg(catches: CatchItem[]): number {
  return catches.reduce((sum, c) => sum + (parseFloat(c.weight) || 0), 0);
}

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
  const [catchModalVisible, setCatchModalVisible] = useState(false);
  const [catchTitle, setCatchTitle] = useState('');
  const [catchSpecies, setCatchSpecies] = useState('');
  const [catchWeight, setCatchWeight] = useState('');
  const [catchWeather, setCatchWeather] = useState('');
  const [catchEquipment, setCatchEquipment] = useState('');
  const [catchImageUri, setCatchImageUri] = useState<string | null>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  const loadProfileUnit = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { unit?: string };
        setWeightUnit(data.unit === 'lb' ? 'lb' : 'kg');
      } else {
        setWeightUnit('kg');
      }
    } catch {
      setWeightUnit('kg');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileUnit();
    }, [loadProfileUnit]),
  );

  const loadLocation = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as LocationItem[];
        const found = list.find(l => l.id === locationId);
        setLocation(found ?? null);
      }
    } catch {
      setLocation(null);
    }
  }, [locationId]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

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

  const saveLocation = useCallback(async (updated: LocationItem) => {
    setLocation(updated);
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as LocationItem[]) : [];
      const next = list.map(l => (l.id === updated.id ? updated : l));
      await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(next));
    } catch (_) {}
  }, []);

  const handleStartFishing = useCallback(() => {
    setSessionActive(true);
    setSessionStartTime(Date.now());
    setTimerSeconds(0);
  }, []);

  const handleEndFishing = useCallback(() => {
    if (!location) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const totalSeconds = timerSeconds;
    setSessionActive(false);
    setSessionStartTime(null);
    setTimerSeconds(0);
    saveLocation({
      ...location,
      totalSessionSeconds: (location.totalSessionSeconds ?? 0) + totalSeconds,
    });
  }, [location, timerSeconds, saveLocation]);

  const handleBack = useCallback(() => {
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
  }, [isSessionActive, navigation]);

  const openCatchModal = useCallback(() => {
    setCatchTitle('');
    setCatchSpecies('');
    setCatchWeight('');
    setCatchWeather('');
    setCatchEquipment('');
    setCatchImageUri(null);
    setCatchModalVisible(true);
  }, []);

  const closeCatchModal = useCallback(() => setCatchModalVisible(false), []);

  const handlePickCatchImage = useCallback(() => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      response => {
        if (response.didCancel) return;
        const uri = response.assets?.[0]?.uri ?? null;
        if (uri) setCatchImageUri(uri);
      },
    );
  }, []);

  const handleSaveCatch = useCallback(() => {
    if (!location) return;
    const newCatch: CatchItem = {
      id: Date.now().toString(),
      title: catchTitle.trim() || 'Catch',
      species: catchSpecies.trim(),
      weight: catchWeight.trim(),
      weatherConditions: catchWeather.trim(),
      equipment: catchEquipment.trim(),
      imageUri: catchImageUri,
    };
    const catches = location.catches ?? [];
    saveLocation({
      ...location,
      catches: [newCatch, ...catches],
    });
    closeCatchModal();
  }, [
    location,
    catchTitle,
    catchSpecies,
    catchWeight,
    catchWeather,
    catchEquipment,
    catchImageUri,
    saveLocation,
    closeCatchModal,
  ]);

  const handleShare = useCallback(() => {
    if (!location) return;
    const message = `${location.title}\n${location.date}\nhttps://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    Share.share({ message, title: location.title });
  }, [location]);

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.header}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/backArrow.png')}
            />
            <Text style={styles.backButtonText}>Back</Text>
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
                <Text style={styles.titleText}>{location.title}</Text>
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
                      {totalWeightKg(location.catches).toFixed(1)} {weightUnit === 'lb' ? 'lb' : 'kg'}
                    </Text>
                  </View>
                )}
                {location.catches && location.catches.length > 0 && (
                  <View style={styles.catchesSection}>
                    {location.catches.map(c => (
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
                            {c.title}
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
                            {c.weight ? `${c.weight} ${weightUnit === 'lb' ? 'Lb' : 'Kg'}` : '—'}
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
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7EC8E3',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
  },
  headerContainer: {
    width: '100%',
    marginBottom: 0,
  },
  header: {
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
  backButton: {
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  timerWrap: {
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
