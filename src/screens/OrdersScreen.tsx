import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePharmacy } from '../context/PharmacyContext';
import Header from '../components/Header';
import { StatusBadge, DashboardBanner } from '../components/SharedComponents';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../utils/theme';
import { Order, OrderStatus, Medication } from '../types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: COLORS.warning,
  approved: COLORS.info,
  completed: COLORS.success,
  rejected: COLORS.danger,
  cancelled: COLORS.textLight,
};

type Props = {
  navigation: any;
};

const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { orders, addOrder, updateOrderStatus, suppliers, medications } = usePharmacy();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // New state for order items
  const [orderItems, setOrderItems] = useState<{medicationId: string, name: string, quantity: number, price: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medication[]>([]);

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'approved');
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'rejected' || o.status === 'cancelled');
  const displayedOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (updatingId) return; // prevent double-tap
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddOrder = async () => {
    if (!selectedSupplier) {
      Alert.alert('Error', 'Please select a supplier');
      return;
    }
    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const result = await addOrder({
      supplierName: selectedSupplier,
      medications: orderItems.map(i => ({ 
        medicationId: i.medicationId, 
        medicationName: i.name, 
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity
      })),
      totalAmount,
      status: 'pending',
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
    });

    if (result && result.success) {
      Alert.alert('Success', 'Order created and saved to database');
      setShowAddModal(false);
      setSelectedSupplier('');
      setNotes('');
      setOrderItems([]);
    } else {
      Alert.alert('Error', `Could not create order: ${result?.error || 'Server error'}`);
    }
  };

  const searchMedications = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const filtered = medications.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.id.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    setSearchResults(filtered);
  };

  const addItemToOrder = (med: Medication) => {
    const existing = orderItems.find(i => i.medicationId === med.id);
    if (existing) {
      setOrderItems(prev => prev.map(i => i.medicationId === med.id ? {...i, quantity: i.quantity + 1} : i));
    } else {
      setOrderItems(prev => [...prev, { medicationId: med.id, name: med.name, quantity: 1, price: med.price }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch { return dateStr; }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Green Pharmacy"
        subtitle="Orders Management"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('RoleSelector')}
        showNotification
      />
      <DashboardBanner screenName="Orders Management" />

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={[styles.summaryCard, SHADOWS.sm]}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{activeOrders.length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>
              {completedOrders.length}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: COLORS.info }]}>
              {activeOrders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Value (EGP)</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {displayedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No orders</Text>
          </View>
        ) : (
          displayedOrders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, SHADOWS.sm]}
              onPress={() => setSelectedOrder(order)}
              activeOpacity={0.9}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.supplierName}>{order.supplierName}</Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              <View style={styles.divider} />

              <View style={styles.orderDetails}>
                <View style={styles.orderDetailItem}>
                  <Ionicons name="layers-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.orderDetailText}>
                    {order.medications.reduce((sum, item) => sum + item.quantity, 0)} items
                  </Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.orderDetailText}>
                    EGP {order.totalAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.orderDetailText}>
                    {formatDate(order.expectedDelivery)}
                  </Text>
                </View>
              </View>

              {order.status === 'pending' && (
                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={[styles.approveOrderBtn, updatingId === order.id && { opacity: 0.6 }]}
                    onPress={() => handleStatusChange(order, 'approved')}
                    disabled={updatingId === order.id}
                  >
                    <Text style={styles.approveOrderBtnText}>
                      {updatingId === order.id ? 'Updating...' : 'Approve'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cancelOrderBtn, updatingId === order.id && { opacity: 0.6 }]}
                    onPress={() => handleStatusChange(order, 'cancelled')}
                    disabled={updatingId === order.id}
                  >
                    <Text style={styles.cancelOrderBtnText}>
                      {updatingId === order.id ? '...' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {order.status === 'approved' && (
                <TouchableOpacity
                  style={[styles.completeOrderBtn, updatingId === order.id && { opacity: 0.6 }]}
                  onPress={() => handleStatusChange(order, 'completed')}
                  disabled={updatingId === order.id}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.white} />
                  <Text style={styles.completeOrderBtnText}>
                    {updatingId === order.id ? 'Updating...' : 'Mark as Received'}
                  </Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, SHADOWS.lg]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Order Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Order</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Select Supplier</Text>
            <ScrollView style={styles.supplierList} nestedScrollEnabled>
              {suppliers.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.supplierItem, selectedSupplier === s.name && styles.supplierItemActive]}
                  onPress={() => setSelectedSupplier(s.name)}
                >
                  <Text style={[styles.supplierItemText, selectedSupplier === s.name && styles.supplierItemTextActive]}>
                    {s.name}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color={COLORS.secondary} />
                    <Text style={styles.ratingText}>{s.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.formLabel, { marginTop: SPACING.md }]}>Add Items (Search {medications.length} items)</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search medication name or ID..."
                value={searchQuery}
                onChangeText={searchMedications}
              />
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map(m => (
                    <TouchableOpacity key={m.id} style={styles.searchResultItem} onPress={() => addItemToOrder(m)}>
                      <Text style={styles.searchResultName}>{m.name}</Text>
                      <Text style={styles.searchResultPrice}>EGP {m.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {orderItems.length > 0 && (
              <View style={styles.itemsList}>
                {orderItems.map(item => (
                  <View key={item.medicationId} style={styles.orderItemRow}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <View style={styles.qtyControls}>
                       <TouchableOpacity onPress={() => setOrderItems(prev => prev.map(i => i.medicationId === item.medicationId ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}>
                         <Ionicons name="remove-circle-outline" size={20} color={COLORS.danger} />
                       </TouchableOpacity>
                       <Text style={styles.qtyText}>{item.quantity}</Text>
                       <TouchableOpacity onPress={() => setOrderItems(prev => prev.map(i => i.medicationId === item.medicationId ? {...i, quantity: i.quantity + 1} : i))}>
                         <Ionicons name="add-circle-outline" size={20} color={COLORS.success} />
                       </TouchableOpacity>
                    </View>
                    <Text style={styles.orderItemPrice}>EGP {item.price * item.quantity}</Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                   <Text style={styles.totalLabel}>Total Amount:</Text>
                   <Text style={styles.totalValue}>EGP {orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</Text>
                </View>
              </View>
            )}

            <Text style={[styles.formLabel, { marginTop: SPACING.md }]}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Order notes..."
              placeholderTextColor={COLORS.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.createBtn} onPress={handleAddOrder}>
              <Text style={styles.createBtnText}>Create Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  supplierName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  orderDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderDetailText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  approveOrderBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveOrderBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  cancelOrderBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelOrderBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
  },
  completeOrderBtn: {
    backgroundColor: COLORS.info,
    borderRadius: RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  completeOrderBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.sm,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  formLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  supplierList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  supplierItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  supplierItemActive: {
    backgroundColor: COLORS.primaryUltraLight,
  },
  supplierItemText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    fontWeight: '500',
  },
  supplierItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
  },
  notesInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.md,
  },
  bottomPad: { height: 80 },
  searchContainer: {
    zIndex: 10,
    marginBottom: SPACING.md,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchResults: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    zIndex: 20,
    elevation: 5,
  },
  searchResultItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchResultName: {
    fontWeight: '600',
    color: COLORS.text,
  },
  searchResultPrice: {
    color: COLORS.primary,
    fontSize: 12,
  },
  itemsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderItemName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 10,
  },
  qtyText: {
    fontWeight: 'bold',
    width: 20,
    textAlign: 'center',
  },
  orderItemPrice: {
    fontWeight: '700',
    color: COLORS.text,
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: COLORS.divider,
  },
  totalLabel: {
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontWeight: '800',
    color: COLORS.primary,
  },
});

export default OrdersScreen;
