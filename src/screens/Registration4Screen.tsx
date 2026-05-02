import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration4'>;

export default function IceBreakersScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [facts, setFacts] = useState(['', '', '']);

  const addFact = () => setFacts([...facts, '']);
  const updateFact = (text: string, index: number) => {
    const updated = [...facts];
    updated[index] = text;
    setFacts(updated);
  };

  const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}>

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={{ height: 3, backgroundColor: '#E0E0E0', borderRadius: 2 }}>
          <View style={{ width: '75%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000', marginBottom: 6 }}>What makes you... you?</Text>
        <Text style={{ fontSize: 15, color: '#444444', lineHeight: 22, marginBottom: 16 }}>
          These are the things that'll make someone walk across a room and meet you. Read the{' '}
          <Text style={{ textDecorationLine: 'underline' }}>rules</Text>.
        </Text>

        <View style={{ backgroundColor: '#EEF0FB', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{ backgroundColor: '#FDDCDB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginRight: 10, marginTop: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#C0392B' }}>Weak</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: '#333333', fontStyle: 'italic' }}>I like music / I love to travel / I'm a cat person</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ backgroundColor: '#DDE3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginRight: 10, marginTop: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#000FE1' }}>Strong</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: '#333333', fontStyle: 'italic' }}>I once got stuck in an elevator with a senator/ I trained in circus acrobatics for 3 years</Text>
          </View>
        </View>

        {facts.map((fact, index) => (
          <View key={index} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>
              {ordinals[index]} unknown fact*:
            </Text>
            <TextInput
              style={{ minHeight: 80, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 12, paddingTop: 12, fontSize: 15, color: '#000000', textAlignVertical: 'top' }}
              placeholder="Share something surprising about you..."
              placeholderTextColor="#AAAAAA"
              multiline
              value={fact}
              onChangeText={text => updateFact(text, index)}
            />
          </View>
        ))}

        {facts.length < 6 && (
          <TouchableOpacity onPress={addFact} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#000FE1', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ fontSize: 18, color: '#000FE1', lineHeight: 22 }}>+</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#000FE1' }}>Add another</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Registration5')}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}
