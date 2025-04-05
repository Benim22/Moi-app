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

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModalFull({ visible, onClose }: PrivacyPolicyModalProps) {
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
            <Text style={styles.modalTitle}>Integritetspolicy</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.lastUpdated}>
              Gäller från: {new Date().toLocaleDateString('sv-SE')}
            </Text>
            
            <Text style={styles.sectionTitle}>1. Inledning och personuppgiftsansvarig</Text>
            <Text style={styles.paragraph}>
              Denna integritetspolicy beskriver hur Moi Sushi AB ("vi", "oss", "vår") samlar in, använder och skyddar dina personuppgifter när du använder vår mobilapplikation, webbplats och tjänster.
            </Text>
            <Text style={styles.paragraph}>
              Moi Sushi AB, organisationsnummer 123456-7890, är personuppgiftsansvarig för behandlingen av dina personuppgifter enligt denna policy. Vi följer den svenska dataskyddslagen och EU:s allmänna dataskyddsförordning (GDPR).
            </Text>
            
            <Text style={styles.sectionTitle}>2. Personuppgifter vi samlar in</Text>
            <Text style={styles.paragraph}>
              Vi samlar in och behandlar följande kategorier av personuppgifter:
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Identitets- och kontaktuppgifter:</Text> Namn, e-postadress, telefonnummer, leveransadress och fakturaadress</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Kontouppgifter:</Text> Användarnamn, lösenord (krypterat), registreringsdatum</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Beställningsuppgifter:</Text> Beställningshistorik, leveransalternativ, betalningsinformation (vi sparar inte fullständiga kortuppgifter)</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Tekniska uppgifter:</Text> IP-adress, enhetstyp, operativsystem, app-version, användarinställningar</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Kommunikation:</Text> Kundtjänstkonversationer, feedback och recensioner</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Användningsinformation:</Text> Navigering i appen, klickbeteenden, favoriter och preferenser</Text>
            
            <Text style={styles.sectionTitle}>3. Hur vi samlar in personuppgifter</Text>
            <Text style={styles.paragraph}>
              Vi samlar in personuppgifter genom:
            </Text>
            <Text style={styles.bulletPoint}>• Direkt interaktion när du skapar ett konto eller genomför en beställning</Text>
            <Text style={styles.bulletPoint}>• Automatiserad teknik när du använder vår app eller webbplats</Text>
            <Text style={styles.bulletPoint}>• Tredjepartskällor såsom leveranspartners och betalningsleverantörer</Text>
            
            <Text style={styles.sectionTitle}>4. Behandlingsändamål och rättslig grund</Text>
            <Text style={styles.paragraph}>
              Vi behandlar dina personuppgifter för följande ändamål och med följande rättsliga grunder:
            </Text>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.boldText}>Ändamål</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.boldText}>Rättslig grund</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Hantera ditt konto</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Fullgörande av avtal</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Hantera och leverera beställningar</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Fullgörande av avtal</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Kundtjänst och support</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Berättigat intresse</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Marknadsföring och personliga erbjudanden</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Samtycke</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Förbättra och utveckla våra tjänster</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Berättigat intresse</Text>
              </View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Uppfylla lagkrav (t.ex. bokföring)</Text>
              </View>
              <View style={styles.tableCell}>
                <Text style={styles.paragraph}>Rättslig förpliktelse</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>5. Mottagare av personuppgifter</Text>
            <Text style={styles.paragraph}>
              Vi kan dela dina personuppgifter med följande kategorier av mottagare:
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Tjänsteleverantörer:</Text> IT-leverantörer, betalningsförmedlare, leveranstjänster</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Myndigheter:</Text> När det krävs enligt lag, domstolsbeslut eller rättsliga förfaranden</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Affärspartners:</Text> Vid överlåtelse av verksamhet eller sammanslagning (du kommer att meddelas i förväg)</Text>
            <Text style={styles.paragraph}>
              Vi ingår alltid lämpliga avtal med tjänsteleverantörer som behandlar personuppgifter för vår räkning för att säkerställa att dina uppgifter är ordentligt skyddade.
            </Text>
            
            <Text style={styles.sectionTitle}>6. Överföring till tredjeland</Text>
            <Text style={styles.paragraph}>
              I vissa fall kan dina personuppgifter överföras till länder utanför EU/EES. När sådana överföringar sker, vidtar vi lämpliga skyddsåtgärder i enlighet med GDPR:
            </Text>
            <Text style={styles.bulletPoint}>• Vi använder EU-kommissionens standardavtalsklausuler</Text>
            <Text style={styles.bulletPoint}>• Vi säkerställer att mottagaren är ansluten till EU-US Privacy Shield (där tillämpligt)</Text>
            <Text style={styles.bulletPoint}>• Vi inhämtar ditt uttryckliga samtycke för vissa överföringar</Text>
            <Text style={styles.paragraph}>
              Du kan begära en kopia av de skyddsåtgärder vi använder för överföringar genom att kontakta oss.
            </Text>
            
            <Text style={styles.sectionTitle}>7. Lagringstid</Text>
            <Text style={styles.paragraph}>
              Vi sparar dina personuppgifter endast så länge som det är nödvändigt för de ändamål för vilka de samlades in, eller så länge som krävs enligt lag:
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Kundkonton:</Text> Så länge du har ett aktivt konto hos oss och upp till 12 månader efter inaktivitet</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Beställningsinformation:</Text> 7 år enligt bokföringslagen</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Kundtjänstärenden:</Text> 24 månader efter avslutat ärende</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Marknadsföringssyfte:</Text> Till dess att du återkallar ditt samtycke</Text>
            
            <Text style={styles.sectionTitle}>8. Dina rättigheter enligt GDPR</Text>
            <Text style={styles.paragraph}>
              Enligt GDPR har du som registrerad flera rättigheter:
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt till tillgång:</Text> Du har rätt att få en bekräftelse på om vi behandlar dina personuppgifter och i så fall få tillgång till dessa</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt till rättelse:</Text> Du har rätt att begära att felaktiga uppgifter om dig korrigeras</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt till radering ("rätten att bli bortglömd"):</Text> Under vissa omständigheter har du rätt att få dina uppgifter raderade</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt till begränsning av behandling:</Text> Du har rätt att begära att behandlingen av dina personuppgifter begränsas</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt till dataportabilitet:</Text> Du har rätt att få ut och överföra dina uppgifter till en annan personuppgiftsansvarig</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt att göra invändningar:</Text> Du har rätt att invända mot behandling som baseras på berättigat intresse, särskilt vid direktmarknadsföring</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Rätt att inte bli föremål för automatiserat beslutsfattande:</Text> Du har rätt att inte bli föremål för beslut som enbart grundas på automatiserad behandling</Text>
            <Text style={styles.paragraph}>
              För att utöva dina rättigheter, kontakta oss via kontaktuppgifterna nedan. Vi kommer att besvara din begäran inom en månad. I vissa fall kan vi behöva förlänga denna period, vilket vi kommer att informera dig om.
            </Text>
            
            <Text style={styles.sectionTitle}>9. Cookies och liknande tekniker</Text>
            <Text style={styles.paragraph}>
              Vår app och webbplats använder cookies och liknande tekniker för att förbättra användarupplevelsen, analysera användarbeteende och för riktad annonsering. Vi använder följande typer av cookies:
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Nödvändiga cookies:</Text> Krävs för att appen/webbplatsen ska fungera</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Preferenscookies:</Text> Sparar dina inställningar</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Statistikcookies:</Text> Hjälper oss förstå hur användare interagerar med vår tjänst</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.boldText}>Marknadsföringscookies:</Text> Används för att visa relevanta annonser</Text>
            <Text style={styles.paragraph}>
              Du kan hantera dina cookie-inställningar genom din webbläsare eller enhetsinställningar. Notera att om du blockerar vissa cookies kan delar av vår tjänst inte fungera korrekt.
            </Text>
            
            <Text style={styles.sectionTitle}>10. Datasäkerhet</Text>
            <Text style={styles.paragraph}>
              Vi vidtar tekniska och organisatoriska åtgärder för att skydda dina personuppgifter mot oavsiktlig eller olaglig förstöring, förlust, ändring, obehörigt röjande eller obehörig åtkomst, inklusive:
            </Text>
            <Text style={styles.bulletPoint}>• Kryptering av känsliga personuppgifter</Text>
            <Text style={styles.bulletPoint}>• Lösenordsskyddad åtkomst till system</Text>
            <Text style={styles.bulletPoint}>• Regelbundna säkerhetsgranskningar</Text>
            <Text style={styles.bulletPoint}>• Utbildning av personal i dataskydd</Text>
            <Text style={styles.bulletPoint}>• Incidenthanteringsrutiner</Text>
            <Text style={styles.paragraph}>
              Om en personuppgiftsincident inträffar som medför risker för dina rättigheter, kommer vi att anmäla incidenten till Integritetsskyddsmyndigheten inom 72 timmar och, om det är nödvändigt, informera dig direkt.
            </Text>
            
            <Text style={styles.sectionTitle}>11. Ändringar i integritetspolicyn</Text>
            <Text style={styles.paragraph}>
              Vi kan uppdatera denna integritetspolicy för att återspegla ändringar i vår verksamhet eller rättsliga krav. När vi gör väsentliga ändringar kommer vi att meddela dig genom vår app, webbplats eller via e-post. Vi rekommenderar att du regelbundet granskar denna policy för att hålla dig informerad om hur vi skyddar dina personuppgifter.
            </Text>
            
            <Text style={styles.sectionTitle}>12. Kontakta oss och klagomål</Text>
            <Text style={styles.paragraph}>
              Om du har frågor om hur vi behandlar dina personuppgifter eller vill utöva dina rättigheter, kontakta oss på:
            </Text>
            <Text style={styles.paragraph}>
              Moi Sushi AB{'\n'}
              Sushigatan 123{'\n'}
              12345 Stockholm{'\n'}
              E-post: privacy@moisushi.se{'\n'}
              Telefon: 08-123 45 67
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Dataskyddsombud:</Text> Om tillämpligt har vi utsett ett dataskyddsombud som kan kontaktas på dpo@moisushi.se
            </Text>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Klagomål:</Text> Om du anser att vår behandling av dina personuppgifter inte följer dataskyddslagstiftningen, har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (www.imy.se).
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
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginLeft: 16,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 8,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  }
}); 