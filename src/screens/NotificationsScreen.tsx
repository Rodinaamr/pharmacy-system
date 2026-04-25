import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { activities, stats } = usePharmacy();

  const notifications = [
    {
      id: 'N1',
      icon: 'document-text',
      color: COLORS.primary,
      bg: COLORS.primaryUltraLight,
      title: 'New Prescription Received',
      desc: 'Patient P102 has a new prescription for Isotretinoin.',
      time: '2 mins ago',
      unread: true,
    },
    {
      id: 'N2',
      icon: 'warning',
      color: COLORS.danger,
      bg: COLORS.dangerLight,
      title: 'Low Stock Alert',
      desc: 'Metformin 850mg is below the minimum stock threshold.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 'N3',
      icon: 'cart',
      color: COLORS.secondary,
      bg: COLORS.secondaryLight,
      title: 'Order Approved',
      desc: 'Order ORD-002 from MedSupply Ltd has been approved.',
      time: '2 hours ago',
      unread: false,
    },
    {
      id: 'N4',
      icon: 'checkmark-circle',
      color: COLORS.success,
      bg: COLORS.successLight,
      title: 'Prescription Dispensed',
      desc: 'Amoxicillin 500mg dispensed to Jane Doe successfully.',
      time: '3 hours ago',
      unread: false,
    },
    {
      id: 'N5',
      icon: 'cube',
      color: COLORS.info,
      bg: COLORS.infoLight,
      title: 'Inventory Updated',
      desc: 'Paracetamol stock updated to 500 units.',
      time: '1 day ago',
      unread: false,
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          <TouchableOpacity>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        {notifications.map(notif => (
          <TouchableOpacity key={notif.id} style={[styles.notifCard, SHADOWS.sm]} activeOpacity={0.9}>
            {notif.unread && <View style={styles.unreadDot} />}
            <View style={[styles.notifIcon, { backgroundColor: notif.bg }]}>
              <Ionicons name={notif.icon as any} size={22} color={notif.color} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, notif.unread && styles.notifTitleUnread]}>
                {notif.title}
              </Text>
              <Text style={styles.notifDesc}>{notif.desc}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  markAllRead: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 3,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  bottomPad: { height: SPACING.xxl },
});

export default NotificationsScreen;
