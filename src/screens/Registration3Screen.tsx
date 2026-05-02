import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration3'>;

const YEARS = [
  { label: 'Freshman', sub: '1st year' },
  { label: 'Sophomore', sub: '2nd year' },
  { label: 'Junior', sub: '3rd year' },
  { label: 'Senior', sub: '4th year' },
];

export default function ProfileSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('Physical therapy');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

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
          <View style={{ width: '60%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000', marginBottom: 24 }}>Set your profile</Text>

        <TouchableOpacity onPress={pickPhoto} style={{ alignSelf: 'center', marginBottom: 24 }}>
          {photo ? (
            <Image source={{ uri: photo }} style={{ width: 150, height: 150, borderRadius: 16 }} />
          ) : (
            <View style={{ width: 150, height: 150, borderRadius: 16, backgroundColor: '#EEF0FB', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 40 }}>📸</Text>
              <Text style={{ fontSize: 13, color: '#C17F5A', textAlign: 'center', marginTop: 8 }}>Tap to add a photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>Displayed Name</Text>
        <TextInput
          style={{ height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: '#000000', marginBottom: 24 }}
          placeholder="Maya"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={setName}
        />

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 12 }}>Year</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {YEARS.map(y => (
            <TouchableOpacity
              key={y.label}
              onPress={() => setYear(y.label)}
              style={{
                flex: 1, minWidth: '45%', paddingVertical: 14,
                borderRadius: 12, alignItems: 'center',
                backgroundColor: year === y.label ? '#EEF0FB' : '#FFFFFF',
                borderWidth: year === y.label ? 1.5 : 1,
                borderColor: year === y.label ? '#000FE1' : '#DDDDDD',
              }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: year === y.label ? '#000FE1' : '#111111' }}>{y.label}</Text>
              <Text style={{ fontSize: 13, color: '#888888', marginTop: 2 }}>{y.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>Major</Text>
        <TouchableOpacity style={{ height: 52, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Text style={{ fontSize: 15, color: '#111111' }}>{major}</Text>
          <Text style={{ fontSize: 14, color: '#888888' }}>▾</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Registration4')}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}
