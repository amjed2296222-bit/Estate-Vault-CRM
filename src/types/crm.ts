export type PropertyCategory = 
  | 'Plot for Sale' 
  | 'Home for Sale' 
  | 'Home for Rent' 
  | 'Personal';

export type PropertyStatus = 
  | 'Available' 
  | 'Sold' 
  | 'Rented' 
  | 'Reserved' 
  | 'Archived';

export interface RemainingCharge {
  id?: string;
  name: string;
  amount: number;
  notes: string;
}

export interface PropertyEntity {
  id: number;
  propertyId: string;
  category: PropertyCategory;
  propertyType: string;
  status: PropertyStatus;
  
  // Address & Location
  society: string;
  block: string;
  street: string;
  propertyNumber: string;
  size: string;
  locationUrl?: string;
  latitude?: number | null;
  longitude?: number | null;
  
  // Pricing
  demandPrice: number;
  purchasePrice: number; // Confidential
  monthlyRent: number;
  estimatedValue: number;
  
  // Home Specifics
  rentalUnitType: string;
  availabilityStatus: string;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  tvLounge: boolean;
  carPorch: boolean;
  
  // Features / Amenities
  isCornerPlot: boolean;
  isParkFacing: boolean;
  isDisputed: boolean;
  isMainBoulevard: boolean;
  hasPossession: boolean;
  isReadyForConstruction: boolean;
  hasCarpetedStreet: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasWaterSupply: boolean;
  hasSewerage: boolean;
  isFile: boolean;
  isBalloted: boolean;
  hasBoundaryWall: boolean;
  otherFeatures: string;
  
  // Interactive Paid Charges
  paidLand: boolean;
  paidUtilities: boolean;
  paidPossession: boolean;
  paidDevelopment: boolean;
  paidGas: boolean;
  paidWater: boolean;
  paidElectricity: boolean;
  paidCorner: boolean;
  
  // Dynamic Remaining Charges
  remainingCharges: RemainingCharge[];
  
  // Owner Info
  ownerName: string;
  ownerPhone: string;
  ownerWhatsApp: string;
  
  // Dealer Info
  dealerName: string;
  dealerPhone: string;
  dealerWhatsApp: string;
  
  // Description & Media
  description: string;
  mediaGallery: string[];
  coverImageUri: string;
  
  // Metadata
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClientEntity {
  id: number;
  name: string;
  phone: string;
  whatsApp: string;
  type: 'Client' | 'Owner' | 'Dealer';
  category: string;
  status: string;
  email: string;
  city: string;
  address: string;
  budget: number;
  followUpDate: number;
  interestedProperty: string;
  notes: string;
  khataBalance: number; // Positive = client owes us, Negative = we owe client
  createdAt: number;
}

export type LeadStatus = 'New' | 'Contacted' | 'Visit Scheduled' | 'Negotiation' | 'Closed Won' | 'Lost / Dropped';

export interface LeadEntity {
  id: number;
  clientName: string;
  phone: string;
  whatsApp: string;
  propertyCategory: string;
  propertyType: string;
  preferredLocation: string;
  maxBudget: number;
  status: LeadStatus;
  source: string;
  assignedAgent: string;
  followUpDate: number;
  notes: string;
  createdAt: number;
}

export type TransactionType = 'Income' | 'Expense';

export interface AccountTransactionEntity {
  id: number;
  title: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: number;
  society: string;
  paymentMethod: string;
  referenceNo: string;
  description: string;
  attachmentUri: string;
  personContact: string;
  personPhone: string;
  propertyRef: string;
  isTrash: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export interface InvestorEntity {
  id: number;
  name: string;
  fatherCompany: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  cnic: string;
  address: string;
  notes: string;
  isActive: boolean;
  createdAt: number;
}

export interface InvestorTransactionEntity {
  id: number;
  investorId: number;
  type: string; // Investment, Additional Investment, Property Purchase, Sale / Revenue, Profit Received, Loss, Withdrawal, Refund, Expense, Other
  amount: number;
  date: number;
  paymentMethod: string;
  reference: string;
  propertyId?: number | null;
  description: string;
  attachmentUri?: string;
  voiceNoteUri?: string;
  createdAt: number;
  isDeleted: boolean;
}

export interface PropertyInvestorEntity {
  id: number;
  propertyId: number;
  investorId: number;
  investmentAmount: number;
  investmentPercentage: number;
  profitSharePercentage: number;
  lossSharePercentage: number;
  profitAmount: number;
  lossAmount: number;
  createdAt: number;
}

export interface DropdownOptionEntity {
  id: number;
  category: string;
  optionValue: string;
  parentCategory?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  colorCode?: string | null;
}

export interface SmartShareConfigEntity {
  id: number;
  moduleName: string;
  selectedFields: string[];
  companyName: string;
  agentName: string;
  contactNumber: string;
  showLogo: boolean;
  showWatermark: boolean;
  includeBranding: boolean;
  lastFormat: string;
  updatedAt: number;
}

export const CRM_PERMISSIONS = [
  { key: 'view_properties', label: 'View Properties', category: 'Properties', description: 'View property listings and details' },
  { key: 'add_property', label: 'Add Property', category: 'Properties', description: 'Create new property records' },
  { key: 'edit_property', label: 'Edit Property', category: 'Properties', description: 'Modify property details, pricing, and media' },
  { key: 'delete_property', label: 'Delete Property', category: 'Properties', description: 'Delete properties or move to recycle bin' },
  { key: 'view_accounts', label: 'View Accounts & Khata', category: 'Accounts', description: 'Access financial ledger and transaction history' },
  { key: 'add_transaction', label: 'Add Transaction', category: 'Accounts', description: 'Record new financial income and expense entries' },
  { key: 'edit_transaction', label: 'Edit Transaction', category: 'Accounts', description: 'Update existing financial transactions' },
  { key: 'delete_transaction', label: 'Delete Transaction', category: 'Accounts', description: 'Delete transactions or move to trash' },
  { key: 'view_reports', label: 'View Reports', category: 'Reports', description: 'Access financial and analytics reports' },
  { key: 'manage_users', label: 'Manage Users', category: 'Administration', description: 'Create, edit, activate/deactivate users and assign permissions' },
  { key: 'manage_settings', label: 'Manage Settings', category: 'System', description: 'Configure CRM preferences and universal dropdowns' },
  { key: 'backup_restore', label: 'Backup & Restore', category: 'System', description: 'Export or restore database backups' },
  { key: 'smart_share', label: 'Smart Share', category: 'Sharing', description: 'Export and share marketing cards and brochures' },
  { key: 'view_notes', label: 'View Notes', category: 'Notes & Reminders', description: 'Access client and property notes' },
  { key: 'add_notes', label: 'Add Notes', category: 'Notes & Reminders', description: 'Create new client or property notes' },
  { key: 'edit_notes', label: 'Edit Notes', category: 'Notes & Reminders', description: 'Update existing notes' },
  { key: 'delete_notes', label: 'Delete Notes', category: 'Notes & Reminders', description: 'Delete notes' },
  { key: 'view_dues', label: 'View Dues & Installments', category: 'Dues & Installments', description: 'View receivables, payables, and installment schedules' },
  { key: 'manage_dues', label: 'Manage Dues & Installments', category: 'Dues & Installments', description: 'Add or update installment statuses and dues' },
  { key: 'view_investors', label: 'View Investors', category: 'Investors', description: 'View investors ledger and shares' },
  { key: 'manage_investors', label: 'Manage Investors', category: 'Investors', description: 'Record investor deposits, withdrawals, and profit shares' },
] as const;

export type PermissionKey = typeof CRM_PERMISSIONS[number]['key'];

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user';

export type PackageValidity = 'Weekly' | 'Monthly' | '3-Month' | '6-Month' | 'Annual';

export interface SubscriptionPackageEntity {
  id: number;
  name: string;
  validity: PackageValidity;
  validityDays: number;
  totalPrice: number;
  discountPercentage: number;
  finalPrice: number;
  totalSavings: number;
  description?: string;
  features?: string[];
  isActive: boolean;
  isPopular?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type AnnouncementTargetType = 'all' | 'packages' | 'users';
export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface AnnouncementEntity {
  id: number;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  targetType: AnnouncementTargetType;
  targetPackageIds: number[];
  targetUserIds: number[];
  isActive: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  status: 'active' | 'inactive';
  permissions: string[];
  passwordHash: string;
  passwordSalt: string;
  packageId?: number | null;
  packageName?: string;
  startDate: number;
  expiryDate: number;
  timePeriod: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface ActivityLogEntity {
  id: number;
  user: string;
  action: string;
  targetModule: string;
  details: string;
  timestamp: number;
}

export interface TrashItemEntity {
  id: number;
  originalRecordId: number;
  recordTitle: string;
  moduleName: 'Properties' | 'Transactions' | 'Clients' | 'Leads' | 'Dropdown Options' | 'Users' | 'Investors';
  recordSummary: string;
  rawJsonData: string;
  deletedBy: string;
  deletedAt: number;
}

export interface AppSettings {
  agencyName: string;
  agencyTagline: string;
  agencyPhone: string;
  agencyWhatsApp: string;
  agencyEmail: string;
  agencyAddress: string;
  agencyLogoUri: string;
  currencyPrefix: string;
  numberFormatWords: boolean; // Show Crore/Lakh
  themeMode: 'light' | 'dark' | 'system';
  biometricLockEnabled: boolean;
  pinLockCode: string;
  inactivityTimeoutMinutes: number;
}

export type CrmScreen = 
  | 'DASHBOARD'
  | 'SUPER_ADMIN_DASHBOARD'
  | 'PROPERTIES'
  | 'ADD_EDIT_PROPERTY'
  | 'PROPERTY_DETAIL'
  | 'CLIENTS_LEADS'
  | 'ACCOUNTS_KHATA'
  | 'INVESTORS'
  | 'INVESTOR_DETAIL'
  | 'SMART_SHARE_EXPORT'
  | 'DROPDOWN_MGMT'
  | 'USER_ADMIN'
  | 'RECYCLE_BIN'
  | 'SETTINGS';
