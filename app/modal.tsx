import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import BackButton from '@/components/BackButton';
import { theme } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: "Modal",
        headerShown: true,
        headerLeft: () => (
          <BackButton 
            title=""
            variant="gold"
            size={26}
            style={{
              backgroundColor: theme.colors.gold,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
            }}
          />
        )
      }} />
      
      <Text style={styles.title}>Modal</Text>
      <View style={styles.separator} />
      <Text>This is an example modal. You can edit it in app/modal.tsx.</Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
