import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const PROFILE_STORAGE_KEY = '@FishermansTracker/profile';
const SAVED_RECIPES_KEY = '@FishermansTracker/savedRecipes';

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
  const navigation = useNavigation();
  const [profileNickname, setProfileNickname] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [detailRecipe, setDetailRecipe] = useState<RecipeItem | null>(null);

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

  const loadSavedRecipes = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        setSavedIds(new Set(Array.isArray(arr) ? arr : []));
      }
    } catch {
      setSavedIds(new Set());
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadSavedRecipes();
  }, [loadProfile, loadSavedRecipes]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const toggleSaved = useCallback(async (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(
        SAVED_RECIPES_KEY,
        JSON.stringify(Array.from(next)),
      ).catch(() => {});
      return next;
    });
  }, []);

  const openDetail = useCallback((recipe: RecipeItem) => {
    setDetailRecipe(recipe);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailRecipe(null);
  }, []);

  const shareRecipe = useCallback((recipe: RecipeItem) => {
    const message = [
      recipe.title,
      `Servings: ${recipe.servings}  Approx. Time: ${recipe.time} minutes`,
      'Ingredients:',
      recipe.ingredients,
      'Steps:',
      recipe.steps,
    ].join('\n\n');
    Share.share({ message, title: recipe.title });
  }, []);

  const renderRecipeCard = useCallback(
    ({ item }: { item: RecipeItem }) => {
      const saved = savedIds.has(item.id);
      return (
        <TouchableOpacity
          style={styles.recipeCard}
          activeOpacity={0.9}
          onPress={() => openDetail(item)}
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
                <Text style={styles.recipeTagText}>Time: ~{item.time} min</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => toggleSaved(item.id)}
            activeOpacity={0.8}
          >
            {saved ? (
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
    },
    [savedIds, toggleSaved, openDetail],
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
          <Text style={styles.screenTitle}>Cook Your Catch</Text>

          <FlatList
            data={RECIPES_DATA}
            renderItem={renderRecipeCard}
            scrollEnabled={false}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <Modal
          visible={detailRecipe !== null}
          animationType="slide"
          onRequestClose={closeDetail}
        >
          {detailRecipe && (
            <ImageBackground
              source={require('../FishermansTrackerAssets/images/mainbg.png')}
              style={styles.detailScreen}
            >
              <View style={styles.detailHeader}>
                <Image
                  source={require('../FishermansTrackerAssets/images/header.png')}
                  style={styles.header}
                />
                <Image
                  source={require('../FishermansTrackerAssets/images/headerImg.png')}
                  style={styles.headerImg}
                />
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={closeDetail}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('../FishermansTrackerAssets/images/backArrow.png')}
                  />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.detailScroll}
                contentContainerStyle={styles.detailScrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.detailCard}>
                  <View style={styles.detailTitleRow}>
                    <View style={styles.detailBookIconWrap}>
                      <Image
                        source={require('../FishermansTrackerAssets/images/recipes.png')}
                        style={styles.detailBookIcon}
                      />
                    </View>
                    <Text style={styles.detailTitle} numberOfLines={2}>
                      {detailRecipe.title}
                    </Text>
                    <TouchableOpacity
                      style={styles.detailBookmarkBtn}
                      onPress={() => toggleSaved(detailRecipe.id)}
                      activeOpacity={0.8}
                    >
                      {savedIds.has(detailRecipe.id) ? (
                        <Image
                          source={require('../FishermansTrackerAssets/images/saved.png')}
                          style={styles.detailBookmarkIcon}
                        />
                      ) : (
                        <Image
                          source={require('../FishermansTrackerAssets/images/save.png')}
                          style={styles.detailBookmarkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.detailTags}>
                    <View style={styles.recipeTag}>
                      <Text style={styles.recipeTagText}>
                        Servings: {detailRecipe.servings}
                      </Text>
                    </View>
                    <View style={styles.recipeTag}>
                      <Text style={styles.recipeTagText}>
                        Time: ~{detailRecipe.time} min
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.detailSectionTitle}>Ingredients:</Text>
                  <Text style={styles.detailBody}>
                    {detailRecipe.ingredients}
                  </Text>
                  <Text style={styles.detailSectionTitle}>Steps:</Text>
                  <Text style={styles.detailBody}>
                    {detailRecipe.steps
                      .split('\n')
                      .filter(Boolean)
                      .map((line, i) => `${i + 1}. ${line}`)
                      .join('\n')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => shareRecipe(detailRecipe)}
                    activeOpacity={0.8}
                    style={styles.shareButtonContainer}
                  >
                    <LinearGradient
                      colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.shareButton}
                    >
                      <Image
                        source={require('../FishermansTrackerAssets/images/share.png')}
                        style={styles.shareButtonIcon}
                      />
                      <Text style={styles.shareButtonText}>Share</Text>
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
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
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
  recipeBookIcon: {
    fontSize: 28,
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
  bookmarkIcon: {
    fontSize: 24,
  },
  detailScreen: {
    flex: 1,
  },
  detailHeader: {
    width: '100%',
    marginBottom: 0,
  },
  backButton: {
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 40,
    flexGrow: 1,
  },
  detailCard: {
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
    marginTop: -20,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailBookIconWrap: {
    width: 58,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailBookIcon: {},
  detailTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  detailBookmarkBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailBookmarkIcon: {
    width: 24,
    height: 24,
  },
  detailTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  detailBody: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 22,
    marginBottom: 20,
  },
  shareButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  shareButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonIcon: {
    width: 22,
    height: 22,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007083',
  },
});

export default FishermansTrackerRecipes;
