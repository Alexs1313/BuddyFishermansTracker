// notes screen - allows user to add notes about their fishing trips, save them to async storage, and share them with friends, also has a profile button that takes user to profile screen where they can set their nickname and other details

import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { StackList } from '../../Stackkrouts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from '@react-native-community/blur';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {
  NOTES_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  formatDate,
} from '../fishermansUtils';
import Orientation from 'react-native-orientation-locker';

export type NoteItem = {
  id: string;
  title: string;
  details: string;
  date: string;
};

const ThebudyyTrackerNotes: React.FC = () => {
  const buddyTrckrNavigation =
    useNavigation<StackNavigationProp<StackList, 'Bottomtabsroutes'>>();
  const [buddyTrckrNotes, setBuddyTrckrNotes] = useState<NoteItem[]>([]);
  const [buddyTrckrProfileNickname, setBuddyTrckrProfileNickname] = useState<
    string | null
  >(null);
  const [buddyTrckrModalVisible, setBuddyTrckrModalVisible] = useState(false);
  const [buddyTrckrTitle, setBuddyTrckrTitle] = useState('');
  const [buddyTrckrDetails, setBuddyTrckrDetails] = useState('');
  const buddyTrckrShowDemoNotes = buddyTrckrNotes.length === 0;
  const buddyTrckrDemoNotes: NoteItem[] = [
    {
      id: 'demo-note-1',
      title: 'Best bait combo',
      date: 'Mar 14, 2026',
      details:
        'Tried spinner + light jig near reeds. First bite in 7 minutes. Next time: start earlier and log wind direction.',
    },
    {
      id: 'demo-note-2',
      title: 'Weather & water notes',
      date: 'Mar 07, 2026',
      details:
        'Cloudy, light drizzle. Fish stayed deeper. Switching to slower retrieve helped. Remember to bring extra line.',
    },
  ];
  const buddyTrckrDisplayedNotes = buddyTrckrShowDemoNotes
    ? buddyTrckrDemoNotes
    : buddyTrckrNotes;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && buddyTrckrModalVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [buddyTrckrModalVisible]),
  );

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
          'FishermansTrackerNotes: loadProfile failed',
          buddyTrckrErr,
        );
      }
      setBuddyTrckrProfileNickname(null);
    }
  };

  const buddyTrckrLoadNotes = async () => {
    try {
      const buddyTrckrRaw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (buddyTrckrRaw) {
        const buddyTrckrParsed = JSON.parse(buddyTrckrRaw) as NoteItem[];
        setBuddyTrckrNotes(
          Array.isArray(buddyTrckrParsed) ? buddyTrckrParsed : [],
        );
      }
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn('FishermansTrackerNotes: loadNotes failed', buddyTrckrErr);
      }
      setBuddyTrckrNotes([]);
    }
  };

  const buddyTrckrSaveNotes = async (buddyTrckrNextNotes: NoteItem[]) => {
    try {
      await AsyncStorage.setItem(
        NOTES_STORAGE_KEY,
        JSON.stringify(buddyTrckrNextNotes),
      );
    } catch (buddyTrckrErr) {
      if (__DEV__) {
        console.warn('FishermansTrackerNotes: saveNotes failed', buddyTrckrErr);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyTrckrLoadNotes();
      buddyTrckrLoadProfile();
    }, []),
  );

  const buddyTrckrOpenAdd = () => {
    setBuddyTrckrTitle('');
    setBuddyTrckrDetails('');
    setBuddyTrckrModalVisible(true);
  };

  const buddyTrckrCloseModal = () => {
    setBuddyTrckrModalVisible(false);
    setBuddyTrckrTitle('');
    setBuddyTrckrDetails('');
  };

  const buddyTrckrHandleShareNote = (buddyTrckrNote: NoteItem) => {
    const buddyTrckrMessage = [
      buddyTrckrNote.title,
      buddyTrckrNote.date,
      buddyTrckrNote.details,
    ]
      .filter(Boolean)
      .join('\n\n');

    Share.share({
      message: buddyTrckrMessage,
      title: buddyTrckrNote.title,
    });
  };

  const buddyTrckrHandleSaveNote = () => {
    const buddyTrckrTrimmedTitle = buddyTrckrTitle.trim();
    if (!buddyTrckrTrimmedTitle) return;

    const buddyTrckrNow = new Date();
    const buddyTrckrNewNote: NoteItem = {
      id: Date.now().toString(),
      title: buddyTrckrTrimmedTitle,
      details: buddyTrckrDetails.trim(),
      date: formatDate(buddyTrckrNow),
    };

    setBuddyTrckrNotes(buddyTrckrPrev => {
      const buddyTrckrNext = [buddyTrckrNewNote, ...buddyTrckrPrev];
      buddyTrckrSaveNotes(buddyTrckrNext).then(() => {
        Toast.show({
          type: 'success',
          text1: 'Note successfully saved!',
          position: 'top',
          visibilityTime: 2000,
        });
      });
      return buddyTrckrNext;
    });

    buddyTrckrCloseModal();
  };

  const buddyTrckrConfirmDelete = (buddyTrckrId: string) => {
    Alert.alert('Remove Note?', 'This action cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setBuddyTrckrNotes(buddyTrckrPrev => {
            const buddyTrckrNext = buddyTrckrPrev.filter(
              buddyTrckrNote => buddyTrckrNote.id !== buddyTrckrId,
            );
            buddyTrckrSaveNotes(buddyTrckrNext);
            return buddyTrckrNext;
          });
        },
      },
    ]);
  };

  const buddyTrckrRenderNoteCard = ({
    item: buddyTrckrItem,
  }: {
    item: NoteItem;
  }) => (
    <View style={styles.buddyTrckrNoteCard}>
      <TouchableOpacity
        style={styles.buddyTrckrNoteCardArrow}
        onPress={() => buddyTrckrHandleShareNote(buddyTrckrItem)}
        activeOpacity={0.8}
      >
        <Image
          source={require('../FishermansTrackerAssets/images/share.png')}
          style={styles.buddyTrckrNoteCardArrowImage}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        onLongPress={() => buddyTrckrConfirmDelete(buddyTrckrItem.id)}
        style={styles.buddyTrckrNoteCardContent}
      >
        <Text style={styles.buddyTrckrNoteCardTitle} numberOfLines={1}>
          {buddyTrckrItem.title}
        </Text>
        <Text style={styles.buddyTrckrNoteCardDate}>{buddyTrckrItem.date}</Text>
        <Text style={styles.buddyTrckrNoteCardDetails} numberOfLines={3}>
          {buddyTrckrItem.details ||
            "Note down details you'd like to remember for next time..."}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.buddyTrckrScreenTitle}>Fishing Notes</Text>

          <TouchableOpacity
            onPress={buddyTrckrOpenAdd}
            activeOpacity={0.8}
            style={styles.buddyTrckrAddButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buddyTrckrAddButton}
            >
              <Text style={styles.buddyTrckrAddButtonPlus}>+</Text>
              <Text style={styles.buddyTrckrAddButtonText}>Add note</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.buddyTrckrListGradient}>
            <FlatList
              data={buddyTrckrDisplayedNotes}
              renderItem={buddyTrckrRenderNoteCard}
              scrollEnabled={false}
              keyExtractor={buddyTrckrItem => buddyTrckrItem.id}
              contentContainerStyle={styles.buddyTrckrListContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        <Modal
          visible={buddyTrckrModalVisible}
          transparent
          animationType="fade"
          onRequestClose={buddyTrckrCloseModal}
          statusBarTranslucent={Platform.OS === 'android'}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              blurType="light"
              blurAmount={10}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          )}

          <TouchableOpacity
            style={styles.buddyTrckrModalBackdrop}
            activeOpacity={1}
            onPress={buddyTrckrCloseModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={buddyTrckrEvent => buddyTrckrEvent.stopPropagation()}
              style={styles.buddyTrckrModalCard}
            >
              <Text style={styles.buddyTrckrModalTitle}>Add Note</Text>

              <TextInput
                style={styles.buddyTrckrModalInput}
                placeholder="What would you call today's adventure?"
                placeholderTextColor="#FFFFFF80"
                value={buddyTrckrTitle}
                onChangeText={setBuddyTrckrTitle}
              />

              <TextInput
                style={[
                  styles.buddyTrckrModalInput,
                  styles.buddyTrckrModalInputMultiline,
                ]}
                placeholder="Note down details you'd like to remember for next time..."
                placeholderTextColor="#FFFFFF80"
                value={buddyTrckrDetails}
                onChangeText={setBuddyTrckrDetails}
                multiline
              />

              <TouchableOpacity
                onPress={buddyTrckrHandleSaveNote}
                activeOpacity={0.8}
                style={styles.buddyTrckrSaveButtonContainer}
                disabled={!buddyTrckrTitle.trim()}
              >
                <LinearGradient
                  colors={
                    buddyTrckrTitle.trim()
                      ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                      : ['#97C5B8', '#97C5B8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buddyTrckrSaveButton}
                >
                  <Text
                    style={[
                      styles.buddyTrckrSaveButtonText,
                      !buddyTrckrTitle.trim() &&
                        styles.buddyTrckrButtonTextDisabled,
                    ]}
                  >
                    Save Note
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={buddyTrckrCloseModal}
                style={styles.buddyTrckrCancelButton}
              >
                <Text style={styles.buddyTrckrCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
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
  buddyTrckrAddButtonContainer: {
    width: '100%',
    marginBottom: 20,
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
  buddyTrckrAddButtonPlus: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007083',
  },
  buddyTrckrAddButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buddyTrckrListGradient: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  buddyTrckrListContent: {
    paddingBottom: 20,
  },
  buddyTrckrNoteCard: {
    width: '100%',
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'relative',
  },
  buddyTrckrNoteCardArrow: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC813',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  buddyTrckrNoteCardArrowImage: {
    width: 20,
    height: 20,
  },
  buddyTrckrNoteCardContent: {
    paddingRight: 44,
  },
  buddyTrckrNoteCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  buddyTrckrNoteCardDate: {
    fontSize: 14,
    color: '#FFC813',
    marginBottom: 8,
  },
  buddyTrckrNoteCardDetails: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 20,
  },
  buddyTrckrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.21)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  buddyTrckrModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buddyTrckrModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buddyTrckrModalInput: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
    marginBottom: 16,
  },
  buddyTrckrModalInputMultiline: {
    borderRadius: 20,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  buddyTrckrSaveButtonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  buddyTrckrSaveButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyTrckrSaveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buddyTrckrButtonTextDisabled: {
    color: '#657375',
  },
  buddyTrckrCancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  buddyTrckrCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ThebudyyTrackerNotes;
