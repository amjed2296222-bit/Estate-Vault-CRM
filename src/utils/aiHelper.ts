import { PropertyEntity } from '../types/crm';
import { formatAmountWithWords } from './amountFormat';

export function getSelectedPlotFeatures(property: PropertyEntity): string[] {
  const features: string[] = [];
  if (property.isCornerPlot) features.push('Corner');
  if (property.isParkFacing) features.push('Park Facing');
  if (property.isMainBoulevard) features.push('Main Boulevard');
  if (property.isDisputed) features.push('Disputed');
  if (property.isFile) features.push('File');
  if (property.isBalloted) features.push('Balloted');
  if (property.hasSewerage) features.push('Sewerage Available');
  if (property.hasElectricity) features.push('Electricity Connected');
  if (property.hasWaterSupply) features.push('Water Supply Available');
  if (property.hasBoundaryWall) features.push('Boundary Wall');
  if (property.hasPossession) features.push('Possession Ready');
  if (property.isReadyForConstruction) features.push('Ready For Construction');
  if (property.hasCarpetedStreet) features.push('Carpeted Wide Street');
  if (property.hasGas) features.push('Sui Gas Available');
  if (property.otherFeatures) {
    property.otherFeatures.split(',').forEach(f => {
      const trimmed = f.trim();
      if (trimmed) features.push(trimmed);
    });
  }
  return Array.from(new Set(features));
}

export function getSelectedPaidDevelopmentCharges(property: PropertyEntity): string[] {
  const list: string[] = [];
  if (property.paidLand) list.push('Cost of Land Paid');
  if (property.paidPossession) list.push('Possession Charges Paid');
  if (property.paidDevelopment) list.push('Development Paid');
  if (property.paidCorner) list.push('Corner Extra Paid');
  return list;
}

export function getSelectedPaidUtilityCharges(property: PropertyEntity): string[] {
  const list: string[] = [];
  if (property.paidUtilities) list.push('Utilities Paid');
  if (property.paidGas) list.push('Sui Gas Charges Paid');
  if (property.paidWater) list.push('Water Supply Charges Paid');
  if (property.paidElectricity) list.push('Electricity Charges Paid');
  return list;
}

export function getSelectedPaidCharges(property: PropertyEntity): string[] {
  return [
    ...getSelectedPaidDevelopmentCharges(property),
    ...getSelectedPaidUtilityCharges(property),
  ];
}

export function getFullAddress(property: PropertyEntity): string {
  const parts: string[] = [];
  if (property.propertyNumber) {
    parts.push(property.category.includes('Home') ? `House #${property.propertyNumber}` : `Plot #${property.propertyNumber}`);
  }
  if (property.street) parts.push(`Street ${property.street}`);
  if (property.block) parts.push(`Block ${property.block}`);
  if (property.society) parts.push(property.society);
  return parts.length > 0 ? parts.join(', ') : 'Location Not Specified';
}

export function generateSmartPropertyDescription(property: PropertyEntity): string {
  const features = getSelectedPlotFeatures(property);
  const paidDev = getSelectedPaidDevelopmentCharges(property);
  const paidUtil = getSelectedPaidUtilityCharges(property);

  const loc = property.society || 'a prime, high-demand location';
  const price = property.category === 'Home for Rent' ? property.monthlyRent : property.demandPrice;
  const formattedPrice = formatAmountWithWords(price, 'PKR');

  let text = `Welcome to an exceptional real estate opportunity in ${loc}!\n\n`;

  if (property.category.includes('Home')) {
    const unitType = property.rentalUnitType ? ` (${property.rentalUnitType})` : '';
    text += `This beautifully appointed ${property.size || 'spacious'} ${property.propertyType.toLowerCase()}${unitType} `;
    text += `offers luxurious modern living with ${property.bedrooms || 0} generous bedrooms, `;
    text += `${property.bathrooms || 0} attached bathrooms, designer kitchen, `;
    text += `${property.tvLounge ? 'cozy TV lounge, ' : ''}${property.carPorch ? 'secure car porch, ' : ''}and tranquil surroundings.\n\n`;
  } else {
    text += `Presenting a prime ${property.size || ''} ${property.propertyType.toLowerCase()} located in ${getFullAddress(property)}. `;
    if (property.isCornerPlot) {
      text += 'Being an advantageous corner plot, it enjoys superior natural light, enhanced ventilation, and prominent road visibility. ';
    }
    if (property.isParkFacing) {
      text += 'Directly facing a lush community park, offering unmatched scenic views and green tranquility. ';
    }
    text += 'Ideal for immediate construction of your dream home or a rewarding long-term investment holding.\n\n';
  }

  if (features.length > 0) {
    text += `⭐ Key Highlights & Infrastructure:\n• ${features.join('\n• ')}\n\n`;
  }

  if (paidDev.length > 0 || paidUtil.length > 0) {
    const allPaid = [...paidDev, ...paidUtil];
    text += `✅ Paid Development & Utility Charges:\n• ${allPaid.join('\n• ')}\n\n`;
  }

  text += `Offered at an attractive demand of ${formattedPrice}. `;
  text += 'Complete verified documentation, transparent file record, and direct dealer facilitation available. ';
  text += 'Contact us today to schedule an on-site visit or discuss the best package deal!';

  return text;
}
