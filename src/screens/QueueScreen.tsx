import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { StatusBadge, DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { Prescription } from '../types';
import api from '../services/apiService';

type Props = {
  navigation: any;
};

const QueueScreen: React.FC<Props> = ({ navigation }) => {
  const { prescriptions, approvePrescription, rejectPrescription, refreshData } = usePharmacy();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New Prescription form state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientName: '',
    patientId: '',
    clinic: '',
    notes: '',
  });

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const clinic = pendingPrescriptions.length > 0 ? pendingPrescriptions[0].clinic : 'Pharmacy Intake';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Pick Document Error:', err);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!form.patientName || !form.patientId || !selectedFile) return;
    setSubmitting(true);
    try {
      // 1. Upload the file first
      let fileUrl = '';
      if (Platform.OS === 'web') {
        const formData = new FormData();
        if (selectedFile.file) {
          formData.append('file', selectedFile.file, selectedFile.name);
        } else {
          const response = await fetch(selectedFile.uri);
          const blob = await response.blob();
          formData.append('file', blob, selectedFile.name);
        }

        const uploadRes = await fetch('http://localhost:5202/api/prescriptions/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error('Upload request failed with status ' + uploadRes.status);
        }
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
      } else {
        const formData = new FormData();
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType,
        } as any);

        const uploadResponse = await api.post('/prescriptions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fileUrl = uploadResponse.data.url;
      }
      // 2. Create the prescription record
      const newRx = {
        patientId: form.patientId,
        patientName: form.patientName,
        clinic: form.clinic || 'Main Pharmacy',
        notes: form.notes,
        prescriptionDocumentUrl: fileUrl,
        imageUrl: selectedFile.mimeType?.startsWith('image/') ? fileUrl : null,
        status: 'pending',
        // Decision fields are empty because the pharmacist doesn't make them
        medicationName: 'PENDING REVIEW', 
        medicationId: 'pending',
        prescribingDoctor: 'TO BE ASSIGNED',
        dosage: '',
        frequency: '',
        duration: '',
        department: 'Intake',
      };

      await api.post('/prescriptions', newRx);
      await refreshData();
      setShowForm(false);
      
      // Reset form
      setForm({ patientName: '', patientId: '', clinic: '', notes: '' });
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Submission failed:', error);
      const msg = error.response?.data || error.message || 'Check your internet connection and try again.';
      alert('Upload Failed: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="Intake & Queue"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
        showNotification
        notificationCount={pendingPrescriptions.length}
      />
      <DashboardBanner screenName="Intake Queue" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {pendingPrescriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={64} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>Queue Empty</Text>
            <Text style={styles.emptyDesc}>Start by scanning a new prescription</Text>
            <TouchableOpacity style={[styles.submitBtn, { marginTop: 24, paddingHorizontal: 32 }]} onPress={() => setShowForm(true)}>
              <Ionicons name="scan" size={18} color={COLORS.white} />
              <Text style={[styles.submitBtnText, { marginLeft: 8 }]}>Scan New Prescription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          pendingPrescriptions.map(rx => (
            <View key={rx.id} style={[styles.card, SHADOWS.md]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.patientId}>ID: {rx.patientId}</Text>
                  <Text style={styles.patientNameHeader}>{rx.patientName}</Text>
                </View>
                <StatusBadge status={rx.status} />
              </View>

              {rx.notes ? (
                <View style={styles.notesBox}>
                  <Ionicons name="information-circle-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.notesText}>{rx.notes}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.viewDocBtn}
                  onPress={() => setViewerUrl(`http://localhost:5202${rx.prescriptionDocumentUrl}`)}
                >
                  <Ionicons name="eye" size={18} color={COLORS.primary} />
                  <Text style={styles.viewDocBtnText}>View Full Scan</Text>
                </TouchableOpacity>

                <View style={styles.decisionRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={async () => {
                      setUpdatingId(rx.id);
                      await approvePrescription(rx.id);
                      setUpdatingId(null);
                    }}
                    disabled={updatingId === rx.id}
                  >
                    {updatingId === rx.id ? <ActivityIndicator size="small" color={COLORS.white} /> : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={async () => {
                      setUpdatingId(rx.id);
                      await rejectPrescription(rx.id);
                      setUpdatingId(null);
                    }}
                    disabled={updatingId === rx.id}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.danger} />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={styles.bottomPad} />

      </ScrollView>

      {/* FAB - New Prescription */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* ===== NEW INTAKE MODAL ===== */}
      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📤 Pharmacist Intake</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>PATIENT DETAILS</Text>
              <TextInput
                style={styles.input}
                placeholder="Patient Name"
                placeholderTextColor={COLORS.textLight}
                value={form.patientName}
                onChangeText={t => setForm({ ...form, patientName: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Patient ID (e.g. P-2024)"
                placeholderTextColor={COLORS.textLight}
                value={form.patientId}
                onChangeText={t => setForm({ ...form, patientId: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Department / Clinic"
                placeholderTextColor={COLORS.textLight}
                value={form.clinic}
                onChangeText={t => setForm({ ...form, clinic: t })}
              />

              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PRESCRIPTION DOCUMENT</Text>
              
              {selectedFile ? (
                <View style={styles.selectedFileBox}>
                  <Ionicons 
                    name={selectedFile.mimeType?.startsWith('image/') ? "image" : "document"} 
                    size={24} 
                    color={COLORS.primary} 
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '700', color: COLORS.text }} numberOfLines={1}>{selectedFile.name}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>{(selectedFile.size / 1024).toFixed(1)} KB</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.pickBtn} onPress={handlePickDocument}>
                  <Ionicons name="document-attach" size={28} color={COLORS.primary} />
                  <Text style={styles.pickBtnText}>Upload PDF or Gallery Photo</Text>
                </TouchableOpacity>
              )}

              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', marginTop: 12 }]}
                placeholder="Pharmacist's clinical notes..."
                placeholderTextColor={COLORS.textLight}
                value={form.notes}
                onChangeText={t => setForm({ ...form, notes: t })}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!form.patientName || !form.patientId || !selectedFile || submitting) && { opacity: 0.5 }
                ]}
                onPress={handleSubmitPrescription}
                disabled={!form.patientName || !form.patientId || !selectedFile || submitting}
              >
                {submitting
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.submitBtnText}>Submit to Doctor Queue</Text>
                }
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== FULL SCREEN IMAGE VIEWER ===== */}
      <Modal visible={!!viewerUrl} animationType="fade" transparent onRequestClose={() => setViewerUrl(null)}>
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerCloseBtn} onPress={() => setViewerUrl(null)}>
            <Ionicons name="close" size={32} color={COLORS.white} />
          </TouchableOpacity>
          {viewerUrl?.endsWith('.pdf') ? (
            <View style={{ flex: 1, backgroundColor: COLORS.white, width: '100%', borderRadius: RADIUS.md, marginTop: 60 }}>
              <iframe src={viewerUrl} width="100%" height="100%" style={{ border: 'none' }} />
            </View>
          ) : (
            <Image source={{ uri: viewerUrl || undefined }} style={styles.viewerImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  clinicBanner: { backgroundColor: COLORS.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: 10 },
  clinicName: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700', letterSpacing: 1.5 },
  clinicBadge: { backgroundColor: '#F59E0B', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  clinicBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  patientId: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },
  patientNameHeader: { fontSize: FONTS.sizes.base, fontWeight: '800', color: COLORS.text },
  previewContainer: { height: 180, backgroundColor: COLORS.background, borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  docImage: { width: '100%', height: '100%' },
  pdfPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  pdfText: { fontWeight: '700', color: COLORS.textSecondary, fontSize: 13 },
  overlayInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8 },
  overlayTitle: { color: COLORS.white, fontWeight: '700', fontSize: 11 },
  overlaySubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 9 },
  notesBox: { flexDirection: 'row', gap: SPACING.xs, backgroundColor: '#F9FAFB', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.md },
  notesText: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  actionRow: { marginTop: SPACING.xs, gap: 12 },
  viewDocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary, gap: 8 },
  viewDocBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  decisionRow: { flexDirection: 'row', gap: SPACING.sm },
  approveBtn: { flex: 1, backgroundColor: COLORS.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: RADIUS.md, gap: 6 },
  approveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  rejectBtn: { flex: 1, backgroundColor: COLORS.dangerLight, borderWidth: 1, borderColor: COLORS.danger, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: RADIUS.md, gap: 6 },
  rejectBtnText: { color: COLORS.danger, fontWeight: '800', fontSize: 13 },
  fab: { position: 'absolute', right: SPACING.xl, bottom: SPACING.xxl, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.lg },
  emptyState: { alignItems: 'center', paddingVertical: 100 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, marginTop: SPACING.lg },
  emptyDesc: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
  bottomPad: { height: 100 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: COLORS.textLight, letterSpacing: 1.2, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.base, color: COLORS.text, backgroundColor: COLORS.background, marginBottom: 10 },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', marginTop: SPACING.md, flexDirection: 'row', justifyContent: 'center' },
  submitBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  pickButtonsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: 10 },
  pickBtn: { flex: 1, height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', gap: 8 },
  pickBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  selectedFileBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryUltraLight, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.primary },
  // Viewer
  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  viewerImage: { width: '100%', height: '100%' },
  viewerCloseBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: RADIUS.full },
});

export default QueueScreen;
