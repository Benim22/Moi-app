import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '@/constants/theme';
import SpecialtyCard from '@/components/SpecialtyCard';
import { ArrowDown } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistorySection from '@/components/HistorySection';
import InstagramSection from '@/components/InstagramSection';
import { Video, ResizeMode } from 'expo-av';
import Footer from '@/components/Footer';

export default function HomeScreen() {
  const router = useRouter();
  const videoRef = useRef(null);
  
  // Navigeringsfunktioner
  const navigateToMenu = () => {
    router.push('/menu');
  };

  const navigateToBooking = () => {
    router.push('/booking');
  };

  const navigateToOrder = () => {
    router.push('/menu');
  };

  return (
    <SafeAreaView style={[globalStyles.container, { paddingTop: 0 }]} edges={['bottom']}>
      <ScrollView style={[globalStyles.container]} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {Platform.OS !== 'web' ? (
            <Video
              ref={videoRef}
              source={{ uri: 'https://videos.pexels.com/video-files/3295852/3295852-uhd_2732_1440_25fps.mp4' }}
              style={styles.backgroundVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          ) : (
            <View style={styles.webVideoContainer}>
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              >
                <source src="https://videos.pexels.com/video-files/3295852/3295852-uhd_2732_1440_25fps.mp4" type="video/mp4" />
              </video>
            </View>
          )}
          
          <View style={styles.overlay}>
            <Image 
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
            />
            
            <Text style={styles.heroTitle}>
              {"Välkommen till\nMoi Sushi & Poké Bowl"}
            </Text>
            <Text style={styles.heroSubtitle}>
              {"FÄRSKA INGREDIENSER, UNIKA SMAKER\nDITT FÖRSTA VAL I TRELLEBORG"}
            </Text>
            
            <View style={styles.buttonContainer}>
              <Pressable 
                style={styles.primaryButton} 
                onPress={navigateToOrder}
              >
                <Text style={styles.primaryButtonText}>Beställ Online</Text>
              </Pressable>
              
              <Pressable 
                style={styles.secondaryButton} 
                onPress={navigateToBooking}
              >
                <Text style={styles.secondaryButtonText}>Boka Bord</Text>
              </Pressable>
            </View>
            
            <Pressable style={styles.scrollDown} onPress={() => {}}>
              <ArrowDown size={24} color={theme.colors.gold} />
            </Pressable>
          </View>
        </View>
        
        <View style={styles.specialtiesSection}>
          <Text style={styles.sectionTitle}>Våra Specialiteter</Text>
          
          <SpecialtyCard
            title="Färsk Sushi"
            description="Handgjord sushi med färska ingredienser av högsta kvalitet"
            imageUrl={require('@/assets/images/magic avokado.jpg')}
            onPress={navigateToMenu}
          />
          
          <SpecialtyCard
            title="Poké Bowls"
            description="Färgglada och näringsrika bowls med smakrika kombinationer"
            imageUrl={require('@/assets/images/crispy chicken.png')}
            onPress={navigateToMenu}
          />
          
          <SpecialtyCard
            title="Helfriterade Maki"
            description="Krispiga friterade maki med unika fyllningar"
            imageUrl={require('@/assets/images/helfriterad salmon.jpg')}
            onPress={navigateToMenu}
          />
        </View>

        <HistorySection />

        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>Redo att smaka våra läckerheter?</Text>
          <Text style={styles.orderSubtitle}>
            Beställ online för avhämtning eller leverans, eller boka ett bord för en minnesvärd matupplevelse.
          </Text>
          
          <View style={styles.buttonContainer}>
            <Pressable 
              style={styles.primaryButton} 
              onPress={navigateToOrder}
            >
              <Text style={styles.primaryButtonText}>Beställ Nu</Text>
            </Pressable>
            
            <Pressable 
              style={styles.secondaryButton} 
              onPress={navigateToBooking}
            >
              <Text style={styles.secondaryButtonText}>Boka Bord</Text>
            </Pressable>
          </View>
        </View>
        
        <InstagramSection />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 0,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  webVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    zIndex: 2,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.lg,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.gold,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    letterSpacing: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  secondaryButtonText: {
    color: theme.colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollDown: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignItems: 'center',
  },
  specialtiesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  orderSection: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  orderSubtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
});