import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Medication,
  Prescription,
  Order,
  Supplier,
  Activity,
  User,
  DashboardStats,
  PrescriptionStatus,
  OrderStatus,
} from '../types';
import {
  mockMedications,
  mockPrescriptions,
  mockOrders,
  mockSuppliers,
  mockActivities,
  mockStats,
  mockUser,
} from '../data/mockData';
import { medicationService, dashboardService } from '../services/apiService';
import api from '../services/apiService';

interface PharmacyContextType {
  // State
  user: User;
  medications: Medication[];
  prescriptions: Prescription[];
  orders: Order[];
  suppliers: Supplier[];
  activities: Activity[];
  stats: DashboardStats;
  loading: boolean;

  // Actions
  refreshData: () => Promise<void>;

  // Prescription actions
  approvePrescription: (id: string) => Promise<void>;
  rejectPrescription: (id: string) => Promise<void>;
  dispensePrescription: (id: string) => Promise<void>;

  // Medication actions
  addMedication: (med: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<{success: boolean, error?: string}>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;

  // Computed
  getPendingPrescriptions: () => Prescription[];
  getLowStockMedications: () => Medication[];
  getActiveOrders: () => Order[];
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(mockUser);
  const [medications, setMedications] = useState<Medication[]>(mockMedications); // 26k items load instantly
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); // Added setter
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    newPrescriptions: 0,
    pendingApprovals: 0,
    lowStockMedications: 0,
    todayDispensed: 0,
    totalRevenue: 0,
    activePatients: 0,
    interactionWarnings: 0
  });
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Syncing real data from backend
      const [statsRes, actRes, presRes, ordRes, supRes, medRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities(),
        api.get('/prescriptions'),
        api.get('/orders'),
        api.get('/suppliers'),
        api.get('/medications'),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (actRes.data && actRes.data.length > 0) setActivities(actRes.data);
      if (presRes.data) setPrescriptions(presRes.data);
      if (ordRes.data) setOrders(ordRes.data);
      if (supRes.data) setSuppliers(supRes.data);
      if (medRes.data) setMedications(medRes.data);
    } catch (error: any) {
      console.error('Real data sync failed:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activity,
      id: `A${Date.now()}`,
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  }, []);

  const approvePrescription = useCallback(async (id: string) => {
    try {
      await api.patch(`/prescriptions/${id}/approve`);
      await refreshData();
    } catch (error: any) {
      console.error('Failed to approve prescription:', error.message);
    }
  }, [refreshData]);

  const rejectPrescription = useCallback(async (id: string) => {
    try {
      await api.patch(`/prescriptions/${id}/reject`);
      await refreshData();
    } catch (error: any) {
      console.error('Failed to reject prescription:', error.message);
    }
  }, [refreshData]);

  const dispensePrescription = useCallback(async (id: string) => {
    try {
      await api.patch(`/prescriptions/${id}/dispense`);
      await refreshData();
    } catch (error: any) {
      console.error('Failed to dispense prescription:', error.message);
    }
  }, [refreshData]);

  const addMedication = useCallback(async (med: Omit<Medication, 'id'>) => {
    try {
      await api.post('/medications', med);
      await refreshData();
    } catch (error: any) {
      console.error('Error adding medication:', error.message);
    }
  }, [refreshData]);

  const updateMedication = useCallback(async (id: string, updates: Partial<Medication>) => {
    try {
      await api.put(`/medications/${id}`, updates);
      await refreshData();
    } catch (error: any) {
      console.error('Error updating medication:', error.message);
    }
  }, [refreshData]);

  const deleteMedication = useCallback(async (id: string) => {
    try {
      await api.delete(`/medications/${id}`);
      await refreshData();
    } catch (error: any) {
      console.error('Error deleting medication:', error.message);
    }
  }, [refreshData]);

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      console.log('Attempting to create order:', JSON.stringify(order, null, 2));
      const response = await api.post('/orders', order);
      console.log('Order created successfully:', response.data);
      await refreshData();
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorMsg = error.response?.data?.title || error.message || 'Unknown error';
      console.error('FAILED to add order:', errorMsg, error.response?.data);
      return { success: false, error: errorMsg };
    }
  }, [refreshData]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${id}`, { status });
      await refreshData();
    } catch (error: any) {
      console.error('Failed to update order status:', error.message);
    }
  }, [refreshData]);

  const getPendingPrescriptions = useCallback(() =>
    prescriptions.filter(p => p.status === 'pending'),
    [prescriptions]
  );

  const getLowStockMedications = useCallback(() =>
    medications.filter(m => m.status === 'low_stock' || m.status === 'out_of_stock'),
    [medications]
  );

  const getActiveOrders = useCallback(() =>
    orders.filter(o => o.status === 'pending' || o.status === 'approved'),
    [orders]
  );

  return (
    <PharmacyContext.Provider
      value={{
        user,
        medications,
        prescriptions,
        orders,
        suppliers,
        activities,
        stats,
        loading,
        refreshData,
        approvePrescription,
        rejectPrescription,
        dispensePrescription,
        addMedication,
        updateMedication,
        deleteMedication,
        addOrder,
        updateOrderStatus,
        getPendingPrescriptions,
        getLowStockMedications,
        getActiveOrders,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = (): PharmacyContextType => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
