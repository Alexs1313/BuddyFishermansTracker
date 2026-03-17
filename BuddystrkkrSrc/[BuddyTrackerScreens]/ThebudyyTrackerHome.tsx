// home screen - shows quick stats, recent locations and saved recipes, also has buttons to navigate to other screens

import { RECIPES_DATA } from './ThebudyyTrackerRecipes';

import {
  LOCATIONS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  SAVED_RECIPES_KEY,
  NOTIFICATIONS_KEY,
  getBiggestCatchKg,
} from '../fishermansUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
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

import type { LocationItem } from './ThebudyyTrackerLocations';
import type { RecipeItem } from './ThebudyyTrackerRecipes';
import { useStorage } from '../thebuddstrrre/thebuddcontxt';

const buddyTrckrBgPath = require('../FishermansTrackerAssets/images/mainbg.png');
const buddyTrckrHeaderPath = require('../FishermansTrackerAssets/images/header.png');
const buddyTrckrBColors = ['#A2E8D5', '#FFFAD0', '#2CCCE7'];
const buddyTrckrPrimYellow = '#FFC813';
const buddyTrckrWhite = '#fff';
const buddyTrckrGreen = '#286E42';
const buddyTrckrBlue = '#007083';

const ThebudyyTrackerHome: React.FC = () => {
  const buddyTrckrNavigation = useNavigation();
  const [buddyTrckrLocations, setBuddyTrckrLocations] = useState<
    LocationItem[]
  >([]);
  const [buddyTrckrSavedRecipeIds, setBuddyTrckrSavedRecipeIds] = useState<
    string[]
  >([]);
  const [buddyTrckrProfileNickname, setBuddyTrckrProfileNickname] = useState<
    string | null
  >(null);

  const { setIsEnabledNotifications: buddyTrckrSetIsEnabledNotifications } =
    useStorage();

  const buddyTrckrLoadNotifications = useCallback(async () => {
    try {
      const buddyTrckrNotifValue = await AsyncStorage.getItem(
        NOTIFICATIONS_KEY,
      );

      const buddyTrckrParsedJSON = buddyTrckrNotifValue
        ? JSON.parse(buddyTrckrNotifValue)
        : null;

      if (typeof buddyTrckrParsedJSON === 'boolean') {
        buddyTrckrSetIsEnabledNotifications(buddyTrckrParsedJSON);
      }
    } catch {
      console.log('catch err');
    }
  }, [buddyTrckrSetIsEnabledNotifications]);

  const buddyTrckrLoadData = useCallback(async () => {
    try {
      const [buddyTrckrLocRaw, buddyTrckrProfileRaw, buddyTrckrRecipesRaw] =
        await Promise.all([
          AsyncStorage.getItem(LOCATIONS_STORAGE_KEY),
          AsyncStorage.getItem(PROFILE_STORAGE_KEY),
          AsyncStorage.getItem(SAVED_RECIPES_KEY),
        ]);

      if (buddyTrckrLocRaw) {
        const buddyTrckrParsed = JSON.parse(buddyTrckrLocRaw) as LocationItem[];
        setBuddyTrckrLocations(
          Array.isArray(buddyTrckrParsed) ? buddyTrckrParsed : [],
        );
      } else {
        setBuddyTrckrLocations([]);
      }

      if (buddyTrckrProfileRaw) {
        const buddyTrckrParsed = JSON.parse(buddyTrckrProfileRaw) as {
          nickname?: string;
        };
        setBuddyTrckrProfileNickname(
          typeof buddyTrckrParsed?.nickname === 'string'
            ? buddyTrckrParsed.nickname
            : null,
        );
      } else {
        setBuddyTrckrProfileNickname(null);
      }

      if (buddyTrckrRecipesRaw) {
        const buddyTrckrArr = JSON.parse(buddyTrckrRecipesRaw) as string[];
        setBuddyTrckrSavedRecipeIds(
          Array.isArray(buddyTrckrArr) ? buddyTrckrArr : [],
        );
      } else {
        setBuddyTrckrSavedRecipeIds([]);
      }
    } catch {
      setBuddyTrckrLocations([]);
      setBuddyTrckrSavedRecipeIds([]);
      setBuddyTrckrProfileNickname(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      buddyTrckrLoadNotifications();
    }, [buddyTrckrLoadNotifications]),
  );

  useFocusEffect(
    useCallback(() => {
      buddyTrckrLoadData();
    }, [buddyTrckrLoadData]),
  );

  const buddyTrckrTotalTrips = buddyTrckrLocations.length;
  const buddyTrckrTotalCatches = buddyTrckrLocations.reduce(
    (buddyTrckrSum, buddyTrckrLoc) =>
      buddyTrckrSum + (buddyTrckrLoc.catches?.length ?? 0),
    0,
  );
  const buddyTrckrBiggestCatchKg = getBiggestCatchKg(buddyTrckrLocations);

  const buddyTrckrShowDemo =
    buddyTrckrLocations.length === 0 && buddyTrckrSavedRecipeIds.length === 0;

  const buddyTrckrDemoStats = useMemo(() => {
    const buddyTrckrTrips = 2 + Math.floor(Math.random() * 4); // 2..5
    const buddyTrckrCatches = buddyTrckrTrips + Math.floor(Math.random() * 6); // trips..trips+5
    const buddyTrckrBiggest = (2.3 + Math.random() * 8.5).toFixed(1); // 2.3..10.8
    return {
      trips: buddyTrckrTrips,
      catches: buddyTrckrCatches,
      biggestKg: buddyTrckrBiggest,
    };
  }, []);

  const buddyTrckrDemoLocations: LocationItem[] = useMemo(
    () => [
      {
        id: 'demo-location-1',
        title: 'Sunny Riverside Bend',
        date: 'Mar 12, 2026',
        latitude: 45.5123,
        longitude: -0.4987,
        catches: [{ id: 'demo-catch-1', title: 'First cast — pike', species: '', weight: '', weatherConditions: '', equipment: '', imageUri: null }],
      },
      {
        id: 'demo-location-2',
        title: 'Quiet Lake Point',
        date: 'Mar 05, 2026',
        latitude: 45.4871,
        longitude: -0.5214,
        catches: [{ id: 'demo-catch-2', title: 'Evening bass', species: '', weight: '', weatherConditions: '', equipment: '', imageUri: null }],
      },
    ],
    [],
  );

  const buddyTrckrRecentLocations = (buddyTrckrShowDemo
    ? buddyTrckrDemoLocations
    : buddyTrckrLocations
  ).slice(0, 2);

  const buddyTrckrSavedRecipes: RecipeItem[] = buddyTrckrSavedRecipeIds
    .map(buddyTrckrId =>
      RECIPES_DATA.find(
        buddyTrckrRecipe => buddyTrckrRecipe.id === buddyTrckrId,
      ),
    )
    .filter(
      (buddyTrckrRecipe): buddyTrckrRecipe is RecipeItem =>
        buddyTrckrRecipe != null,
    )
    .slice(0, 2);

  const buddyTrckrDisplayedRecipes: RecipeItem[] = buddyTrckrShowDemo
    ? RECIPES_DATA.slice(0, 2)
    : buddyTrckrSavedRecipes;

  const buddyTrckrDisplayedTrips = buddyTrckrShowDemo
    ? buddyTrckrDemoStats.trips
    : buddyTrckrTotalTrips;
  const buddyTrckrDisplayedCatches = buddyTrckrShowDemo
    ? buddyTrckrDemoStats.catches
    : buddyTrckrTotalCatches;
  const buddyTrckrDisplayedBiggestCatchKg =
    buddyTrckrShowDemo && buddyTrckrBiggestCatchKg == null
      ? buddyTrckrDemoStats.biggestKg
      : buddyTrckrBiggestCatchKg;

  const buddyTrckrOpenProfile = () => {
    (buddyTrckrNavigation as { navigate: (s: string) => void }).navigate(
      'ThebudyyTrackerProfile',
    );
  };

  const buddyTrckrOpenMap = () => {
    (buddyTrckrNavigation as { navigate: (s: string) => void }).navigate(
      'ThebudyyTrackerMap',
    );
  };

  const buddyTrckrOpenLocationsTab = () => {
    (buddyTrckrNavigation as { navigate: (s: string) => void }).navigate(
      'ThebudyyTrackerLocations',
    );
  };

  const buddyTrckrOpenRecipesTab = () => {
    (buddyTrckrNavigation as { navigate: (s: string) => void }).navigate(
      'ThebudyyTrackerRecipes',
    );
  };

  const buddyTrckrOpenLocationDetail = (buddyTrckrItem: LocationItem) => {
    (
      buddyTrckrNavigation as {
        navigate: (s: string, p: { locationId: string }) => void;
      }
    ).navigate('ThebudyyTrackerLocationDetail', {
      locationId: buddyTrckrItem.id,
    });
  };

  return (
    <ImageBackground source={buddyTrckrBgPath} style={styles.buddyTrckrFshCnt}>
      <ScrollView
        contentContainerStyle={styles.buddyTrckrScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.buddyTrckrHeaderFshCnt}>
          <Image
            source={buddyTrckrHeaderPath}
            style={styles.buddyTrckrHeaderFsh}
          />
          <TouchableOpacity
            style={styles.buddyTrckrProfButton}
            activeOpacity={0.8}
            onPress={buddyTrckrOpenProfile}
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
          <Text style={styles.buddyTrckrSectionTitle}>Quick Stats</Text>
          <View style={styles.buddyTrckrStatsRow}>
            <View style={styles.buddyTrckrStatCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/trips.png')}
                />
                <Text style={styles.buddyTrckrStatValue}>
                  {buddyTrckrDisplayedTrips > 0
                    ? String(buddyTrckrDisplayedTrips)
                    : '-'}
                </Text>
              </View>
              <Text style={styles.buddyTrckrStatLabel}>Total Trips</Text>
            </View>

            <View style={styles.buddyTrckrStatCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/catches.png')}
                />
                <Text style={styles.buddyTrckrStatValue}>
                  {buddyTrckrDisplayedCatches > 0
                    ? String(buddyTrckrDisplayedCatches)
                    : '-'}
                </Text>
              </View>
              <Text style={styles.buddyTrckrStatLabel}>Total Catches</Text>
            </View>

            <View style={styles.buddyTrckrStatCard}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/biggestcatch.png')}
                />
                <Text style={styles.buddyTrckrStatValue}>
                  {buddyTrckrDisplayedBiggestCatchKg != null
                    ? `${buddyTrckrDisplayedBiggestCatchKg} kg`
                    : '-'}
                </Text>
              </View>
              <Text style={styles.buddyTrckrStatLabel}>Biggest Catch</Text>
            </View>
          </View>

          <View style={styles.buddyTrckrSection}>
            <View style={styles.buddyTrckrSectionHeader}>
              <Text style={styles.buddyTrckrSectionTitle}>
                Recent fish locations
              </Text>
              {!buddyTrckrShowDemo && buddyTrckrLocations.length > 0 && (
                <TouchableOpacity
                  onPress={buddyTrckrOpenLocationsTab}
                  style={styles.buddyTrckrSeeAllButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buddyTrckrSeeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>

            {buddyTrckrRecentLocations.map(buddyTrckrItem => (
              <TouchableOpacity
                key={buddyTrckrItem.id}
                style={styles.buddyTrckrLocationCard}
                activeOpacity={0.9}
                onPress={
                  buddyTrckrShowDemo
                    ? buddyTrckrOpenMap
                    : () => buddyTrckrOpenLocationDetail(buddyTrckrItem)
                }
              >
                <View style={styles.buddyTrckrLocationCardIcon}>
                  <Image
                    source={require('../FishermansTrackerAssets/images/anchor.png')}
                  />
                </View>
                <View style={styles.buddyTrckrLocationCardBody}>
                  <Text
                    style={styles.buddyTrckrLocationCardTitle}
                    numberOfLines={1}
                  >
                    {buddyTrckrItem.catches?.[0]?.title ?? buddyTrckrItem.title}
                  </Text>
                  <Text style={styles.buddyTrckrLocationCardDate}>
                    {buddyTrckrItem.date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={buddyTrckrOpenMap}
              activeOpacity={0.8}
              style={styles.buddyTrckrAddButtonContainer}
            >
              <LinearGradient
                colors={buddyTrckrBColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buddyTrckrAddButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/addcatch.png')}
                />
                <Text style={styles.buddyTrckrAddButtonText}>Add location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.buddyTrckrSection}>
            <Text style={styles.buddyTrckrSectionTitle}>
              Your favorite fish recipes
            </Text>

            {buddyTrckrDisplayedRecipes.map(buddyTrckrItem => (
              <TouchableOpacity
                key={buddyTrckrItem.id}
                style={styles.buddyTrckrRecipeCard}
                activeOpacity={0.9}
                onPress={buddyTrckrOpenRecipesTab}
              >
                <View style={styles.buddyTrckrRecipeCardLeft}>
                  <Image
                    source={require('../FishermansTrackerAssets/images/recipes.png')}
                  />
                </View>
                <View style={styles.buddyTrckrRecipeCardBody}>
                  <Text
                    style={styles.buddyTrckrRecipeCardTitle}
                    numberOfLines={2}
                  >
                    {buddyTrckrItem.title}
                  </Text>
                  <View style={styles.buddyTrckrRecipeTags}>
                    <View style={styles.buddyTrckrRecipeTag}>
                      <Text style={styles.buddyTrckrRecipeTagText}>
                        Servings: {buddyTrckrItem.servings}
                      </Text>
                    </View>
                    <View style={styles.buddyTrckrRecipeTag}>
                      <Text style={styles.buddyTrckrRecipeTagText}>
                        Time: ~{buddyTrckrItem.time} min
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.buddyTrckrBookmarkButton}>
                  <Image
                    source={require('../FishermansTrackerAssets/images/saved.png')}
                  />
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={buddyTrckrOpenRecipesTab}
              activeOpacity={0.8}
              style={styles.buddyTrckrAddButtonContainer}
            >
              <LinearGradient
                colors={buddyTrckrBColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buddyTrckrAddButton}
              >
                <Image
                  source={require('../FishermansTrackerAssets/images/addcatch.png')}
                />
                <Text style={styles.buddyTrckrAddButtonText}>Add recipe</Text>
              </LinearGradient>
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
  },
  buddyTrckrScrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  buddyTrckrProfButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    backgroundColor: buddyTrckrGreen,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: buddyTrckrWhite,
  },
  buddyTrckrProfileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: buddyTrckrWhite,
  },
  buddyTrckrContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  buddyTrckrSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: buddyTrckrWhite,
    marginBottom: 12,
    marginTop: 16,
  },
  buddyTrckrSection: {
    marginBottom: 8,
  },
  buddyTrckrSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  buddyTrckrSeeAllButton: {
    backgroundColor: buddyTrckrPrimYellow,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 60,
  },
  buddyTrckrSeeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: buddyTrckrGreen,
  },
  buddyTrckrStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  buddyTrckrStatCard: {
    flex: 1,
    backgroundColor: buddyTrckrGreen,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: buddyTrckrWhite,
  },
  buddyTrckrStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: buddyTrckrPrimYellow,
  },
  buddyTrckrStatLabel: {
    fontSize: 10,
    color: buddyTrckrWhite,
    fontWeight: '600',
    marginTop: 8,
  },
  buddyTrckrLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: buddyTrckrGreen,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: buddyTrckrWhite,
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
    color: buddyTrckrWhite,
    marginBottom: 4,
  },
  buddyTrckrLocationCardDate: {
    fontSize: 14,
    color: buddyTrckrPrimYellow,
  },
  buddyTrckrAddButtonContainer: {
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
  buddyTrckrAddButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buddyTrckrAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: buddyTrckrBlue,
  },
  buddyTrckrRecipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: buddyTrckrGreen,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: buddyTrckrWhite,
  },
  buddyTrckrRecipeCardLeft: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buddyTrckrRecipeCardBody: {
    flex: 1,
  },
  buddyTrckrRecipeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: buddyTrckrWhite,
    marginBottom: 8,
  },
  buddyTrckrRecipeTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  buddyTrckrRecipeTag: {
    backgroundColor: buddyTrckrPrimYellow,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 60,
  },
  buddyTrckrRecipeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: buddyTrckrGreen,
  },
  buddyTrckrBookmarkButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ThebudyyTrackerHome;
