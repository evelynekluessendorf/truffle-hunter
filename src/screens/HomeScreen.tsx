import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = async () => {
    if (!isVisible) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: insets.top }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000' }}>Hey, Hannah</Text>
        {isVisible ? (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EF4514', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>H</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingTop: 32 }}>

        {/* Toggle button */}
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.9}>
          <View style={{ width: 240, height: 240, borderRadius: 120, borderWidth: 1.5, borderColor: '#EF4514', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
            <View style={{ width: 210, height: 210, borderRadius: 105, backgroundColor: isVisible ? '#000FE1' : '#EEF0FB', alignItems: 'center', justifyContent: 'center' }}>
              {isVisible ? (
                <>
                  <Text style={{ fontSize: 48 }}>👋</Text>
                  <Text style={{ fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 }}>VISIBLE</Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 48 }}>👻</Text>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: '#EF4514', textAlign: 'center', lineHeight: 30 }}>TAP TO{'\n'}SHOW UP</Text>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ marginTop: 32, paddingHorizontal: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#000000', marginBottom: 8 }}>
            {isVisible ? 'You are visible' : "You're not visible"}
          </Text>
          <Text style={{ fontSize: 14, color: '#8888CC', textAlign: 'center', lineHeight: 22 }}>
            {isVisible
              ? 'Anyone nearby will have access to your profile and might want to chat with you.'
              : "Toggle on when you're open to meeting someone."}
          </Text>
        </View>

        {isVisible && (
          <>
            <TouchableOpacity
              onPress={() => navigation.navigate('Discover')}
              style={{ marginTop: 24, borderWidth: 1.5, borderColor: '#000FE1', borderRadius: 100, paddingHorizontal: 28, paddingVertical: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#000FE1' }}>View map →</Text>
            </TouchableOpacity>

            {/* Nearby avatars */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 40, paddingHorizontal: 24 }}>
              {['img=1','img=2','img=3','img=4','img=5'].map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: `https://i.pravatar.cc/150?${img}` }}
                  style={{ width: 44, height: 44, borderRadius: 22, marginLeft: i === 0 ? 0 : -10, borderWidth: 2, borderColor: '#FFFFFF' }}
                />
              ))}
              <Text style={{ fontSize: 14, color: '#8888CC', marginLeft: 12 }}>+ 6 others nearby</Text>
            </View>

            {/* Shoutout card */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Shoutout')}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F1FA', borderRadius: 12, padding: 16, marginTop: 20, marginHorizontal: 24, width: '100%', alignSelf: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>🎙️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#000000' }}>Shout something out!</Text>
                <Text style={{ fontSize: 13, color: '#888888', marginTop: 2 }}>Send an announcement to people nearby</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#888888' }}>›</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}
