module.exports = {
  expo: {
    name: "Meex",
    slug: "meex",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FEF0E8"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.evekluessendorf.meex",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "553d9283-78fd-4e15-88d1-aa7d46848c26"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    // updates: {
    //   url: "https://u.expo.dev/553d9283-78fd-4e15-88d1-aa7d46848c26"
    // },
    plugins: [
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Meex to access your photos so you can set a profile picture."
        }
      ]
    ]
  }
};
