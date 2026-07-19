import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration1'>;

export default function Registration1Screen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const canProceed = username.trim().length > 0;

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
          <View style={{ width: '30%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, alignSelf: 'flex-start', marginBottom: 16 }}>
          <Text style={{ fontSize: 13, color: '#2E7D32' }}>💡 .edu email only</Text>
        </View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000', marginBottom: 24 }}>Provide university email</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>University Email*:</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          <TextInput style={{ flex: 1.2, height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: '#000000', backgroundColor: '#FFFFFF' }} placeholder="maya.chen" placeholderTextColor="#AAAAAA" autoCapitalize="none" keyboardType="email-address" value={username} onChangeText={setUsername} />
          <View style={{ flex: 1, height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 10, justifyContent: 'center', backgroundColor: '#F9F9F9' }}>
            <Text style={{ fontSize: 13, color: '#888888' }}>@university.edu</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => canProceed && navigation.navigate('Registration2')}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', opacity: canProceed ? 1 : 0.4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
