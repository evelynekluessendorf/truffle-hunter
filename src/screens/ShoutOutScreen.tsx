import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RANGES = ['50m', '200m', '500m', 'Campus'];
const INSPIRATIONS = [
  'Anyone up for a coffee run?',
  "Free tickets to tonight's game",
  'Looking for a developer for some ideas input.',
];

export default function ShoutoutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [range, setRange] = useState('200m');
  const hasText = text.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}>

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#000000', marginBottom: 8 }}>Say something to everyone nearby</Text>
        <Text style={{ fontSize: 14, color: '#8888CC', lineHeight: 22, marginBottom: 20 }}>
          This is a one-way public shout – not a message, not a chat. Anyone available in range will see it as a notification.
        </Text>

        <TextInput
          style={{ minHeight: 120, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 12, padding: 14, fontSize: 15, color: '#111111', textAlignVertical: 'top', marginBottom: 4 }}
          placeholder="What do you want to shout?"
          placeholderTextColor="#EF9070"
          multiline
          maxLength={120}
          value={text}
          onChangeText={setText}
        />
        <Text style={{ fontSize: 12, color: '#AAAAAA', textAlign: 'right', marginBottom: 20 }}>{text.length}/ 120</Text>

        <Text style={{ fontSize: 12, fontWeight: '700', color: '#000000', letterSpacing: 1, marginBottom: 12 }}>WHO SEES IT?</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: range === r ? 2 : 1, borderColor: range === r ? '#000FE1' : '#DDDDDD' }}>
              <Text style={{ fontSize: 14, fontWeight: range === r ? '700' : '400', color: range === r ? '#000FE1' : '#888888' }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={{ fontSize: 13, color: '#8888CC', marginBottom: 20 }}>~ 47 people currently available nearby</Text>

        {!hasText && (
          <>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#000000', letterSpacing: 1, marginBottom: 12 }}>NEED INSPIRATION?</Text>
            {INSPIRATIONS.map((tip, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setText(tip)}
                style={{ backgroundColor: '#F0F1FA', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                <Text style={{ fontSize: 15, color: '#111111' }}>{tip}</Text>
              </TouchableOpacity>
            ))}
            <Text style={{ fontSize: 12, color: '#8888CC', textAlign: 'center', marginTop: 16 }}>
              Expires automatically in 2 hours.{'  '}You can also withdraw manually.
            </Text>
          </>
        )}

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            {hasText ? 'Shout it out' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}
