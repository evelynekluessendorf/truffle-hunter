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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

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

interface Registration1ScreenProps {
  onNext?: (emailData: { username: string; domain: string }) => void;
  onBack?: () => void;
}

export const Registration1Screen: React.FC<Registration1ScreenProps> = ({ onNext, onBack }) => {
  const [username, setUsername] = useState('');
  const [domain, setDomain] = useState('@georgetown.edu');
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

  const handleNext = () => {
    if (username.trim()) {
      onNext?.({ username, domain });
    }
  };

  const isValid = username.trim().length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={onBack} style={styles.backButton} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '20%' }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Provide university email</Text>

        <View style={styles.infoTag}>
          <Text style={styles.infoTagIcon}>💡</Text>
          <Text style={styles.infoTagText}>.edu email only</Text>
        </View>

        <Text style={styles.label}>University Email*:</Text>
        <View style={styles.emailInputRow}>
          <TextInput
            style={[styles.emailInput, styles.usernameInput]}
            placeholder="maya.chen"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={[styles.emailInput, styles.domainInput]}
            placeholder="@georgetown.edu"
            placeholderTextColor="#999"
            value={domain}
            onChangeText={setDomain}
            editable={false}
          />
        </View>

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
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.accentCoral,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
    alignSelf: 'flex-start',
  },
  infoTagIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoTagText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: COLORS.keylinePurple,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Fredoka_700Bold',
    color: COLORS.keylinePurple,
    marginBottom: 12,
  },
  emailInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.keylinePurple,
    backgroundColor: '#ffffff',
  },
  usernameInput: {
    flex: 1,
  },
  domainInput: {
    flex: 1.2,
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
});
