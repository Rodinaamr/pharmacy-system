import json

# Load the fixed medications
with open(r'c:\Users\roday\OneDrive\Desktop\pharmacy system\meds_output_fixed.json', 'r', encoding='utf-8') as f:
    medications = json.load(f)

# Convert to TypeScript string
meds_ts = "export const mockMedications: Medication[] = " + json.dumps(medications, indent=2) + ";\n"

# Define the other mock data (copied from Step 141)
header = """import {
  Medication,
  Prescription,
  Order,
  Supplier,
  Activity,
  User,
  DashboardStats,
} from '../types';

export const mockUser: User = {
  id: 'U001',
  name: 'Pharmacist Ahmed',
  role: 'pharmacist',
  email: 'ahmed@greenpharmacy.com',
  phone: '+20 100 123 4567',
  shift: 'Morning (8AM - 4PM)',
  licenseNumber: 'PH-2024-001',
};

"""

footer = """
export const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-P102',
    patientId: 'P102',
    patientName: 'Mohamed Ali',
    medicationName: '1 2 3 (one two three) syrup 120 ml',
    medicationId: 'M001',
    prescribingDoctor: 'Dr Ahmed',
    department: 'Dermatology',
    dosage: '20mg',
    frequency: 'Once daily',
    duration: '3 months',
    notes: 'Patient has severe acne. Monitor liver function monthly.',
    status: 'pending',
    createdAt: '2026-03-16T08:00:00Z',
    updatedAt: '2026-03-16T08:00:00Z',
    clinic: 'Dermatology Clinic',
  },
  {
    id: 'RX-P105',
    patientId: 'P105',
    patientName: 'Sara Hassan',
    medicationName: '1 2 3 (one two three) 20 f.c.tabs.',
    medicationId: 'M002',
    prescribingDoctor: 'Dr Sara',
    department: 'Dermatology',
    dosage: 'Topical Application',
    frequency: 'Twice daily',
    duration: '2 weeks',
    notes: 'Apply thin layer to affected area.',
    status: 'pending',
    createdAt: '2026-03-16T09:30:00Z',
    updatedAt: '2026-03-16T09:30:00Z',
    clinic: 'Dermatology Clinic',
  },
  {
    id: 'RX-P089',
    patientId: 'P089',
    patientName: 'Jane Doe',
    medicationName: '5-fluorouracil-ebewe 250mg/5ml i.v. vial',
    medicationId: 'M003',
    prescribingDoctor: 'Dr Khalid',
    department: 'Internal Medicine',
    dosage: '500mg',
    frequency: 'Three times daily',
    duration: '7 days',
    notes: 'Complete full course even if symptoms improve.',
    status: 'approved',
    createdAt: '2026-03-16T07:15:00Z',
    updatedAt: '2026-03-16T07:20:00Z',
    clinic: 'Internal Medicine Clinic',
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    supplierName: 'PharmaCo Egypt',
    medications: [
      {
        medicationId: 'M003',
        medicationName: '5-fluorouracil-ebewe 250mg/5ml i.v. vial',
        quantity: 200,
        unitPrice: 15.0,
        totalPrice: 3000.0,
      }
    ],
    totalAmount: 3000.0,
    status: 'pending',
    expectedDelivery: '2026-03-20',
    createdAt: '2026-03-16T10:00:00Z',
    notes: 'Urgent order for low stock medications.',
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'S001',
    name: 'hikma',
    contactPerson: 'Ahmed Khalil',
    phone: '+20 2 1234 5678',
    email: 'orders@hikma.com',
    address: 'Cairo, Egypt',
    rating: 4.8,
    activeOrders: 2,
  },
  {
    id: 'S002',
    name: 'eva pharma',
    contactPerson: 'Sara Mostafa',
    phone: '+20 2 9876 5432',
    email: 'supply@evapharma.com',
    address: 'Giza, Egypt',
    rating: 4.5,
    activeOrders: 1,
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'A001',
    type: 'prescription',
    title: 'Refill for Patient: Jane Doe',
    description: 'Amoxicillin 500mg • 2 mins ago',
    timestamp: '2026-03-16T17:32:00Z',
    color: '#2E7D32',
  }
];

export const mockStats: DashboardStats = {
  newPrescriptions: 10,
  pendingApprovals: 3,
  lowStockMedications: 2,
  todayDispensed: 24,
  totalRevenue: 12450,
  activePatients: 47,
};
"""

with open(r'c:\Users\roday\OneDrive\Desktop\pharmacy system\GreenPharmacy\src\data\mockData.ts', 'w', encoding='utf-8') as f:
    f.write(header + meds_ts + footer)
