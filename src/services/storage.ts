import {
  PropertyEntity,
  ClientEntity,
  LeadEntity,
  AccountTransactionEntity,
  InvestorEntity,
  InvestorTransactionEntity,
  PropertyInvestorEntity,
  DropdownOptionEntity,
  SmartShareConfigEntity,
  UserEntity,
  ActivityLogEntity,
  TrashItemEntity,
  AppSettings,
  CRM_PERMISSIONS,
  SubscriptionPackageEntity,
  AnnouncementEntity,
} from '../types/crm';

const STORAGE_KEYS = {
  PROPERTIES: 'estatevault_properties',
  CLIENTS: 'estatevault_clients',
  LEADS: 'estatevault_leads',
  TRANSACTIONS: 'estatevault_transactions',
  INVESTORS: 'estatevault_investors',
  INVESTOR_TRANSACTIONS: 'estatevault_investor_transactions',
  PROPERTY_INVESTORS: 'estatevault_property_investors',
  DROPDOWNS: 'estatevault_dropdowns',
  SMART_SHARE_CONFIG: 'estatevault_smart_share_config',
  USERS: 'estatevault_users',
  PACKAGES: 'estatevault_packages',
  ANNOUNCEMENTS: 'estatevault_announcements',
  ACTIVITY_LOGS: 'estatevault_activity_logs',
  TRASH: 'estatevault_trash',
  SETTINGS: 'estatevault_settings',
  CURRENT_USER_ID: 'estatevault_current_user_id',
  IS_INITIALIZED: 'estatevault_initialized_v2',
};

// Default initial dropdown options
const DEFAULT_DROPDOWNS: Omit<DropdownOptionEntity, 'id'>[] = [
  // Societies
  { category: 'Society', optionValue: 'DHA Phase 1', isEnabled: true, sortOrder: 0 },
  { category: 'Society', optionValue: 'DHA Phase 2', isEnabled: true, sortOrder: 1 },
  { category: 'Society', optionValue: 'DHA Phase 3', isEnabled: true, sortOrder: 2 },
  { category: 'Society', optionValue: 'DHA Phase 4', isEnabled: true, sortOrder: 3 },
  { category: 'Society', optionValue: 'DHA Phase 5', isEnabled: true, sortOrder: 4 },
  { category: 'Society', optionValue: 'DHA Phase 6', isEnabled: true, sortOrder: 5 },
  { category: 'Society', optionValue: 'DHA Phase 7', isEnabled: true, sortOrder: 6 },
  { category: 'Society', optionValue: 'DHA Phase 8', isEnabled: true, sortOrder: 7 },
  { category: 'Society', optionValue: 'DHA Phase 9 Prism', isEnabled: true, sortOrder: 8 },
  { category: 'Society', optionValue: 'Bahria Town', isEnabled: true, sortOrder: 9 },
  { category: 'Society', optionValue: 'Gulberg Greens', isEnabled: true, sortOrder: 10 },
  { category: 'Society', optionValue: 'Lake City', isEnabled: true, sortOrder: 11 },
  { category: 'Society', optionValue: 'Park View City', isEnabled: true, sortOrder: 12 },
  { category: 'Society', optionValue: 'Johar Town', isEnabled: true, sortOrder: 13 },

  // Blocks
  { category: 'Block', optionValue: 'Block A', isEnabled: true, sortOrder: 0 },
  { category: 'Block', optionValue: 'Block B', isEnabled: true, sortOrder: 1 },
  { category: 'Block', optionValue: 'Block C', isEnabled: true, sortOrder: 2 },
  { category: 'Block', optionValue: 'Block D', isEnabled: true, sortOrder: 3 },
  { category: 'Block', optionValue: 'Block E', isEnabled: true, sortOrder: 4 },
  { category: 'Block', optionValue: 'Sector A', isEnabled: true, sortOrder: 5 },
  { category: 'Block', optionValue: 'Sector B', isEnabled: true, sortOrder: 6 },
  { category: 'Block', optionValue: 'Phase 1', isEnabled: true, sortOrder: 7 },

  // Property Types
  { category: 'PropertyType', optionValue: 'Residential Plot', isEnabled: true, sortOrder: 0 },
  { category: 'PropertyType', optionValue: 'Commercial Plot', isEnabled: true, sortOrder: 1 },
  { category: 'PropertyType', optionValue: 'House / Villa', isEnabled: true, sortOrder: 2 },
  { category: 'PropertyType', optionValue: 'Apartment / Flat', isEnabled: true, sortOrder: 3 },
  { category: 'PropertyType', optionValue: 'Penthouse', isEnabled: true, sortOrder: 4 },
  { category: 'PropertyType', optionValue: 'Shop / Commercial Unit', isEnabled: true, sortOrder: 5 },
  { category: 'PropertyType', optionValue: 'Office Floor', isEnabled: true, sortOrder: 6 },
  { category: 'PropertyType', optionValue: 'Farmhouse', isEnabled: true, sortOrder: 7 },

  // Sizes
  { category: 'Size', optionValue: '3 Marla', isEnabled: true, sortOrder: 0 },
  { category: 'Size', optionValue: '5 Marla', isEnabled: true, sortOrder: 1 },
  { category: 'Size', optionValue: '7 Marla', isEnabled: true, sortOrder: 2 },
  { category: 'Size', optionValue: '8 Marla', isEnabled: true, sortOrder: 3 },
  { category: 'Size', optionValue: '10 Marla', isEnabled: true, sortOrder: 4 },
  { category: 'Size', optionValue: '1 Kanal', isEnabled: true, sortOrder: 5 },
  { category: 'Size', optionValue: '2 Kanal', isEnabled: true, sortOrder: 6 },
  { category: 'Size', optionValue: '4 Kanal', isEnabled: true, sortOrder: 7 },
  { category: 'Size', optionValue: '120 Sq Yd', isEnabled: true, sortOrder: 8 },
  { category: 'Size', optionValue: '240 Sq Yd', isEnabled: true, sortOrder: 9 },

  // Rental Unit Types
  { category: 'RentalUnitType', optionValue: 'Full House', isEnabled: true, sortOrder: 0 },
  { category: 'RentalUnitType', optionValue: 'Ground Portion', isEnabled: true, sortOrder: 1 },
  { category: 'RentalUnitType', optionValue: 'Upper Portion', isEnabled: true, sortOrder: 2 },
  { category: 'RentalUnitType', optionValue: 'Basement', isEnabled: true, sortOrder: 3 },
  { category: 'RentalUnitType', optionValue: 'Studio Apartment', isEnabled: true, sortOrder: 4 },
  { category: 'RentalUnitType', optionValue: '2 Bed Flat', isEnabled: true, sortOrder: 5 },
  { category: 'RentalUnitType', optionValue: '3 Bed Flat', isEnabled: true, sortOrder: 6 },

  // Lead Sources
  { category: 'LeadSource', optionValue: 'Direct Call', isEnabled: true, sortOrder: 0 },
  { category: 'LeadSource', optionValue: 'WhatsApp Inquiry', isEnabled: true, sortOrder: 1 },
  { category: 'LeadSource', optionValue: 'Facebook Ads', isEnabled: true, sortOrder: 2 },
  { category: 'LeadSource', optionValue: 'Walk-in Client', isEnabled: true, sortOrder: 3 },
  { category: 'LeadSource', optionValue: 'Client Referral', isEnabled: true, sortOrder: 4 },
  { category: 'LeadSource', optionValue: 'Website / Portal', isEnabled: true, sortOrder: 5 },

  // Lead Statuses
  { category: 'LeadStatus', optionValue: 'New', isEnabled: true, sortOrder: 0 },
  { category: 'LeadStatus', optionValue: 'Contacted', isEnabled: true, sortOrder: 1 },
  { category: 'LeadStatus', optionValue: 'Visit Scheduled', isEnabled: true, sortOrder: 2 },
  { category: 'LeadStatus', optionValue: 'Negotiation', isEnabled: true, sortOrder: 3 },
  { category: 'LeadStatus', optionValue: 'Closed Won', isEnabled: true, sortOrder: 4 },
  { category: 'LeadStatus', optionValue: 'Lost / Dropped', isEnabled: true, sortOrder: 5 },

  // Client Statuses
  { category: 'ClientStatus', optionValue: 'Active', isEnabled: true, sortOrder: 0 },
  { category: 'ClientStatus', optionValue: 'Follow-up Needed', isEnabled: true, sortOrder: 1 },
  { category: 'ClientStatus', optionValue: 'Deal Finalized', isEnabled: true, sortOrder: 2 },
  { category: 'ClientStatus', optionValue: 'Inactive', isEnabled: true, sortOrder: 3 },

  // Payment Methods
  { category: 'PaymentMethod', optionValue: 'Cash', isEnabled: true, sortOrder: 0 },
  { category: 'PaymentMethod', optionValue: 'Bank Transfer', isEnabled: true, sortOrder: 1 },
  { category: 'PaymentMethod', optionValue: 'Cheque', isEnabled: true, sortOrder: 2 },
  { category: 'PaymentMethod', optionValue: 'Online Deposit', isEnabled: true, sortOrder: 3 },
  { category: 'PaymentMethod', optionValue: 'Pay Order', isEnabled: true, sortOrder: 4 },

  // Transaction Categories
  { category: 'TransactionCategory', optionValue: 'Token Money', isEnabled: true, sortOrder: 0 },
  { category: 'TransactionCategory', optionValue: 'Advance Payment', isEnabled: true, sortOrder: 1 },
  { category: 'TransactionCategory', optionValue: 'Final Settlement', isEnabled: true, sortOrder: 2 },
  { category: 'TransactionCategory', optionValue: 'Agency Commission', isEnabled: true, sortOrder: 3 },
  { category: 'TransactionCategory', optionValue: 'Rental Income', isEnabled: true, sortOrder: 4 },
  { category: 'TransactionCategory', optionValue: 'Office Rent & Bills', isEnabled: true, sortOrder: 5 },
  { category: 'TransactionCategory', optionValue: 'Staff Salary', isEnabled: true, sortOrder: 6 },
  { category: 'TransactionCategory', optionValue: 'Marketing & Promotion', isEnabled: true, sortOrder: 7 },
  { category: 'TransactionCategory', optionValue: 'Legal & Transfer Fees', isEnabled: true, sortOrder: 8 },
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  agencyName: 'Estate Vault Prime Real Estate',
  agencyTagline: 'Professional Property Advisory & Financial Operating System',
  agencyPhone: '',
  agencyWhatsApp: '',
  agencyEmail: '',
  agencyAddress: '',
  agencyLogoUri: '/estate_vault_icon.png',
  currencyPrefix: 'PKR',
  numberFormatWords: true,
  themeMode: 'light',
  biometricLockEnabled: false,
  pinLockCode: '',
  inactivityTimeoutMinutes: 30,
};

// Realistic Seed Properties
// Seed Clients
// Seed Leads
// Seed Account Transactions
// Seed Investors
// Seed Investor Transactions
// Seed Activity Logs
// Seed Subscription Packages (Weekly, Monthly, 3-Month, 6-Month, Annual)
const SEED_PACKAGES: SubscriptionPackageEntity[] = [
  {
    id: 1,
    name: 'Starter Weekly Access',
    validity: 'Weekly',
    validityDays: 7,
    totalPrice: 2500,
    discountPercentage: 10,
    finalPrice: 2250,
    totalSavings: 250,
    description: 'Ideal for short-term trial or single campaign realtors',
    features: ['Full Property Inventory Access', 'WhatsApp Smart Share Cards', 'Clients & Leads Pipeline'],
    isActive: true,
    isPopular: false,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 2,
    name: 'Professional Monthly Plan',
    validity: 'Monthly',
    validityDays: 30,
    totalPrice: 8000,
    discountPercentage: 15,
    finalPrice: 6800,
    totalSavings: 1200,
    description: 'Complete CRM access for active real estate advisors and dealers',
    features: ['Unlimited Property Listings', 'Khata & Accounts Ledger', 'Smart Share Brochures', 'Lead Kanban Pipeline'],
    isActive: true,
    isPopular: false,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 3,
    name: 'Growth Quarterly (3-Month)',
    validity: '3-Month',
    validityDays: 90,
    totalPrice: 24000,
    discountPercentage: 20,
    finalPrice: 19200,
    totalSavings: 4800,
    description: 'Quarterly agency package with Investor Ledger and team collaboration',
    features: ['All Monthly Features', 'Investors Portfolio & ROI', 'Priority Support', 'Custom Branding'],
    isActive: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 4,
    name: 'Business Semi-Annual (6-Month)',
    validity: '6-Month',
    validityDays: 180,
    totalPrice: 48000,
    discountPercentage: 25,
    finalPrice: 36000,
    totalSavings: 12000,
    description: 'Half-yearly enterprise suite for established real estate agencies',
    features: ['Full Multi-Module Access', 'Unlimited Investor Ledgers', 'Full Offline Backup & Restore', 'Audit Logs'],
    isActive: true,
    isPopular: false,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 5,
    name: 'Enterprise Annual Vault',
    validity: 'Annual',
    validityDays: 365,
    totalPrice: 96000,
    discountPercentage: 35,
    finalPrice: 62400,
    totalSavings: 33600,
    description: 'Maximum annual value with 35% discount for premier real estate firms',
    features: ['All Enterprise Capabilities', '365 Days Full License', 'VIP Onboarding & Support', 'Maximum Annual Savings'],
    isActive: true,
    isPopular: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
  },
];

// Seed Announcements
const SEED_ANNOUNCEMENTS: AnnouncementEntity[] = [
  {
    id: 1,
    title: 'Welcome to Estate Vault CRM v2.0 Enterprise Suite',
    message: 'New subscription packages (Weekly, Monthly, 3-Month, 6-Month, and Annual) and direct mobile Contact Picker integration are now live across all modules.',
    priority: 'important',
    targetType: 'all',
    targetPackageIds: [],
    targetUserIds: [],
    isActive: true,
    createdBy: 'Super Admin',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 2,
    title: 'Special 35% Discount on Annual Enterprise Subscriptions',
    message: 'Upgrade to the Enterprise Annual Vault package this month and save PKR 33,600 on your agency license.',
    priority: 'normal',
    targetType: 'packages',
    targetPackageIds: [1, 2, 3],
    targetUserIds: [],
    isActive: true,
    createdBy: 'Super Admin',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('estatevault_db_change', { detail: { key } }));
      }
    } catch (err) {
      console.error(`Storage error writing to ${key}:`, err);
    }
  }

  public initialize(): void {
    const isInit = localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED);
    if (!isInit) {
      this.resetToDefaults();
    } else {
      // Ensure packages and announcements are seeded if upgrading from an earlier session
      if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
        this.set(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
        this.set(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
      }
      this.syncDatabaseValuesToDropdowns();
    }
  }

  public syncDatabaseValuesToDropdowns(): void {
    const allDropdowns = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    const properties = this.get<PropertyEntity[]>(STORAGE_KEYS.PROPERTIES, []);
    const transactions = this.get<AccountTransactionEntity[]>(STORAGE_KEYS.TRANSACTIONS, []);

    let nextId = allDropdowns.length > 0 ? Math.max(...allDropdowns.map(d => d.id)) + 1 : 1;
    let changed = false;

    const ensureOption = (category: string, val?: string) => {
      const trimmed = (val || '').trim();
      if (!trimmed) return;
      const exists = allDropdowns.some(
        d => d.category.toLowerCase() === category.toLowerCase() &&
             d.optionValue.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (!exists) {
        const catCount = allDropdowns.filter(d => d.category.toLowerCase() === category.toLowerCase()).length;
        allDropdowns.push({
          id: nextId++,
          category,
          optionValue: trimmed,
          isEnabled: true,
          sortOrder: catCount,
        });
        changed = true;
      }
    };

    properties.forEach(p => {
      ensureOption('Society', p.society);
      ensureOption('Block', p.block);
      ensureOption('Size', p.size);
    });

    transactions.forEach(t => {
      ensureOption('Society', t.society);
    });

    if (changed) {
      this.set(STORAGE_KEYS.DROPDOWNS, allDropdowns);
    }
  }

  public resetToDefaults(): void {
    // Dropdowns
    const dropdownsWithIds = DEFAULT_DROPDOWNS.map((d, i) => ({
      ...d,
      id: i + 1,
    }));
    this.set(STORAGE_KEYS.DROPDOWNS, dropdownsWithIds);

    // Settings
    this.set(STORAGE_KEYS.SETTINGS, DEFAULT_APP_SETTINGS);

    this.set(STORAGE_KEYS.USERS, []);

    // Seed Properties, Clients, Leads, Accounts, Investors, Packages, Announcements, Logs
    this.set(STORAGE_KEYS.PROPERTIES, []);
    this.set(STORAGE_KEYS.CLIENTS, []);
    this.set(STORAGE_KEYS.LEADS, []);
    this.set(STORAGE_KEYS.TRANSACTIONS, []);
    this.set(STORAGE_KEYS.INVESTORS, []);
    this.set(STORAGE_KEYS.INVESTOR_TRANSACTIONS, []);
    this.set(STORAGE_KEYS.PROPERTY_INVESTORS, []);
    this.set(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
    this.set(STORAGE_KEYS.ACTIVITY_LOGS, []);
    this.set(STORAGE_KEYS.TRASH, []);

    // Smart Share Config
    const smartShareConfig: SmartShareConfigEntity = {
      id: 1,
      moduleName: 'Property',
      selectedFields: [
        'propertyId', 'category', 'society', 'block', 'streetNumber', 'plotNumber',
        'size', 'demandPrice', 'propertyType', 'plotFeatures', 'paidCharges',
        'remainingCharges', 'dealerName', 'dealerPhone', 'status',
      ],
      companyName: 'Estate Vault Prime Real Estate',
      agentName: '',
      contactNumber: '',
      showLogo: true,
      showWatermark: true,
      includeBranding: true,
      lastFormat: 'Card',
      updatedAt: Date.now(),
    };
    this.set(STORAGE_KEYS.SMART_SHARE_CONFIG, smartShareConfig);

    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
  }

  // --- PROPERTIES ---
  public getProperties(): PropertyEntity[] {
    return this.get<PropertyEntity[]>(STORAGE_KEYS.PROPERTIES, []);
  }

  public saveProperty(property: Omit<PropertyEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): PropertyEntity {
    const properties = this.getProperties();
    let saved: PropertyEntity;
    const now = Date.now();

    if (property.id && property.id > 0) {
      const idx = properties.findIndex(p => p.id === property.id);
      if (idx >= 0) {
        saved = {
          ...properties[idx],
          ...property,
          updatedAt: now,
        };
        properties[idx] = saved;
        this.logActivity(currentUser, 'Updated Property', 'Properties', `Modified ${saved.propertyId || saved.society}`);
      } else {
        const id = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
        saved = { ...property, id, createdAt: now, updatedAt: now } as PropertyEntity;
        properties.unshift(saved);
        this.logActivity(currentUser, 'Created Property', 'Properties', `Added ${saved.propertyId || saved.society}`);
      }
    } else {
      const id = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
      const pid = property.propertyId || `EV-${String(id).padStart(4, '0')}`;
      saved = {
        ...property,
        id,
        propertyId: pid,
        createdAt: now,
        updatedAt: now,
        createdBy: currentUser,
      } as PropertyEntity;
      properties.unshift(saved);
      this.logActivity(currentUser, 'Created Property', 'Properties', `Added ${saved.propertyId} in ${saved.society}`);
    }

    this.set(STORAGE_KEYS.PROPERTIES, properties);
    return saved;
  }

  public deleteProperty(id: number, currentUser: string = 'Super Admin'): void {
    const properties = this.getProperties();
    const item = properties.find(p => p.id === id);
    if (!item) return;

    // Move to Trash
    this.addToTrash({
      originalRecordId: item.id,
      recordTitle: `${item.category} - ${item.size} (${item.society})`,
      moduleName: 'Properties',
      recordSummary: `Demand: PKR ${item.demandPrice} | Owner: ${item.ownerName}`,
      rawJsonData: JSON.stringify(item),
      deletedBy: currentUser,
      deletedAt: Date.now(),
    });

    const updated = properties.filter(p => p.id !== id);
    this.set(STORAGE_KEYS.PROPERTIES, updated);
    this.logActivity(currentUser, 'Moved to Trash', 'Properties', `Deleted property #${id}`);
  }

  public toggleFavorite(id: number): void {
    const properties = this.getProperties();
    const idx = properties.findIndex(p => p.id === id);
    if (idx >= 0) {
      properties[idx].isFavorite = !properties[idx].isFavorite;
      this.set(STORAGE_KEYS.PROPERTIES, properties);
    }
  }

  // --- CLIENTS ---
  public getClients(): ClientEntity[] {
    return this.get<ClientEntity[]>(STORAGE_KEYS.CLIENTS, []);
  }

  public saveClient(client: Omit<ClientEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): ClientEntity {
    const clients = this.getClients();
    let saved: ClientEntity;
    const now = Date.now();

    if (client.id && client.id > 0) {
      const idx = clients.findIndex(c => c.id === client.id);
      if (idx >= 0) {
        saved = { ...clients[idx], ...client };
        clients[idx] = saved;
        this.logActivity(currentUser, 'Updated Contact', 'Clients', `Updated ${saved.name}`);
      } else {
        const id = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
        saved = { ...client, id, createdAt: now } as ClientEntity;
        clients.unshift(saved);
        this.logActivity(currentUser, 'Created Contact', 'Clients', `Added ${saved.name}`);
      }
    } else {
      const id = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
      saved = { ...client, id, createdAt: now } as ClientEntity;
      clients.unshift(saved);
      this.logActivity(currentUser, 'Created Contact', 'Clients', `Added ${saved.name}`);
    }

    this.set(STORAGE_KEYS.CLIENTS, clients);
    return saved;
  }

  public deleteClient(id: number, currentUser: string = 'Super Admin'): void {
    const clients = this.getClients();
    const item = clients.find(c => c.id === id);
    if (!item) return;

    this.addToTrash({
      originalRecordId: item.id,
      recordTitle: `${item.name} (${item.type})`,
      moduleName: 'Clients',
      recordSummary: `Phone: ${item.phone} | Khata: PKR ${item.khataBalance}`,
      rawJsonData: JSON.stringify(item),
      deletedBy: currentUser,
      deletedAt: Date.now(),
    });

    this.set(STORAGE_KEYS.CLIENTS, clients.filter(c => c.id !== id));
    this.logActivity(currentUser, 'Moved to Trash', 'Clients', `Deleted client ${item.name}`);
  }

  // --- LEADS ---
  public getLeads(): LeadEntity[] {
    return this.get<LeadEntity[]>(STORAGE_KEYS.LEADS, []);
  }

  public saveLead(lead: Omit<LeadEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): LeadEntity {
    const leads = this.getLeads();
    let saved: LeadEntity;
    const now = Date.now();

    if (lead.id && lead.id > 0) {
      const idx = leads.findIndex(l => l.id === lead.id);
      if (idx >= 0) {
        saved = { ...leads[idx], ...lead };
        leads[idx] = saved;
        this.logActivity(currentUser, 'Updated Lead', 'Leads', `Updated ${saved.clientName}`);
      } else {
        const id = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
        saved = { ...lead, id, createdAt: now } as LeadEntity;
        leads.unshift(saved);
        this.logActivity(currentUser, 'Created Lead', 'Leads', `Added ${saved.clientName}`);
      }
    } else {
      const id = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
      saved = { ...lead, id, createdAt: now } as LeadEntity;
      leads.unshift(saved);
      this.logActivity(currentUser, 'Created Lead', 'Leads', `Added ${saved.clientName}`);
    }

    this.set(STORAGE_KEYS.LEADS, leads);
    return saved;
  }

  public deleteLead(id: number, currentUser: string = 'Super Admin'): void {
    const leads = this.getLeads();
    const item = leads.find(l => l.id === id);
    if (!item) return;

    this.addToTrash({
      originalRecordId: item.id,
      recordTitle: `${item.clientName} (${item.status})`,
      moduleName: 'Leads',
      recordSummary: `Budget: PKR ${item.maxBudget} | Location: ${item.preferredLocation}`,
      rawJsonData: JSON.stringify(item),
      deletedBy: currentUser,
      deletedAt: Date.now(),
    });

    this.set(STORAGE_KEYS.LEADS, leads.filter(l => l.id !== id));
    this.logActivity(currentUser, 'Moved to Trash', 'Leads', `Deleted lead ${item.clientName}`);
  }

  // --- ACCOUNTS & TRANSACTIONS ---
  public getTransactions(): AccountTransactionEntity[] {
    return this.get<AccountTransactionEntity[]>(STORAGE_KEYS.TRANSACTIONS, []);
  }

  public saveTransaction(tx: Omit<AccountTransactionEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): AccountTransactionEntity {
    const transactions = this.getTransactions();
    let saved: AccountTransactionEntity;
    const now = Date.now();

    if (tx.id && tx.id > 0) {
      const idx = transactions.findIndex(t => t.id === tx.id);
      if (idx >= 0) {
        saved = { ...transactions[idx], ...tx, updatedAt: now };
        transactions[idx] = saved;
        this.logActivity(currentUser, 'Updated Transaction', 'Accounts', `Updated ${saved.title}`);
      } else {
        const id = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        saved = { ...tx, id, createdAt: now, updatedAt: now, createdBy: currentUser } as AccountTransactionEntity;
        transactions.unshift(saved);
        this.logActivity(currentUser, 'Created Transaction', 'Accounts', `Added ${saved.title}`);
      }
    } else {
      const id = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
      saved = { ...tx, id, createdAt: now, updatedAt: now, createdBy: currentUser } as AccountTransactionEntity;
      transactions.unshift(saved);
      this.logActivity(currentUser, 'Recorded Transaction', 'Accounts', `${saved.type}: ${saved.title} (PKR ${saved.amount})`);
    }

    this.set(STORAGE_KEYS.TRANSACTIONS, transactions);
    return saved;
  }

  public deleteTransaction(id: number, currentUser: string = 'Super Admin'): void {
    const transactions = this.getTransactions();
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    this.addToTrash({
      originalRecordId: item.id,
      recordTitle: `${item.type}: ${item.title}`,
      moduleName: 'Transactions',
      recordSummary: `Amount: PKR ${item.amount} | Date: ${new Date(item.date).toLocaleDateString()}`,
      rawJsonData: JSON.stringify(item),
      deletedBy: currentUser,
      deletedAt: Date.now(),
    });

    this.set(STORAGE_KEYS.TRANSACTIONS, transactions.filter(t => t.id !== id));
    this.logActivity(currentUser, 'Moved to Trash', 'Accounts', `Deleted transaction #${id}`);
  }

  // --- INVESTORS ---
  public getInvestors(): InvestorEntity[] {
    return this.get<InvestorEntity[]>(STORAGE_KEYS.INVESTORS, []);
  }

  public saveInvestor(investor: Omit<InvestorEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): InvestorEntity {
    const investors = this.getInvestors();
    let saved: InvestorEntity;
    const now = Date.now();

    if (investor.id && investor.id > 0) {
      const idx = investors.findIndex(i => i.id === investor.id);
      if (idx >= 0) {
        saved = { ...investors[idx], ...investor };
        investors[idx] = saved;
        this.logActivity(currentUser, 'Updated Investor', 'Investors', `Updated ${saved.name}`);
      } else {
        const id = investors.length > 0 ? Math.max(...investors.map(i => i.id)) + 1 : 1;
        saved = { ...investor, id, createdAt: now } as InvestorEntity;
        investors.unshift(saved);
        this.logActivity(currentUser, 'Created Investor', 'Investors', `Added ${saved.name}`);
      }
    } else {
      const id = investors.length > 0 ? Math.max(...investors.map(i => i.id)) + 1 : 1;
      saved = { ...investor, id, createdAt: now } as InvestorEntity;
      investors.unshift(saved);
      this.logActivity(currentUser, 'Created Investor', 'Investors', `Added ${saved.name}`);
    }

    this.set(STORAGE_KEYS.INVESTORS, investors);
    return saved;
  }

  public getInvestorTransactions(investorId?: number): InvestorTransactionEntity[] {
    const all = this.get<InvestorTransactionEntity[]>(STORAGE_KEYS.INVESTOR_TRANSACTIONS, []);
    if (investorId !== undefined) {
      return all.filter(t => t.investorId === investorId && !t.isDeleted);
    }
    return all.filter(t => !t.isDeleted);
  }

  public saveInvestorTransaction(tx: Omit<InvestorTransactionEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): InvestorTransactionEntity {
    const all = this.get<InvestorTransactionEntity[]>(STORAGE_KEYS.INVESTOR_TRANSACTIONS, []);
    let saved: InvestorTransactionEntity;
    const now = Date.now();

    if (tx.id && tx.id > 0) {
      const idx = all.findIndex(t => t.id === tx.id);
      if (idx >= 0) {
        saved = { ...all[idx], ...tx };
        all[idx] = saved;
      } else {
        const id = all.length > 0 ? Math.max(...all.map(t => t.id)) + 1 : 1;
        saved = { ...tx, id, createdAt: now } as InvestorTransactionEntity;
        all.unshift(saved);
      }
    } else {
      const id = all.length > 0 ? Math.max(...all.map(t => t.id)) + 1 : 1;
      saved = { ...tx, id, createdAt: now } as InvestorTransactionEntity;
      all.unshift(saved);
    }

    this.set(STORAGE_KEYS.INVESTOR_TRANSACTIONS, all);
    this.logActivity(currentUser, 'Investor Transaction', 'Investors', `${saved.type}: PKR ${saved.amount} for investor #${saved.investorId}`);
    return saved;
  }

  public deleteInvestorTransaction(id: number): void {
    const all = this.get<InvestorTransactionEntity[]>(STORAGE_KEYS.INVESTOR_TRANSACTIONS, []);
    const idx = all.findIndex(t => t.id === id);
    if (idx >= 0) {
      all[idx].isDeleted = true;
      this.set(STORAGE_KEYS.INVESTOR_TRANSACTIONS, all);
    }
  }

  // --- DROPDOWNS ---
  public getDropdowns(category?: string): DropdownOptionEntity[] {
    const all = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    if (category) {
      return all
        .filter(d => d.category.toLowerCase() === category.toLowerCase() && d.isEnabled)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getAllDropdowns(category?: string): DropdownOptionEntity[] {
    const all = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    if (category) {
      return all
        .filter(d => d.category.toLowerCase() === category.toLowerCase())
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getDropdownCategories(): string[] {
    const all = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    return Array.from(new Set(all.map(d => d.category))).sort();
  }

  public saveDropdownOption(opt: Omit<DropdownOptionEntity, 'id'> & { id?: number }): DropdownOptionEntity {
    const all = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    let saved: DropdownOptionEntity;

    if (opt.id && opt.id > 0) {
      const idx = all.findIndex(d => d.id === opt.id);
      if (idx >= 0) {
        saved = { ...all[idx], ...opt };
        all[idx] = saved;
      } else {
        const id = all.length > 0 ? Math.max(...all.map(d => d.id)) + 1 : 1;
        saved = { ...opt, id } as DropdownOptionEntity;
        all.push(saved);
      }
    } else {
      const id = all.length > 0 ? Math.max(...all.map(d => d.id)) + 1 : 1;
      saved = { ...opt, id } as DropdownOptionEntity;
      all.push(saved);
    }

    this.set(STORAGE_KEYS.DROPDOWNS, all);
    return saved;
  }

  public deleteDropdownOption(id: number): void {
    const all = this.get<DropdownOptionEntity[]>(STORAGE_KEYS.DROPDOWNS, []);
    this.set(STORAGE_KEYS.DROPDOWNS, all.filter(d => d.id !== id));
  }

  // --- USERS & AUTH ---
  public getUsers(): UserEntity[] {
    return this.get<UserEntity[]>(STORAGE_KEYS.USERS, []);
  }

  public createInitialAdmin(details: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): UserEntity {
    if (this.getUsers().length > 0) {
      throw new Error('Admin setup has already been completed.');
    }

    const name = details.name.trim();
    const username = details.username.trim();
    const email = details.email.trim().toLowerCase();
    if (!name || !username || details.password.length < 12) {
      throw new Error('Enter a name, username, and password of at least 12 characters.');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Enter a valid email address or leave it blank.');
    }

    const now = Date.now();
    const admin: UserEntity = {
      id: 1,
      name,
      email,
      username,
      role: 'super_admin',
      phone: '',
      isActive: true,
      status: 'active',
      permissions: CRM_PERMISSIONS.map(permission => permission.key),
      passwordHash: details.password,
      passwordSalt: '',
      packageId: null,
      packageName: '',
      startDate: now,
      expiryDate: 0,
      timePeriod: 'Unlimited',
      createdAt: now,
    };
    this.set(STORAGE_KEYS.USERS, [admin]);
    return admin;
  }

  public saveUser(user: Omit<UserEntity, 'id'> & { id?: number }, currentUser: string = 'Super Admin'): UserEntity {
    const users = this.getUsers();
    let saved: UserEntity;
    const now = Date.now();

    if (user.id && user.id > 0) {
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        saved = { ...users[idx], ...user };
        users[idx] = saved;
        this.logActivity(currentUser, 'Updated User', 'User Management', `Updated profile of ${saved.username}`);
      } else {
        const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        saved = { ...user, id, createdAt: now } as UserEntity;
        users.unshift(saved);
        this.logActivity(currentUser, 'Created User', 'User Management', `Added user ${saved.username}`);
      }
    } else {
      const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      saved = { ...user, id, createdAt: now } as UserEntity;
      users.unshift(saved);
      this.logActivity(currentUser, 'Created User', 'User Management', `Added user ${saved.username}`);
    }

    this.set(STORAGE_KEYS.USERS, users);
    return saved;
  }

  public deleteUser(id: number, currentUser: string = 'Super Admin'): void {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return;
    if (target.role === 'super_admin' && users.filter(u => u.role === 'super_admin').length <= 1) {
      throw new Error('Cannot delete the primary Super Admin account.');
    }
    this.set(STORAGE_KEYS.USERS, users.filter(u => u.id !== id));
    this.logActivity(currentUser, 'Deleted User', 'User Management', `Removed user ${target.username}`);
  }

  public authenticate(identifier: string, password: string): UserEntity | null {
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getUsers();

    const found = users.find(u => 
      (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
      u.passwordHash === password
    );

    if (found && found.isActive) {
      found.lastLoginAt = Date.now();
      this.saveUser(found, found.name);
      return found;
    }

    return null;
  }

  // --- TRASH & RECYCLE BIN ---
  public getTrashItems(): TrashItemEntity[] {
    return this.get<TrashItemEntity[]>(STORAGE_KEYS.TRASH, []);
  }

  public addToTrash(item: Omit<TrashItemEntity, 'id'>): void {
    const trash = this.getTrashItems();
    const id = trash.length > 0 ? Math.max(...trash.map(t => t.id)) + 1 : 1;
    trash.unshift({ ...item, id });
    this.set(STORAGE_KEYS.TRASH, trash);
  }

  public restoreTrashItem(id: number, currentUser: string = 'Super Admin'): void {
    const trash = this.getTrashItems();
    const item = trash.find(t => t.id === id);
    if (!item) return;

    try {
      const parsed = JSON.parse(item.rawJsonData);
      if (item.moduleName === 'Properties') {
        const props = this.getProperties();
        props.unshift(parsed);
        this.set(STORAGE_KEYS.PROPERTIES, props);
      } else if (item.moduleName === 'Clients') {
        const clients = this.getClients();
        clients.unshift(parsed);
        this.set(STORAGE_KEYS.CLIENTS, clients);
      } else if (item.moduleName === 'Leads') {
        const leads = this.getLeads();
        leads.unshift(parsed);
        this.set(STORAGE_KEYS.LEADS, leads);
      } else if (item.moduleName === 'Transactions') {
        const txs = this.getTransactions();
        txs.unshift(parsed);
        this.set(STORAGE_KEYS.TRANSACTIONS, txs);
      }
      this.set(STORAGE_KEYS.TRASH, trash.filter(t => t.id !== id));
      this.logActivity(currentUser, 'Restored Item', 'Recycle Bin', `Restored ${item.recordTitle}`);
    } catch (err) {
      console.error('Error restoring trash item:', err);
    }
  }

  public permanentlyDeleteTrash(id: number, currentUser: string = 'Super Admin'): void {
    const trash = this.getTrashItems();
    this.set(STORAGE_KEYS.TRASH, trash.filter(t => t.id !== id));
    this.logActivity(currentUser, 'Permanently Deleted', 'Recycle Bin', `Wiped item #${id}`);
  }

  public emptyTrash(currentUser: string = 'Super Admin'): void {
    this.set(STORAGE_KEYS.TRASH, []);
    this.logActivity(currentUser, 'Emptied Trash', 'Recycle Bin', 'Permanently cleared all recycled records');
  }

  // --- ACTIVITY LOGS ---
  public getActivityLogs(): ActivityLogEntity[] {
    return this.get<ActivityLogEntity[]>(STORAGE_KEYS.ACTIVITY_LOGS, []);
  }

  public logActivity(user: string, action: string, targetModule: string, details: string): void {
    const logs = this.getActivityLogs();
    const id = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    logs.unshift({ id, user, action, targetModule, details, timestamp: Date.now() });
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.set(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }

  // --- SETTINGS ---
  public getSettings(): AppSettings {
    return this.get<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_APP_SETTINGS);
  }

  public saveSettings(settings: AppSettings, currentUser: string = 'Super Admin'): void {
    this.set(STORAGE_KEYS.SETTINGS, settings);
    this.logActivity(currentUser, 'Updated Settings', 'Settings', 'Saved system preferences');
  }

  // --- SMART SHARE CONFIG ---
  public getSmartShareConfig(): SmartShareConfigEntity {
    return this.get<SmartShareConfigEntity>(STORAGE_KEYS.SMART_SHARE_CONFIG, {
      id: 1,
      moduleName: 'Property',
      selectedFields: [
        'propertyId', 'category', 'society', 'block', 'streetNumber', 'plotNumber',
        'size', 'demandPrice', 'propertyType', 'plotFeatures', 'paidCharges',
        'remainingCharges', 'dealerName', 'dealerPhone', 'status',
      ],
      companyName: 'Estate Vault Prime Real Estate',
      agentName: '',
      contactNumber: '',
      showLogo: true,
      showWatermark: true,
      includeBranding: true,
      lastFormat: 'Card',
      updatedAt: Date.now(),
    });
  }

  public saveSmartShareConfig(config: SmartShareConfigEntity): void {
    this.set(STORAGE_KEYS.SMART_SHARE_CONFIG, config);
  }

  // --- SUBSCRIPTION PACKAGES ---
  public getPackages(): SubscriptionPackageEntity[] {
    return this.get<SubscriptionPackageEntity[]>(STORAGE_KEYS.PACKAGES, SEED_PACKAGES);
  }

  public savePackage(
    pkg: Omit<SubscriptionPackageEntity, 'id'> & { id?: number },
    currentUser: string = 'Super Admin'
  ): SubscriptionPackageEntity {
    const packages = this.getPackages();
    const now = Date.now();
    // Ensure automatic calculation of finalPrice and totalSavings
    const totalPrice = Math.max(0, Number(pkg.totalPrice) || 0);
    const discountPercentage = Math.min(100, Math.max(0, Number(pkg.discountPercentage) || 0));
    const totalSavings = Math.round((totalPrice * discountPercentage) / 100);
    const finalPrice = Math.max(0, totalPrice - totalSavings);

    let saved: SubscriptionPackageEntity;

    if (pkg.id && pkg.id > 0) {
      const idx = packages.findIndex(p => p.id === pkg.id);
      if (idx >= 0) {
        saved = {
          ...packages[idx],
          ...pkg,
          totalPrice,
          discountPercentage,
          finalPrice,
          totalSavings,
          updatedAt: now,
        };
        packages[idx] = saved;
        this.logActivity(currentUser, 'Updated Package', 'Package Management', `Modified ${saved.name} (${saved.validity})`);
      } else {
        const id = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
        saved = {
          ...pkg,
          id,
          totalPrice,
          discountPercentage,
          finalPrice,
          totalSavings,
          createdAt: now,
          updatedAt: now,
        } as SubscriptionPackageEntity;
        packages.push(saved);
        this.logActivity(currentUser, 'Created Package', 'Package Management', `Added ${saved.name} (${saved.validity})`);
      }
    } else {
      const id = packages.length > 0 ? Math.max(...packages.map(p => p.id)) + 1 : 1;
      saved = {
        ...pkg,
        id,
        totalPrice,
        discountPercentage,
        finalPrice,
        totalSavings,
        createdAt: now,
        updatedAt: now,
      } as SubscriptionPackageEntity;
      packages.push(saved);
      this.logActivity(currentUser, 'Created Package', 'Package Management', `Added ${saved.name} (${saved.validity})`);
    }

    this.set(STORAGE_KEYS.PACKAGES, packages);
    return saved;
  }

  public deletePackage(id: number, currentUser: string = 'Super Admin'): void {
    const packages = this.getPackages();
    const target = packages.find(p => p.id === id);
    if (!target) return;
    this.set(STORAGE_KEYS.PACKAGES, packages.filter(p => p.id !== id));
    this.logActivity(currentUser, 'Deleted Package', 'Package Management', `Removed package ${target.name}`);
  }

  // --- ANNOUNCEMENTS ---
  public getAnnouncements(): AnnouncementEntity[] {
    return this.get<AnnouncementEntity[]>(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  }

  public saveAnnouncement(
    ann: Omit<AnnouncementEntity, 'id'> & { id?: number },
    currentUser: string = 'Super Admin'
  ): AnnouncementEntity {
    const announcements = this.getAnnouncements();
    const now = Date.now();
    let saved: AnnouncementEntity;

    if (ann.id && ann.id > 0) {
      const idx = announcements.findIndex(a => a.id === ann.id);
      if (idx >= 0) {
        saved = {
          ...announcements[idx],
          ...ann,
          updatedAt: now,
        };
        announcements[idx] = saved;
        this.logActivity(currentUser, 'Updated Announcement', 'Announcements', `Updated "${saved.title}"`);
      } else {
        const id = announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
        saved = {
          ...ann,
          id,
          createdAt: now,
          updatedAt: now,
        } as AnnouncementEntity;
        announcements.unshift(saved);
        this.logActivity(currentUser, 'Published Announcement', 'Announcements', `Published "${saved.title}"`);
      }
    } else {
      const id = announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
      saved = {
        ...ann,
        id,
        createdAt: now,
        updatedAt: now,
      } as AnnouncementEntity;
      announcements.unshift(saved);
      this.logActivity(currentUser, 'Published Announcement', 'Announcements', `Published "${saved.title}"`);
    }

    this.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return saved;
  }

  public deleteAnnouncement(id: number, currentUser: string = 'Super Admin'): void {
    const announcements = this.getAnnouncements();
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, announcements.filter(a => a.id !== id));
    this.logActivity(currentUser, 'Deleted Announcement', 'Announcements', `Removed "${target.title}"`);
  }

  // --- FULL BACKUP & RESTORE ---
  public exportFullBackup(): string {
    const payload = {
      appIdentifier: 'com.estatevault.crm',
      backupVersion: '2.0.0-web',
      createdAt: Date.now(),
      data: {
        properties: this.getProperties(),
        clients: this.getClients(),
        leads: this.getLeads(),
        transactions: this.getTransactions(),
        investors: this.getInvestors(),
        investorTransactions: this.getInvestorTransactions(),
        dropdowns: this.getAllDropdowns(),
        users: this.getUsers(),
        packages: this.getPackages(),
        announcements: this.getAnnouncements(),
        settings: this.getSettings(),
        smartShareConfig: this.getSmartShareConfig(),
      },
    };
    return JSON.stringify(payload, null, 2);
  }

  public restoreBackup(jsonString: string, mode: 'replace' | 'merge', currentUser: string = 'Super Admin'): {
    propertiesRestored: number;
    clientsRestored: number;
    leadsRestored: number;
    transactionsRestored: number;
  } {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;

    if (mode === 'replace') {
      if (data.properties) this.set(STORAGE_KEYS.PROPERTIES, data.properties);
      if (data.clients) this.set(STORAGE_KEYS.CLIENTS, data.clients);
      if (data.leads) this.set(STORAGE_KEYS.LEADS, data.leads);
      if (data.transactions) this.set(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.investors) this.set(STORAGE_KEYS.INVESTORS, data.investors);
      if (data.investorTransactions) this.set(STORAGE_KEYS.INVESTOR_TRANSACTIONS, data.investorTransactions);
      if (data.dropdowns) this.set(STORAGE_KEYS.DROPDOWNS, data.dropdowns);
      if (data.packages) this.set(STORAGE_KEYS.PACKAGES, data.packages);
      if (data.announcements) this.set(STORAGE_KEYS.ANNOUNCEMENTS, data.announcements);
      if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
    } else {
      // Merge
      if (data.properties) {
        const cur = this.getProperties();
        const merged = [...data.properties, ...cur.filter((c: PropertyEntity) => !data.properties.some((p: PropertyEntity) => p.id === c.id))];
        this.set(STORAGE_KEYS.PROPERTIES, merged);
      }
      if (data.clients) {
        const cur = this.getClients();
        const merged = [...data.clients, ...cur.filter((c: ClientEntity) => !data.clients.some((p: ClientEntity) => p.id === c.id))];
        this.set(STORAGE_KEYS.CLIENTS, merged);
      }
      if (data.leads) {
        const cur = this.getLeads();
        const merged = [...data.leads, ...cur.filter((c: LeadEntity) => !data.leads.some((p: LeadEntity) => p.id === c.id))];
        this.set(STORAGE_KEYS.LEADS, merged);
      }
      if (data.transactions) {
        const cur = this.getTransactions();
        const merged = [...data.transactions, ...cur.filter((c: AccountTransactionEntity) => !data.transactions.some((p: AccountTransactionEntity) => p.id === c.id))];
        this.set(STORAGE_KEYS.TRANSACTIONS, merged);
      }
    }

    this.logActivity(currentUser, 'Restored Backup', 'Backup & Restore', `Imported database in ${mode} mode`);

    return {
      propertiesRestored: data.properties?.length || 0,
      clientsRestored: data.clients?.length || 0,
      leadsRestored: data.leads?.length || 0,
      transactionsRestored: data.transactions?.length || 0,
    };
  }
}

export const storageService = new StorageService();
