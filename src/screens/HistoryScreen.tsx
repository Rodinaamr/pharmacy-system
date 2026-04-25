import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { StatusBadge, DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { Prescription } from '../types';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { StatusBadge, DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { Prescription } from '../types';

type Props = {
  navigation: any;
};

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const { prescriptions, dispensePrescription } = usePharmacy();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  const filtered = prescriptions.filter(p =>
    activeFilter === 'all' ? p.status !== 'pending' : p.status === activeFilter
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="History"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
        showNotification
      />
      <DashboardBanner screenName="History" />

      {/* Stats Summary Section */}
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, SHADOWS.sm]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filtered.length}</Text>
            <Text style={styles.summaryLabel}>Total Records</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>
              {filtered.filter(rx => rx.status === 'approved').length}
            </Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
              {filtered.filter(rx => rx.status === 'rejected').length}
            </Text>
            <Text style={styles.summaryLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.value)}
            >
              <Text style={[styles.filterChipText, activeFilter === f.value && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No records found</Text>
          </View>
        ) : (
          filtered.map(rx => (
            <View key={rx.id} style={[styles.card, SHADOWS.sm]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.rxId}>{rx.id}</Text>
                  <Text style={styles.medicationName}>{rx.medicationName}</Text>
                </View>
                <StatusBadge status={rx.status} />
              </View>
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Patient</Text>
                  <Text style={styles.detailValue}>{rx.patientName} ({rx.patientId})</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Doctor</Text>
                  <Text style={styles.detailValue}>{rx.prescribingDoctor}</Text>
                </View>
              </View>

              {rx.prescriptionDocumentUrl ? (
                <TouchableOpacity
                  style={styles.viewDocBtn}
                  onPress={() => setViewerUrl(`http://localhost:5202${rx.prescriptionDocumentUrl}`)}
                >
                  <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.viewDocBtnText}>View Document</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.footerRow}>
                <View style={styles.deptChip}>
                  <Ionicons name="business-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.deptText}>{rx.department}</Text>
                </View>
                <Text style={styles.timestamp}>{formatDate(rx.updatedAt)}</Text>
              </View>

              {rx.status === 'approved' && (
                <TouchableOpacity
                  style={[styles.dispenseBtn, updatingId === rx.id && { opacity: 0.6 }]}
                  onPress={async () => {
                    setUpdatingId(rx.id);
                    await dispensePrescription(rx.id);
                    setUpdatingId(null);
                  }}
                  disabled={updatingId === rx.id}
                >
                  <Ionicons name="medical-outline" size={18} color={COLORS.white} />
                  <Text style={styles.dispenseBtnText}>
                    {updatingId === rx.id ? 'Dispensing...' : 'Dispense Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Viewer Modal */}
      {viewerUrl && (
        <Modal transparent visible={!!viewerUrl} onRequestClose={() => setViewerUrl(null)}>
          <View style={styles.viewerOverlay}>
            <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerUrl(null)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Image
              source={{ uri: viewerUrl }}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}

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
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  filterChipText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  rxId: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  medicationName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryUltraLight,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    gap: 6,
  },
  viewDocBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  deptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deptText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bottomPad: { height: SPACING.xxl },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.full,
  },
  dispenseBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    gap: 8,
  },
  dispenseBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default HistoryScreen;
