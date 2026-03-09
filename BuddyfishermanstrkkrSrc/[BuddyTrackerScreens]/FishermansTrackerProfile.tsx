// profile screen - allows user to set their nickname, choose between kg and lb for weight units, and upload a profile picture, also has a toggle for notifications and a button to share the app with friends, all data is saved to async storage and loaded on app start

import { StackList } from '../../Fishermanstackkrouts';
import LinearGradient from 'react-native-linear-gradient';

import { useStorage } from '../FishermansStore/fishermansContxt';

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

type ProfileData = {
  nickname: string;
  unit: 'kg' | 'lb';
  avatarUri: string | null;
};

const FishermansTrackerProfile: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTrackerProfile'>>();
  const [buddyFsNickname, setBuddyFsNickname] = useState('');
  const [buddyFshunit, setBuddyFshunit] = useState<'kg' | 'lb'>('kg');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ProfileData | null>(null);
  const { isEnabledNotifications, setIsEnabledNotifications } = useStorage();

  const buddyFshToggleNotifications = async (value: boolean) => {
    Toast.show({
      type: 'success',
      text1: `Notifications ${value ? 'enabled' : 'disabled'}`,
      position: 'top',
      visibilityTime: 2000,
    });

    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(value));
      setIsEnabledNotifications(value);
    } catch (err) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerProfile: toggleNotifications failed',
          err,
        );
      }
    }
  };

  const hasChanges = Boolean(
    initialData &&
      ((buddyFsNickname.trim() || 'there') !==
        (initialData.nickname?.trim() || 'there') ||
        buddyFshunit !== initialData.unit ||
        avatarUri !== initialData.avatarUri),
  );

  const buddyFshloadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as ProfileData;
        const loaded: ProfileData = {
          nickname: data.nickname ?? '',
          unit: data.unit === 'lb' ? 'lb' : 'kg',
          avatarUri: data.avatarUri ?? null,
        };
        setBuddyFsNickname(loaded.nickname);
        setBuddyFshunit(loaded.unit);
        setAvatarUri(loaded.avatarUri);
        setInitialData(loaded);
      } else {
        setBuddyFsNickname('');
        setBuddyFshunit('kg');
        setAvatarUri(null);
        setInitialData({ nickname: '', unit: 'kg', avatarUri: null });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerProfile: loadProfile failed', err);
      }
      setBuddyFsNickname('');
      setBuddyFshunit('kg');
      setAvatarUri(null);
      setInitialData({ nickname: '', unit: 'kg', avatarUri: null });
    }
  };

  useEffect(() => {
    buddyFshloadProfile();
  }, []);

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            'error',
            response.errorMessage ?? 'Failed to select photo',
          );
          return;
        }
        const uri = response.assets?.[0]?.uri ?? null;
        if (uri) setAvatarUri(uri);
      },
    );
  };

  const buddyFshhandleSave = async () => {
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          nickname: buddyFsNickname.trim() || 'there',
          unit: buddyFshunit,
          avatarUri,
        }),
      );
      navigation.goBack();
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerProfile: handleSave failed', err);
      }
    }
  };

  const handleShareApp = () => {
    Linking.openURL(
      'https://apps.apple.com/us/app/the-fisherman-buddy-tracker/id6759281802',
    );
  };

  const handleResetData = () => {
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
            } catch (err) {
              if (__DEV__) {
                console.warn(
                  'FishermansTrackerProfile: handleResetData failed',
                  err,
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
      style={styles.buddyFshcontainer}
    >
      <ScrollView
        style={styles.buddyFshcScrll}
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
        <View style={{ paddingHorizontal: 20, width: '100%' }}>
          <View style={styles.card}>
            <Text style={styles.title}>Settings</Text>

            <TouchableOpacity
              style={styles.avatarPlaceholder}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#FFFFFFB2"
              value={buddyFsNickname}
              onChangeText={setBuddyFsNickname}
              maxLength={10}
            />

            <View style={styles.unitRow}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  buddyFshunit === 'kg' && styles.unitOptionActive,
                ]}
                onPress={() => setBuddyFshunit('kg')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radio,
                    buddyFshunit === 'kg' && styles.radioActive,
                  ]}
                />
                <Text style={styles.unitLabel}>Kg (Kilograms)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  buddyFshunit === 'lb' && styles.unitOptionActive,
                ]}
                onPress={() => setBuddyFshunit('lb')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radio,
                    buddyFshunit === 'lb' && styles.radioActive,
                  ]}
                />
                <Text style={styles.unitLabel}>Lb (Pounds)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={hasChanges ? buddyFshhandleSave : undefined}
              activeOpacity={0.8}
              style={styles.saveButtonContainer}
              disabled={!hasChanges}
            >
              <LinearGradient
                colors={
                  hasChanges
                    ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                    : ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.saveButton,
                  !hasChanges && styles.saveButtonDisabled,
                ]}
              >
                {!hasChanges && (
                  <Image
                    source={require('../FishermansTrackerAssets/images/edit.png')}
                  />
                )}
                <Text
                  style={[
                    styles.saveButtonText,
                    !hasChanges && styles.saveButtonTextDisabled,
                  ]}
                >
                  {hasChanges ? 'Save' : 'Edit'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.settingsContainer}>
            <View style={styles.settingsRow}>
              <Text style={styles.settingsRowText}>Notifications</Text>
              <Switch
                value={isEnabledNotifications}
                onValueChange={value => buddyFshToggleNotifications(value)}
                trackColor={{ false: '#ccc', true: '#FF9F29' }}
                thumbColor="#fff"
              />
            </View>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={handleShareApp}
                activeOpacity={0.8}
              >
                <Text style={styles.settingsRowText}>Share the App</Text>
                <Image
                  source={require('../FishermansTrackerAssets/images/shareapp.png')}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.settingsRow}
              onPress={handleResetData}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsRowText}>Reset All Data</Text>
              <Image
                source={require('../FishermansTrackerAssets/images/reset.png')}
              />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.settingsRow, { justifyContent: 'center' }]}
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    'https://www.termsfeed.com/live/72f3fddd-07b9-4f5f-8318-60f63e1c3d2b',
                  )
                }
              >
                <Text style={[styles.settingsRowText]}>Terms of Use</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyFshcontainer: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 0,
  },
  header: {
    width: '100%',
    height: 156,
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
  buddyFshcScrll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 142,
    height: 142,
    borderRadius: 70,
    backgroundColor: '#799930',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  unitOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 60,
    padding: 10,
    gap: 8,
  },
  unitOptionActive: {},
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  radioActive: {
    backgroundColor: '#FF9F29',
    borderColor: '#fff',
  },
  unitLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  saveButtonContainer: {
    width: '100%',
  },
  saveButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  saveButtonDisabled: {
    opacity: 0.9,
  },
  saveButtonTextDisabled: {
    color: '#007083',
  },
  settingsRow: {
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
  settingsRowText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  settingsContainer: {
    width: '100%',
  },
});

export default FishermansTrackerProfile;
