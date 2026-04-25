import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';

type Props = {
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, stats, prescriptions, medications } = usePharmacy();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [alertsEnabled, setAlertsEnabled] = React.useState(true);

  const [activeModal, setActiveModal] = React.useState<'pin' | 'reports' | 'about' | null>(null);
  const [pinCode, setPinCode] = React.useState('');

  const totalDispensed = prescriptions.filter(p => p.status === 'dispensed').length;
  const totalApproved = prescriptions.filter(p => p.status === 'approved').length;
  const lowStockCount = medications.filter(m => m.status !== 'available').length;

  const menuItems = [
    { icon: 'shield-checkmark-outline', label: 'Security & PIN', onPress: () => setActiveModal('pin') },
    { icon: 'document-text-outline', label: 'Reports', onPress: () => setActiveModal('reports') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => Linking.openURL('mailto:support@greenpharmacy.com?subject=Support%20Request') },
    { icon: 'information-circle-outline', label: 'About', value: 'v2.1.0', onPress: () => setActiveModal('about') },
  ];

  const handleDownloadCSV = () => {
    if (Platform.OS === 'web') {
      try {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Green Pharmacy Advanced Report\n\n";
        
        csvContent += "--- PRESCRIPTIONS HISTORY ---\n";
        csvContent += "ID,Patient Name,Medication,Status,Created At\n";
        prescriptions.forEach(p => {
          csvContent += `"${p.id}","${p.patientName}","${p.medicationName}","${p.status}","${new Date(p.createdAt).toLocaleDateString()}"\n`;
        });

        csvContent += "\n--- CURRENT INVENTORY ---\n";
        csvContent += "ID,Name,Category,Stock Level,Unit Price\n";
        medications.forEach(m => {
          csvContent += `"${m.id}","${m.name}","${m.category}","${m.stockQuantity}","${m.price}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `GreenPharmacy_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setActiveModal(null);
        Alert.alert('Success', 'Report downloaded successfully.');
      } catch (err) {
        Alert.alert('Error', 'Failed to generate CSV.');
      }
    } else {
      Alert.alert('Notice', 'CSV Export is only supported on the Web Dashboard.');
      setActiveModal(null);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
       if (window.confirm('Are you sure you want to sign out?')) {
          navigation.replace('Login');
       }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => navigation.replace('Login') },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="Profile"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
        showNotification
      />
      <DashboardBanner screenName="Profile" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.md]}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={COLORS.primary} />
            </View>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.license}>License: {user.licenseNumber}</Text>
          <Text style={styles.shift}>🕐 {user.shift}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, SHADOWS.sm]}>
            <Text style={styles.statNum}>{totalApproved}</Text>
            <Text style={styles.statLbl}>Approved</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.sm]}>
            <Text style={styles.statNum}>{lowStockCount}</Text>
            <Text style={styles.statLbl}>Low Stock</Text>
          </View>
          <View style={[styles.statBox, SHADOWS.sm]}>
            <Text style={styles.statNum}>{prescriptions.length}</Text>
            <Text style={styles.statLbl}>Total Prescriptions</Text>
          </View>
        </View>

        {/* Notifications Toggle */}
        <View style={[styles.sectionCard, SHADOWS.sm]}>
          <Text style={styles.sectionCardTitle}>Notifications</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.toggleLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textLight}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="warning-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.toggleLabel}>Low Stock Alerts</Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={setAlertsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={alertsEnabled ? COLORS.primary : COLORS.textLight}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={[styles.sectionCard, SHADOWS.sm]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.value && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                </View>
              </TouchableOpacity>
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={[styles.signOutBtn, SHADOWS.sm]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Modals */}

      {/* PIN Modal */}
      <Modal visible={activeModal === 'pin'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.lg]}>
            <Text style={styles.modalTitle}>Change Security PIN</Text>
            <Text style={styles.modalSubtitle}>Enter your new 4-digit security PIN to restrict local access.</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              value={pinCode}
              onChangeText={setPinCode}
              textAlign="center"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnConfirm} 
                onPress={() => {
                  if (pinCode.length === 4) {
                    Alert.alert('Success', 'Security PIN successfully updated!');
                    setActiveModal(null);
                    setPinCode('');
                  } else {
                    Alert.alert('Error', 'PIN must be exactly 4 digits.');
                  }
                }}>
                <Text style={styles.modalBtnConfirmText}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reports Modal */}
      <Modal visible={activeModal === 'reports'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.lg]}>
            <View style={styles.modalIconCenter}>
               <Ionicons name="document-text" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Generate Report</Text>
            <Text style={styles.modalSubtitle}>Would you like to export the monthly pharmacy performance and inventory report to CSV?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setActiveModal(null)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnConfirm} 
                onPress={handleDownloadCSV}>
                <Text style={styles.modalBtnConfirmText}>Download CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={activeModal === 'about'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, SHADOWS.lg]}>
            <View style={styles.modalIconCenter}>
               <Ionicons name="leaf" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Green Pharmacy</Text>
            <Text style={[styles.modalSubtitle, { color: COLORS.primary, fontWeight: '700', marginBottom: 8 }]}>
              "Your Health, Naturally Prioritized"
            </Text>
            <Text style={styles.modalSubtitle}>
              Welcome to the future of pharmaceutical care. Green Pharmacy ensures safe, immediate, and high-quality medication dispensing backed by a real-time smart tracking engine.
              {"\n\n"}System Version 2.1.0
            </Text>
            
            <TouchableOpacity 
                style={[styles.modalBtnConfirm, { width: '100%', marginTop: SPACING.xs }]} 
                onPress={() => setActiveModal(null)}>
                <Text style={styles.modalBtnConfirmText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  name: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryUltraLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  roleText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  email: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  license: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  shift: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statNum: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statLbl: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionCardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  toggleLabel: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },

  signOutBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.dangerLight,
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },

  bottomPad: { height: SPACING.xxl },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalIconCenter: {
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    height: 50,
    fontSize: 24,
    letterSpacing: 8,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
});

export default ProfileScreen;
