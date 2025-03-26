import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Linking, ActivityIndicator, TouchableOpacity } from 'react-native';
import { globalStyles } from '@/constants/theme';
import { theme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '@/components/Footer';

type Location = 'trelleborg' | 'ystad';

interface LocationLinks {
  [key: string]: {
    foodora: string;
    wolt: string;
    ubereats: string;
  };
}

interface LocationSelectorProps {
  selectedLocation: Location;
  onSelectLocation: (location: Location) => void;
}

interface DeliveryServiceCardProps {
  name: string;
  logo: string;
  time: string;
  price: string;
  url: string;
}

const LocationSelector = ({ selectedLocation, onSelectLocation }: LocationSelectorProps) => {
  return (
    <View style={styles.locationSelector}>
      <View style={styles.locationOptions}>
        <Text 
          style={[
            styles.locationOption, 
            selectedLocation === 'trelleborg' && styles.locationOptionSelected
          ]}
          onPress={() => onSelectLocation('trelleborg')}
        >
          Trelleborg
        </Text>
        <Text 
          style={[
            styles.locationOption, 
            selectedLocation === 'ystad' && styles.locationOptionSelected
          ]}
          onPress={() => onSelectLocation('ystad')}
        >
          Ystad
        </Text>
      </View>
      <Text style={styles.locationSelectorHelp}>
        Välj restaurangplats för att se tillgängliga alternativ
      </Text>
    </View>
  );
};

const DeliveryServiceCard = ({ name, logo, time, price, url }: DeliveryServiceCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.deliveryServiceCard} 
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.7}
    >
      <View style={styles.deliveryServiceContent}>
        <Image 
          source={{ uri: logo }} 
          style={styles.deliveryServiceLogo}
          onError={() => console.error(`Kunde inte ladda logotyp för ${name}`)}
        />
        <View style={styles.deliveryServiceInfo}>
          <Text style={styles.deliveryServiceName}>{name}</Text>
          <View style={styles.deliveryDetails}>
            <Text style={styles.deliveryServiceTime}>{time}</Text>
            <View style={styles.priceDot} />
            <Text style={styles.deliveryServicePrice}>{price} leveransavgift</Text>
          </View>
        </View>
      </View>
      <View style={styles.orderButtonContainer}>
        <Text style={styles.deliveryServiceButton}>Beställ</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function OrderScreen() {
  const [selectedLocation, setSelectedLocation] = useState<Location>('trelleborg');
  const [isLoading, setIsLoading] = useState(false);

  // Definiera länkar för olika platser
  const locationLinks: LocationLinks = {
    trelleborg: {
      foodora: "https://www.foodora.se/restaurant/z1xp/moi-sushi-and-pokebowl",
      wolt: "https://wolt.com",
      ubereats: "https://ubereats.com"
    },
    ystad: {
      foodora: "https://www.foodora.se/restaurant/fids/moi-poke-bowl",
      wolt: "https://wolt.com",
      ubereats: "https://ubereats.com"
    }
  };

  const deliveryServices = [
    {
      name: "Foodora",
      logo: "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67a7365a002c60c2a215/view?project=678bfed4002a8a6174c4",
      time: "30-45 min",
      price: "39 kr",
      url: locationLinks[selectedLocation].foodora
    },
    {
      name: "Wolt",
      logo: "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67a7365400237ee66773/view?project=678bfed4002a8a6174c4",
      time: "25-40 min",
      price: "35 kr",
      url: locationLinks[selectedLocation].wolt
    },
    {
      name: "Uber Eats",
      logo: "https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67a7365b00396bd1708f/view?project=678bfed4002a8a6174c4",
      time: "35-50 min",
      price: "45 kr",
      url: locationLinks[selectedLocation].ubereats
    }
  ];

  return (
    <SafeAreaView style={globalStyles.container} edges={['bottom']}>
      
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
          <Text style={styles.loadingText}>Laddar...</Text>
        </View>
      ) : (
        <ScrollView style={globalStyles.container} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://cloud.appwrite.io/v1/storage/buckets/678c0f710007dd361cec/files/67ccd62d00368913f38e/view?project=678bfed4002a8a6174c4' }} 
              style={styles.logoImage}
              onError={() => console.error('Kunde inte ladda logotypen')}
            />
            <Text style={styles.headerTitle}>Leveranstjänster</Text>
            <Text style={styles.headerSubtitle}>
              Välj en leveranstjänst för att beställa mat från Moi Sushi direkt till din dörr
            </Text>
          </View>

          <LocationSelector 
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />

          <View style={styles.deliverySection}>
            {deliveryServices.map((service, index) => (
              <DeliveryServiceCard 
                key={index}
                name={service.name}
                logo={service.logo}
                time={service.time}
                price={service.price}
                url={service.url}
              />
            ))}
          </View>

          <View style={styles.pickupSection}>
            <Text style={styles.sectionTitle}>Föredrar du att hämta själv?</Text>
            <View style={styles.pickupCard}>
              <Text style={styles.pickupCardTitle}>Beställ för avhämtning</Text>
              <Text style={styles.pickupCardText}>
                Ring oss direkt så förbereder vi din beställning för avhämtning.
              </Text>
              <TouchableOpacity 
                style={styles.phoneButton}
                onPress={() => Linking.openURL('tel:0410-28110')}
              >
                <Text style={styles.phoneButtonText}>0410-28110</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Footer />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  locationCard: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationSubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  deliverySection: {
    marginVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  pickupSection: {
    marginBottom: theme.spacing.xl,
  },
  pickupCard: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  pickupCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickupCardText: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  phoneButton: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  phoneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
  },
  locationSelector: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  locationOptions: {
    flexDirection: 'row',
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  locationOption: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  locationOptionSelected: {
    backgroundColor: theme.colors.gold,
    color: '#111',
    fontWeight: 'bold',
  },
  locationSelectorHelp: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  deliveryServiceCard: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  deliveryServiceContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  deliveryServiceLogo: {
    width: 60,
    height: 60,
    marginRight: theme.spacing.md,
    borderRadius: 12,
  },
  deliveryServiceInfo: {
    flex: 1,
  },
  deliveryServiceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  deliveryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.subtext,
    marginHorizontal: 6,
  },
  deliveryServiceTime: {
    fontSize: 14,
    color: theme.colors.gold,
    fontWeight: '500',
  },
  deliveryServicePrice: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  orderButtonContainer: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deliveryServiceButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
});