import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Modal, Linking, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import UserAvatar from '../components/UserAvatar';
import { Image } from 'react-native';
import InterestTag from '../components/InterestTag';
import { currentUser, interestEmojis } from '../data/mockData';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';

const ALL_INTERESTS = Object.keys(interestEmojis);

const SOCIAL_META = {
  instagram: { icon: '📸', url: (h: string) => `https://instagram.com/${h}` },
  tiktok:    { icon: '🎵', url: (h: string) => `https://tiktok.com/@${h}` },
  facebook:  { icon: '👤', url: (h: string) => `https://facebook.com/${h}` },
};

export default function ProfileScreen() {
  const { iceBreakers, setIceBreakers, interests, setInterests, conversationCount, socialLinks, setSocialLinks, registrationDraft, setRegistrationDraft } = useUser();

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) { setRegistrationDraft({ photoUri: result.assets[0].uri }); setHasChanges(true); }
  };

  // ice breaker editing
  const [editingIB, setEditingIB] = useState(false);
  const [draftIB, setDraftIB] = useState<string[]>([]);

  // social editing
  const [editingSocial, setEditingSocial] = useState(false);
  const [draftSocial, setDraftSocial] = useState({ instagram: '', tiktok: '', facebook: '' });

  // interest editing
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  const [draftInterests, setDraftInterests] = useState<Set<string>>(new Set());

  const [hasChanges, setHasChanges] = useState(false);
  const insets = useSafeAreaInsets();

  const startEditSocial = () => {
    setDraftSocial({
      instagram: socialLinks.instagram ?? '',
      tiktok: socialLinks.tiktok ?? '',
      facebook: socialLinks.facebook ?? '',
    });
    setEditingSocial(true);
    setHasChanges(true);
  };

  const startEditIB = () => {
    setDraftIB([...iceBreakers]);
    setEditingIB(true);
    setHasChanges(true);
  };

  const startEditInterests = () => {
    setDraftInterests(new Set(interests));
    setInterestModalVisible(true);
    setHasChanges(true);
  };

  const toggleDraftInterest = (tag: string) => {
    setDraftInterests(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const handleSave = () => {
    if (editingIB) {
      setIceBreakers(draftIB.filter(t => t.trim().length > 0));
      setEditingIB(false);
    }
    if (editingSocial) {
      setSocialLinks({
        instagram: draftSocial.instagram.trim() || undefined,
        tiktok: draftSocial.tiktok.trim() || undefined,
        facebook: draftSocial.facebook.trim() || undefined,
      });
      setEditingSocial(false);
    }
    setHasChanges(false);
    Alert.alert('Saved!', 'Your profile has been updated.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: Colors.white }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <TouchableOpacity style={styles.avatarWrapper} onPress={pickPhoto} activeOpacity={0.8}>
                {registrationDraft.photoUri ? (
                  <Image source={{ uri: registrationDraft.photoUri }} style={styles.photo} />
                ) : (
                  <UserAvatar name={currentUser.name} color={currentUser.avatarColor} size={140} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.editPhotoBtn} onPress={pickPhoto}>
                <Text style={styles.editLink}>✏ Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.name}>{currentUser.name}</Text>
              <Text style={styles.conversationCount}>
                <Text style={styles.convBold}>{conversationCount} conversations</Text>
                {' '}in the last 30 days
              </Text>
              <View style={styles.tagsRow}>
                <Text style={styles.metaTag}>⚙ {currentUser.year}</Text>
                <Text style={styles.metaTag}>⊕ {currentUser.major}</Text>
              </View>

              {/* ICE BREAKERS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>ICE BREAKERS</Text>
                  {!editingIB ? (
                    <TouchableOpacity onPress={startEditIB}>
                      <Text style={styles.editLink}>✏ Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => {
                      setIceBreakers(draftIB.filter(t => t.trim().length > 0));
                      setEditingIB(false);
                      setHasChanges(true);
                    }}>
                      <Text style={styles.doneLink}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {editingIB ? (
                  <>
                    {draftIB.map((item, i) => (
                      <View key={i} style={styles.ibEditRow}>
                        <TextInput
                          style={styles.ibInput}
                          value={item}
                          onChangeText={val => {
                            const updated = [...draftIB];
                            updated[i] = val;
                            setDraftIB(updated);
                          }}
                          multiline
                          placeholder="Add an ice breaker…"
                          placeholderTextColor={Colors.muted}
                        />
                        <TouchableOpacity onPress={() => setDraftIB(draftIB.filter((_, j) => j !== i))}>
                          <Text style={styles.removeBtn}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => setDraftIB([...draftIB, ''])} style={styles.addIBBtn}>
                      <Text style={styles.addIBText}>+ Add another</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  iceBreakers.map((item, i) => (
                    <View key={i} style={styles.iceBreakerRow}>
                      <Text style={styles.iceBreakerBullet}>·</Text>
                      <Text style={styles.iceBreaker}>{item}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* INTERESTS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>INTERESTS</Text>
                  <TouchableOpacity onPress={startEditInterests}>
                    <Text style={styles.editLink}>✏ Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsWrap}>
                  {interests.map(tag => (
                    <InterestTag key={tag} label={tag} />
                  ))}
                </View>
              </View>

              {/* SOCIAL */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>SOCIAL</Text>
                  {!editingSocial ? (
                    <TouchableOpacity onPress={startEditSocial}>
                      <Text style={styles.editLink}>✏ Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => {
                      setSocialLinks({
                        instagram: draftSocial.instagram.trim() || undefined,
                        tiktok: draftSocial.tiktok.trim() || undefined,
                        facebook: draftSocial.facebook.trim() || undefined,
                      });
                      setEditingSocial(false);
                      setHasChanges(true);
                    }}>
                      <Text style={styles.doneLink}>Done</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {editingSocial ? (
                  <View style={styles.socialInputs}>
                    {(['instagram', 'tiktok', 'facebook'] as const).map(platform => (
                      <View key={platform} style={styles.socialInputRow}>
                        <Text style={styles.socialLabel}>{SOCIAL_META[platform].icon}</Text>
                        <TextInput
                          style={styles.socialInput}
                          value={draftSocial[platform]}
                          onChangeText={val => setDraftSocial(prev => ({ ...prev, [platform]: val }))}
                          placeholder={`@${platform} username`}
                          placeholderTextColor={Colors.muted}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.socialLinks}>
                    {(['instagram', 'tiktok', 'facebook'] as const).map(platform => {
                      const handle = socialLinks[platform];
                      if (!handle) return null;
                      return (
                        <View key={platform} style={styles.socialRow}>
                          <Text style={styles.socialIcon}>{SOCIAL_META[platform].icon}</Text>
                          <Text style={styles.socialHandle}>@{handle}</Text>
                        </View>
                      );
                    })}
                    {!socialLinks.instagram && !socialLinks.tiktok && !socialLinks.facebook && (
                      <Text style={styles.socialEmpty}>No social links added yet</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
        </ScrollView>

        {/* Interests selection modal */}
        <Modal visible={interestModalVisible} transparent animationType="slide">
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Interests</Text>
                <TouchableOpacity onPress={() => setInterestModalVisible(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalHint}>Select at least 3</Text>
              <ScrollView contentContainerStyle={styles.pillsWrap}>
                {ALL_INTERESTS.map(tag => {
                  const selected = draftInterests.has(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.pill, selected && styles.pillSelected]}
                      onPress={() => toggleDraftInterest(tag)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                        {interestEmojis[tag]} {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, draftInterests.size < 3 && styles.saveBtnDisabled]}
                  disabled={draftInterests.size < 3}
                  onPress={() => {
                    setInterests(Array.from(draftInterests));
                    setInterestModalVisible(false);
                    setHasChanges(true);
                  }}
                >
                  <Text style={styles.saveBtnText}>Save interests</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {hasChanges && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 16 },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    position: 'relative',
  },
  photo: { width: 140, height: 140, borderRadius: 24 },
  avatarWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  editPhotoBtn: {
    position: 'absolute',
    right: Spacing.screen,
    bottom: 16,
  },
  content: { paddingHorizontal: Spacing.screen },
  name: {
    fontSize: FontSize.displayMedium,
    fontWeight: '700',
    fontFamily: FontFamily.brand,
    color: Colors.body,
    marginBottom: 4,
    letterSpacing: LetterSpacing.displayMedium,
  },
  conversationCount: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.body,
    marginBottom: 8,
  },
  convBold: { color: Colors.brand, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.section },
  metaTag: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted },
  section: { marginBottom: Spacing.section },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: 0.8,
  },
  editLink: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted },
  doneLink: { fontSize: FontSize.bodySmall, color: Colors.brand, fontWeight: '600' },
  iceBreakerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  iceBreakerBullet: { fontSize: FontSize.body, color: Colors.coral, lineHeight: 26, marginTop: 1 },
  iceBreaker: { flex: 1, fontSize: FontSize.body, fontWeight: '400', color: Colors.body, lineHeight: 26 },
  ibEditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  ibInput: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 26,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeBtn: { fontSize: 16, color: Colors.muted, paddingTop: 2 },
  addIBBtn: { paddingVertical: 6 },
  addIBText: { fontSize: FontSize.bodySmall, color: Colors.brand, fontWeight: '600' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, paddingBottom: 32 },
  saveBtn: {
    height: 52,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { backgroundColor: Colors.selected, opacity: 1 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
  saveBtnTextDisabled: { color: '#B0A8A4' },
  // interests modal
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.screen,
    paddingBottom: 8,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#E0E0E0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  modalTitle: { fontSize: FontSize.sectionHeader, fontWeight: '600', color: Colors.body, letterSpacing: LetterSpacing.sectionHeader },
  modalClose: { fontSize: FontSize.sectionHeader, color: Colors.muted },
  modalHint: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted, marginBottom: 16 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 16 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: Radius.tag, borderWidth: 1.5, borderColor: '#E0E0E0',
    backgroundColor: Colors.white,
  },
  pillSelected: { backgroundColor: Colors.selected, borderColor: Colors.brand },
  pillText: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.body },
  pillTextSelected: { color: Colors.brand, fontWeight: '700' },
  modalFooter: { paddingVertical: 12 },
  modalSaveBtn: {
    height: 52, backgroundColor: Colors.orange,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  socialInputs: { gap: 10 },
  socialInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  socialLabel: { fontSize: FontSize.body },
  socialInput: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
  },
  socialLinks: { gap: 10 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialIcon: { fontSize: FontSize.body },
  socialHandle: { fontSize: FontSize.body, fontWeight: '400', color: Colors.body },
  socialEmpty: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted },
});
