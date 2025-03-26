import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Category } from '@/store/menu-store';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <Pressable
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Text 
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}
          >
            {category.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  categoryButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.darkCard || theme.colors.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.gold,
  },
  categoryText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: theme.colors.gold,
    fontWeight: '600',
  },
});