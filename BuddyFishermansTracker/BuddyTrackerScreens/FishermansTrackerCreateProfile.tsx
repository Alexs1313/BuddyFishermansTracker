import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../TrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';
import { PROFILE_STORAGE_KEY } from '../fishermansUtils';

const FishermansTrackerCreateProfile: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const navigation =
    useNavigation<
      StackNavigationProp<StackList, 'FishermansTrackerCreateProfile'>
    >();

  const isFormValid = nickname.trim().length > 0 && avatarUri !== null;

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('error', response.errorMessage ?? 'failed');
          return;
        }
        const uri = response.assets?.[0]?.uri ?? null;
        if (uri) setAvatarUri(uri);
      },
    );
  };

  const handleCreate = async () => {
    if (!isFormValid) return;
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ nickname: nickname.trim(), unit, avatarUri }),
      );
    } catch (_) {}
    navigation.navigate('FishermansTabsRoutes');
  };

  const handleSkip = () => {
    navigation.navigate('FishermansTabsRoutes');
  };

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.fshCnt}>
          <View style={styles.headerFshCnt}>
            <Image
              source={require('../FishermansTrackerAssets/images/header.png')}
              style={styles.header}
            />
            <Image
              source={require('../FishermansTrackerAssets/images/headerImg.png')}
              style={styles.headerImg}
            />
          </View>

          <View style={styles.profileCard}>
            <Text style={styles.headTtl}>Create profile</Text>

            <TouchableOpacity
              style={styles.phPlaceholder}
              activeOpacity={0.8}
              onPress={handlePickImage}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.nicknameInput}
              placeholder="Nickname"
              placeholderTextColor="#FFFFFFB2"
              value={nickname}
              maxLength={10}
              onChangeText={setNickname}
            />

            <View style={styles.unitWrr}>
              <TouchableOpacity
                style={[
                  styles.unitOptn,
                  unit === 'kg' && styles.unitOptnActive,
                ]}
                onPress={() => setUnit('kg')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioButtn,
                    unit === 'kg' && styles.radioActive,
                  ]}
                />
                <Text style={styles.unitLabelTxt}>Kg (Kilograms)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOptn,
                  unit === 'lb' && styles.unitOptnActive,
                ]}
                onPress={() => setUnit('lb')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioButtn,
                    unit === 'lb' && styles.radioActive,
                  ]}
                />
                <Text style={styles.unitLabelTxt}>Lb (Pounds)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              activeOpacity={0.8}
              style={styles.buttonContainer}
              disabled={!isFormValid}
            >
              <LinearGradient
                colors={
                  isFormValid
                    ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                    : ['#97C5B8', '#97C5B8', '#97C5B8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.profbtn, !isFormValid && styles.buttonDisabled]}
              >
                <Text
                  style={[
                    styles.profbtnTxt,
                    !isFormValid && styles.buttonTextDisabled,
                  ]}
                >
                  Create
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              activeOpacity={0.8}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip</Text>
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
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileCard: {
    width: '90%',
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  headerImg: {
    position: 'absolute',
    right: 20,
    bottom: -10,
  },
  headerFshCnt: {
    width: '100%',
    marginBottom: 36,
  },
  header: {
    width: '100%',
    height: 156,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headTtl: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  phPlaceholder: {
    width: 142,
    height: 142,
    borderRadius: 70,
    backgroundColor: '#799930',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 30,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  nicknameInput: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  unitWrr: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  unitOptn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 60,
    padding: 12,
    paddingHorizontal: 5,
    gap: 8,
  },
  unitOptnActive: {},

  radioButtn: {
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
  unitLabelTxt: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  profbtn: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profbtnTxt: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonTextDisabled: {
    color: '#657375',
  },
  skipText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  skipButton: {
    marginTop: 5,
  },
});

export default FishermansTrackerCreateProfile;
