import React from "react";
import { Link, Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import BackButton from '@/components/BackButton';
import { theme } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ 
        title: "Sidan hittades inte",
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
      <View style={styles.container}>
        <Text style={styles.title}>Denna sida finns inte.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Gå till startsidan!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
