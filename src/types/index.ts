// ==================== PHARMACY SYSTEM TYPES ====================

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type PrescriptionStatus = 'pending' | 'approved' | 'rejected' | 'dispensed';
export type UserRole = 'pharmacist' | 'manager' | 'admin';

// --- Medication ---
export interface Medication {
  id: string;
  name: string;
  category: string;
  description: string;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  expiryDate: string;
  batchNumber: string;
  price: number;
  supplier: string;
  status: StockStatus;
  imageColor: string;
  interactions?: string[]; // IDs of other medications that cause interaction warnings
}

// --- Prescription ---
export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  medicationId: string;
  prescribingDoctor: string;
  department: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  status: PrescriptionStatus;
  createdAt: string;
  updatedAt: string;
  clinic: string;
  isChronic?: boolean;
  refillDueDate?: string; // ISO Date
  prescriptionDocumentUrl?: string;
  imageUrl?: string;
}

// --- Order ---
export interface Order {
  id: string;
  supplierName: string;
  medications: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  expectedDelivery: string;
  createdAt: string;
  notes: string;
}

export interface OrderItem {
  medicationId: string;
  medicationName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// --- Supplier ---
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  activeOrders: number;
}

// --- Activity ---
export interface Activity {
  id: string;
  type: 'prescription' | 'inventory' | 'order' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  color: string;
}

// --- User ---
export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
  shift: string;
  licenseNumber: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  newPrescriptions: number;
  pendingApprovals: number;
  lowStockMedications: number;
  todayDispensed: number;
  totalRevenue: number;
  activePatients: number;
  interactionWarnings: number;
}

// --- Navigation Params ---
export type RootStackParamList = {
  MainTabs: undefined;
  PrescriptionDetail: { prescription: Prescription };
  MedicationDetail: { medication: Medication };
  OrderDetail: { order: Order };
  AddMedication: undefined;
  AddOrder: undefined;
  SupplierDetail: { supplier: Supplier };
  Notifications: undefined;
  Settings: undefined;
  EditProfile: undefined;
};

export type HomeTabParamList = {
  Home: undefined;
  Orders: undefined;
  Stock: undefined;
  Profile: undefined;
};

export type QueueTabParamList = {
  Queue: undefined;
  History: undefined;
  QueueProfile: undefined;
};

export type InventoryTabParamList = {
  Dashboard: undefined;
  Inventory: undefined;
  Suppliers: undefined;
  InventorySettings: undefined;
};
