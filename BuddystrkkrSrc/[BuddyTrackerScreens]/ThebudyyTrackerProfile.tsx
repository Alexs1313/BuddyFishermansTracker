// profile screen - allows user to set their nickname, choose between kg and lb for weight units, and upload a profile picture, also has a toggle for notifications and a button to share the app with friends, all data is saved to async storage and loaded on app start

import { StackList } from '../../Stackkrouts';
import LinearGradient from 'react-native-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Switch,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { StackNavigationProp } from '@react-navigation/stack';

import Toast from 'react-native-toast-message';
import {
  PROFILE_STORAGE_KEY,
  NOTIFICATIONS_KEY,
  NOTES_STORAGE_KEY,
  SAVED_RECIPES_KEY,
  LOCATIONS_STORAGE_KEY,
  MAP_DRAFT_KEY,
} from '../fishermansUtils';
import { useStorage } from '../thebuddstrrre/thebuddcontxt';

type ProfileData = {
  nickname: string;
  unit: 'kg' | 'lb';
  avatarUri: string | null;
};

const ThebudyyTrackerProfile: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'ThebudyyTrackerProfile'>>();
  const [buddyTrckrNickname, setBuddyTrckrNickname] = useState('');
  const [buddyTrckrUnit, setBuddyTrckrUnit] = useState<'kg' | 'lb'>('kg');
  const [buddyTrckrAvatarUri, setBuddyTrckrAvatarUri] = useState<string | null>(
    null,
  );
  const [buddyTrckrInitialData, setBuddyTrckrInitialData] =
    useState<ProfileData | null>(null);
  const {
    isEnabledNotifications: buddyTrckrIsEnabledNotifications,
    setIsEnabledNotifications: buddyTrckrSetIsEnabledNotifications,
  } = useStorage();

  const buddyTrckrToggleNotifications = async (buddyTrckrValue: boolean) => {
    Toast.show({
      type: 'success',
      text1: `Notifications ${buddyTrckrValue ? 'enabled' : 'disabled'}`,
      position: 'top',
      visibilityTime: 2000,
    });

    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(buddyTrckrValue),
      );
      buddyTrckrSetIsEnabledNotifications(buddyTrckrValue);
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerProfile: toggleNotifications failed',
          buddyTrckrErr,
        );
      }
    }
  };

  const buddyTrckrHasChanges = Boolean(
    buddyTrckrInitialData &&
      ((buddyTrckrNickname.trim() || 'there') !==
        (buddyTrckrInitialData.nickname?.trim() || 'there') ||
        buddyTrckrUnit !== buddyTrckrInitialData.unit ||
        buddyTrckrAvatarUri !== buddyTrckrInitialData.avatarUri),
  );

  const buddyTrckrLoadProfile = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrData = JSON.parse(buddyTrckrRaw) as ProfileData;
        const buddyTrckrLoaded: ProfileData = {
          nickname: buddyTrckrData.nickname ?? '',
          unit: buddyTrckrData.unit === 'lb' ? 'lb' : 'kg',
          avatarUri: buddyTrckrData.avatarUri ?? null,
        };
        setBuddyTrckrNickname(buddyTrckrLoaded.nickname);
        setBuddyTrckrUnit(buddyTrckrLoaded.unit);
        setBuddyTrckrAvatarUri(buddyTrckrLoaded.avatarUri);
        setBuddyTrckrInitialData(buddyTrckrLoaded);
      } else {
        setBuddyTrckrNickname('');
        setBuddyTrckrUnit('kg');
        setBuddyTrckrAvatarUri(null);
        setBuddyTrckrInitialData({
          nickname: '',
          unit: 'kg',
          avatarUri: null,
        });
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerProfile: loadProfile failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrNickname('');
      setBuddyTrckrUnit('kg');
      setBuddyTrckrAvatarUri(null);
      setBuddyTrckrInitialData({
        nickname: '',
        unit: 'kg',
        avatarUri: null,
      });
    }
  };

  useEffect(() => {
    buddyTrckrLoadProfile();
  }, []);

  const buddyTrckrHandlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      buddyTrckrResponse => {
        if (buddyTrckrResponse.didCancel) return;
        if (buddyTrckrResponse.errorCode) {
          Alert.alert(
            'error',
            buddyTrckrResponse.errorMessage ?? 'Failed to select photo',
          );
          return;
        }
        const buddyTrckrUri = buddyTrckrResponse.assets?.[0]?.uri ?? null;
        if (buddyTrckrUri) setBuddyTrckrAvatarUri(buddyTrckrUri);
      },
    );
  };

  const buddyTrckrHandleSave = async () => {
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          nickname: buddyTrckrNickname.trim() || 'there',
          unit: buddyTrckrUnit,
          avatarUri: buddyTrckrAvatarUri,
        }),
      );
      buddyTrckrNavigation.goBack();
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerProfile: handleSave failed',
          buddyTrckrErr,
        );
      }
    }
  };

  const buddyTrckrHandleShareApp = () => {
    Linking.openURL(
      'https://apps.apple.com/us/app/the-fisher-man-buddy/id6760774809',
    );
  };

  const buddyTrckrHandleResetData = () => {
    Alert.alert(
      'Reset All Data?',
      'This will permanently delete all trips, catches, saved spots, notes, and statistics. Your profile will be kept. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                NOTIFICATIONS_KEY,
                NOTES_STORAGE_KEY,
                SAVED_RECIPES_KEY,
                LOCATIONS_STORAGE_KEY,
                MAP_DRAFT_KEY,
              ]);
            } catch (buddyTrckrErr) {
              if (__DEV__) {
                console.warn(
                  'FishermansTrackerProfile: handleResetData failed',
                  buddyTrckrErr,
                );
              }
            }
          },
        },
      ],
    );
  };

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.buddyTrckrContainer}
    >
      <ScrollView
        style={styles.buddyTrckrScroll}
        contentContainerStyle={styles.buddyTrckrScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
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

        <View style={{ paddingHorizontal: 20, width: '100%' }}>
          <View style={styles.buddyTrckrCard}>
            <Text style={styles.buddyTrckrTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.buddyTrckrAvatarPlaceholder}
              activeOpacity={0.8}
              onPress={buddyTrckrHandlePickImage}
            >
              {buddyTrckrAvatarUri ? (
                <Image
                  source={{ uri: buddyTrckrAvatarUri }}
                  style={styles.buddyTrckrAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.buddyTrckrInput}
              placeholder="Name"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrNickname}
              onChangeText={setBuddyTrckrNickname}
              maxLength={10}
            />

            <View style={styles.buddyTrckrUnitRow}>
              <TouchableOpacity
                style={[
                  styles.buddyTrckrUnitOption,
                  buddyTrckrUnit === 'kg' && styles.buddyTrckrUnitOptionActive,
                ]}
                onPress={() => setBuddyTrckrUnit('kg')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.buddyTrckrRadio,
                    buddyTrckrUnit === 'kg' && styles.buddyTrckrRadioActive,
                  ]}
                />
                <Text style={styles.buddyTrckrUnitLabel}>Kg (Kilograms)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.buddyTrckrUnitOption,
                  buddyTrckrUnit === 'lb' && styles.buddyTrckrUnitOptionActive,
                ]}
                onPress={() => setBuddyTrckrUnit('lb')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.buddyTrckrRadio,
                    buddyTrckrUnit === 'lb' && styles.buddyTrckrRadioActive,
                  ]}
                />
                <Text style={styles.buddyTrckrUnitLabel}>Lb (Pounds)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={buddyTrckrHasChanges ? buddyTrckrHandleSave : undefined}
              activeOpacity={0.8}
              style={styles.buddyTrckrSaveButtonContainer}
              disabled={!buddyTrckrHasChanges}
            >
              <LinearGradient
                colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buddyTrckrSaveButton,
                  !buddyTrckrHasChanges && styles.buddyTrckrSaveButtonDisabled,
                ]}
              >
                {!buddyTrckrHasChanges && (
                  <Image
                    source={require('../FishermansTrackerAssets/images/edit.png')}
                  />
                )}
                <Text
                  style={[
                    styles.buddyTrckrSaveButtonText,
                    !buddyTrckrHasChanges &&
                      styles.buddyTrckrSaveButtonTextDisabled,
                  ]}
                >
                  {buddyTrckrHasChanges ? 'Save' : 'Edit'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.buddyTrckrSettingsContainer}>
            <View style={styles.buddyTrckrSettingsRow}>
              <Text style={styles.buddyTrckrSettingsRowText}>
                Notifications
              </Text>
              <Switch
                value={buddyTrckrIsEnabledNotifications}
                onValueChange={buddyTrckrValue =>
                  buddyTrckrToggleNotifications(buddyTrckrValue)
                }
                trackColor={{ false: '#ccc', true: '#FF9F29' }}
                thumbColor="#fff"
              />
            </View>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.buddyTrckrSettingsRow}
                onPress={buddyTrckrHandleShareApp}
                activeOpacity={0.8}
              >
                <Text style={styles.buddyTrckrSettingsRowText}>
                  Share the App
                </Text>
                <Image
                  source={require('../FishermansTrackerAssets/images/shareapp.png')}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.buddyTrckrSettingsRow}
              onPress={buddyTrckrHandleResetData}
              activeOpacity={0.8}
            >
              <Text style={styles.buddyTrckrSettingsRowText}>
                Reset All Data
              </Text>
              <Image
                source={require('../FishermansTrackerAssets/images/reset.png')}
              />
            </TouchableOpacity>
            {/* 
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[
                  styles.buddyTrckrSettingsRow,
                  { justifyContent: 'center' },
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    'https://www.termsfeed.com/live/72f3fddd-07b9-4f5f-8318-60f63e1c3d2b',
                  )
                }
              >
                <Text style={styles.buddyTrckrSettingsRowText}>
                  Terms of Use
                </Text>
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </ScrollView>
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
  },
  buddyTrckrHeader: {
    width: '100%',
    height: 156,
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
    gap: 8,
  },
  buddyTrckrBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrScroll: {
    flex: 1,
  },
  buddyTrckrScrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  buddyTrckrCard: {
    width: '100%',
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    marginBottom: 20,
    marginTop: 20,
  },
  buddyTrckrTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  buddyTrckrAvatarPlaceholder: {
    width: 142,
    height: 142,
    borderRadius: 70,
    backgroundColor: '#799930',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  buddyTrckrAvatarImage: {
    width: '100%',
    height: '100%',
  },
  buddyTrckrInput: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  buddyTrckrUnitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  buddyTrckrUnitOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 60,
    padding: 10,
    gap: 8,
  },
  buddyTrckrUnitOptionActive: {},
  buddyTrckrRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  buddyTrckrRadioActive: {
    backgroundColor: '#FF9F29',
    borderColor: '#fff',
  },
  buddyTrckrUnitLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  buddyTrckrSaveButtonContainer: {
    width: '100%',
  },
  buddyTrckrSaveButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buddyTrckrSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  buddyTrckrSaveButtonDisabled: {
    opacity: 0.9,
  },
  buddyTrckrSaveButtonTextDisabled: {
    color: '#007083',
  },
  buddyTrckrSettingsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#286E42',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    minHeight: 55,
  },
  buddyTrckrSettingsRowText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  buddyTrckrSettingsContainer: {
    width: '100%',
  },
});

export default ThebudyyTrackerProfile;
