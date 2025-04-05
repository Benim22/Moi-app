import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { theme } from '@/constants/theme';

// Aktivera LayoutAnimation för Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AccordionItemProps {
  title: string;
  content: string;
}

const AccordionItem = ({ title, content }: AccordionItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity 
        style={[styles.accordionHeader, expanded && styles.accordionHeaderActive]} 
        onPress={toggleExpand}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        {expanded ? (
          <ChevronUp size={20} color={theme.colors.gold} />
        ) : (
          <ChevronDown size={20} color={theme.colors.text} />
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionContentText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

const FAQAccordion = () => {
  // FAQ data
  const faqItems: AccordionItemProps[] = [
    {
      title: "Hur beställer jag?",
      content: "Du kan beställa via vår app genom att bläddra i menyn, lägga produkter i din kundvagn och slutföra beställningen. Vi erbjuder både leverans och uthämtning i restaurangen."
    },
    {
      title: "Vad kostar leveransen?",
      content: "Leveranskostnaden är 49 kr. Vid beställningar över 500 kr är leveransen kostnadsfri. Minsta beställningsvärde för leverans är 200 kr."
    },
    {
      title: "Hur lång tid tar leveransen?",
      content: "Normal leveranstid är mellan 30-45 minuter beroende på avstånd och beställningsvolym. Vid högtider eller rusningstid kan leveranstiden vara längre."
    },
    {
      title: "Kan jag annullera eller ändra min beställning?",
      content: "Du kan ändra eller annullera din beställning inom 5 minuter efter att du lagt den genom att kontakta oss. Efter att beställningen har bekräftats och börjat tillagas kan vi tyvärr inte längre göra ändringar."
    },
    {
      title: "Hur skapar jag ett konto?",
      content: "Du kan skapa ett konto genom att klicka på 'Registrera' på inloggningssidan. Fyll i dina uppgifter, bekräfta din e-post och du är redo att använda alla funktioner i appen."
    },
    {
      title: "Hur hanterar ni allergier?",
      content: "Vi tar allergier på största allvar. I menyn anges de vanligaste allergenerna för varje rätt. Har du specifika allergier, vänligen notera det i kommentarsfältet vid beställning eller kontakta oss direkt."
    },
    {
      title: "Vad gör jag om min beställning inte kommer fram?",
      content: "Om din beställning är försenad med mer än 15 minuter från uppskattad leveranstid, vänligen kontakta oss via telefon så kan vi kontrollera status på din beställning."
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {faqItems.map((item, index) => (
        <AccordionItem 
          key={index} 
          title={item.title} 
          content={item.content} 
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  accordionItem: {
    marginBottom: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderActive: {
    backgroundColor: `${theme.colors.gold}10`, // 10% opacity
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 8,
  },
  accordionContentText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.subtext,
  },
});

export default FAQAccordion; 