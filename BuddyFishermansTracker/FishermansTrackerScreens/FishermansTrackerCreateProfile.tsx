import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
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
import { StackList } from '../FishermansTrackerNavigation/FishermansStackRoutes';
import LinearGradient from 'react-native-linear-gradient';

const FishermansTrackerCreateProfile: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const navigation =
    useNavigation<
      StackNavigationProp<StackList, 'FishermansTrackerCreateProfile'>
    >();

  const isFormValid = nickname.trim().length > 0 && avatarUri !== null;

  const handlePickImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(
            'Ошибка',
            response.errorMessage ?? 'Не удалось выбрать фото',
          );
          return;
        }
        const uri = response.assets?.[0]?.uri ?? null;
        if (uri) setAvatarUri(uri);
      },
    );
  }, []);

  const handleCreate = useCallback(async () => {
    if (!isFormValid) return;
    try {
      await AsyncStorage.setItem(
        '@FishermansTracker/profile',
        JSON.stringify({ nickname: nickname.trim(), unit, avatarUri }),
      );
    } catch (_) {}
    navigation.navigate('FishermansTabsRoutes');
  }, [navigation, isFormValid, nickname, unit, avatarUri]);

  const handleSkip = useCallback(() => {
    navigation.navigate('FishermansTabsRoutes');
  }, [navigation]);

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
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Image
              source={require('../FishermansTrackerAssets/images/header.png')}
              style={styles.header}
            />
            <Image
              source={require('../FishermansTrackerAssets/images/headerImg.png')}
              style={styles.headerImg}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create profile</Text>

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
              placeholder="Nickname"
              placeholderTextColor="#FFFFFFB2"
              value={nickname}
              maxLength={10}
              onChangeText={setNickname}
            />

            <View style={styles.unitRow}>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  unit === 'kg' && styles.unitOptionActive,
                ]}
                onPress={() => setUnit('kg')}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.radio, unit === 'kg' && styles.radioActive]}
                />
                <Text style={styles.unitLabel}>Kg (Kilograms)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitOption,
                  unit === 'lb' && styles.unitOptionActive,
                ]}
                onPress={() => setUnit('lb')}
                activeOpacity={0.8}
              >
                <View
                  style={[styles.radio, unit === 'lb' && styles.radioActive]}
                />
                <Text style={styles.unitLabel}>Lb (Pounds)</Text>
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
                style={[styles.button, !isFormValid && styles.buttonDisabled]}
              >
                <Text
                  style={[
                    styles.buttonText,
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
  container: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  card: {
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
  headerContainer: {
    width: '100%',
    marginBottom: 36,
  },
  header: {
    width: '100%',
    height: 156,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    marginBottom: 30,
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
    padding: 12,
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
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
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
