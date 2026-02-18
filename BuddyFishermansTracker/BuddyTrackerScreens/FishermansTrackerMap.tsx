import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { launchImageLibrary } from 'react-native-image-picker';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../TrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';
import type { CatchItem, LocationItem } from './FishermansTrackerLocations';
import { BlurView } from '@react-native-community/blur';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useStorage } from '../FishermansStore/fishermansContxt';
import Orientation from 'react-native-orientation-locker';
import {
  LOCATIONS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  MAP_DRAFT_KEY,
  formatDate,
  formatTimer,
} from '../fishermansUtils';

type MapDraft = {
  title: string;
  latitude: number;
  longitude: number;
  sessionStartTime: number;
  catches: CatchItem[];
  sessionLocationId?: string;
};

const DEFAULT_REGION = {
  latitude: 45.5,
  longitude: -0.5,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const MAX_CATCHES_PER_SESSION = 2;

const FishermansTrackerMap: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerMap'>>();
  const [title, setTitle] = useState('');
  const [pin, setPin] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [catchModalVisible, setCatchModalVisible] = useState(false);
  const [catchTitle, setCatchTitle] = useState('');
  const [catchSpecies, setCatchSpecies] = useState('');
  const [catchWeight, setCatchWeight] = useState('');
  const [catchWeather, setCatchWeather] = useState('');
  const [catchEquipment, setCatchEquipment] = useState('');
  const [catchImageUri, setCatchImageUri] = useState<string | null>(null);
  const [pendingCatches, setPendingCatches] = useState<CatchItem[]>([]);
  const [isSessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const { isEnabledNotifications } = useStorage();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, []),
  );

  const loadProfileUnit = async () => {
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
        console.warn('FishermansTrackerMap: loadProfileUnit failed', err);
      }
      setWeightUnit('kg');
    }
  };

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

  const handleStartFishing = () => {
    setSessionActive(true);
    setSessionStartTime(Date.now());
    setTimerSeconds(0);
    setPendingCatches([]);
  };

  const handleEndFishing = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      await AsyncStorage.removeItem(MAP_DRAFT_KEY);
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerMap: handleEndFishing failed', err);
      }
    }
    setSessionActive(false);
    setSessionStartTime(null);
    setTimerSeconds(0);
    setPendingCatches([]);
  };

  const openCatchModal = () => {
    setCatchTitle('');
    setCatchSpecies('');
    setCatchWeight('');
    setCatchWeather('');
    setCatchEquipment('');
    setCatchImageUri(null);
    setCatchModalVisible(true);
  };

  const closeCatchModal = () => setCatchModalVisible(false);

  const handlePickCatchImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      response => {
        if (response.didCancel) return;
        const uri = response.assets?.[0]?.uri ?? null;
        if (uri) setCatchImageUri(uri);
      },
    );
  };

  const handleSaveCatch = async () => {
    const newCatch: CatchItem = {
      id: Date.now().toString(),
      title: catchTitle.trim() || 'Catch',
      species: catchSpecies.trim(),
      weight: catchWeight.trim(),
      weatherConditions: catchWeather.trim(),
      equipment: catchEquipment.trim(),
      imageUri: catchImageUri,
    };
    const nextCatches =
      pendingCatches.length >= MAX_CATCHES_PER_SESSION
        ? pendingCatches
        : [newCatch, ...pendingCatches];
    setPendingCatches(nextCatches);
    closeCatchModal();

    if (sessionStartTime === null) return;
    const totalSessionSeconds = Math.floor(
      (Date.now() - sessionStartTime) / 1000,
    );
    const locationTitle =
      catchTitle.trim() || title.trim() || 'Title of place here';
    try {
      const draftRaw = await AsyncStorage.getItem(MAP_DRAFT_KEY);
      const draft = draftRaw ? (JSON.parse(draftRaw) as MapDraft) : null;
      const sessionLocationId = draft?.sessionLocationId;

      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as LocationItem[]) : [];

      if (sessionLocationId) {
        const idx = list.findIndex(l => l.id === sessionLocationId);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            title: locationTitle,
            catches: nextCatches.length > 0 ? nextCatches : undefined,
            totalSessionSeconds,
          };
          await AsyncStorage.setItem(
            LOCATIONS_STORAGE_KEY,
            JSON.stringify(list),
          );
          if (isEnabledNotifications) {
            Toast.show({
              type: 'success',
              text1: 'Successfully saved',
              position: 'top',
              visibilityTime: 2000,
            });
          }
        }
      } else {
        const newLocation: LocationItem = {
          id: Date.now().toString(),
          title: locationTitle,
          date: formatDate(new Date()),
          latitude: pin.latitude,
          longitude: pin.longitude,
          catches: nextCatches.length > 0 ? nextCatches : undefined,
          totalSessionSeconds,
        };
        const next = [newLocation, ...list];
        await AsyncStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(next));
        await AsyncStorage.setItem(
          MAP_DRAFT_KEY,
          JSON.stringify({
            title,
            latitude: pin.latitude,
            longitude: pin.longitude,
            sessionStartTime,
            catches: nextCatches,
            sessionLocationId: newLocation.id,
          } as MapDraft),
        );
        if (isEnabledNotifications) {
          Toast.show({
            type: 'success',
            text1: 'Successfully saved',
            position: 'top',
            visibilityTime: 2000,
          });
        }
        return;
      }

      await AsyncStorage.setItem(
        MAP_DRAFT_KEY,
        JSON.stringify({
          title,
          latitude: pin.latitude,
          longitude: pin.longitude,
          sessionStartTime,
          catches: nextCatches,
          sessionLocationId,
        } as MapDraft),
      );
      if (isEnabledNotifications) {
        Toast.show({
          type: 'success',
          text1: 'Successfully saved',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerMap: handleSaveCatch failed', err);
      }
    }
  };

  const canAddCatch =
    isSessionActive && pendingCatches.length < MAX_CATCHES_PER_SESSION;

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Image
          source={require('../FishermansTrackerAssets/images/header.png')}
          style={styles.header}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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

      {isSessionActive && (
        <View style={styles.timerWrap}>
          <Text style={styles.timerText}>{formatTimer(timerSeconds)}</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          onPress={e => setPin(e.nativeEvent.coordinate)}
        >
          <Marker coordinate={pin}>
            <Image
              source={require('../FishermansTrackerAssets/images/marker.png')}
            />
          </Marker>
        </MapView>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <Text style={styles.titleInputFlex}>Title of place here</Text>
          <TouchableOpacity
            style={[
              styles.addCatchButton,
              !canAddCatch && styles.addCatchButtonDisabled,
            ]}
            onPress={canAddCatch ? openCatchModal : undefined}
            activeOpacity={0.8}
            disabled={!canAddCatch}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/addcatch.png')}
            />
            <Text style={styles.addCatchText}>Add catch</Text>
          </TouchableOpacity>
        </View>
        {!isSessionActive ? (
          <TouchableOpacity
            onPress={handleStartFishing}
            activeOpacity={0.8}
            style={styles.startButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Start fishing</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndFishing}
            activeOpacity={0.8}
          >
            <Text style={styles.endButtonText}>End fishing</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={catchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCatchModal}
        statusBarTranslucent={Platform.OS === 'android'}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            blurType="light"
            blurAmount={10}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={closeCatchModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={styles.modalCard}
          >
            <Text style={styles.modalTitle}>🎉 Log New Catch</Text>

            <TouchableOpacity
              style={styles.catchImageCircle}
              onPress={handlePickCatchImage}
              activeOpacity={0.8}
            >
              {catchImageUri ? (
                <Image
                  source={{ uri: catchImageUri }}
                  style={styles.catchImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              placeholderTextColor="#FFFFFFB2"
              value={catchTitle}
              maxLength={20}
              onChangeText={setCatchTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Species"
              placeholderTextColor="#FFFFFFB2"
              value={catchSpecies}
              maxLength={20}
              onChangeText={setCatchSpecies}
            />
            <View style={styles.weightRow}>
              <TextInput
                style={[styles.modalInput, styles.weightInput]}
                placeholder="Weight"
                placeholderTextColor="#FFFFFFB2"
                value={catchWeight}
                maxLength={5}
                onChangeText={setCatchWeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.unitLabel}>
                {weightUnit === 'lb' ? 'Lb' : 'Kg'}
              </Text>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Weather Conditions"
              placeholderTextColor="#FFFFFFB2"
              value={catchWeather}
              maxLength={20}
              onChangeText={setCatchWeather}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Equipment"
              placeholderTextColor="#FFFFFFB2"
              value={catchEquipment}
              maxLength={20}
              onChangeText={setCatchEquipment}
            />

            {(() => {
              const isCatchFormValid =
                !!catchImageUri &&
                catchTitle.trim() !== '' &&
                catchSpecies.trim() !== '' &&
                catchWeight.trim() !== '' &&
                catchWeather.trim() !== '' &&
                catchEquipment.trim() !== '';
              return (
                <TouchableOpacity
                  onPress={isCatchFormValid ? handleSaveCatch : undefined}
                  activeOpacity={0.8}
                  disabled={!isCatchFormValid}
                  style={[
                    styles.saveCatchButtonContainer,
                    !isCatchFormValid && styles.saveCatchButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      isCatchFormValid
                        ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                        : ['#97C5B8', '#97C5B8', '#97C5B8']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveCatchButton}
                  >
                    <Text
                      style={[
                        styles.saveCatchButtonText,
                        !isCatchFormValid && styles.saveCatchButtonTextDisabled,
                      ]}
                    >
                      Save Catch
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })()}
            <TouchableOpacity
              onPress={closeCatchModal}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    gap: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  timerWrap: {
    marginHorizontal: 20,
    backgroundColor: '#286E42',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 1,
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#fff',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    backgroundColor: '#286E42',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'absolute',
    bottom: 40,
    width: '90%',
    alignSelf: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleInputFlex: {
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  addCatchButtonDisabled: {
    opacity: 0.8,
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
    width: 110,
    height: 110,
    borderRadius: 55,
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
    color: '#FFFFFF',
    minWidth: 28,
    position: 'absolute',
    right: 16,
    top: 14,
  },
  saveCatchButtonContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  saveCatchButtonDisabled: {
    opacity: 0.7,
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
  saveCatchButtonTextDisabled: {
    color: '#555',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 7,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default FishermansTrackerMap;
