// locations list screen - shows all saved fishing spots, allows navigation to map and details, also allows deleting spots

import { StackList } from '../../Stackkrouts';
import { LOCATIONS_STORAGE_KEY, PROFILE_STORAGE_KEY } from '../fishermansUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

export type CatchItem = {
  id: string;
  title: string;
  species: string;
  weight: string;
  weatherConditions: string;
  equipment: string;
  imageUri: string | null;
};

export type LocationItem = {
  id: string;
  title: string;
  date: string;
  latitude: number;
  longitude: number;
  catches?: CatchItem[];
  totalSessionSeconds?: number;
};

const ThebudyyTrackerLocations: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'Bottomtabsroutes'>>();
  const [buddyTrckrLocations, setBuddyTrckrLocations] = useState<
    LocationItem[]
  >([]);
  const [buddyTrckrProfileNickname, setBuddyTrckrProfileNickname] = useState<
    string | null
  >(null);

  const buddyTrckrDemoLocations: LocationItem[] = [
    {
      id: 'demo-location-1',
      title: 'Sunny Riverside Bend',
      date: 'Mar 12, 2026',
      latitude: 45.5123,
      longitude: -0.4987,
    },
    {
      id: 'demo-location-2',
      title: 'Quiet Lake Point',
      date: 'Mar 05, 2026',
      latitude: 45.4871,
      longitude: -0.5214,
    },
  ];

  const buddyTrckrShowDemoLocations = buddyTrckrLocations.length === 0;
  const buddyTrckrDisplayedLocations = buddyTrckrShowDemoLocations
    ? buddyTrckrDemoLocations
    : buddyTrckrLocations;

  const buddyTrckrLoadProfile = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrParsed = JSON.parse(buddyTrckrRaw) as {
          nickname?: string;
        };
        setBuddyTrckrProfileNickname(
          typeof buddyTrckrParsed?.nickname === 'string'
            ? buddyTrckrParsed.nickname
            : null,
        );
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocations: loadProfile failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrProfileNickname(null);
    }
  };

  const buddyTrckrLoadLocations = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrParsed = JSON.parse(buddyTrckrRaw) as LocationItem[];
        setBuddyTrckrLocations(
          Array.isArray(buddyTrckrParsed) ? buddyTrckrParsed : [],
        );
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerLocations: loadLocations failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrLocations([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyTrckrLoadLocations();
      buddyTrckrLoadProfile();
    }, []),
  );

  const buddyTrckrOpenMap = () => {
    buddyTrckrNavigation.navigate('ThebudyyTrackerMap');
  };

  const buddyTrckrOpenDetail = (buddyTrckrItem: LocationItem) => {
    buddyTrckrNavigation.navigate('ThebudyyTrackerLocationDetail', {
      locationId: buddyTrckrItem.id,
    });
  };

  const buddyTrckrConfirmDelete = (buddyTrckrItem: LocationItem) => {
    Alert.alert(
      'Delete This Spot?',
      'This location will be permanently removed from your map. Any notes linked to this spot will also be detached.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBuddyTrckrLocations(buddyTrckrPrev => {
              const buddyTrckrNext = buddyTrckrPrev.filter(
                buddyTrckrLocation =>
                  buddyTrckrLocation.id !== buddyTrckrItem.id,
              );
              AsyncStorage.setItem(
                LOCATIONS_STORAGE_KEY,
                JSON.stringify(buddyTrckrNext),
              ).catch(buddyTrckrErr => {
                if (__DEV__) {
                  console.warn(
                    'FishermansTrackerLocations: saveLocations failed',
                    buddyTrckrErr,
                  );
                }
              });
              return buddyTrckrNext;
            });
          },
        },
      ],
    );
  };

  const buddyTrckrRenderLocationCard = ({
    item: buddyTrckrItem,
  }: {
    item: LocationItem;
  }) => (
    <TouchableOpacity
      style={styles.buddyTrckrLocationCard}
      activeOpacity={0.9}
      onPress={
        buddyTrckrShowDemoLocations
          ? buddyTrckrOpenMap
          : () => buddyTrckrOpenDetail(buddyTrckrItem)
      }
      onLongPress={
        buddyTrckrShowDemoLocations
          ? undefined
          : () => buddyTrckrConfirmDelete(buddyTrckrItem)
      }
    >
      <View style={styles.buddyTrckrLocationCardIcon}>
        <Image
          source={require('../FishermansTrackerAssets/images/anchor.png')}
        />
      </View>
      <View style={styles.buddyTrckrLocationCardBody}>
        <Text style={styles.buddyTrckrLocationCardTitle} numberOfLines={1}>
          {buddyTrckrItem.catches?.[0]?.title ?? buddyTrckrItem.title}
        </Text>
        <Text style={styles.buddyTrckrLocationCardDate}>
          {buddyTrckrItem.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.buddyTrckrFshCnt}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.buddyTrckrHeaderFshCnt}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.buddyTrckrHeaderFsh}
          />
          <TouchableOpacity
            style={styles.buddyTrckrProfileButton}
            activeOpacity={0.8}
            onPress={() =>
              buddyTrckrNavigation.navigate('ThebudyyTrackerProfile')
            }
          >
            <Image
              source={require('../FishermansTrackerAssets/images/settings.png')}
            />
            <Text style={styles.buddyTrckrProfileButtonText}>
              Hi, {buddyTrckrProfileNickname || 'there'}!
            </Text>
          </TouchableOpacity>
          <Image
            source={require('../FishermansTrackerAssets/images/headerImg.png')}
            style={styles.buddyTrckrHeaderImg}
          />
        </View>

        <View style={styles.buddyTrckrContent}>
          <Text style={styles.buddyTrckrPromptText}>
            Search new locations, go to map!
          </Text>

          <TouchableOpacity
            onPress={buddyTrckrOpenMap}
            activeOpacity={0.8}
            style={styles.buddyTrckrOpenMapButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buddyTrckrOpenMapButton}
            >
              <Text style={styles.buddyTrckrOpenMapButtonText}>Open map</Text>
            </LinearGradient>
          </TouchableOpacity>

          <FlatList
            data={buddyTrckrDisplayedLocations}
            scrollEnabled={false}
            renderItem={buddyTrckrRenderLocationCard}
            keyExtractor={buddyTrckrItem => buddyTrckrItem.id}
            contentContainerStyle={styles.buddyTrckrListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrFshCnt: {
    flex: 1,
  },
  buddyTrckrHeaderFshCnt: {
    width: '100%',
    marginBottom: 8,
  },
  buddyTrckrHeaderFsh: {
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
  buddyTrckrProfileButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    backgroundColor: '#286E42',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrProfileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  buddyTrckrContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  buddyTrckrPromptText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10,
  },
  buddyTrckrOpenMapButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  buddyTrckrOpenMapButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrOpenMapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  buddyTrckrListContent: {
    paddingBottom: 20,
  },
  buddyTrckrLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrLocationCardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buddyTrckrLocationCardBody: {
    flex: 1,
  },
  buddyTrckrLocationCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  buddyTrckrLocationCardDate: {
    fontSize: 14,
    color: '#FFC813',
  },
});

export default ThebudyyTrackerLocations;
