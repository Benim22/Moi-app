import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { User, Edit, Trash, Search, X, CheckCircle } from 'lucide-react-native';
import BackButton from '@/components/BackButton';

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
};

// Ny komponent för att redigera användare
const EditUserModal = ({ 
  visible, 
  user, 
  onClose, 
  onSave 
}: { 
  visible: boolean; 
  user: UserProfile | null; 
  onClose: () => void; 
  onSave: (user: UserProfile) => Promise<void>; 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'user');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!email.trim()) {
      Alert.alert("Fel", "E-post krävs");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await onSave({
        ...user,
        name,
        email,
        phone,
        role
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert("Fel", "Kunde inte spara användaren");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redigera användare</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Namn</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="Användarens namn"
                placeholderTextColor={theme.colors.subtext || '#666'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>E-post</Text>
              <TextInput
                style={styles.formInput}
                value={email}
                onChangeText={setEmail}
                placeholder="E-postadress"
                placeholderTextColor={theme.colors.subtext || '#666'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Telefon</Text>
              <TextInput
                style={styles.formInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefonnummer"
                placeholderTextColor={theme.colors.subtext || '#666'}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Roll</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'user' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('user')}
                >
                  <Text 
                    style={[
                      styles.roleOptionText,
                      role === 'user' && styles.roleOptionTextSelected
                    ]}
                  >
                    Användare
                  </Text>
                  {role === 'user' && (
                    <CheckCircle size={16} color={theme.colors.gold} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'admin' && styles.roleOptionSelected
                  ]}
                  onPress={() => setRole('admin')}
                >
                  <Text 
                    style={[
                      styles.roleOptionText,
                      role === 'admin' && styles.roleOptionTextSelected
                    ]}
                  >
                    Admin
                  </Text>
                  {role === 'admin' && (
                    <CheckCircle size={16} color={theme.colors.gold} style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Spara</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsEditModalVisible(true);
    }
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        })
        .eq('id', updatedUser.id);
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      // Uppdatera användarlistan
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      Alert.alert("Användare uppdaterad", "Användaruppgifterna har sparats");
    } catch (error) {
      console.error('Error in handleSaveUser:', error);
      Alert.alert("Fel", "Kunde inte uppdatera användaren");
    }
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={[
          styles.userAvatar,
          { backgroundColor: item.role === 'admin' ? '#FF6B6B' : '#4ECDC4' }
        ]}>
          <User size={20} color="#fff" />
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name || 'Namnlös användare'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone || 'Ingen telefon'}</Text>
        </View>
      </View>
      
      <View style={styles.userRole}>
        <View style={[
          styles.roleBadge,
          { backgroundColor: item.role === 'admin' ? '#FF6B6B' : '#4ECDC4' }
        ]}>
          <Text style={styles.roleText}>
            {item.role === 'admin' ? 'Admin' : 'Användare'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => handleEditUser(item.id)}
      >
        <Edit size={20} color={theme.colors.gold} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: 'Användare',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text },
          headerLeft: () => (
            <BackButton 
              title=""
              variant="gold"
              size={26}
              style={styles.headerBackButton}
            />
          ),
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Användare</Text>
          <Text style={styles.subtitle}>Hantera användare och deras behörigheter</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Inga användare att visa</Text>
            }
          />
        )}
        
        <EditUserModal
          visible={isEditModalVisible}
          user={selectedUser}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUser}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 24,
  },
  userItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: theme.colors.text,
  },
  userRole: {
    marginRight: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.text,
    marginTop: 24,
  },
  headerBackButton: {
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
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.text,
  },
  modalContent: {
    padding: 15,
    maxHeight: '60%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    marginBottom: 5,
    fontWeight: '500',
    color: theme.colors.text,
  },
  formInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  roleSelector: {
    flexDirection: 'row',
    marginTop: 5,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleOptionSelected: {
    borderColor: theme.colors.gold,
    backgroundColor: 'rgba(220, 201, 145, 0.1)',
  },
  roleOptionText: {
    color: theme.colors.text,
  },
  roleOptionTextSelected: {
    fontWeight: 'bold',
    color: theme.colors.gold,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.text,
  },
  submitButton: {
    backgroundColor: theme.colors.gold,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 