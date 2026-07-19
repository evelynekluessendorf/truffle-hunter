import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';
import { interestEmojis } from '../data/mockData';

const SOCIAL_PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', icon: '📸', placeholder: '@username' },
  { key: 'tiktok'    as const, label: 'TikTok',    icon: '🎵', placeholder: '@username' },
  { key: 'facebook'  as const, label: 'Facebook',  icon: '👤', placeholder: 'Profile URL' },
];

export default function MyProfileScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { registrationDraft, setRegistrationDraft, conversationCount } = useUser();

  const displayName = registrationDraft.displayedName || 'You';
  const year = registrationDraft.year || '';
  const major = registrationDraft.major || '';
  const interests = registrationDraft.selectedInterests;

  const [editingFacts, setEditingFacts] = useState(false);
  const [draftFacts, setDraftFacts] = useState<string[]>(registrationDraft.facts);

  const [editingSocial, setEditingSocial] = useState(false);
  const [draftSocial, setDraftSocial] = useState(registrationDraft.social);

  const [hasChanges, setHasChanges] = useState(false);

  const displayedFacts = registrationDraft.facts.filter(f => f.trim().length > 0);
  const hasSocialLinks = Object.values(registrationDraft.social).some(v => v.trim().length > 0);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setRegistrationDraft({ photoUri: result.assets[0].uri });
      setHasChanges(true);
    }
  };

  const handleFactChange = (text: string, index: number) => {
    const next = draftFacts.map((f, i) => (i === index ? text : f));
    setDraftFacts(next);
    setHasChanges(true);
  };

  const handleSocialChange = (key: 'instagram' | 'tiktok' | 'facebook', value: string) => {
    setDraftSocial(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setRegistrationDraft({ facts: draftFacts, social: draftSocial });
    setEditingFacts(false);
    setEditingSocial(false);
    setHasChanges(false);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000' }}>My Profile</Text>
        </View>

        {/* Photo */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ position: 'relative' }}>
            {registrationDraft.photoUri ? (
              <Image source={{ uri: registrationDraft.photoUri }} style={{ width: 160, height: 160, borderRadius: 20 }} />
            ) : (
              <View style={{ width: 160, height: 160, borderRadius: 20, backgroundColor: '#EF4514', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 48, fontWeight: '700', color: '#FFFFFF' }}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handlePickPhoto}
              style={{ position: 'absolute', top: -6, right: -6, width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#000FE1' }}>
              <Text style={{ color: '#000FE1', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#000000', marginBottom: 4 }}>{displayName}</Text>

          <Text style={{ fontSize: 14, marginBottom: 6 }}>
            <Text style={{ fontWeight: '700', color: '#000FE1' }}>{conversationCount} conversations</Text>
            <Text style={{ color: '#555555' }}> in the last 30 days</Text>
          </Text>

          {(year || major) && (
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              {year ? <Text style={{ fontSize: 13, color: '#888888' }}>🎓 {year}</Text> : null}
              {major ? <Text style={{ fontSize: 13, color: '#888888' }}>📚 {major}</Text> : null}
            </View>
          )}

          {/* Unknown Facts */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5 }}>UNKNOWN FACTS</Text>
            <TouchableOpacity
              onPress={() => {
                setDraftFacts(registrationDraft.facts);
                setEditingFacts(true);
              }}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#000FE1' }}>
              <Text style={{ color: '#000FE1', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>

          {editingFacts ? (
            draftFacts.map((fact, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 16, color: '#8888CC', marginRight: 10, marginTop: 14 }}>·</Text>
                <View style={{ flex: 1, position: 'relative' }}>
                  <TextInput
                    style={{
                      fontSize: 15,
                      color: '#111111',
                      lineHeight: 24,
                      borderWidth: 1.5,
                      borderColor: '#000FE1',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingRight: 36,
                      paddingVertical: 10,
                      minHeight: 60,
                      textAlignVertical: 'top',
                    }}
                    value={fact}
                    onChangeText={text => handleFactChange(text, i)}
                    multiline
                    placeholder="Share something surprising about you..."
                    placeholderTextColor="#BBADA5"
                  />
                  {fact.length > 0 && (
                    <TouchableOpacity
                      onPress={() => handleFactChange('', i)}
                      style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#DDDDDD', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 11, color: '#555555', lineHeight: 13 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : displayedFacts.length > 0 ? displayedFacts.map((fact, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#8888CC', marginRight: 10, marginTop: 2 }}>·</Text>
              <Text style={{ flex: 1, fontSize: 15, color: '#111111', lineHeight: 24 }}>{fact}</Text>
            </View>
          )) : (
            <Text style={{ fontSize: 14, color: '#AAAAAA', fontStyle: 'italic', marginBottom: 16 }}>
              No unknown facts yet — tap ✏️ to add some
            </Text>
          )}

          {/* Interests */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5 }}>INTERESTS</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('RegistrationInterests', { isEditing: true })}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#000FE1' }}>
              <Text style={{ color: '#000FE1', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          {interests.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {interests.map((interest, i) => {
                const emoji = interestEmojis[interest] ?? '';
                return (
                  <View key={i} style={{ backgroundColor: '#EEF0FB', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 13, color: '#000FE1', fontWeight: '500' }}>{emoji} {interest}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: '#AAAAAA', fontStyle: 'italic', marginBottom: 8 }}>
              No interests yet — tap ✏️ to add some
            </Text>
          )}

          {/* Social Media */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5 }}>SOCIAL MEDIA</Text>
            <TouchableOpacity
              onPress={() => {
                setDraftSocial(registrationDraft.social);
                setEditingSocial(true);
              }}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#000FE1' }}>
              <Text style={{ color: '#000FE1', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>

          {editingSocial ? (
            SOCIAL_PLATFORMS.map(({ key, icon, placeholder }) => (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#000FE1', borderRadius: 10, paddingHorizontal: 14, height: 52, marginBottom: 10, backgroundColor: '#FFFFFF' }}>
                <Text style={{ fontSize: 20 }}>{icon}</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 15, color: '#000000', padding: 0 }}
                  value={draftSocial[key]}
                  onChangeText={val => handleSocialChange(key, val)}
                  placeholder={placeholder}
                  placeholderTextColor="#BBADA5"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {draftSocial[key].length > 0 && (
                  <TouchableOpacity
                    onPress={() => handleSocialChange(key, '')}
                    style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#DDDDDD', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 11, color: '#555555', lineHeight: 13 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : hasSocialLinks ? (
            SOCIAL_PLATFORMS.filter(p => registrationDraft.social[p.key].trim().length > 0).map(({ key, icon, label }) => (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 18 }}>{icon}</Text>
                <Text style={{ fontSize: 15, color: '#000FE1', fontWeight: '500' }}>
                  {key === 'facebook' ? registrationDraft.social[key] : `@${registrationDraft.social[key].replace(/^@/, '')}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 14, color: '#AAAAAA', fontStyle: 'italic', marginBottom: 8 }}>
              No social links yet — tap ✏️ to add some
            </Text>
          )}

        </View>
      </ScrollView>

      {/* Save CTA */}
      {hasChanges && (
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
