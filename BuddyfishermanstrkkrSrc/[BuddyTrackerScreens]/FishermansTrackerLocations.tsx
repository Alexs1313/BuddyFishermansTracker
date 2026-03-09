// locations list screen - shows all saved fishing spots, allows navigation to map and details, also allows deleting spots

import { StackList } from '../../Fishermanstackkrouts';
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

const FishermansTrackerLocations: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTabsRoutes'>>();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);

  const buddyFsrmnsLoadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { nickname?: string };
        setProfileNickname(
          typeof parsed?.nickname === 'string' ? parsed.nickname : null,
        );
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerLocations: loadProfile failed', err);
      }
      setProfileNickname(null);
    }
  };

  const buddyFsrmLoadLocations = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocationItem[];
        setLocations(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerLocations: loadLocations failed', err);
      }
      setLocations([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyFsrmLoadLocations();
      buddyFsrmnsLoadProfile();
    }, []),
  );

  const buddyFshOpenMap = () => {
    navigation.navigate('FishermansTrackerMap');
  };

  const openDetail = (item: LocationItem) => {
    navigation.navigate('FishermansTrackerLocationDetail', {
      locationId: item.id,
    });
  };

  const buddyFshConfirmDelete = (item: LocationItem) => {
    Alert.alert(
      'Delete This Spot?',
      'This location will be permanently removed from your map. Any notes linked to this spot will also be detached.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLocations(prev => {
              const next = prev.filter(l => l.id !== item.id);
              AsyncStorage.setItem(
                LOCATIONS_STORAGE_KEY,
                JSON.stringify(next),
              ).catch(err => {
                if (__DEV__) {
                  console.warn(
                    'FishermansTrackerLocations: saveLocations failed',
                    err,
                  );
                }
              });
              return next;
            });
          },
        },
      ],
    );
  };

  const renderLocationCard = ({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      style={styles.locationCard}
      activeOpacity={0.9}
      onPress={() => openDetail(item)}
      onLongPress={() => buddyFshConfirmDelete(item)}
    >
      <View style={styles.locationCardIcon}>
        <Image
          source={require('../FishermansTrackerAssets/images/anchor.png')}
        />
      </View>
      <View style={styles.locationCardBody}>
        <Text style={styles.locationCardTitle} numberOfLines={1}>
          {item.catches?.[0]?.title ?? item.title}
        </Text>
        <Text style={styles.locationCardDate}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.fshCnt}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerFshCnt}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.headerFsh}
          />
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FishermansTrackerProfile')}
          >
            <Image
              source={require('../FishermansTrackerAssets/images/settings.png')}
            />
            <Text style={styles.profileButtonText}>
              Hi, {profileNickname || 'there'}!
            </Text>
          </TouchableOpacity>
          <Image
            source={require('../FishermansTrackerAssets/images/headerImg.png')}
            style={styles.headerImg}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.promptText}>
            Search new locations, go to map!
          </Text>

          <TouchableOpacity
            onPress={buddyFshOpenMap}
            activeOpacity={0.8}
            style={styles.openMapButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.openMapButton}
            >
              <Text style={styles.openMapButtonText}>Open map</Text>
            </LinearGradient>
          </TouchableOpacity>

          <FlatList
            data={locations}
            scrollEnabled={false}
            renderItem={renderLocationCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  fshCnt: {
    flex: 1,
  },
  headerFshCnt: {
    width: '100%',
    marginBottom: 8,
  },
  headerFsh: {
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
  profileButton: {
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
  profileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10,
  },
  openMapButtonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  openMapButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  listContent: {
    paddingBottom: 20,
  },
  locationCard: {
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
  locationCardIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationCardBody: {
    flex: 1,
  },
  locationCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  locationCardDate: {
    fontSize: 14,
    color: '#FFC813',
  },
});

export default FishermansTrackerLocations;
