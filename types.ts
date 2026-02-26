
export type PageView = 'dashboard' | 'products' | 'team' | 'kpi' | 'lab-equipment' | 'documents' | 'database' | 'about' | 'settings' | 'checklist' | 'top-load' | 'weight-check';
export type UserRole = 'admin' | 'user' | 'demo';

export interface Product {
  id: string;
  name: string;
  specs: string;
  defects: string;
  image: string;
  manufacturer?: string; // New field for manufacturer name
}

export interface ReservedItem {
  id: string;
  productName: string;
  quantity: number;
  defects: string;
  actionTaken: string;
  date: string;
  status: 'pending' | 'resolved' | 'scrapped';
  shift: 'A' | 'B' | 'C'; // Added Shift
  inspectorName: string; // Added Inspector Name
}

export interface DefectCode {
  code: string;
  label: string;
  color: string;
}

export interface ChecklistEntry {
  id: string;
  date: string;
  shift: 'A' | 'B' | 'C';
  machineId: string; // e.g., 'P0', 'P1'
  timeSlot: string; // e.g., '08:00'
  status: string; // 'OK', 'STOP', or Defect Code (A, B, C...)
  notes?: string;
}

export interface TopLoadEntry {
  id: string;
  date: string;
  shift: 'A' | 'B' | 'C';
  machineId: string;
  timeSlot: string;
  value: string; // The Top Load Value entered
}

export interface WeightEntry {
  id: string;
  date: string;
  shift: 'A' | 'B' | 'C';
  machineId: string;
  timeSlot: string;
  value: string;
}

export interface TopLoadStandard {
  id: string;
  name: string;
  val: number;
  color: string; // Tailwind class string
}

export interface LabDevice {
  id: string;
  name: string;
  image: string;
  sop: string; // Standard Operating Procedure text
  lastCalibrationDate?: string; // New: Last Calibration Date
  nextCalibrationDate?: string; // New: Next Calibration Date
}

export interface Employee {
  id: string;
  name: string;
  employeeCode?: string; // New field for HR/Employee Code
  role: string;
  department: 'management' | 'qc' | 'qa';
  joinedDate: string;
  email: string;
  phone: string;
  image?: string;
  stampData?: string; // New field for quality stamps/codes
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word';
  size: string;
  date: string;
  url: string; // Simulated URL
}

export interface KPIData {
  month: string;
  year: string;
  qualityRate: number;
  defects: number;
  // New Production Metrics
  reservedBlowPieces: number;
  reservedBlowWeight: number;
  reservedInjectionPieces: number;
  reservedInjectionWeight: number;
  scrappedPieces: number;
  scrappedWeight: number;
  scrappedBlow: number;
  scrappedInjection: number;
  // PPM Scrap Rates
  internalScrapPpm: number;
  externalScrapPpm: number;
  // Non-Conformance Reports per Shift
  ncrShift1: number;
  ncrShift2: number;
  ncrShift3: number;
  // Customer & Logistics Metrics
  totalSupplied: number;
  totalReturned: number;
  totalComplaints: number;
  // Added Metrics
  totalProduction: number;
  totalInternalReserved: number;
}

export interface CompanySettings {
  name: string;
  slogan: string;
  address: string;
  logo: string;
  email: string;
  phone: string;
  website: string;
  registrationNumber: string;
  certificates?: string; // New field for company certificates
}
