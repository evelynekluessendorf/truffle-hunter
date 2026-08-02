import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Keyboard,
  Platform,
  Modal,
  Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Truffle Hunter colors
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

interface Registration2ScreenProps {
  onNext?: (verificationData: { phone: string; code: string }) => void;
  onBack?: () => void;
  /** Hidden on the login path, where this is a one-step flow rather than step 2 of registration. */
  showProgress?: boolean;
}

export const Registration2Screen: React.FC<Registration2ScreenProps> = ({
  onNext,
  onBack,
  showProgress = true,
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

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

  const handleSendCode = () => {
    if (phone.trim()) {
      const newCode = generateCode();
      setGeneratedCode(newCode);
      setCodeSent(true);
      setModalVisible(true);
    }
  };

  const handleCopyCode = () => {
    Clipboard.setString(generatedCode);
    setCode(generatedCode);
    setModalVisible(false);
  };

  const handleOk = () => {
    setModalVisible(false);
  };

  const handleNext = () => {
    if (phone.trim() && code.trim().length === 6) {
      onNext?.({ phone, code });
    }
  };

  const isPhoneValid = phone.trim().length > 0;
  const isCodeValid = code.trim().length === 6;
  const canProceed = isPhoneValid && isCodeValid;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBack} style={styles.backButton} />
      </View>

      {/* Progress Bar — registration only; login is a single step */}
      {showProgress && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '40%' }]} />
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Account verification</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We'll send you 6-digit code to your phone to confirm it's really you
        </Text>

        {/* Phone Number Section */}
        <Text style={styles.label}>Your Phone Number*:</Text>
        <View style={styles.phoneRow}>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="+1(555) 000-000"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.sendCodeButton, !isPhoneValid && styles.sendCodeButtonDisabled]}
            onPress={handleSendCode}
            disabled={!isPhoneValid}
          >
            <Text style={styles.sendCodeText}>Send code</Text>
          </TouchableOpacity>
        </View>

        {/* Verification Code Section */}
        <Text style={styles.label}>Your Verification Code*:</Text>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="######"
          placeholderTextColor="#999"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : insets.bottom + 8 },
        ]}
      >
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* SMS-style code popup */}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={handleOk}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📱 New Message</Text>
            <Text style={styles.modalMeta}>From: MEEX</Text>
            <Text style={styles.modalMeta}>Your MEEX verification code is:</Text>
            <Text style={styles.modalCode}>{generatedCode}</Text>
            <Text style={styles.modalDisclaimer}>Do not share this code with anyone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleCopyCode}>
                <Text style={styles.modalActionText}>COPY CODE</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleOk}>
                <Text style={styles.modalActionText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.keylinePurple,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.accentCoral,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.keylinePurple,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#999',
    lineHeight: 18,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.keylinePurple,
    marginBottom: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.keylinePurple,
    backgroundColor: '#ffffff',
  },
  phoneInput: {
    flex: 1,
  },
  codeInput: {
    marginBottom: 28,
  },
  sendCodeButton: {
    borderWidth: 2,
    borderColor: COLORS.keylinePurple,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  sendCodeButtonDisabled: {
    opacity: 0.5,
  },
  sendCodeText: {
    fontSize: 15,
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.keylinePurple,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  nextButton: {
    backgroundColor: COLORS.accentCoral,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
  } as any,
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Fredoka_700Bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(32,22,66,0.45)',
  },
  modalCard: {
    width: 300,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalMeta: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  modalCode: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 4,
  },
  modalDisclaimer: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.piggyPinkBright,
  },
});
