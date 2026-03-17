// profile creation screen - allows user to set nickname, choose unit and pick img

import { launchImageLibrary } from 'react-native-image-picker';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StackList } from '../../Stackkrouts';
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

import LinearGradient from 'react-native-linear-gradient';
import { PROFILE_STORAGE_KEY } from '../fishermansUtils';

const ThebudyyTrackerCreateProfile: React.FC = () => {
  const [buddyTrckrNickname, setBuddyTrckrNickname] = useState('');
  const [buddyTrckrUnit, setBuddyTrckrUnit] = useState<'kg' | 'lb'>('kg');
  const [buddyTrckrAvatarUri, setBuddyTrckrAvatarUri] = useState<string | null>(
    null,
  );
  const navigation =
    useNavigation<
      StackNavigationProp<StackList, 'ThebudyyTrackerCreateProfile'>
    >();

  const buddyTrckrIsFormValid =
    buddyTrckrNickname.trim().length > 0 && buddyTrckrAvatarUri !== null;

  const buddyTrckrHandlePickImage = () => {
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
        if (uri) setBuddyTrckrAvatarUri(uri);
      },
    );
  };

  const buddyTrckrHandleCreate = async () => {
    if (!buddyTrckrIsFormValid) return;
    try {
      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          nickname: buddyTrckrNickname.trim(),
          unit: buddyTrckrUnit,
          avatarUri: buddyTrckrAvatarUri,
        }),
      );
    } catch (_) {}
    navigation.navigate('Bottomtabsroutes');
  };

  const buddyTrckrHandleSkip = () => {
    navigation.navigate('Bottomtabsroutes');
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
        <View style={styles.buddyTrckrFshCnt}>
          <View style={styles.buddyTrckrHeaderFshCnt}>
            <Image
              source={require('../FishermansTrackerAssets/images/header.png')}
              style={styles.buddyTrckrHeader}
            />
            <Image
              source={require('../FishermansTrackerAssets/images/headerImg.png')}
              style={styles.buddyTrckrHeaderImg}
            />
          </View>

          <View style={styles.buddyTrckrProfileCard}>
            <Text style={styles.buddyTrckrHeadTtl}>Create profile</Text>

            <TouchableOpacity
              style={styles.buddyTrckrPhPlaceholder}
              activeOpacity={0.8}
              onPress={buddyTrckrHandlePickImage}
            >
              {buddyTrckrAvatarUri ? (
                <Image
                  source={{ uri: buddyTrckrAvatarUri }}
                  style={styles.buddyTrckrAvatarImg}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('../FishermansTrackerAssets/images/add.png')}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.buddyTrckrNicknameInput}
              placeholder="Nickname"
              placeholderTextColor="#FFFFFFB2"
              value={buddyTrckrNickname}
              maxLength={10}
              onChangeText={setBuddyTrckrNickname}
            />

            <View style={styles.buddyTrckrUnitWrr}>
              <TouchableOpacity
                style={[
                  styles.buddyTrckrUnitOptn,
                  buddyTrckrUnit === 'kg' && styles.buddyTrckrUnitOptnActive,
                ]}
                onPress={() => setBuddyTrckrUnit('kg')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.buddyTrckrRadioButtn,
                    buddyTrckrUnit === 'kg' && styles.buddyTrckrRadioActive,
                  ]}
                />
                <Text style={styles.buddyTrckrUnitLabelTxt}>
                  Kg (Kilograms)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buddyTrckrUnitOptn,
                  buddyTrckrUnit === 'lb' && styles.buddyTrckrUnitOptnActive,
                ]}
                onPress={() => setBuddyTrckrUnit('lb')}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.buddyTrckrRadioButtn,
                    buddyTrckrUnit === 'lb' && styles.buddyTrckrRadioActive,
                  ]}
                />
                <Text style={styles.buddyTrckrUnitLabelTxt}>Lb (Pounds)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={buddyTrckrHandleCreate}
              activeOpacity={0.8}
              style={styles.buddyTrckrButtonContainer}
              disabled={!buddyTrckrIsFormValid}
            >
              <LinearGradient
                colors={
                  buddyTrckrIsFormValid
                    ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                    : ['#97C5B8', '#97C5B8', '#97C5B8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buddyTrckrProfbtn,
                  !buddyTrckrIsFormValid && styles.buddyTrckrButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.buddyTrckrProfbtnTxt,
                    !buddyTrckrIsFormValid &&
                      styles.buddyTrckrButtonTextDisabled,
                  ]}
                >
                  Create
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={buddyTrckrHandleSkip}
              activeOpacity={0.8}
              style={styles.buddyTrckrSkipButton}
            >
              <Text style={styles.buddyTrckrSkipText}>Skip</Text>
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
    alignItems: 'center',
    paddingBottom: 20,
  },
  buddyTrckrProfileCard: {
    width: '90%',
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrHeaderImg: {
    position: 'absolute',
    right: 20,
    bottom: -10,
  },
  buddyTrckrHeaderFshCnt: {
    width: '100%',
    marginBottom: 36,
  },
  buddyTrckrHeader: {
    width: '100%',
    height: 156,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  buddyTrckrHeadTtl: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  buddyTrckrPhPlaceholder: {
    width: 142,
    height: 142,
    borderRadius: 70,
    backgroundColor: '#799930',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 30,
  },
  buddyTrckrAvatarImg: {
    width: '100%',
    height: '100%',
  },
  buddyTrckrNicknameInput: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  buddyTrckrUnitWrr: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  buddyTrckrUnitOptn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#799930',
    borderRadius: 60,
    padding: 12,
    paddingHorizontal: 5,
    gap: 8,
  },
  buddyTrckrUnitOptnActive: {},

  buddyTrckrRadioButtn: {
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
  buddyTrckrUnitLabelTxt: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  buddyTrckrButtonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  buddyTrckrProfbtn: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrProfbtnTxt: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buddyTrckrButtonDisabled: {
    opacity: 0.7,
  },
  buddyTrckrButtonTextDisabled: {
    color: '#657375',
  },
  buddyTrckrSkipText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  buddyTrckrSkipButton: {
    marginTop: 5,
  },
});

export default ThebudyyTrackerCreateProfile;
