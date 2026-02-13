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
import LinearGradient from 'react-native-linear-gradient';
import type { LocationItem } from './FishermansTrackerLocations';
import type { RecipeItem } from './FishermansTrackerRecipes';
import { RECIPES_DATA } from './FishermansTrackerRecipes';

const LOCATIONS_STORAGE_KEY = '@FishermansTracker/locations';
const PROFILE_STORAGE_KEY = '@FishermansTracker/profile';
const SAVED_RECIPES_KEY = '@FishermansTracker/savedRecipes';

const MAX_LOCATION_CARDS = 2;
const MAX_RECIPE_CARDS = 2;

const FishermansTrackerHome: React.FC = () => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);

  const loadData = useCallback(async () => {
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
    } catch {
      setLocations([]);
      setSavedRecipeIds([]);
      setProfileNickname(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const totalTrips = locations.length;
  const totalCatches = locations.reduce(
    (sum, loc) => sum + (loc.catches?.length ?? 0),
    0,
  );

  let biggestCatchKg: number | null = null;
  for (const loc of locations) {
    for (const c of loc.catches ?? []) {
      const weightStr = (c.weight || '').trim().replace(',', '.');
      const w = parseFloat(weightStr);
      if (
        !Number.isNaN(w) &&
        w > 0 &&
        (biggestCatchKg === null || w > biggestCatchKg)
      ) {
        biggestCatchKg = w;
      }
    }
  }

  const recentLocations = locations.slice(0, MAX_LOCATION_CARDS);
  const savedRecipes: RecipeItem[] = savedRecipeIds
    .map(id => RECIPES_DATA.find(r => r.id === id))
    .filter((r): r is RecipeItem => r != null)
    .slice(0, MAX_RECIPE_CARDS);

  const openProfile = useCallback(() => {
    (navigation as { navigate: (s: string) => void }).navigate(
      'FishermansTrackerProfile',
    );
  }, [navigation]);

  const openMap = useCallback(() => {
    (navigation as { navigate: (s: string) => void }).navigate(
      'FishermansTrackerMap',
    );
  }, [navigation]);

  const openLocationsTab = useCallback(() => {
    (navigation as { navigate: (s: string) => void }).navigate(
      'FishermansTrackerLocations',
    );
  }, [navigation]);

  const openRecipesTab = useCallback(() => {
    (navigation as { navigate: (s: string) => void }).navigate(
      'FishermansTrackerRecipes',
    );
  }, [navigation]);

  const openLocationDetail = useCallback(
    (item: LocationItem) => {
      (
        navigation as {
          navigate: (s: string, p: { locationId: string }) => void;
        }
      ).navigate('FishermansTrackerLocationDetail', { locationId: item.id });
    },
    [navigation],
  );

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.container}
    >
      <ScrollView
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
            style={styles.profileButton}
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
                colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
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
                colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
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
    backgroundColor: '#FFC813',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 60,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#286E42',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  statIcon: {
    width: 28,
    height: 28,
    marginBottom: 6,
    tintColor: '#FFC813',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFC813',
  },
  statLabel: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    marginTop: 8,
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
  addButtonIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007083',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
  recipeCard: {
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
    color: '#fff',
    marginBottom: 8,
  },
  recipeTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  recipeTag: {
    backgroundColor: '#FFC813',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 60,
  },
  recipeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#286E42',
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
