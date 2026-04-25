import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { StockStatus, PrescriptionStatus, OrderStatus } from '../types';

// ──────────────────────────────────────────────
// Dashboard Status Banner (shared across all screens)
// ──────────────────────────────────────────────
interface DashboardBannerProps {
  screenName: string;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({ screenName }) => (
  <View style={styles.dashBanner}>
    <View style={styles.dashBannerLeft}>
      <View style={styles.dashBannerDot} />
      <Ionicons name="flash" size={13} color={COLORS.secondary} />
      <Text style={styles.dashBannerText}>Real-time Terminal Active</Text>
      <Text style={styles.dashBannerSub}>  •  System synced</Text>
    </View>
    <View style={styles.dashBannerRight}>
      <Ionicons name="grid-outline" size={12} color="rgba(255,255,255,0.6)" />
      <Text style={styles.dashBannerPage}>{screenName}</Text>
    </View>
  </View>
);

type StatusType = StockStatus | PrescriptionStatus | OrderStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  available: { label: 'Available', bg: COLORS.successLight, text: COLORS.success },
  low_stock: { label: 'Low stock', bg: COLORS.warningLight, text: COLORS.warning },
  out_of_stock: { label: 'Out of stock', bg: COLORS.dangerLight, text: COLORS.danger },
  pending: { label: 'Pending', bg: '#FFF8E1', text: '#F57F17' },
  approved: { label: 'Approved', bg: COLORS.successLight, text: COLORS.success },
  rejected: { label: 'Rejected', bg: COLORS.dangerLight, text: COLORS.danger },
  dispensed: { label: 'Dispensed', bg: COLORS.infoLight, text: COLORS.info },
  completed: { label: 'Completed', bg: COLORS.successLight, text: COLORS.success },
  cancelled: { label: 'Cancelled', bg: '#F5F5F5', text: '#757575' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: '#F5F5F5', text: '#757575' };
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={[styles.badgeText, { color: config.text }, isSmall && styles.badgeTextSm]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
};

// ──────────────────────────────────────────────
// Stock Status Dot Indicator
// ──────────────────────────────────────────────
interface StockDotProps {
  status: StockStatus;
}

export const StockDot: React.FC<StockDotProps> = ({ status }) => {
  const COLOR_MAP: Record<StockStatus, string> = {
    available: COLORS.success,
    low_stock: COLORS.warning,
    out_of_stock: COLORS.danger,
  };

  const LABEL_MAP: Record<StockStatus, string> = {
    available: 'Available',
    low_stock: 'Low stock',
    out_of_stock: 'Out of stock',
  };

  const color = COLOR_MAP[status];
  return (
    <View style={styles.dotRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.dotLabel, { color }]}>{LABEL_MAP[status]}</Text>
    </View>
  );
};

// ──────────────────────────────────────────────
// Stat Card (for Dashboard)
// ──────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  actionLabel?: string;
  onAction?: () => void;
  iconBg: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  actionLabel,
  onAction,
  iconBg,
}) => (
  <View style={[styles.statCard, SHADOWS.sm]}>
    <View style={styles.statLeft}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={styles.statText}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
    {actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.statAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ──────────────────────────────────────────────
// Section Header
// ──────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ──────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIcon}>{icon}</View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDesc}>{description}</Text>}
    {actionLabel && (
      <TouchableOpacity style={styles.emptyBtn} onPress={onAction}>
        <Text style={styles.emptyBtnText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Status Badge
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextSm: {
    fontSize: 9,
  },

  // Stock Dot
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.full,
  },
  dotLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },

  // Stat Card
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statIconWrap: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    gap: 2,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.text,
    fontWeight: '800',
  },
  statAction: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDesc: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.base,
  },

  // Dashboard Banner
  dashBanner: {
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
  },
  dashBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dashBannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22ff66',
  },
  dashBannerText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  dashBannerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONTS.sizes.xs,
  },
  dashBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dashBannerPage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
