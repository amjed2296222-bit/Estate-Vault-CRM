import { PropertyEntity, SmartShareConfigEntity } from '../types/crm';
import { formatAmountWithWords } from './amountFormat';
import { getFullAddress, getSelectedPlotFeatures } from './aiHelper';

export interface ShareableColumn {
  id: string;
  label: string;
  isSelected: boolean;
}

export const DEFAULT_SHAREABLE_COLUMNS: ShareableColumn[] = [
  { id: 'propertyId', label: 'Property ID', isSelected: true },
  { id: 'category', label: 'Property Category', isSelected: true },
  { id: 'society', label: 'Society', isSelected: true },
  { id: 'block', label: 'Block', isSelected: true },
  { id: 'streetNumber', label: 'Street Number', isSelected: true },
  { id: 'plotNumber', label: 'Plot Number', isSelected: true },
  { id: 'size', label: 'Size', isSelected: true },
  { id: 'demandPrice', label: 'Demand Price', isSelected: true },
  { id: 'propertyType', label: 'Property Type', isSelected: true },
  { id: 'rentalUnitType', label: 'Rental Unit Type', isSelected: true },
  { id: 'accommodation', label: 'Accommodation (Beds/Baths)', isSelected: true },
  { id: 'plotFeatures', label: 'Plot Features', isSelected: true },
  { id: 'paidCharges', label: 'Paid Charges', isSelected: true },
  { id: 'remainingCharges', label: 'Remaining Dues', isSelected: true },
  { id: 'description', label: 'Description', isSelected: true },
  { id: 'ownerName', label: 'Owner Name', isSelected: false },
  { id: 'ownerPhone', label: 'Owner Phone', isSelected: false },
  { id: 'dealerName', label: 'Dealer Name', isSelected: true },
  { id: 'dealerPhone', label: 'Dealer Phone', isSelected: true },
  { id: 'status', label: 'Status', isSelected: true },
];

export function generateWhatsAppMessage(
  property: PropertyEntity,
  config: Partial<SmartShareConfigEntity> = {},
  selectedColumns: ShareableColumn[] = DEFAULT_SHAREABLE_COLUMNS
): string {
  const isSelected = (id: string) => selectedColumns.find(c => c.id === id)?.isSelected ?? true;
  const lines: string[] = [];

  const company = config.companyName || 'Estate Vault Real Estate';
  lines.push(`🏡 *${company.toUpperCase()}*`);
  lines.push(`✨ *EXCELLENT PROPERTY FOR ${property.category.toUpperCase()}* ✨\n`);

  if (isSelected('propertyId') && property.propertyId) {
    lines.push(`📌 *Ref ID:* ${property.propertyId}`);
  }
  if (isSelected('category')) {
    lines.push(`🏷️ *Category:* ${property.category}`);
  }
  if (isSelected('propertyType')) {
    lines.push(`🏢 *Type:* ${property.propertyType}`);
  }
  if (isSelected('size') && property.size) {
    lines.push(`📐 *Size:* ${property.size}`);
  }

  const price = property.category === 'Home for Rent' ? property.monthlyRent : property.demandPrice;
  if (isSelected('demandPrice')) {
    lines.push(`💰 *Demand:* ${formatAmountWithWords(price, 'PKR')}`);
  }

  // Address
  const addrParts: string[] = [];
  if (isSelected('plotNumber') && property.propertyNumber) {
    addrParts.push(property.category.includes('Home') ? `House #${property.propertyNumber}` : `Plot #${property.propertyNumber}`);
  }
  if (isSelected('streetNumber') && property.street) addrParts.push(`Street ${property.street}`);
  if (isSelected('block') && property.block) addrParts.push(`Block ${property.block}`);
  if (isSelected('society') && property.society) addrParts.push(property.society);
  if (addrParts.length > 0) {
    lines.push(`📍 *Location:* ${addrParts.join(', ')}`);
  }

  // Accommodation
  if (isSelected('accommodation') && property.category.includes('Home')) {
    const acc: string[] = [];
    if (property.bedrooms) acc.push(`${property.bedrooms} Beds`);
    if (property.bathrooms) acc.push(`${property.bathrooms} Baths`);
    if (property.kitchens) acc.push(`${property.kitchens} Kitchen`);
    if (property.tvLounge) acc.push('TV Lounge');
    if (property.carPorch) acc.push('Car Porch');
    if (acc.length > 0) lines.push(`🛏️ *Details:* ${acc.join(' | ')}`);
  }

  // Plot features
  if (isSelected('plotFeatures')) {
    const features = getSelectedPlotFeatures(property);
    if (features.length > 0) {
      lines.push(`⭐ *Features:* ${features.join(', ')}`);
    }
  }

  // Paid charges
  if (isSelected('paidCharges')) {
    const devPaid: string[] = [];
    if (property.paidLand) devPaid.push('Cost of Land');
    if (property.paidPossession) devPaid.push('Possession');
    if (property.paidDevelopment) devPaid.push('Development');
    if (property.paidCorner) devPaid.push('Corner Extra');

    const utilPaid: string[] = [];
    if (property.paidUtilities) utilPaid.push('Utilities');
    if (property.paidGas) utilPaid.push('Sui Gas');
    if (property.paidWater) utilPaid.push('Water Supply');
    if (property.paidElectricity) utilPaid.push('Electricity');

    if (devPaid.length > 0) {
      lines.push(`✅ *Paid Development Charges:* ${devPaid.join(', ')}`);
    }
    if (utilPaid.length > 0) {
      lines.push(`⚡ *Paid Utilities Charges:* ${utilPaid.join(', ')}`);
    }
  }

  // Remaining dues
  if (isSelected('remainingCharges') && property.remainingCharges && property.remainingCharges.length > 0) {
    const totalRemaining = property.remainingCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
    lines.push(`⚠️ *Remaining Dues:* ${formatAmountWithWords(totalRemaining, 'PKR')}`);
  }

  // Description
  if (isSelected('description') && property.description) {
    lines.push(`\n📝 *Overview:*\n${property.description}`);
  }

  // Contact
  lines.push('\n───────────────────────');
  const agent = config.agentName || property.dealerName || 'Estate Advisor';
  const phone = config.contactNumber || property.dealerPhone || '';
  lines.push(`📞 *For Inspection & Booking:*`);
  lines.push(`👤 *Contact:* ${agent}`);
  if (phone) lines.push(`📱 *Call/WhatsApp:* ${phone}`);
  if (config.showWatermark) lines.push(`🔒 *Powered by Estate Vault CRM*`);

  return lines.join('\n');
}
