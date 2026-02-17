import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
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
import type { StackList } from '../TrackerNavigation/FishermansStackRoutes';
import type { LocationItem } from './FishermansTrackerLocations';
import type { RecipeItem } from './FishermansTrackerRecipes';
import { RECIPES_DATA } from './FishermansTrackerRecipes';
import { useStorage } from '../FishermansStore/fishermansContxt';
import {
  LOCATIONS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  SAVED_RECIPES_KEY,
  NOTIFICATIONS_KEY,
  getBiggestCatchKg,
} from '../fishermansUtils';

const bgPath = require('../FishermansTrackerAssets/images/mainbg.png');
const headerPath = require('../FishermansTrackerAssets/images/header.png');
const bColors = ['#A2E8D5', '#FFFAD0', '#2CCCE7'];
const primYellow = '#FFC813';
const white = '#fff';
const green = '#286E42';
const blue = '#007083';

const FishermansTrackerHome: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTabsRoutes'>>();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);

  const { setIsEnabledNotifications } = useStorage();

  const loadNotifications = async () => {
    try {
      const notifValue = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const parsedJSON = notifValue ? JSON.parse(notifValue) : null;
      if (typeof parsedJSON === 'boolean')
        setIsEnabledNotifications(parsedJSON);
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerHome: loadNotifications failed!', err);
      }
    }
  };

  const fetchSavedData = async () => {
    try {
      const [locRaw, profileRaw, recipesRaw] = await Promise.all([
        AsyncStorage.getItem(LOCATIONS_STORAGE_KEY),
        AsyncStorage.getItem(PROFILE_STORAGE_KEY),
        AsyncStorage.getItem(SAVED_RECIPES_KEY),
      ]);
      if (locRaw) {
        const parsed = JSON.parse(locRaw) as LocationItem[];
        setLocations(Array.isArray(parsed) ? parsed : []);
      } else {
        setLocations([]);
      }
      if (profileRaw) {
        const parsed = JSON.parse(profileRaw) as { nickname?: string };
        setProfileNickname(
          typeof parsed?.nickname === 'string' ? parsed.nickname : null,
        );
      } else {
        setProfileNickname(null);
      }
      if (recipesRaw) {
        const arr = JSON.parse(recipesRaw) as string[];
        setSavedRecipeIds(Array.isArray(arr) ? arr : []);
      } else {
        setSavedRecipeIds([]);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerHome: load SavedData failed', err);
      }
      setLocations([]);
      setSavedRecipeIds([]);
      setProfileNickname(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      fetchSavedData();
    }, []),
  );

  const totalTrips = locations.length;
  const totalCatches = locations.reduce(
    (sum, loc) => sum + (loc.catches?.length ?? 0),
    0,
  );
  const biggestCatchKg = getBiggestCatchKg(locations);

  const recentLocations = locations.slice(0, 2);
  const savedRecipes: RecipeItem[] = savedRecipeIds
    .map(id => RECIPES_DATA.find(r => r.id === id))
    .filter((r): r is RecipeItem => r != null)
    .slice(0, 2);

  const openProfile = () => {
    navigation.navigate('FishermansTrackerProfile');
  };

  const openMap = () => {
    navigation.navigate('FishermansTrackerMap');
  };

  const openLocationsTab = () => {
    navigation.navigate('FishermansTabsRoutes', {
      screen: 'FishermansTrackerLocations',
    });
  };

  const openRecipesTab = () => {
    navigation.navigate('FishermansTabsRoutes', {
      screen: 'FishermansTrackerRecipes',
    });
  };

  const openLocationDetail = (item: LocationItem) => {
    navigation.navigate('FishermansTrackerLocationDetail', {
      locationId: item.id,
    });
  };

  return (
    <ImageBackground source={bgPath} style={styles.fshCnt}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.headerFshCnt}>
          <Image source={headerPath} style={styles.headerFsh} />
          <TouchableOpacity
            style={styles.profButton}
            activeOpacity={0.8}
            onPress={openProfile}
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
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/trips.png')}
                />
                <Text style={styles.statValue}>
                  {totalTrips > 0 ? String(totalTrips) : '-'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/catches.png')}
                />
                <Text style={styles.statValue}>
                  {totalCatches > 0 ? String(totalCatches) : '-'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Total Catches</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/biggestcatch.png')}
                />
                <Text style={styles.statValue}>
                  {biggestCatchKg != null ? `${biggestCatchKg} kg` : '-'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Biggest Catch</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent fish locations</Text>
              {locations.length > 0 && (
                <TouchableOpacity
                  onPress={openLocationsTab}
                  style={styles.seeAllButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {recentLocations.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.locationCard}
                activeOpacity={0.9}
                onPress={() => openLocationDetail(item)}
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
            ))}
            <TouchableOpacity
              onPress={openMap}
              activeOpacity={0.8}
              style={styles.addButtonContainer}
            >
              <LinearGradient
                colors={bColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/addcatch.png')}
                />
                <Text style={styles.addButtonText}>Add location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your favorite fish recipes</Text>
            {savedRecipes.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.recipeCard}
                activeOpacity={0.9}
                onPress={openRecipesTab}
              >
                <View style={styles.recipeCardLeft}>
                  <Image
                    source={require('../FishermansTrackerAssets/images/recipes.png')}
                  />
                </View>
                <View style={styles.recipeCardBody}>
                  <Text style={styles.recipeCardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.recipeTags}>
                    <View style={styles.recipeTag}>
                      <Text style={styles.recipeTagText}>
                        Servings: {item.servings}
                      </Text>
                    </View>
                    <View style={styles.recipeTag}>
                      <Text style={styles.recipeTagText}>
                        Time: ~{item.time} min
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.bookmarkButton}>
                  <Image
                    source={require('../FishermansTrackerAssets/images/saved.png')}
                  />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={openRecipesTab}
              activeOpacity={0.8}
              style={styles.addButtonContainer}
            >
              <LinearGradient
                colors={bColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/addcatch.png')}
                />
                <Text style={styles.addButtonText}>Add recipe</Text>
              </LinearGradient>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  profButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    backgroundColor: green,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: white,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: white,
    marginBottom: 12,
    marginTop: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  seeAllButton: {
    backgroundColor: primYellow,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 60,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: green,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: green,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: white,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: primYellow,
  },
  statLabel: {
    fontSize: 10,
    color: white,
    fontWeight: '600',
    marginTop: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: green,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: white,
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
    color: white,
    marginBottom: 4,
  },
  locationCardDate: {
    fontSize: 14,
    color: primYellow,
  },
  addButtonContainer: {
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
  addButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: blue,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: green,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: white,
  },
  recipeCardLeft: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeCardBody: {
    flex: 1,
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: white,
    marginBottom: 8,
  },
  recipeTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  recipeTag: {
    backgroundColor: primYellow,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 60,
  },
  recipeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: green,
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default FishermansTrackerHome;
