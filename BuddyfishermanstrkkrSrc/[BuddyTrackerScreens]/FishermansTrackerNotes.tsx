// notes screen - allows user to add notes about their fishing trips, save them to async storage, and share them with friends, also has a profile button that takes user to profile screen where they can set their nickname and other details

import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { StackList } from '../../Fishermanstackkrouts';
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

const FishermansTrackerNotes: React.FC = () => {
  const navigation =
    useNavigation<StackNavigationProp<StackList, 'FishermansTabsRoutes'>>();
  const [buddyFshNotes, setBuddyFshNotes] = useState<NoteItem[]>([]);
  const [profileNickname, setProfileNickname] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [buddyFshTitle, setBuddyFshTitle] = useState('');
  const [buddyFshDetails, setBuddyFshDetails] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android' && modalVisible) {
        Orientation.lockToPortrait();
      }

      return () => Orientation.unlockAllOrientations();
    }, [modalVisible]),
  );

  const buddyFshloadProfile = async () => {
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
        console.warn('FishermansTrackerNotes: loadProfile failed', err);
      }
      setProfileNickname(null);
    }
  };

  const buddyFshLoadNotes = async () => {
    try {
      const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NoteItem[];
        setBuddyFshNotes(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerNotes: loadNotes failed', err);
      }
      setBuddyFshNotes([]);
    }
  };

  const buddyFshSaveNotes = async (nextNotes: NoteItem[]) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextNotes));
    } catch (err) {
      if (__DEV__) {
        console.warn('FishermansTrackerNotes: saveNotes failed', err);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      buddyFshLoadNotes();
      buddyFshloadProfile();
    }, []),
  );

  const openAdd = () => {
    setBuddyFshTitle('');
    setBuddyFshDetails('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setBuddyFshTitle('');
    setBuddyFshDetails('');
  };

  const buddyFshHandleShareNote = (note: NoteItem) => {
    const message = [note.title, note.date, note.details]
      .filter(Boolean)
      .join('\n\n');
    Share.share({ message, title: note.title });
  };

  const buddyFshHandleSaveNote = () => {
    const t = buddyFshTitle.trim();
    if (!t) return;
    const now = new Date();
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: t,
      details: buddyFshDetails.trim(),
      date: formatDate(now),
    };
    setBuddyFshNotes(prev => {
      const next = [newNote, ...prev];
      buddyFshSaveNotes(next).then(() => {
        Toast.show({
          type: 'success',
          text1: 'Note successfully saved!',
          position: 'top',
          visibilityTime: 2000,
        });
      });
      return next;
    });
    closeModal();
  };

  const buddyFshConfirmDelete = (id: string) => {
    Alert.alert('Remove Note?', 'This action cannot be undone', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setBuddyFshNotes(prev => {
            const next = prev.filter(n => n.id !== id);
            buddyFshSaveNotes(next);
            return next;
          });
        },
      },
    ]);
  };

  const renderNoteCard = ({ item }: { item: NoteItem }) => (
    <View style={styles.noteCard}>
      <TouchableOpacity
        style={styles.noteCardArrow}
        onPress={() => buddyFshHandleShareNote(item)}
        activeOpacity={0.8}
      >
        <Image
          source={require('../FishermansTrackerAssets/images/share.png')}
          style={styles.noteCardArrowImage}
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={() => buddyFshConfirmDelete(item.id)}
        style={styles.noteCardContent}
      >
        <Text style={styles.noteCardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteCardDate}>{item.date}</Text>
        <Text style={styles.noteCardDetails} numberOfLines={3}>
          {item.details ||
            "Note down details you'd like to remember for next time..."}
        </Text>
      </TouchableOpacity>
    </View>
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
          <Text style={styles.screenTitle}>Fishing Notes</Text>

          <TouchableOpacity
            onPress={openAdd}
            activeOpacity={0.8}
            style={styles.addButtonContainer}
          >
            <LinearGradient
              colors={['#A2E8D5', '#FFFAD0', '#2CCCE7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addButton}
            >
              <Text style={styles.addButtonPlus}>+</Text>
              <Text style={styles.addButtonText}>Add note</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.listGradient}>
            <FlatList
              data={buddyFshNotes}
              renderItem={renderNoteCard}
              scrollEnabled={false}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
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
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={styles.modalCard}
            >
              <Text style={styles.modalTitle}>Add Note</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="What would you call today's adventure?"
                placeholderTextColor="#FFFFFF80"
                value={buddyFshTitle}
                onChangeText={setBuddyFshTitle}
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputMultiline]}
                placeholder="Note down details you'd like to remember for next time..."
                placeholderTextColor="#FFFFFF80"
                value={buddyFshDetails}
                onChangeText={setBuddyFshDetails}
                multiline
              />
              <TouchableOpacity
                onPress={buddyFshHandleSaveNote}
                activeOpacity={0.8}
                style={styles.saveButtonContainer}
                disabled={!buddyFshTitle.trim()}
              >
                <LinearGradient
                  colors={
                    buddyFshTitle.trim()
                      ? ['#A2E8D5', '#FFFAD0', '#2CCCE7']
                      : ['#97C5B8', '#97C5B8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      !buddyFshTitle.trim() && styles.buttonTextDisabled,
                    ]}
                  >
                    Save Note
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
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
  addButtonContainer: {
    width: '100%',
    marginBottom: 20,
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
  addButtonPlus: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007083',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  listGradient: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingBottom: 20,
  },
  noteCard: {
    width: '100%',
    backgroundColor: '#286E42',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'relative',
  },
  noteCardArrow: {
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
  noteCardArrowImage: {
    width: 20,
    height: 20,
  },
  noteCardContent: {
    paddingRight: 44,
  },
  noteCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  noteCardDate: {
    fontSize: 14,
    color: '#FFC813',
    marginBottom: 8,
  },
  noteCardDetails: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.21)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#286E42',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#799930',
    borderRadius: 60,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#fff',
    marginBottom: 16,
  },
  modalInputMultiline: {
    borderRadius: 20,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  saveButton: {
    width: '100%',
    height: 51,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007083',
  },
  buttonTextDisabled: {
    color: '#657375',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default FishermansTrackerNotes;
