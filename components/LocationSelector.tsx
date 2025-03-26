import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/constants/theme';
import { MapPin } from 'lucide-react-native';
import { locations } from '@/store/menu-store';

interface LocationSelectorProps {
  selectedLocation: string;
  onSelectLocation: (locationId: string) => void;
}

export default function LocationSelector({ 
  selectedLocation, 
  onSelectLocation 
}: LocationSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Välj plats</Text>
      
      {locations.map((location) => (
        <Pressable 
          key={location.id}
          style={[
            styles.locationBox,
            selectedLocation === location.id && styles.selectedLocationBox
          ]}
          onPress={() => !location.comingSoon && onSelectLocation(location.id)}
          disabled={location.comingSoon}
        >
          <View style={styles.locationHeader}>
            <MapPin size={18} color={theme.colors.gold} />
            <Text style={styles.locationName}>{location.name}</Text>
            {location.comingSoon && (
              <View style={styles.comingSoonTag}>
                <Text style={styles.comingSoonText}>Kommer snart</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.locationAddress}>{location.address}</Text>
          
          {location.onlyPokebowl && (
            <Text style={styles.limitedMenuText}>Endast Pokébowls tillgängliga</Text>
          )}
          
          {!location.comingSoon && (
            <Pressable 
              style={styles.menuButton}
              onPress={() => onSelectLocation(location.id)}
            >
              <Text style={styles.menuButtonText}>Se meny</Text>
            </Pressable>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  locationBox: {
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedLocationBox: {
    borderColor: theme.colors.gold,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  locationAddress: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.lg + 2,
  },
  limitedMenuText: {
    fontSize: 14,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.lg + 2,
    fontStyle: 'italic',
  },
  menuButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginLeft: theme.spacing.lg + 2,
  },
  menuButtonText: {
    color: theme.colors.buttonText || theme.colors.background,
    fontWeight: '600',
  },
  comingSoonTag: {
    backgroundColor: theme.colors.darkCard || '#333',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: theme.spacing.sm,
  },
  comingSoonText: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
});