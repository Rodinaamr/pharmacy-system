import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { Supplier } from '../types';

type Props = {
  navigation: any;
};

const SuppliersScreen: React.FC<Props> = ({ navigation }) => {
  const { suppliers, orders } = usePharmacy();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const getOrderCount = (supplierName: string) =>
    orders.filter(o => o.supplierName === supplierName).length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={14}
        color={COLORS.secondary}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="Suppliers"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
        showNotification
      />
      <DashboardBanner screenName="Suppliers" />

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, SHADOWS.sm]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{suppliers.length}</Text>
            <Text style={styles.summaryLabel}>Total Suppliers</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
              {suppliers.filter(s => s.rating >= 4.5).length}
            </Text>
            <Text style={styles.summaryLabel}>Top Rated</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.info }]}>
              {orders.length}
            </Text>
            <Text style={styles.summaryLabel}>Active Orders</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]} onPress={() => {}}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Active Partners</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>PARTNER NETWORK</Text>

        {suppliers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No suppliers found</Text>
          </View>
        ) : (
          suppliers.map(supplier => (
            <TouchableOpacity
              key={supplier.id}
              style={[styles.card, SHADOWS.sm]}
              onPress={() => setSelectedSupplier(supplier)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={styles.supplierAvatar}>
                  <Text style={styles.supplierAvatarText}>
                    {supplier.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.supplierInfo}>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.contactPerson}>{supplier.contactPerson}</Text>
                  <View style={styles.ratingRow}>{renderStars(supplier.rating)}</View>
                </View>
                <View style={styles.ordersBadge}>
                  <Text style={styles.ordersBadgeNum}>{getOrderCount(supplier.name)}</Text>
                  <Text style={styles.ordersBadgeLabel}>orders</Text>
                </View>
              </View>

              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.contactText}>{supplier.phone}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.contactText}>{supplier.email}</Text>
                </View>
              </View>

              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.addressText}>{supplier.address}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Add Supplier FAB */}
      <TouchableOpacity 
        style={[styles.fab, SHADOWS.lg]}
        onPress={() => Alert.alert('Quick Add Supplier', 'Supplier intake module opened. Connect to portal?')}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summarySection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.white,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.divider,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
  },
  summaryValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  sectionTitle: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  supplierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierAvatarText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  supplierInfo: { flex: 1 },
  supplierName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  contactPerson: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  ordersBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryUltraLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
    minWidth: 48,
  },
  ordersBadgeNum: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ordersBadgeLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  contactRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  contactText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  addressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  bottomPad: { height: 80 },
});

export default SuppliersScreen;
