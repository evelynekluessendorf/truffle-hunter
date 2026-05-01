import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Image, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { useUser } from '../context/UserContext';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration2'>;

const YEARS = [
  { label: 'Freshman', sub: '1st year' },
  { label: 'Sophomore', sub: '2nd year' },
  { label: 'Junior', sub: '3rd year' },
  { label: 'Senior', sub: '4th year' },
];

const MAJORS = [
  'Biology', 'Business Administration', 'Communications', 'Computer Science',
  'Economics', 'Engineering', 'Nursing', 'Physical Therapy', 'Political Science', 'Psychology',
];

export default function Registration2Screen({ navigation }: Props) {
  const { setFirstName: saveNameToContext, registrationDraft, setRegistrationDraft } = useUser();
  const insets = useSafeAreaInsets();
  const photo = registrationDraft.photoUri;
  const setPhoto = (v: string | null) => setRegistrationDraft({ photoUri: v });
  const firstName = registrationDraft.displayedName;
  const setFirstName = (v: string) => setRegistrationDraft({ displayedName: v });
  const year = registrationDraft.year;
  const setYear = (v: string | null) => setRegistrationDraft({ year: v });
  const major = registrationDraft.major;
  const setMajor = (v: string | null) => setRegistrationDraft({ major: v });
  const [majorModalVisible, setMajorModalVisible] = useState(false);
  const canProceed = firstName.trim().length > 0 && !!year && !!major;

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <RegistrationProgressBar step={3} />
            <Text style={styles.heading}>Set your profile</Text>

            <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                <>
                  <Text style={styles.cameraEmoji}>📸</Text>
                  <Text style={styles.photoLabel}>Tap to add a{'\n'}photo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DISPLAYED NAME*</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Maya"
                placeholderTextColor="#BBADA5"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>YEAR*</Text>
              <View style={styles.yearGrid}>
                {YEARS.map(y => {
                  const selected = year === y.label;
                  return (
                    <TouchableOpacity
                      key={y.label}
                      style={[styles.yearCard, selected && styles.yearCardSelected]}
                      onPress={() => setYear(y.label)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.yearLabel, selected && styles.yearLabelSelected]}>{y.label}</Text>
                      <Text style={[styles.yearSub, selected && styles.yearSubSelected]}>{y.sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>MAJOR*</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setMajorModalVisible(true)} activeOpacity={0.8}>
                <Text style={[styles.dropdownText, !major && styles.dropdownPlaceholder]}>
                  {major ?? 'Select your major'}
                </Text>
                <Text style={styles.chevron}>⌄</Text>
              </TouchableOpacity>
            </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={() => { if (canProceed) { saveNameToContext(firstName.trim()); navigation.navigate('RegistrationFacts'); } }}
          activeOpacity={canProceed ? 0.85 : 1}
        >
          <View style={styles.nextRow}>
            <Text style={styles.nextText}>Next</Text>
            <Text style={styles.nextArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={majorModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setMajorModalVisible(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select your major</Text>
            <FlatList
              data={MAJORS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, major === item && styles.modalItemSelected]}
                  onPress={() => { setMajor(item); setMajorModalVisible(false); }}
                >
                  <Text style={[styles.modalItemText, major === item && styles.modalItemTextSelected]}>{item}</Text>
                  {major === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.screen, paddingBottom: 16 },
  heading: {
    fontSize: FontSize.displayMedium, fontWeight: '600', color: Colors.body,
    lineHeight: 36, marginTop: 16, marginBottom: 20, letterSpacing: LetterSpacing.displayMedium,
    fontFamily: FontFamily.brand,
  },
  photoPicker: {
    alignSelf: 'center', width: 130, height: 130, borderRadius: 20,
    backgroundColor: Colors.secondaryCTA, alignItems: 'center', justifyContent: 'center',
    marginTop: 20, marginBottom: 28, overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  cameraEmoji: { fontSize: 36, marginBottom: 8 },
  photoLabel: {
    fontSize: FontSize.caption, fontWeight: '400', color: Colors.muted,
    textAlign: 'center', lineHeight: 18, letterSpacing: LetterSpacing.caption,
  },
  fieldGroup: { marginBottom: 24 },
  label: { fontSize: FontSize.micro, fontWeight: '700', color: Colors.body, letterSpacing: 0.8, marginBottom: 8 },
  input: {
    height: 52, backgroundColor: Colors.white, borderRadius: Radius.button,
    paddingHorizontal: Spacing.card, fontSize: FontSize.body, color: Colors.body,
    borderWidth: 1, borderColor: Colors.border,
  },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  yearCard: {
    width: '47%', paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: Radius.button, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white, alignItems: 'center',
  },
  yearCardSelected: { backgroundColor: Colors.selected, borderColor: Colors.brand },
  yearLabel: { fontSize: FontSize.body, fontWeight: '600', color: Colors.muted, marginBottom: 2, letterSpacing: LetterSpacing.body },
  yearLabelSelected: { color: Colors.brand },
  yearSub: { fontSize: FontSize.micro, fontWeight: '400', color: Colors.muted, letterSpacing: LetterSpacing.micro },
  yearSubSelected: { color: Colors.coral },
  dropdown: {
    height: 52, backgroundColor: Colors.white, borderRadius: Radius.button,
    paddingHorizontal: Spacing.card, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dropdownText: { fontSize: FontSize.body, color: Colors.body },
  dropdownPlaceholder: { color: '#BBADA5' },
  chevron: { fontSize: FontSize.sectionHeader, color: Colors.muted },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, backgroundColor: Colors.white },
  nextBtn: { height: 56, backgroundColor: Colors.orange, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled: { backgroundColor: Colors.brand, opacity: 0.4 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
  nextArrow: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false, lineHeight: 20 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingBottom: 32, maxHeight: '60%',
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600', color: Colors.body, paddingHorizontal: Spacing.screen, marginBottom: 8, letterSpacing: LetterSpacing.sectionHeader },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.screen },
  modalItemSelected: { backgroundColor: Colors.selected },
  modalItemText: { fontSize: FontSize.body, fontWeight: '400', color: Colors.body },
  modalItemTextSelected: { color: Colors.brand, fontWeight: '600' },
  checkmark: { fontSize: FontSize.body, color: Colors.brand },
  separator: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.screen },
});
