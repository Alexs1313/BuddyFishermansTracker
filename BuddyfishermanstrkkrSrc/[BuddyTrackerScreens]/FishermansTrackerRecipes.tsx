// recipes screen - shows a list of recipes for different types of fish, user can save their favorite recipes, view recipe details, and share recipes with friends, also has a profile button that takes user to profile screen where they can set their nickname and other details

import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackList } from '../../Fishermanstackkrouts';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

import {
  PROFILE_STORAGE_KEY,
  SAVED_RECIPES_KEY,
  formatRecipeSteps,
} from '../fishermansUtils';
import { useStorage } from '../FishermansStore/fishermansContxt';
import Orientation from 'react-native-orientation-locker';

export type RecipeItem = {
  id: string;
  title: string;
  servings: string;
  time: string;
  ingredients: string;
  steps: string;
};

export const RECIPES_DATA: RecipeItem[] = [
  {
    id: 'pike',
    title: '🐟🔥 Campfire Grilled Pike',
    servings: '2',
    time: '25',
    ingredients: `1 whole pike (cleaned, filleted)
2 tbsp olive oil
2 cloves garlic (minced)
1 lemon (sliced)
Salt & black pepper
Fresh dill (optional)`,
    steps: `Rinse and pat the fillets dry.
Brush both sides with olive oil.
Season with salt, pepper, and garlic.
Place lemon slices on top.
Grill over medium campfire heat for 5–7 minutes per side.
Garnish with fresh dill and serve hot.`,
  },
  {
    id: 'bass',
    title: '🐠🍋 Crispy Pan-Fried Bass',
    servings: '2',
    time: '20',
    ingredients: `2 bass fillets
½ cup flour
1 tsp paprika
Salt & pepper
2 tbsp butter
Lemon wedges`,
    steps: `Mix flour, paprika, salt, and pepper.
Coat fillets evenly in flour mixture.
Melt butter in a skillet over medium heat.
Fry fish for 3–4 minutes per side until golden and crispy.
Serve with fresh lemon juice.`,
  },
  {
    id: 'skillet',
    title: '🐟🥔 Lake Fish & Potato Skillet',
    servings: '3',
    time: '35',
    ingredients: `2 white fish fillets (perch or walleye)
3 medium potatoes (sliced)
1 onion (chopped)
2 tbsp oil
Salt, pepper
Fresh parsley`,
    steps: `Fry potatoes in oil for 10–12 minutes.
Add onions and cook until soft.
Place fish on top of potatoes.
Cover and cook 8–10 minutes until fish flakes easily.
Sprinkle with parsley and serve.`,
  },
  {
    id: 'trout',
    title: '🐟🌿 Baked Trout with Herbs',
    servings: '2',
    time: '30',
    ingredients: `1 whole trout (cleaned)
1 tbsp olive oil
1 lemon (sliced)
Fresh thyme & rosemary
Salt & pepper`,
    steps: `Preheat oven to 180°C / 350°F.
Rub trout with olive oil.
Season inside and out.
Stuff with lemon slices and herbs.
Bake 20–25 minutes until tender.`,
  },
  {
    id: 'soup',
    title: "🐟🥣 Fisherman's Fish Soup",
    servings: '4',
    time: '40',
    ingredients: `500 g mixed fish pieces
1 carrot (chopped)
1 potato (cubed)
1 onion (chopped)
1.5 L water or fish stock
Salt, pepper
Bay leaf
Fresh dill`,
    steps: `Bring water or stock to boil.
Add vegetables and bay leaf.
Simmer 15 minutes.
Add fish pieces and cook 8–10 minutes.
Season, remove bay leaf, add dill before serving.`,
  },
  {
    id: 'tacos',
    title: '🐟🌮 Fish Tacos by the Lake',
    servings: '3',
    time: '25',
    ingredients: `3 fish fillets
6 tortillas
1 cup shredded cabbage
1 tomato (chopped)
½ cup sour cream
Lime wedges
Taco seasoning`,
    steps: `Season and cook fish in a skillet (4–5 min per side).
Warm tortillas.
Flake fish into pieces.
Fill tortillas with fish, cabbage, tomato.
Add sour cream and lime juice.`,
  },
  {
    id: 'walleye',
    title: '🐟🔥 Garlic Butter Walleye',
    servings: '2',
    time: '20',
    ingredients: `2 walleye fillets
2 tbsp butter
2 cloves garlic (minced)
Salt & black pepper
Fresh parsley
Lemon wedges`,
    steps: `Pat fillets dry and season both sides.
Melt butter in a skillet over medium heat.
Add garlic and cook for 30 seconds.
Place fish in the pan and cook 3–4 minutes per side.
Sprinkle with parsley and serve with lemon.`,
  },
  {
    id: 'catfish',
    title: '🐟🥓 Bacon-Wrapped Catfish',
    servings: '3',
    time: '30',
    ingredients: `3 catfish fillets
6 slices bacon
1 tsp paprika
Black pepper
Toothpicks`,
    steps: `Preheat oven to 190°C / 375°F.
Season catfish with paprika and pepper.
Wrap each fillet with bacon and secure with toothpicks.
Bake 20–25 minutes until bacon is crispy.
Serve hot.`,
  },
  {
    id: 'stew',
    title: '🐟🍅 Rustic Fish Stew',
    servings: '4',
    time: '45',
    ingredients: `600 g mixed fish chunks
1 onion (chopped)
2 tomatoes (diced)
1 bell pepper (sliced)
2 cloves garlic
1 L fish stock
Olive oil
Salt & herbs`,
    steps: `Sauté onion and garlic in olive oil.
Add tomatoes and pepper; cook 5 minutes.
Pour in fish stock and simmer 15 minutes.
Add fish and cook another 8–10 minutes.
Season and serve warm.`,
  },
  {
    id: 'sandwich',
    title: '🐟🥪 Crispy Fish Sandwich',
    servings: '2',
    time: '25',
    ingredients: `2 fish fillets
½ cup breadcrumbs
1 egg (beaten)
2 sandwich buns
Lettuce
Tartar sauce`,
    steps: `Dip fillets in egg, then coat with breadcrumbs.
Fry in oil until golden (3–4 minutes per side).
Toast buns lightly.
Assemble sandwich with fish, lettuce, and sauce.`,
  },
  {
    id: 'carp',
    title: '🐟🌶 Spicy Grilled Carp',
    servings: '2',
    time: '30',
    ingredients: `1 carp fillet
1 tsp chili flakes
1 tbsp olive oil
Salt
Lemon juice`,
    steps: `Brush fish with olive oil.
Season with chili flakes and salt.
Grill 6–8 minutes per side.
Finish with lemon juice before serving.`,
  },
  {
    id: 'salad',
    title: '🐟🥗 Light Trout Salad',
    servings: '2',
    time: '20',
    ingredients: `1 smoked trout (flaked)
Mixed greens
Cherry tomatoes
1 cucumber (sliced)
Olive oil
Lemon juice`,
    steps: `Arrange greens on a plate.
Add tomatoes and cucumber.
Top with flaked trout.
Drizzle olive oil and lemon juice.`,
  },
  {
    id: 'foil',
    title: '🐟🍳 Campfire Foil Fish Pack',
    servings: '2',
    time: '25',
    ingredients: `2 fish fillets
1 zucchini (sliced)
1 small onion (sliced)
1 tbsp butter
Salt & pepper
Aluminum foil`,
    steps: `Place fish on foil sheets.
Add vegetables on top.
Season and add butter.
Wrap tightly and cook over campfire coals for 15–20 minutes.
Open carefully and serve.`,
  },
];

const FishermansTrackerRecipes: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTabsRoutes'>>();
  const [buddyTrckrProfileNickname, setBuddyTrckrProfileNickname] = useState<
    string | null
  >(null);
  const [buddyTrckrSavedIds, setBuddyTrckrSavedIds] = useState<Set<string>>(
    new Set(),
  );
  const [buddyTrckrDetailRecipe, setBuddyTrckrDetailRecipe] =
    useState<RecipeItem | null>(null);
  const { isEnabledNotifications: buddyTrckrIsEnabledNotifications } =
    useStorage();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && buddyTrckrDetailRecipe !== null) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [buddyTrckrDetailRecipe !== null]),
  );

  const buddyTrckrGetSvdProfile = async () => {
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
          'FishermansTrackerRecipes: getSvdProfile failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrProfileNickname(null);
    }
  };

  const buddyTrckrLoadSavedRecipes = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrArr = JSON.parse(buddyTrckrRaw) as string[];
        setBuddyTrckrSavedIds(
          new Set(Array.isArray(buddyTrckrArr) ? buddyTrckrArr : []),
        );
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn(
          'FishermansTrackerRecipes: loadSavedRecipes failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrSavedIds(new Set());
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyTrckrGetSvdProfile();
      buddyTrckrLoadSavedRecipes();
    }, []),
  );

  const buddyTrckrToggleSavedRecipe = (buddyTrckrId: string) => {
    setBuddyTrckrSavedIds(buddyTrckrPrev => {
      const buddyTrckrNext = new Set(buddyTrckrPrev);
      const buddyTrckrWasSaved = buddyTrckrNext.has(buddyTrckrId);

      if (buddyTrckrWasSaved) {
        buddyTrckrNext.delete(buddyTrckrId);
      } else {
        buddyTrckrNext.add(buddyTrckrId);
      }

      AsyncStorage.setItem(
        SAVED_RECIPES_KEY,
        JSON.stringify(Array.from(buddyTrckrNext)),
      )
        .then(() => {
          if (buddyTrckrIsEnabledNotifications) {
            Toast.show({
              type: 'success',
              text1: buddyTrckrWasSaved
                ? 'Removed from saved!'
                : 'Recipe saved!',
              position: 'top',
              visibilityTime: 2000,
            });
          }
        })
        .catch(buddyTrckrErr => {
          if (__DEV__) {
            console.warn(
              'FishermansTrackerRecipes: saveRecipes failed',
              buddyTrckrErr,
            );
          }
        });

      return buddyTrckrNext;
    });
  };

  const buddyTrckrOpenDetail = (buddyTrckrRecipe: RecipeItem) => {
    setBuddyTrckrDetailRecipe(buddyTrckrRecipe);
  };

  const buddyTrckrCloseDetail = () => {
    setBuddyTrckrDetailRecipe(null);
  };

  const buddyTrckrShareRecipe = (buddyTrckrRecipe: RecipeItem) => {
    const buddyTrckrMessage = [
      buddyTrckrRecipe.title,
      `Servings: ${buddyTrckrRecipe.servings}  Approx. Time: ${buddyTrckrRecipe.time} minutes`,
      'Ingredients:',
      buddyTrckrRecipe.ingredients,
      'Steps:',
      buddyTrckrRecipe.steps,
    ].join('\n\n');

    Share.share({ message: buddyTrckrMessage, title: buddyTrckrRecipe.title });
  };

  const buddyTrckrRenderRecipeCard = ({
    item: buddyTrckrItem,
  }: {
    item: RecipeItem;
  }) => {
    const buddyTrckrSaved = buddyTrckrSavedIds.has(buddyTrckrItem.id);

    return (
      <TouchableOpacity
        style={styles.buddyTrckrRecipeCard}
        activeOpacity={0.9}
        onPress={() => buddyTrckrOpenDetail(buddyTrckrItem)}
      >
        <View style={styles.buddyTrckrRecipeCardLeft}>
          <Image
            source={require('../FishermansTrackerAssets/images/recipes.png')}
          />
        </View>

        <View style={styles.buddyTrckrRecipeCardBody}>
          <Text style={styles.buddyTrckrRecipeCardTitle} numberOfLines={2}>
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

        <TouchableOpacity
          style={styles.buddyTrckrBookmarkButton}
          onPress={() => buddyTrckrToggleSavedRecipe(buddyTrckrItem.id)}
          activeOpacity={0.8}
        >
          {buddyTrckrSaved ? (
            <Image
              source={require('../FishermansTrackerAssets/images/saved.png')}
            />
          ) : (
            <Image
              source={require('../FishermansTrackerAssets/images/save.png')}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../FishermansTrackerAssets/images/mainbg.png')}
      style={styles.buddyTrckrContainer}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.buddyTrckrHeaderContainer}>
          <Image
            source={require('../FishermansTrackerAssets/images/header.png')}
            style={styles.buddyTrckrHeader}
          />
          <TouchableOpacity
            style={styles.buddyTrckrProfileButton}
            activeOpacity={0.8}
            onPress={() =>
              buddyTrckrNavigation.navigate('FishermansTrackerProfile')
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
          <Text style={styles.buddyTrckrScreenTitle}>Cook Your Catch</Text>

          <FlatList
            data={RECIPES_DATA}
            renderItem={buddyTrckrRenderRecipeCard}
            scrollEnabled={false}
            keyExtractor={buddyTrckrItem => buddyTrckrItem.id}
            contentContainerStyle={styles.buddyTrckrListContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <Modal
          visible={buddyTrckrDetailRecipe !== null}
          animationType="slide"
          onRequestClose={buddyTrckrCloseDetail}
          statusBarTranslucent={Platform.OS === 'android'}
        >
          {buddyTrckrDetailRecipe && (
            <ImageBackground
              source={require('../FishermansTrackerAssets/images/mainbg.png')}
              style={styles.buddyTrckrDetailScreen}
            >
              <View style={styles.buddyTrckrDetailHeader}>
                <Image
                  source={require('../FishermansTrackerAssets/images/header.png')}
                  style={styles.buddyTrckrHeader}
                />
                <Image
                  source={require('../FishermansTrackerAssets/images/headerImg.png')}
                  style={styles.buddyTrckrHeaderImg}
                />
                <TouchableOpacity
                  style={styles.buddyTrckrBackButton}
                  onPress={buddyTrckrCloseDetail}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('../FishermansTrackerAssets/images/backArrow.png')}
                  />
                  <Text style={styles.buddyTrckrBackButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.buddyTrckrDetailScroll}
                contentContainerStyle={styles.buddyTrckrDetailScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.buddyTrckrDetailCard}>
                  <View style={styles.buddyTrckrDetailTitleRow}>
                    <View style={styles.buddyTrckrDetailBookIconWrap}>
                      <Image
                        source={require('../FishermansTrackerAssets/images/recipes.png')}
                        style={styles.buddyTrckrDetailBookIcon}
                      />
                    </View>

                    <Text
                      style={styles.buddyTrckrDetailTitle}
                      numberOfLines={2}
                    >
                      {buddyTrckrDetailRecipe.title}
                    </Text>

                    <TouchableOpacity
                      style={styles.buddyTrckrDetailBookmarkBtn}
                      onPress={() =>
                        buddyTrckrToggleSavedRecipe(buddyTrckrDetailRecipe.id)
                      }
                      activeOpacity={0.8}
                    >
                      {buddyTrckrSavedIds.has(buddyTrckrDetailRecipe.id) ? (
                        <Image
                          source={require('../FishermansTrackerAssets/images/saved.png')}
                          style={styles.buddyTrckrDetailBookmarkIcon}
                        />
                      ) : (
                        <Image
                          source={require('../FishermansTrackerAssets/images/save.png')}
                          style={styles.buddyTrckrDetailBookmarkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buddyTrckrDetailTags}>
                    <View style={styles.buddyTrckrRecipeTag}>
                      <Text style={styles.buddyTrckrRecipeTagText}>
                        Servings: {buddyTrckrDetailRecipe.servings}
                      </Text>
                    </View>
                    <View style={styles.buddyTrckrRecipeTag}>
                      <Text style={styles.buddyTrckrRecipeTagText}>
                        Time: ~{buddyTrckrDetailRecipe.time} min
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.buddyTrckrDetailSectionTitle}>
                    Ingredients:
                  </Text>
                  <Text style={styles.buddyTrckrDetailBody}>
                    {buddyTrckrDetailRecipe.ingredients}
                  </Text>

                  <Text style={styles.buddyTrckrDetailSectionTitle}>
                    Steps:
                  </Text>
                  <Text style={styles.buddyTrckrDetailBody}>
                    {formatRecipeSteps(buddyTrckrDetailRecipe.steps)}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      buddyTrckrShareRecipe(buddyTrckrDetailRecipe)
                    }
                    activeOpacity={0.8}
                    style={styles.buddyTrckrShareButtonContainer}
                  >
                    <LinearGradient
                      colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buddyTrckrShareButton}
                    >
                      <Image
                        source={require('../FishermansTrackerAssets/images/share.png')}
                        style={styles.buddyTrckrShareButtonIcon}
                      />
                      <Text style={styles.buddyTrckrShareButtonText}>
                        Share
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </ImageBackground>
          )}
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  buddyTrckrContainer: {
    flex: 1,
  },
  buddyTrckrHeaderContainer: {
    width: '100%',
    marginBottom: 8,
  },
  buddyTrckrHeader: {
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
  buddyTrckrScreenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10,
  },
  buddyTrckrListContent: {
    paddingBottom: 20,
  },
  buddyTrckrRecipeCard: {
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
    color: '#fff',
    marginBottom: 8,
  },
  buddyTrckrRecipeTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  buddyTrckrRecipeTag: {
    backgroundColor: '#FFC813',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 60,
  },
  buddyTrckrRecipeTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#286E42',
  },
  buddyTrckrBookmarkButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buddyTrckrDetailScreen: {
    flex: 1,
  },
  buddyTrckrDetailHeader: {
    width: '100%',
    marginBottom: 0,
  },
  buddyTrckrBackButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#286E42',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrDetailScroll: {
    flex: 1,
  },
  buddyTrckrDetailScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40,
    flexGrow: 1,
  },
  buddyTrckrDetailCard: {
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: -20,
  },
  buddyTrckrDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  buddyTrckrDetailBookIconWrap: {
    width: 58,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buddyTrckrDetailBookIcon: {},
  buddyTrckrDetailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buddyTrckrDetailBookmarkBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrDetailBookmarkIcon: {
    width: 24,
    height: 24,
  },
  buddyTrckrDetailTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  buddyTrckrDetailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  buddyTrckrDetailBody: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 20,
  },
  buddyTrckrShareButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  buddyTrckrShareButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buddyTrckrShareButtonIcon: {
    width: 22,
    height: 22,
  },
  buddyTrckrShareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
});

export default FishermansTrackerRecipes;
