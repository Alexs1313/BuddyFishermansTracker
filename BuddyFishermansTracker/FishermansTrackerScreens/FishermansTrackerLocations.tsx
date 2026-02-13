import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';

const LOCATIONS_STORAGE_KEY = '@FishermansTracker/locations';
const PROFILE_STORAGE_KEY = '@FishermansTracker/profile';

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

function formatLocationDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const FishermansTrackerLocations: React.FC = () => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { nickname?: string };
        setProfileNickname(
          typeof parsed?.nickname === 'string' ? parsed.nickname : null,
        );
      }
    } catch {
      setProfileNickname(null);
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LocationItem[];
        setLocations(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setLocations([]);
    }
  }, []);

  useEffect(() => {
    loadLocations();
    loadProfile();
  }, [loadLocations, loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadLocations();
      loadProfile();
    }, [loadLocations, loadProfile]),
  );

  const openMap = useCallback(() => {
    (navigation as { navigate: (s: string) => void }).navigate(
      'FishermansTrackerMap',
    );
  }, [navigation]);

  const openDetail = useCallback(
    (item: LocationItem) => {
      (
        navigation as {
          navigate: (s: string, p: { locationId: string }) => void;
        }
      ).navigate('FishermansTrackerLocationDetail', { locationId: item.id });
    },
    [navigation],
  );

  const confirmDelete = useCallback((item: LocationItem) => {
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
              ).catch(() => {});
              return next;
            });
          },
        },
      ],
    );
  }, []);

  const renderLocationCard = useCallback(
    ({ item }: { item: LocationItem }) => (
      <TouchableOpacity
        style={styles.locationCard}
        activeOpacity={0.9}
        onPress={() => openDetail(item)}
        onLongPress={() => confirmDelete(item)}
      >
        <View style={styles.locationCardIcon}>
          <Image
            source={require('../FishermansTrackerAssets/images/anchor.png')}
          />
        </View>
        <View style={styles.locationCardBody}>
          <Text style={styles.locationCardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.locationCardDate}>{item.date}</Text>
        </View>
      </TouchableOpacity>
    ),
    [openDetail, confirmDelete],
  );

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.header}
          />
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() =>
              (navigation as { navigate: (s: string) => void }).navigate(
                'FishermansTrackerProfile',
              )
            }
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
            onPress={openMap}
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
  container: {
    flex: 1,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 8,
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
  emptyText: {
    fontSize: 16,
    color: '#5A8F7A',
    textAlign: 'center',
    marginTop: 24,
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
  locationCardIconText: {
    fontSize: 24,
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
