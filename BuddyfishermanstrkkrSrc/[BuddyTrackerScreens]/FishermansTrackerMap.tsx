// main map screen - allows user to set location, add catches with details and photos, start/end fishing session, also has timer and saves data to async storage

import Toast from 'react-native-toast-message';
import { useStorage } from '../FishermansStore/fishermansContxt';
import Orientation from 'react-native-orientation-locker';
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
import { StackList } from '../../Fishermanstackkrouts';

import LinearGradient from 'react-native-linear-gradient';
import type { CatchItem, LocationItem } from './FishermansTrackerLocations';
import { BlurView } from '@react-native-community/blur';

import { useFocusEffect } from '@react-navigation/native';

import {
  LOCATIONS_STORAGE_KEY,
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

const buddyTrckrDefaultRegion = {
  latitude: 45.5,
  longitude: -0.5,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const buddyTrckrMaxCatchesPerSession = 2;

const FishermansTrackerMap: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerMap'>>();
  const [buddyTrckrTitle, setBuddyTrckrTitle] = useState('');
  const [buddyTrckrPin, setBuddyTrckrPin] = useState({
    latitude: buddyTrckrDefaultRegion.latitude,
    longitude: buddyTrckrDefaultRegion.longitude,
  });
  const [buddyTrckrCatchModalVisible, setBuddyTrckrCatchModalVisible] =
    useState(false);
  const [buddyTrckrCatchTitle, setBuddyTrckrCatchTitle] = useState('');
  const [buddyTrckrCatchSpecies, setBuddyTrckrCatchSpecies] = useState('');
  const [buddyTrckrCatchWeight, setBuddyTrckrCatchWeight] = useState('');
  const [buddyTrckrCatchWeather, setBuddyTrckrCatchWeather] = useState('');
  const [buddyTrckrCatchEquipment, setBuddyTrckrCatchEquipment] = useState('');
  const [buddyTrckrCatchImageUri, setBuddyTrckrCatchImageUri] = useState<
    string | null
  >(null);
  const [buddyTrckrPendingCatches, setBuddyTrckrPendingCatches] = useState<
    CatchItem[]
  >([]);
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
  const { isEnabledNotifications: buddyTrckrIsEnabledNotifications } =
    useStorage();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, []),
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

  const buddyTrckrHandleStartFishing = () => {
    setBuddyTrckrSessionActive(true);
    setBuddyTrckrSessionStartTime(Date.now());
    setBuddyTrckrTimerSeconds(0);
    setBuddyTrckrPendingCatches([]);
  };

  const buddyTrckrHandleEndFishing = async () => {
    if (buddyTrckrTimerRef.current) {
      clearInterval(buddyTrckrTimerRef.current);
      buddyTrckrTimerRef.current = null;
    }
    try {
      await AsyncStorage.removeItem(MAP_DRAFT_KEY);
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerMap: handleEndFishing failed',
          buddyTrckrErr,
        );
      }
    }
    setBuddyTrckrSessionActive(false);
    setBuddyTrckrSessionStartTime(null);
    setBuddyTrckrTimerSeconds(0);
    setBuddyTrckrPendingCatches([]);
  };

  const buddyTrckrOpenCatchModal = () => {
    setBuddyTrckrCatchTitle('');
    setBuddyTrckrCatchSpecies('');
    setBuddyTrckrCatchWeight('');
    setBuddyTrckrCatchWeather('');
    setBuddyTrckrCatchEquipment('');
    setBuddyTrckrCatchImageUri(null);
    setBuddyTrckrCatchModalVisible(true);
  };

  const buddyTrckrCloseCatchModal = () => setBuddyTrckrCatchModalVisible(false);

  const buddyTrckrHandlePickCatchImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      buddyTrckrResponse => {
        if (buddyTrckrResponse.didCancel) return;
        const buddyTrckrUri = buddyTrckrResponse.assets?.[0]?.uri ?? null;
        if (buddyTrckrUri) setBuddyTrckrCatchImageUri(buddyTrckrUri);
      },
    );
  };

  const buddyTrckrHandleSaveCatch = async () => {
    const buddyTrckrNewCatch: CatchItem = {
      id: Date.now().toString(),
      title: buddyTrckrCatchTitle.trim() || 'Catch',
      species: buddyTrckrCatchSpecies.trim(),
      weight: buddyTrckrCatchWeight.trim(),
      weatherConditions: buddyTrckrCatchWeather.trim(),
      equipment: buddyTrckrCatchEquipment.trim(),
      imageUri: buddyTrckrCatchImageUri,
    };

    const buddyTrckrNextCatches =
      buddyTrckrPendingCatches.length >= buddyTrckrMaxCatchesPerSession
        ? buddyTrckrPendingCatches
        : [buddyTrckrNewCatch, ...buddyTrckrPendingCatches];

    setBuddyTrckrPendingCatches(buddyTrckrNextCatches);
    buddyTrckrCloseCatchModal();

    if (buddyTrckrSessionStartTime === null) return;

    const buddyTrckrTotalSessionSeconds = Math.floor(
      (Date.now() - buddyTrckrSessionStartTime) / 1000,
    );

    const buddyTrckrLocationTitle =
      buddyTrckrCatchTitle.trim() ||
      buddyTrckrTitle.trim() ||
      'Title of place here';

    try {
      const buddyTrckrDraftRaw = await AsyncStorage.getItem(MAP_DRAFT_KEY);
      const buddyTrckrDraft = buddyTrckrDraftRaw
        ? (JSON.parse(buddyTrckrDraftRaw) as MapDraft)
        : null;
      const buddyTrckrSessionLocationId = buddyTrckrDraft?.sessionLocationId;

      const buddyTrckrRaw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      const buddyTrckrList = buddyTrckrRaw
        ? (JSON.parse(buddyTrckrRaw) as LocationItem[])
        : [];

      if (buddyTrckrSessionLocationId) {
        const buddyTrckrIdx = buddyTrckrList.findIndex(
          buddyTrckrLocation =>
            buddyTrckrLocation.id === buddyTrckrSessionLocationId,
        );

        if (buddyTrckrIdx !== -1) {
          buddyTrckrList[buddyTrckrIdx] = {
            ...buddyTrckrList[buddyTrckrIdx],
            title: buddyTrckrLocationTitle,
            catches:
              buddyTrckrNextCatches.length > 0
                ? buddyTrckrNextCatches
                : undefined,
            totalSessionSeconds: buddyTrckrTotalSessionSeconds,
          };

          await AsyncStorage.setItem(
            LOCATIONS_STORAGE_KEY,
            JSON.stringify(buddyTrckrList),
          );

          if (buddyTrckrIsEnabledNotifications) {
            Toast.show({
              type: 'success',
              text1: 'Successfully saved',
              position: 'top',
              visibilityTime: 2000,
            });
          }
        }
      } else {
        const buddyTrckrNewLocation: LocationItem = {
          id: Date.now().toString(),
          title: buddyTrckrLocationTitle,
          date: formatDate(new Date()),
          latitude: buddyTrckrPin.latitude,
          longitude: buddyTrckrPin.longitude,
          catches:
            buddyTrckrNextCatches.length > 0
              ? buddyTrckrNextCatches
              : undefined,
          totalSessionSeconds: buddyTrckrTotalSessionSeconds,
        };

        const buddyTrckrNext = [buddyTrckrNewLocation, ...buddyTrckrList];

        await AsyncStorage.setItem(
          LOCATIONS_STORAGE_KEY,
          JSON.stringify(buddyTrckrNext),
        );

        await AsyncStorage.setItem(
          MAP_DRAFT_KEY,
          JSON.stringify({
            title: buddyTrckrTitle,
            latitude: buddyTrckrPin.latitude,
            longitude: buddyTrckrPin.longitude,
            sessionStartTime: buddyTrckrSessionStartTime,
            catches: buddyTrckrNextCatches,
            sessionLocationId: buddyTrckrNewLocation.id,
          } as MapDraft),
        );

        if (buddyTrckrIsEnabledNotifications) {
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
          title: buddyTrckrTitle,
          latitude: buddyTrckrPin.latitude,
          longitude: buddyTrckrPin.longitude,
          sessionStartTime: buddyTrckrSessionStartTime,
          catches: buddyTrckrNextCatches,
          sessionLocationId: buddyTrckrSessionLocationId,
        } as MapDraft),
      );

      if (buddyTrckrIsEnabledNotifications) {
        Toast.show({
          type: 'success',
          text1: 'Successfully saved',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerMap: handleSaveCatch failed',
          buddyTrckrErr,
        );
      }
    }
  };

  const buddyTrckrCanAddCatch =
    buddyTrckrIsSessionActive &&
    buddyTrckrPendingCatches.length < buddyTrckrMaxCatchesPerSession;

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.buddyTrckrContainer}
    >
      <View style={styles.buddyTrckrHeaderContainer}>
        <Image
          source={require('../FishermansTrackerAssets/images/header.png')}
          style={styles.buddyTrckrHeader}
        />
        <TouchableOpacity
          style={styles.buddyTrckrBackButton}
          onPress={() => buddyTrckrNavigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../FishermansTrackerAssets/images/backArrow.png')}
          />
          <Text style={styles.buddyTrckrBackButtonText}>Back</Text>
        </TouchableOpacity>
        <Image
          source={require('../FishermansTrackerAssets/images/headerImg.png')}
          style={styles.buddyTrckrHeaderImg}
        />
      </View>

      {buddyTrckrIsSessionActive && (
        <View style={styles.buddyTrckrTimerWrap}>
          <Text style={styles.buddyTrckrTimerText}>
            {formatTimer(buddyTrckrTimerSeconds)}
          </Text>
        </View>
      )}

      <View style={styles.buddyTrckrMapContainer}>
        <MapView
          style={styles.buddyTrckrMap}
          initialRegion={buddyTrckrDefaultRegion}
          onPress={buddyTrckrEvent =>
            setBuddyTrckrPin(buddyTrckrEvent.nativeEvent.coordinate)
          }
        >
          <Marker coordinate={buddyTrckrPin}>
            <Image
              source={require('../FishermansTrackerAssets/images/marker.png')}
            />
          </Marker>
        </MapView>
      </View>

      <View style={styles.buddyTrckrBottomBar}>
        <View style={styles.buddyTrckrBottomRow}>
          <Text style={styles.buddyTrckrTitleInputFlex}>
            Title of place here
          </Text>
          <TouchableOpacity
            style={[
              styles.buddyTrckrAddCatchButton,
              !buddyTrckrCanAddCatch && styles.buddyTrckrAddCatchButtonDisabled,
            ]}
            onPress={
              buddyTrckrCanAddCatch ? buddyTrckrOpenCatchModal : undefined
            }
            activeOpacity={0.8}
            disabled={!buddyTrckrCanAddCatch}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/addcatch.png')}
            />
            <Text style={styles.buddyTrckrAddCatchText}>Add catch</Text>
          </TouchableOpacity>
        </View>

        {!buddyTrckrIsSessionActive ? (
          <TouchableOpacity
            onPress={buddyTrckrHandleStartFishing}
            activeOpacity={0.8}
            style={styles.buddyTrckrStartButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buddyTrckrStartButton}
            >
              <Text style={styles.buddyTrckrStartButtonText}>
                Start fishing
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.buddyTrckrEndButton}
            onPress={buddyTrckrHandleEndFishing}
            activeOpacity={0.8}
          >
            <Text style={styles.buddyTrckrEndButtonText}>End fishing</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={buddyTrckrCatchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={buddyTrckrCloseCatchModal}
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
          style={styles.buddyTrckrModalBackdrop}
          activeOpacity={1}
          onPress={buddyTrckrCloseCatchModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={buddyTrckrEvent => buddyTrckrEvent.stopPropagation()}
            style={styles.buddyTrckrModalCard}
          >
            <Text style={styles.buddyTrckrModalTitle}>🎉 Log New Catch</Text>

            <TouchableOpacity
              style={styles.buddyTrckrCatchImageCircle}
              onPress={buddyTrckrHandlePickCatchImage}
              activeOpacity={0.8}
            >
              {buddyTrckrCatchImageUri ? (
                <Image
                  source={{ uri: buddyTrckrCatchImageUri }}
                  style={styles.buddyTrckrCatchImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.buddyTrckrModalInput}
              placeholder="Title"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrCatchTitle}
              maxLength={20}
              onChangeText={setBuddyTrckrCatchTitle}
            />
            <TextInput
              style={styles.buddyTrckrModalInput}
              placeholder="Species"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrCatchSpecies}
              maxLength={20}
              onChangeText={setBuddyTrckrCatchSpecies}
            />
            <View style={styles.buddyTrckrWeightRow}>
              <TextInput
                style={[
                  styles.buddyTrckrModalInput,
                  styles.buddyTrckrWeightInput,
                ]}
                placeholder="Weight"
                placeholderTextColor="#FFFFFFB2"
                value={buddyTrckrCatchWeight}
                maxLength={5}
                onChangeText={setBuddyTrckrCatchWeight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.buddyTrckrUnitLabel}>
                {buddyTrckrWeightUnit === 'lb' ? 'Lb' : 'Kg'}
              </Text>
            </View>
            <TextInput
              style={styles.buddyTrckrModalInput}
              placeholder="Weather Conditions"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrCatchWeather}
              maxLength={20}
              onChangeText={setBuddyTrckrCatchWeather}
            />
            <TextInput
              style={styles.buddyTrckrModalInput}
              placeholder="Equipment"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrCatchEquipment}
              maxLength={20}
              onChangeText={setBuddyTrckrCatchEquipment}
            />

            {(() => {
              const buddyTrckrIsCatchFormValid =
                !!buddyTrckrCatchImageUri &&
                buddyTrckrCatchTitle.trim() !== '' &&
                buddyTrckrCatchSpecies.trim() !== '' &&
                buddyTrckrCatchWeight.trim() !== '' &&
                buddyTrckrCatchWeather.trim() !== '' &&
                buddyTrckrCatchEquipment.trim() !== '';

              return (
                <TouchableOpacity
                  onPress={
                    buddyTrckrIsCatchFormValid
                      ? buddyTrckrHandleSaveCatch
                      : undefined
                  }
                  activeOpacity={0.8}
                  disabled={!buddyTrckrIsCatchFormValid}
                  style={[
                    styles.buddyTrckrSaveCatchButtonContainer,
                    !buddyTrckrIsCatchFormValid &&
                      styles.buddyTrckrSaveCatchButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      buddyTrckrIsCatchFormValid
                        ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                        : ['#97C5B8', '#97C5B8', '#97C5B8']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buddyTrckrSaveCatchButton}
                  >
                    <Text
                      style={[
                        styles.buddyTrckrSaveCatchButtonText,
                        !buddyTrckrIsCatchFormValid &&
                          styles.buddyTrckrSaveCatchButtonTextDisabled,
                      ]}
                    >
                      Save Catch
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })()}

            <TouchableOpacity
              onPress={buddyTrckrCloseCatchModal}
              style={styles.buddyTrckrCancelButton}
            >
              <Text style={styles.buddyTrckrCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrContainer: {
    flex: 1,
  },
  buddyTrckrHeaderContainer: {
    width: '100%',
    marginBottom: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  buddyTrckrHeader: {
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
  buddyTrckrBackButton: {
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
  buddyTrckrBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrTimerWrap: {
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
  buddyTrckrTimerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  buddyTrckrMapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  buddyTrckrMap: {
    width: '100%',
    height: '100%',
  },
  buddyTrckrBottomBar: {
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
  buddyTrckrBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  buddyTrckrTitleInputFlex: {
    fontSize: 20,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buddyTrckrAddCatchButtonDisabled: {
    opacity: 0.8,
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
    color: '#FFFFFF',
    minWidth: 28,
    position: 'absolute',
    right: 16,
    top: 14,
  },
  buddyTrckrSaveCatchButtonContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 12,
  },
  buddyTrckrSaveCatchButtonDisabled: {
    opacity: 0.7,
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
  buddyTrckrSaveCatchButtonTextDisabled: {
    color: '#555',
  },
  buddyTrckrCancelButton: {
    alignSelf: 'center',
    paddingVertical: 7,
  },
  buddyTrckrCancelButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default FishermansTrackerMap;
