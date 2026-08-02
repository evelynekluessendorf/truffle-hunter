import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Registration4'>;

export default function IceBreakersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setRegistrationDraft } = useUser();

  const [facts, setFacts] = useState<string[]>(['', '', '']);
  const canProceed =
    facts[0].trim().length > 0 && facts[1].trim().length > 0 && facts[2].trim().length > 0;

  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [facebook, setFacebook] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const addFact = () => setFacts([...facts, '']);

  const updateFact = (text: string, index: number) => {
    const updated = [...facts];
    updated[index] = text;
    setFacts(updated);
  };

  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '75%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 6 }}>
          What makes you... you?
        </Text>
        <Text
          style={{
            fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
            color: '#444444', lineHeight: 22, marginBottom: 16,
          }}>
          These are the things that'll make someone walk across a room and meet you. Read the{' '}
          <Text style={{ textDecorationLine: 'underline' }}>rules</Text>.
        </Text>

        {/* Weak vs strong examples */}
        <View style={{ backgroundColor: COLORS.accentCoralLight, borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <View
              style={{
                backgroundColor: '#FDDCDB', paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 100, marginRight: 10, marginTop: 2,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#C0392B' }}>Weak</Text>
            </View>
            <Text
              style={{
                flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                color: '#333333', fontStyle: 'italic',
              }}>
              I like music / I love to travel / I'm a cat person
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                backgroundColor: COLORS.accentCoralLight, paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 100, marginRight: 10, marginTop: 2,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.accentCoral }}>Strong</Text>
            </View>
            <Text
              style={{
                flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                color: '#333333', fontStyle: 'italic',
              }}>
              I trained in circus acrobatics for 3 years
            </Text>
          </View>
        </View>

        {facts.map((fact, index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
              {ordinals[index]} unknown fact*:
            </Text>
            <TextInput
              style={{
                minHeight: 80, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10,
                paddingHorizontal: 12, paddingTop: 12, fontSize: 15,
                color: COLORS.keylinePurple, textAlignVertical: 'top', backgroundColor: '#ffffff',
              }}
              placeholder="Share something surprising about you..."
              placeholderTextColor="#AAAAAA"
              multiline
              value={fact}
              onChangeText={text => updateFact(text, index)}
            />
          </View>
        ))}

        {facts.length < 6 && (
          <TouchableOpacity
            onPress={addFact}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View
              style={{
                width: 28, height: 28, borderRadius: 14,
                borderWidth: 1.5, borderColor: COLORS.accentCoral,
                alignItems: 'center', justifyContent: 'center', marginRight: 10,
              }}>
              <Text style={{ fontSize: 18, color: COLORS.accentCoral, lineHeight: 22 }}>+</Text>
            </View>
            <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: COLORS.accentCoral }}>
              Add another
            </Text>
          </TouchableOpacity>
        )}

        {/* ── SOCIAL MEDIA ── */}
        <View style={{ marginTop: -8, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 4 }}>
            Social Media
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: '#888888', marginBottom: 16 }}>
            Optional — share your handles so people can connect with you
          </Text>

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CCCCCC',
              borderRadius: 10, height: 52, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#ffffff',
            }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>📸</Text>
            <Text style={{ fontSize: 15, color: '#AAAAAA', marginRight: 4 }}>@</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: COLORS.keylinePurple }}
              placeholder="instagram"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              autoCorrect={false}
              value={instagram}
              onChangeText={setInstagram}
            />
          </View>

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CCCCCC',
              borderRadius: 10, height: 52, paddingHorizontal: 12, marginBottom: 12, backgroundColor: '#ffffff',
            }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🎵</Text>
            <Text style={{ fontSize: 15, color: '#AAAAAA', marginRight: 4 }}>@</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: COLORS.keylinePurple }}
              placeholder="tiktok"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              autoCorrect={false}
              value={tiktok}
              onChangeText={setTiktok}
            />
          </View>

          <View
            style={{
              flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CCCCCC',
              borderRadius: 10, height: 52, paddingHorizontal: 12, backgroundColor: '#ffffff',
            }}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>👤</Text>
            <Text style={{ fontSize: 15, color: '#AAAAAA', marginRight: 4 }}>@</Text>
            <TextInput
              style={{ flex: 1, fontSize: 15, color: COLORS.keylinePurple }}
              placeholder="facebook"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              autoCorrect={false}
              value={facebook}
              onChangeText={setFacebook}
            />
          </View>
        </View>

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
            setRegistrationDraft({
              facts: facts.filter(f => f.trim().length > 0),
              social: {
                instagram: instagram.trim(),
                tiktok: tiktok.trim(),
                facebook: facebook.trim(),
              },
            });
            navigation.navigate('Registration5');
          }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            opacity: canProceed ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
