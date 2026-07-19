import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, Clipboard, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration2'>;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Registration2Screen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const isLogin = route.params?.mode === 'login';
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const canProceed = code.trim().length > 0;

  const handleSendCode = () => {
    if (!phone.trim()) {
      Alert.alert('Enter your phone number first.');
      return;
    }
    const newCode = generateCode();
    setGeneratedCode(newCode);
    setModalVisible(true);
  };

  const handleCopyCode = () => {
    Clipboard.setString(generatedCode);
    setCode(generatedCode);
    setModalVisible(false);
  };

  const handleOk = () => {
    setModalVisible(false);
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
          <View style={{ width: '45%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000', marginBottom: 8 }}>Account verification</Text>
        <Text style={{ fontSize: 15, color: '#444444', lineHeight: 22, marginBottom: 24 }}>
          We'll send you 6-digit code to your phone to confirm it's really you
        </Text>

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>Your Phone Number*:</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          <TextInput
            style={{ flex: 1.8, height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: '#000000' }}
            placeholder="+1 (555) 000-000"
            placeholderTextColor="#AAAAAA"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity
            onPress={handleSendCode}
            style={{ flex: 1, height: 52, borderWidth: 1.5, borderColor: '#000FE1', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#000FE1', fontSize: 14, fontWeight: '600' }}>Send code</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>Your Verification Code*:</Text>
        <TextInput
          style={{ height: 52, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: '#000000' }}
          placeholder="#######"
          placeholderTextColor="#AAAAAA"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          value={code}
          onChangeText={setCode}
        />

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => canProceed && navigation.navigate(isLogin ? 'Main' : 'Registration3')}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', opacity: canProceed ? 1 : 0.4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* SMS-style code popup */}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={handleOk}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View style={{ width: 300, backgroundColor: '#3A3A3A', borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 }}>📱 New Message</Text>
            <Text style={{ fontSize: 14, color: '#CCCCCC', marginBottom: 4 }}>From: MEEX</Text>
            <Text style={{ fontSize: 14, color: '#FFFFFF', marginBottom: 4 }}>Your MEEX verification code is:</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, letterSpacing: 4 }}>{generatedCode}</Text>
            <Text style={{ fontSize: 13, color: '#CCCCCC', marginBottom: 20 }}>Do not share this code with anyone.</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 24 }}>
              <TouchableOpacity onPress={handleCopyCode}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4FC3F7' }}>COPY CODE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleOk}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4FC3F7' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
