import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Platform, ScrollView,
  Image, Modal, FlatList, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';
import BackButton from '../components/BackButton';

// Truffle Hunter design tokens — .claude/skills/truffle-hunter-design/SKILL.md
const COLORS = {
  piggyPink: '#FFB0C7',
  piggyPinkBright: '#FF7D9E',
  keylinePurple: '#201642',
  cream: '#FAF9F6',
  accentCoral: '#FF6B35',
  accentCoralLight: '#FFF0EB',
  sunnyYellow: '#FFF1C6',
  sunnyYellowBright: '#E8A33D',
};

const YEARS = [
  { label: 'Freshman', sub: '1st year' },
  { label: 'Sophomore', sub: '2nd year' },
  { label: 'Junior', sub: '3rd year' },
  { label: 'Senior', sub: '4th year' },
];

const MAJORS = [
  'Biology',
  'Business Administration',
  'Computer Science',
  'Law',
  'Physical Therapy',
  'Political Science',
  'Psychology',
];

type Props = NativeStackScreenProps<RootStackParamList, 'Registration3'>;

export default function ProfileSetupScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { setRegistrationDraft, registrationDraft } = useUser();
  const isEditing = route?.params?.isEditing ?? false;

  const [photo, setPhoto] = useState<string | null>(registrationDraft.photoUri ?? null);
  const [name, setName] = useState(registrationDraft.displayedName ?? '');
  const [year, setYear] = useState(registrationDraft.year ?? '');
  const [major, setMajor] = useState(registrationDraft.major ?? '');
  const [majorModalVisible, setMajorModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const canProceed = name.trim().length > 0 && year.length > 0 && major.length > 0;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setRegistrationDraft({ photoUri: result.assets[0].uri });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '60%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 24 }}>
          Set your profile
        </Text>

        <TouchableOpacity onPress={pickPhoto} style={{ alignSelf: 'center', marginBottom: 24 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 150, height: 150, borderRadius: 16 }} />
          ) : (
            <View
              style={{
                width: 150, height: 150, borderRadius: 16,
                backgroundColor: COLORS.accentCoralLight,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 40 }}>📸</Text>
              <Text
                style={{
                  fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                  color: '#C17F5A', textAlign: 'center', marginTop: 8,
                }}>
                Tap to add a photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
          Displayed Name*
        </Text>
        <TextInput
          style={{
            height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10,
            paddingHorizontal: 12, fontSize: 15, color: COLORS.keylinePurple,
            marginBottom: 24, backgroundColor: '#ffffff',
          }}
          placeholder="Maya"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={setName}
        />

        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 12 }}>
          Year*
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {YEARS.map(y => (
            <TouchableOpacity
              key={y.label}
              onPress={() => setYear(y.label)}
              style={{
                flex: 1, minWidth: '45%', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                backgroundColor: year === y.label ? COLORS.accentCoralLight : '#FFFFFF',
                borderWidth: year === y.label ? 1.5 : 1,
                borderColor: year === y.label ? COLORS.accentCoral : '#DDDDDD',
              }}>
              <Text
                style={{
                  fontSize: 15, fontFamily: 'Fredoka_700Bold',
                  color: year === y.label ? COLORS.accentCoral : '#111111',
                }}>
                {y.label}
              </Text>
              <Text
                style={{
                  fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                  color: '#888888', marginTop: 2,
                }}>
                {y.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
          Major*
        </Text>
        <TouchableOpacity
          onPress={() => setMajorModalVisible(true)}
          style={{
            height: 52, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 10,
            paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 24, backgroundColor: '#ffffff',
          }}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: major ? '#111111' : '#AAAAAA' }}>
            {major || 'Please select'}
          </Text>
          <Text style={{ fontSize: 14, color: '#888888' }}>▾</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : insets.bottom + 8,
          backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() => {
            if (!canProceed) return;
            setRegistrationDraft({ displayedName: name, year, major });
            if (isEditing) {
              navigation.goBack();
            } else {
              navigation.navigate('Registration4');
            }
          }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            opacity: canProceed ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>
            {isEditing ? 'Save' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── MAJOR PICKER ── */}
      <Modal visible={majorModalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setMajorModalVisible(false)}>
          <View
            style={{
              backgroundColor: COLORS.cream,
              borderTopLeftRadius: 20, borderTopRightRadius: 20,
              paddingTop: 12, paddingBottom: insets.bottom + 16,
            }}>
            <View
              style={{
                width: 40, height: 4, backgroundColor: '#E0E0E0',
                borderRadius: 2, alignSelf: 'center', marginBottom: 16,
              }}
            />
            <Text
              style={{
                fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
                paddingHorizontal: 24, marginBottom: 8,
              }}>
              Select your major
            </Text>
            <FlatList
              data={MAJORS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setMajor(item);
                    setMajorModalVisible(false);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 16, paddingHorizontal: 24,
                    backgroundColor: major === item ? COLORS.accentCoralLight : '#FFFFFF',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: major === item ? COLORS.accentCoral : '#111111',
                      fontWeight: major === item ? '600' : '400',
                    }}>
                    {item}
                  </Text>
                  {major === item && <Text style={{ fontSize: 16, color: COLORS.accentCoral }}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 24 }} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
