import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  ScrollView
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsOfServiceModal({ visible, onClose }: TermsOfServiceModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Användarvillkor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>1. Inledning</Text>
            <Text style={styles.paragraph}>
              Välkommen till Moi Sushi. Dessa användarvillkor gäller för din användning av Moi Sushi-appen, tillgänglig för iOS och Android enheter. Genom att använda vår app accepterar du dessa villkor i sin helhet. Om du inte godkänner dessa villkor bör du inte använda appen.
            </Text>
            
            <Text style={styles.sectionTitle}>2. Definitioner</Text>
            <Text style={styles.paragraph}>
              "Appen" avser Moi Sushi-mobilapplikationen.{'\n'}
              "Användare", "du", "din" avser varje person som använder appen.{'\n'}
              "Vi", "oss", "vår" avser Moi Sushi AB.{'\n'}
              "Tjänster" avser alla tjänster som tillhandahålls via appen, inklusive men inte begränsat till beställning av mat, leverans, och kontoinformation.
            </Text>
            
            <Text style={styles.sectionTitle}>3. Registrering och konto</Text>
            <Text style={styles.paragraph}>
              För att använda vissa funktioner i appen behöver du skapa ett konto. Du ansvarar för att säkerställa att all information du anger under registreringsprocessen är korrekt, fullständig och aktuell. Du är ansvarig för att hålla ditt lösenord säkert och för all aktivitet som sker under ditt konto.
            </Text>
            <Text style={styles.paragraph}>
              Du får inte:{'\n'}
              • Skapa mer än ett konto per användare{'\n'}
              • Använda någon annans konto{'\n'}
              • Uppge falsk information vid registrering
            </Text>
            
            <Text style={styles.sectionTitle}>4. Beställning och betalning</Text>
            <Text style={styles.paragraph}>
              Du kan beställa mat via appen för leverans eller hämtning. Alla priser som visas i appen inkluderar moms och andra tillämpliga skatter. Leveransavgifter visas separat.
            </Text>
            <Text style={styles.paragraph}>
              Vi accepterar betalning via de metoder som anges i appen. Genom att genomföra en beställning godkänner du att betala det totala beloppet som visas, inklusive produktkostnader, leveransavgifter och andra tillämpliga avgifter.
            </Text>
            <Text style={styles.paragraph}>
              Vi förbehåller oss rätten att vägra eller avbryta beställningar efter eget gottfinnande, inklusive men inte begränsat till fall där det finns problem med beställningen eller betalningen.
            </Text>
            
            <Text style={styles.sectionTitle}>5. Leverans</Text>
            <Text style={styles.paragraph}>
              Vi strävar efter att leverera din beställning inom den uppskattade leveranstiden. Leveranstiderna är uppskattningar och vi garanterar inte leverans inom exakt angivna tidsramar. Leveranstider kan påverkas av faktorer utanför vår kontroll, såsom väderförhållanden, trafiksituation och volym av beställningar.
            </Text>
            <Text style={styles.paragraph}>
              Om din leveransadress är utanför vårt leveransområde, eller om vi av någon annan anledning inte kan leverera till din adress, kommer vi att meddela dig och erbjuda dig att hämta upp din beställning i restaurangen istället.
            </Text>
            
            <Text style={styles.sectionTitle}>6. Annullering av beställning</Text>
            <Text style={styles.paragraph}>
              Du kan annullera din beställning genom att kontakta oss direkt via telefon inom 5 minuter efter att beställningen har lagts. Efter denna tid kan vi inte garantera att annulleringen kan genomföras, särskilt om tillagningen redan har påbörjats.
            </Text>
            <Text style={styles.paragraph}>
              Om en beställning avbryts av oss på grund av omständigheter som leveransproblem, eller om produkter inte finns tillgängliga, kommer vi att meddela dig så snart som möjligt och erbjuda en återbetalning eller ett alternativ.
            </Text>
            
            <Text style={styles.sectionTitle}>7. Behörighet att använda appen</Text>
            <Text style={styles.paragraph}>
              För att använda appen och genomföra beställningar måste du vara minst 16 år gammal. Genom att använda appen bekräftar du att du uppfyller detta ålderskrav.
            </Text>
            
            <Text style={styles.sectionTitle}>8. Immateriella rättigheter</Text>
            <Text style={styles.paragraph}>
              Alla immateriella rättigheter i appen, inklusive men inte begränsat till upphovsrätt, varumärken, logotyper, design, text, grafik, och programvara, tillhör oss eller våra licensgivare. Du får inte kopiera, reproducera, modifiera, distribuera, visas offentligt, sälja, licensiera eller på annat sätt exploatera appen eller dess innehåll utan vårt uttryckliga skriftliga tillstånd.
            </Text>
            
            <Text style={styles.sectionTitle}>9. Användaransvar</Text>
            <Text style={styles.paragraph}>
              Du godkänner att inte använda appen för något olagligt eller otillåtet syfte. Du får inte försöka få obehörig åtkomst till våra system eller störa appens funktionalitet.
            </Text>
            <Text style={styles.paragraph}>
              Vi förbehåller oss rätten att avsluta eller begränsa din åtkomst till appen om du bryter mot dessa villkor eller om vi har rimliga skäl att misstänka att du har brutit mot dessa villkor.
            </Text>
            
            <Text style={styles.sectionTitle}>10. Ändringar i tjänsten och villkoren</Text>
            <Text style={styles.paragraph}>
              Vi förbehåller oss rätten att när som helst och utan förvarning ändra eller avbryta appen (eller delar av den), samt att ändra dessa användarvillkor. Fortsatt användning av appen efter sådana ändringar utgör ditt godkännande av de ändrade villkoren.
            </Text>
            
            <Text style={styles.sectionTitle}>11. Ansvarsbegränsning</Text>
            <Text style={styles.paragraph}>
              I den utsträckning som tillåts enligt lag, är vi inte ansvariga för indirekta, särskilda, tillfälliga, följdriktiga eller straffbara skador som uppstår på grund av din användning av appen eller tjänsterna.
            </Text>
            <Text style={styles.paragraph}>
              Vi lämnar inga garantier för att appen alltid kommer att vara tillgänglig, oavbruten, punktlig, säker eller felfri.
            </Text>
            
            <Text style={styles.sectionTitle}>12. Gällande lag</Text>
            <Text style={styles.paragraph}>
              Dessa villkor ska regleras och tolkas i enlighet med svensk lag, utan hänsyn till lagvalsregler. Tvister som härrör från eller relaterar till dessa villkor ska slutligt avgöras av behörig domstol i Sverige.
            </Text>
            
            <Text style={styles.sectionTitle}>13. Kontakt</Text>
            <Text style={styles.paragraph}>
              Om du har några frågor eller synpunkter angående dessa användarvillkor, vänligen kontakta oss på:{'\n\n'}
              Moi Sushi AB{'\n'}
              Sushigatan 123{'\n'}
              12345 Stockholm{'\n'}
              E-post: info@moisushi.se{'\n'}
              Telefon: 08-123 45 67
            </Text>
            
            <Text style={styles.lastUpdated}>
              Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.card,
    marginTop: Platform.OS === 'ios' ? 0 : 30,
    marginHorizontal: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: 30,
    textAlign: 'center',
  },
}); 