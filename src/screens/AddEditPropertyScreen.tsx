import React, { useState, useRef } from 'react';
import {
  Building2,
  Save,
  ArrowLeft,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckSquare,
  Square,
  CheckCheck,
  XSquare,
  MapPin,
  DollarSign,
  User,
  Info,
  HelpCircle,
  X,
  Upload,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PropertyEntity, PropertyCategory, PropertyStatus, RemainingCharge } from '../types/crm';
import { formatAmountWithWords, formatInputWithCommas, parseAmountToNumber, formatCommas } from '../utils/amountFormat';
import { generateSmartPropertyDescription } from '../utils/aiHelper';
import { ContactPickerButton } from '../components/ContactPickerButton';
import { DropdownManagerModal } from '../components/DropdownManagerModal';
import { processMultipleImageFiles } from '../utils/imageUpload';

interface AddEditPropertyScreenProps {
  propertyToEdit?: PropertyEntity | null;
}

export const AddEditPropertyScreen: React.FC<AddEditPropertyScreenProps> = ({ propertyToEdit }) => {
  const { saveProperty, navigateTo, dropdowns, properties, showToast } = useCrm();

  // Basic info
  const [propertyId, setPropertyId] = useState(propertyToEdit?.propertyId || '');
  const [category, setCategory] = useState<PropertyCategory>(propertyToEdit?.category || 'Plot for Sale');
  const [propertyType, setPropertyType] = useState(propertyToEdit?.propertyType || 'Residential Plot');
  const [status, setStatus] = useState<PropertyStatus>(propertyToEdit?.status || 'Available');

  // Address
  const [society, setSociety] = useState(propertyToEdit?.society || '');
  const [block, setBlock] = useState(propertyToEdit?.block || '');
  const [street, setStreet] = useState(propertyToEdit?.street || '');
  const [propertyNumber, setPropertyNumber] = useState(propertyToEdit?.propertyNumber || '');
  const [size, setSize] = useState(propertyToEdit?.size || '1 Kanal');
  const [locationUrl, setLocationUrl] = useState(propertyToEdit?.locationUrl || '');

  // Pricing
  const [demandPrice, setDemandPrice] = useState(propertyToEdit ? String(propertyToEdit.demandPrice) : '');
  const [purchasePrice, setPurchasePrice] = useState(propertyToEdit ? String(propertyToEdit.purchasePrice) : '');
  const [monthlyRent, setMonthlyRent] = useState(propertyToEdit ? String(propertyToEdit.monthlyRent) : '');
  const [estimatedValue, setEstimatedValue] = useState(propertyToEdit ? String(propertyToEdit.estimatedValue) : '');

  // Home specifics
  const [rentalUnitType, setRentalUnitType] = useState(propertyToEdit?.rentalUnitType || '');
  const [bedrooms, setBedrooms] = useState(propertyToEdit?.bedrooms ? String(propertyToEdit.bedrooms) : '0');
  const [bathrooms, setBathrooms] = useState(propertyToEdit?.bathrooms ? String(propertyToEdit.bathrooms) : '0');
  const [kitchens, setKitchens] = useState(propertyToEdit?.kitchens ? String(propertyToEdit.kitchens) : '0');
  const [tvLounge, setTvLounge] = useState(propertyToEdit?.tvLounge || false);
  const [carPorch, setCarPorch] = useState(propertyToEdit?.carPorch || false);

  // Features
  const [isCornerPlot, setIsCornerPlot] = useState(propertyToEdit?.isCornerPlot || false);
  const [isParkFacing, setIsParkFacing] = useState(propertyToEdit?.isParkFacing || false);
  const [isMainBoulevard, setIsMainBoulevard] = useState(propertyToEdit?.isMainBoulevard || false);
  const [isDisputed, setIsDisputed] = useState(propertyToEdit?.isDisputed || false);
  const [hasPossession, setHasPossession] = useState(propertyToEdit?.hasPossession || false);
  const [isReadyForConstruction, setIsReadyForConstruction] = useState(propertyToEdit?.isReadyForConstruction || false);
  const [hasCarpetedStreet, setHasCarpetedStreet] = useState(propertyToEdit?.hasCarpetedStreet || false);
  const [hasElectricity, setHasElectricity] = useState(propertyToEdit?.hasElectricity || false);
  const [hasGas, setHasGas] = useState(propertyToEdit?.hasGas || false);
  const [hasWaterSupply, setHasWaterSupply] = useState(propertyToEdit?.hasWaterSupply || false);
  const [hasSewerage, setHasSewerage] = useState(propertyToEdit?.hasSewerage || false);
  const [isFile, setIsFile] = useState(propertyToEdit?.isFile || false);
  const [isBalloted, setIsBalloted] = useState(propertyToEdit?.isBalloted || false);
  const [hasBoundaryWall, setHasBoundaryWall] = useState(propertyToEdit?.hasBoundaryWall || false);
  const [otherFeatures, setOtherFeatures] = useState(propertyToEdit?.otherFeatures || '');

  // Interactive Paid Charges
  const [paidLand, setPaidLand] = useState(propertyToEdit?.paidLand || false);
  const [paidUtilities, setPaidUtilities] = useState(propertyToEdit?.paidUtilities || false);
  const [paidPossession, setPaidPossession] = useState(propertyToEdit?.paidPossession || false);
  const [paidDevelopment, setPaidDevelopment] = useState(propertyToEdit?.paidDevelopment || false);
  const [paidGas, setPaidGas] = useState(propertyToEdit?.paidGas || false);
  const [paidWater, setPaidWater] = useState(propertyToEdit?.paidWater || false);
  const [paidElectricity, setPaidElectricity] = useState(propertyToEdit?.paidElectricity || false);
  const [paidCorner, setPaidCorner] = useState(propertyToEdit?.paidCorner || false);

  // Dynamic remaining charges
  const [remainingCharges, setRemainingCharges] = useState<RemainingCharge[]>(
    propertyToEdit?.remainingCharges || []
  );
  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');
  const [newChargeNotes, setNewChargeNotes] = useState('');

  // Owner info
  const [ownerName, setOwnerName] = useState(propertyToEdit?.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(propertyToEdit?.ownerPhone || '');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(propertyToEdit?.ownerWhatsApp || '');

  // Dealer info
  const [dealerName, setDealerName] = useState(propertyToEdit?.dealerName || '');
  const [dealerPhone, setDealerPhone] = useState(propertyToEdit?.dealerPhone || '');
  const [dealerWhatsApp, setDealerWhatsApp] = useState(propertyToEdit?.dealerWhatsApp || '');

  // Description & Media
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [mediaGallery, setMediaGallery] = useState<string[]>(propertyToEdit?.mediaGallery || []);
  const [coverImageUri, setCoverImageUri] = useState(propertyToEdit?.coverImageUri || '');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown options & inline manager modal state
  const [managingDropdown, setManagingDropdown] = useState<'Society' | 'Block' | 'Size' | null>(null);

  const societyOptions = dropdowns.filter(d => d.category.toLowerCase() === 'society' && d.isEnabled);
  const blockOptions = dropdowns.filter(d => d.category.toLowerCase() === 'block' && d.isEnabled);
  const propertyTypeOptions = dropdowns.filter(d => d.category.toLowerCase() === 'propertytype' && d.isEnabled);
  const sizeOptions = dropdowns.filter(d => d.category.toLowerCase() === 'size' && d.isEnabled);
  const rentalUnitOptions = dropdowns.filter(d => d.category.toLowerCase() === 'rentalunittype' && d.isEnabled);

  // Merge dropdown options with any existing database values in properties
  const selectableSocieties = Array.from(
    new Set([
      ...societyOptions.map(o => o.optionValue),
      ...properties.map(p => p.society).filter(Boolean),
      ...(society ? [society] : []),
    ])
  );

  const selectableBlocks = Array.from(
    new Set([
      ...blockOptions.map(o => o.optionValue),
      ...properties.map(p => p.block).filter(Boolean),
      ...(block ? [block] : []),
    ])
  );

  const selectableSizes = Array.from(
    new Set([
      ...sizeOptions.map(o => o.optionValue),
      ...properties.map(p => p.size).filter(Boolean),
      ...(size ? [size] : []),
    ])
  );

  const handleAddRemainingCharge = () => {
    if (!newChargeName.trim()) return;
    const amount = parseAmountToNumber(newChargeAmount);
    setRemainingCharges([
      ...remainingCharges,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: newChargeName.trim(),
        amount,
        notes: newChargeNotes.trim(),
      },
    ]);
    setNewChargeName('');
    setNewChargeAmount('');
    setNewChargeNotes('');
  };

  const handleRemoveRemainingCharge = (index: number) => {
    setRemainingCharges(remainingCharges.filter((_, i) => i !== index));
  };

  // Select All / Unselect All handlers for Plot Highlights & Infrastructure Amenities
  const handleSelectAllPlotHighlights = () => {
    setIsCornerPlot(true);
    setIsParkFacing(true);
    setIsMainBoulevard(true);
    setHasPossession(true);
    setIsReadyForConstruction(true);
    setHasCarpetedStreet(true);
    setHasElectricity(true);
    setHasGas(true);
    setHasWaterSupply(true);
    setHasSewerage(true);
    setIsBalloted(true);
    setIsFile(true);
    setHasBoundaryWall(true);
    setIsDisputed(true);
  };

  const handleUnselectAllPlotHighlights = () => {
    setIsCornerPlot(false);
    setIsParkFacing(false);
    setIsMainBoulevard(false);
    setHasPossession(false);
    setIsReadyForConstruction(false);
    setHasCarpetedStreet(false);
    setHasElectricity(false);
    setHasGas(false);
    setHasWaterSupply(false);
    setHasSewerage(false);
    setIsBalloted(false);
    setIsFile(false);
    setHasBoundaryWall(false);
    setIsDisputed(false);
  };

  // Select All / Unselect All handlers for Paid Development Charges
  const handleSelectAllDevelopmentCharges = () => {
    setPaidLand(true);
    setPaidPossession(true);
    setPaidDevelopment(true);
    setPaidCorner(true);
  };

  const handleUnselectAllDevelopmentCharges = () => {
    setPaidLand(false);
    setPaidPossession(false);
    setPaidDevelopment(false);
    setPaidCorner(false);
  };

  // Select All / Unselect All handlers for Paid Utilities Charges
  const handleSelectAllUtilityCharges = () => {
    setPaidUtilities(true);
    setPaidGas(true);
    setPaidWater(true);
    setPaidElectricity(true);
  };

  const handleUnselectAllUtilityCharges = () => {
    setPaidUtilities(false);
    setPaidGas(false);
    setPaidWater(false);
    setPaidElectricity(false);
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const url = newImageUrl.trim();
      const updated = [...mediaGallery, url];
      setMediaGallery(updated);
      if (!coverImageUri) setCoverImageUri(url);
      setNewImageUrl('');
      showToast('Photo URL added to gallery.', 'success');
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleDeviceFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      const { urls, errors } = await processMultipleImageFiles(files);
      if (urls.length > 0) {
        setMediaGallery((prev) => {
          const updated = [...prev, ...urls];
          if (!coverImageUri && updated.length > 0) {
            setCoverImageUri(updated[0]);
          }
          return updated;
        });
        showToast(`${urls.length} image(s) uploaded and ready.`, 'success');
      }
      if (errors.length > 0) {
        showToast(errors[0], 'error');
      }
    } catch {
      showToast('Failed to process selected images.', 'error');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const target = mediaGallery[index];
    const updated = mediaGallery.filter((_, i) => i !== index);
    setMediaGallery(updated);
    if (coverImageUri === target) {
      setCoverImageUri(updated[0] || '');
    }
  };

  const handleGenerateAiDescription = () => {
    const draftProperty: PropertyEntity = {
      id: propertyToEdit?.id || 0,
      propertyId: propertyId || 'EV-DRAFT',
      category,
      propertyType,
      status,
      society,
      block,
      street,
      propertyNumber,
      size,
      demandPrice: parseAmountToNumber(demandPrice),
      purchasePrice: parseAmountToNumber(purchasePrice),
      monthlyRent: parseAmountToNumber(monthlyRent),
      estimatedValue: parseAmountToNumber(estimatedValue),
      rentalUnitType,
      availabilityStatus: status,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      kitchens: parseInt(kitchens) || 0,
      tvLounge,
      carPorch,
      isCornerPlot,
      isParkFacing,
      isMainBoulevard,
      isDisputed,
      hasPossession,
      isReadyForConstruction,
      hasCarpetedStreet,
      hasElectricity,
      hasGas,
      hasWaterSupply,
      hasSewerage,
      isFile,
      isBalloted,
      hasBoundaryWall,
      otherFeatures,
      paidLand,
      paidUtilities,
      paidPossession,
      paidDevelopment,
      paidGas,
      paidWater,
      paidElectricity,
      paidCorner,
      remainingCharges,
      ownerName,
      ownerPhone,
      ownerWhatsApp,
      dealerName,
      dealerPhone,
      dealerWhatsApp,
      description: '',
      mediaGallery,
      coverImageUri,
      isFavorite: propertyToEdit?.isFavorite || false,
      isArchived: false,
      isTrashed: false,
      createdBy: 'Super Admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const smartDesc = generateSmartPropertyDescription(draftProperty);
    setDescription(smartDesc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Omit<PropertyEntity, 'id'> & { id?: number } = {
      id: propertyToEdit?.id,
      propertyId: propertyId.trim(),
      category,
      propertyType,
      status,
      society: society.trim(),
      block: block.trim(),
      street: street.trim(),
      propertyNumber: propertyNumber.trim(),
      size: size.trim(),
      locationUrl: locationUrl.trim(),
      demandPrice: parseAmountToNumber(demandPrice),
      purchasePrice: parseAmountToNumber(purchasePrice),
      monthlyRent: parseAmountToNumber(monthlyRent),
      estimatedValue: parseAmountToNumber(estimatedValue),
      rentalUnitType,
      availabilityStatus: status,
      bedrooms: parseInt(bedrooms) || 0,
      bathrooms: parseInt(bathrooms) || 0,
      kitchens: parseInt(kitchens) || 0,
      tvLounge,
      carPorch,
      isCornerPlot,
      isParkFacing,
      isMainBoulevard,
      isDisputed,
      hasPossession,
      isReadyForConstruction,
      hasCarpetedStreet,
      hasElectricity,
      hasGas,
      hasWaterSupply,
      hasSewerage,
      isFile,
      isBalloted,
      hasBoundaryWall,
      otherFeatures: otherFeatures.trim(),
      paidLand,
      paidUtilities,
      paidPossession,
      paidDevelopment,
      paidGas,
      paidWater,
      paidElectricity,
      paidCorner,
      remainingCharges,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      ownerWhatsApp: ownerWhatsApp.trim(),
      dealerName: dealerName.trim(),
      dealerPhone: dealerPhone.trim(),
      dealerWhatsApp: dealerWhatsApp.trim(),
      description: description.trim(),
      mediaGallery,
      coverImageUri: coverImageUri || mediaGallery[0] || '',
      isFavorite: propertyToEdit?.isFavorite || false,
      isArchived: false,
      isTrashed: false,
      createdBy: propertyToEdit?.createdBy || 'Super Admin',
      createdAt: propertyToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const saved = saveProperty(payload);
    navigateTo('PROPERTY_DETAIL', saved);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('PROPERTIES')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {propertyToEdit ? `Edit Property (${propertyToEdit.propertyId})` : 'New Property Record'}
            </h2>
            <p className="text-xs text-slate-500">
              Provide complete architectural, location, and financial parameters
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Save Property</span>
        </button>
      </div>

      {/* 1. Categorization & Status */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Category & Basic Classification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Property Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PropertyCategory)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="Plot for Sale">Plot for Sale</option>
              <option value="Home for Sale">Home for Sale</option>
              <option value="Home for Rent">Home for Rent</option>
              <option value="Personal">Personal Asset</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Property Type *
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              {propertyTypeOptions.length > 0 ? (
                propertyTypeOptions.map((opt) => (
                  <option key={opt.id} value={opt.optionValue}>
                    {opt.optionValue}
                  </option>
                ))
              ) : (
                <>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="House / Villa">House / Villa</option>
                  <option value="Apartment / Flat">Apartment / Flat</option>
                  <option value="Penthouse">Penthouse</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
              <option value="Reserved">Reserved</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Reference ID (Optional)
            </label>
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="e.g. EV-DHA6-101"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Address & Physical Specs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          Location & Dimensions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Society / Housing Project *
              </label>
              <button
                type="button"
                onClick={() => setManagingDropdown('Society')}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                title="Add or Manage Society Options"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
            <select
              required
              value={society}
              onChange={(e) => {
                if (e.target.value === '__MANAGE_OPTIONS__') {
                  setManagingDropdown('Society');
                } else {
                  setSociety(e.target.value);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="">Select Society / Housing Project</option>
              {selectableSocieties.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              <option value="__MANAGE_OPTIONS__">+ Add / Manage Societies...</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Block / Sector
              </label>
              <button
                type="button"
                onClick={() => setManagingDropdown('Block')}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                title="Add or Manage Block Options"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
            <select
              value={block}
              onChange={(e) => {
                if (e.target.value === '__MANAGE_OPTIONS__') {
                  setManagingDropdown('Block');
                } else {
                  setBlock(e.target.value);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="">Select Block / Sector</option>
              {selectableBlocks.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              <option value="__MANAGE_OPTIONS__">+ Add / Manage Blocks...</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Size *
              </label>
              <button
                type="button"
                onClick={() => setManagingDropdown('Size')}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                title="Add or Manage Size Options"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Manage</span>
              </button>
            </div>
            <select
              required
              value={size}
              onChange={(e) => {
                if (e.target.value === '__MANAGE_OPTIONS__') {
                  setManagingDropdown('Size');
                } else {
                  setSize(e.target.value);
                }
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="">Select Size</option>
              {selectableSizes.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
              <option value="__MANAGE_OPTIONS__">+ Add / Manage Sizes...</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Plot # / House #
            </label>
            <input
              type="text"
              value={propertyNumber}
              onChange={(e) => setPropertyNumber(e.target.value)}
              placeholder="e.g. 215"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Street / Lane #
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. Street 14"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Map / Location Link (Google Maps)
            </label>
            <input
              type="url"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Pricing with South Asian Words Converter */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Financial Pricing (PKR with Lakhs & Crores)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Demand Price */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
            <label className="block font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              Demand Price (PKR) *
            </label>
            <input
              type="text"
              required={category !== 'Home for Rent'}
              value={demandPrice ? formatInputWithCommas(demandPrice) : ''}
              onChange={(e) => setDemandPrice(e.target.value)}
              placeholder="e.g. 42,500,000"
              className="w-full p-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white"
            />
            {demandPrice && (
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                {formatAmountWithWords(demandPrice, 'PKR')}
              </p>
            )}
          </div>

          {/* Monthly Rent */}
          {category === 'Home for Rent' && (
            <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40">
              <label className="block font-bold text-teal-900 dark:text-teal-300 mb-1">
                Monthly Rent (PKR) *
              </label>
              <input
                type="text"
                required
                value={monthlyRent ? formatInputWithCommas(monthlyRent) : ''}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="e.g. 160,000"
                className="w-full p-2 rounded-xl border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 font-mono font-bold text-sm text-slate-900 dark:text-white"
              />
              {monthlyRent && (
                <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 mt-1">
                  {formatAmountWithWords(monthlyRent, 'PKR')} / month
                </p>
              )}
            </div>
          )}

          {/* Purchase Price (Private) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Purchase Price (Confidential)
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Internal</span>
            </div>
            <input
              type="text"
              value={purchasePrice ? formatInputWithCommas(purchasePrice) : ''}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 38,000,000"
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />
            {purchasePrice && (
              <p className="text-[11px] text-slate-500 mt-1">
                {formatAmountWithWords(purchasePrice, 'PKR')}
              </p>
            )}
          </div>

          {/* Estimated Market Value */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estimated Market Value
            </label>
            <input
              type="text"
              value={estimatedValue ? formatInputWithCommas(estimatedValue) : ''}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g. 43,000,000"
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />
            {estimatedValue && (
              <p className="text-[11px] text-slate-500 mt-1">
                {formatAmountWithWords(estimatedValue, 'PKR')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Home Accommodation (If Home category) */}
      {category.includes('Home') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            Home Accommodation & Layout
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rental Unit Type
              </label>
              <select
                value={rentalUnitType}
                onChange={(e) => setRentalUnitType(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">Full House</option>
                {rentalUnitOptions.map((o) => (
                  <option key={o.id} value={o.optionValue}>
                    {o.optionValue}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kitchens
              </label>
              <input
                type="number"
                min="0"
                value={kitchens}
                onChange={(e) => setKitchens(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={tvLounge}
                  onChange={(e) => setTvLounge(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>TV Lounge</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={carPorch}
                  onChange={(e) => setCarPorch(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Car Porch</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 5. Plot Features (PlotFeaturesGrid) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Plot Highlights & Infrastructure Amenities
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllPlotHighlights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold transition-all"
              title="Select All Plot Highlights & Amenities"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Select All</span>
            </button>
            <button
              type="button"
              onClick={handleUnselectAllPlotHighlights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all"
              title="Unselect All Plot Highlights & Amenities"
            >
              <XSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Unselect All</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          {[
            { label: 'Corner Plot', val: isCornerPlot, set: setIsCornerPlot },
            { label: 'Park Facing', val: isParkFacing, set: setIsParkFacing },
            { label: 'Main Boulevard', val: isMainBoulevard, set: setIsMainBoulevard },
            { label: 'Possession Ready', val: hasPossession, set: setHasPossession },
            { label: 'Ready for Construction', val: isReadyForConstruction, set: setIsReadyForConstruction },
            { label: 'Carpeted Wide Street', val: hasCarpetedStreet, set: setHasCarpetedStreet },
            { label: 'Electricity Connected', val: hasElectricity, set: setHasElectricity },
            { label: 'Sui Gas Available', val: hasGas, set: setHasGas },
            { label: 'Water Supply', val: hasWaterSupply, set: setHasWaterSupply },
            { label: 'Sewerage Installed', val: hasSewerage, set: setHasSewerage },
            { label: 'Balloted Plot', val: isBalloted, set: setIsBalloted },
            { label: 'Plot File', val: isFile, set: setIsFile },
            { label: 'Boundary Wall Built', val: hasBoundaryWall, set: setHasBoundaryWall },
            { label: 'Disputed Record', val: isDisputed, set: setIsDisputed },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => item.set(!item.val)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                item.val
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.val ? (
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">
            Other Custom Features (comma separated)
          </label>
          <input
            type="text"
            value={otherFeatures}
            onChange={(e) => setOtherFeatures(e.target.value)}
            placeholder="e.g. Near Mosque, Facing Commercial Zone, Facing 80ft Road"
            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* 6. Interactive Paid Charges (PaidChargesCheckboxes) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Paid Development & Utility Charges
          </h3>
          <p className="text-xs text-slate-500">
            Check the fees and dues that are already 100% paid to the society
          </p>
        </div>

        {/* Paid Development Charges Group */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
              Paid Development Charges
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllDevelopmentCharges}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 text-[11px] font-bold transition-all"
                title="Select All Paid Development Charges"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={handleUnselectAllDevelopmentCharges}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all"
                title="Unselect All Paid Development Charges"
              >
                <XSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Unselect All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Cost of Land Paid', val: paidLand, set: setPaidLand },
              { label: 'Possession Charges', val: paidPossession, set: setPaidPossession },
              { label: 'Development Paid', val: paidDevelopment, set: setPaidDevelopment },
              { label: 'Corner Extra Paid', val: paidCorner, set: setPaidCorner },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => item.set(!item.val)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  item.val
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.val ? (
                  <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Utilities Charges Group */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
              Paid Utilities Charges
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllUtilityCharges}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80 text-[11px] font-bold transition-all"
                title="Select All Paid Utilities Charges"
              >
                <CheckCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Select All</span>
              </button>
              <button
                type="button"
                onClick={handleUnselectAllUtilityCharges}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all"
                title="Unselect All Paid Utilities Charges"
              >
                <XSquare className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Unselect All</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Utilities Paid', val: paidUtilities, set: setPaidUtilities },
              { label: 'Sui Gas Charges', val: paidGas, set: setPaidGas },
              { label: 'Water Supply Charges', val: paidWater, set: setPaidWater },
              { label: 'Electricity Charges', val: paidElectricity, set: setPaidElectricity },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => item.set(!item.val)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  item.val
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 font-semibold'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.val ? (
                  <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Dynamic Remaining Charges Editor (RemainingChargesEditor) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Remaining Dues & Outstanding Installments
            </h3>
            <p className="text-xs text-slate-500">
              Track pending installments, development fees, or transfer charges
            </p>
          </div>
          {remainingCharges.length > 0 && (
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Outstanding:</span>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                PKR {formatCommas(remainingCharges.reduce((s, c) => s + c.amount, 0))}
              </p>
            </div>
          )}
        </div>

        {/* Existing charges list */}
        {remainingCharges.length > 0 && (
          <div className="space-y-2">
            {remainingCharges.map((rc, idx) => (
              <div
                key={rc.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{rc.name}</span>
                  {rc.notes && <p className="text-[11px] text-slate-500 mt-0.5">{rc.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 dark:text-white">
                    PKR {formatCommas(rc.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRemainingCharge(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new charge inline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <input
            type="text"
            placeholder="Charge Name (e.g. Installment 4)"
            value={newChargeName}
            onChange={(e) => setNewChargeName(e.target.value)}
            className="sm:col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
          <input
            type="text"
            placeholder="Amount in PKR"
            value={newChargeAmount ? formatInputWithCommas(newChargeAmount) : ''}
            onChange={(e) => setNewChargeAmount(e.target.value)}
            className="sm:col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200"
          />
          <input
            type="text"
            placeholder="Due date / Notes"
            value={newChargeNotes}
            onChange={(e) => setNewChargeNotes(e.target.value)}
            className="sm:col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleAddRemainingCharge}
            className="sm:col-span-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Due</span>
          </button>
        </div>
      </div>

      {/* 8. Direct Owner & Dealer Information */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Owner & Dealer Contact Directory
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Owner Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Direct Owner Details (Confidential)
            </h4>
            <div>
              <label className="block text-slate-500 mb-1">Owner Name</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Malik Tariq"
                  className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                />
                <ContactPickerButton
                  onContactSelected={(cName, cPhone) => {
                    if (cName) setOwnerName(cName);
                    if (cPhone) {
                      setOwnerPhone(cPhone);
                      if (!ownerWhatsApp) setOwnerWhatsApp(cPhone);
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 mb-1">Phone Call</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+92 300..."
                    className="flex-1 min-w-0 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <ContactPickerButton
                    onContactSelected={(cName, cPhone) => {
                      if (cPhone) setOwnerPhone(cPhone);
                      if (cName && !ownerName) setOwnerName(cName);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">WhatsApp</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={ownerWhatsApp}
                    onChange={(e) => setOwnerWhatsApp(e.target.value)}
                    placeholder="+92 300..."
                    className="flex-1 min-w-0 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <ContactPickerButton
                    onContactSelected={(cName, cPhone) => {
                      if (cPhone) setOwnerWhatsApp(cPhone);
                      if (cName && !ownerName) setOwnerName(cName);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Details */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">
              Listing Dealer / Facilitator (Public Contact)
            </h4>
            <div>
              <label className="block text-slate-500 mb-1">Dealer / Realtor Name</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                  placeholder="e.g. Chaudhry Bilal (Prime Estate)"
                  className="flex-1 min-w-0 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                />
                <ContactPickerButton
                  onContactSelected={(cName, cPhone) => {
                    if (cName) setDealerName(cName);
                    if (cPhone) {
                      setDealerPhone(cPhone);
                      if (!dealerWhatsApp) setDealerWhatsApp(cPhone);
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 mb-1">Dealer Phone</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={dealerPhone}
                    onChange={(e) => setDealerPhone(e.target.value)}
                    placeholder="+92 300..."
                    className="flex-1 min-w-0 p-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <ContactPickerButton
                    onContactSelected={(cName, cPhone) => {
                      if (cPhone) setDealerPhone(cPhone);
                      if (cName && !dealerName) setDealerName(cName);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Dealer WhatsApp</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={dealerWhatsApp}
                    onChange={(e) => setDealerWhatsApp(e.target.value)}
                    placeholder="+92 300..."
                    className="flex-1 min-w-0 p-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <ContactPickerButton
                    onContactSelected={(cName, cPhone) => {
                      if (cPhone) setDealerWhatsApp(cPhone);
                      if (cName && !dealerName) setDealerName(cName);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. Description & AI Generator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Marketing Overview & Description
          </h3>
          <button
            type="button"
            onClick={handleGenerateAiDescription}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-sm shadow-emerald-700/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Smart Description</span>
          </button>
        </div>

        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Click 'Generate Smart Description' to compose marketing copy automatically from the attributes above, or type custom notes here..."
          className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* 10. Media Gallery */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Property Photo Gallery
        </h3>

        {/* Existing Images */}
        {mediaGallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {mediaGallery.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden group aspect-square bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={img}
                  alt={`Property photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/estate_vault_icon.png';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setCoverImageUri(img)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                      coverImageUri === img
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/90 text-slate-900 hover:bg-white'
                    }`}
                  >
                    {coverImageUri === img ? 'Cover' : 'Set Cover'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {coverImageUri === img && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold shadow-sm">
                    Cover Photo
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Hidden Device File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleDeviceFilesSelected}
          className="hidden"
        />

        {/* Add image input & upload button */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste image URL (https://...) or click Add Photo to upload from device"
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          />
          <button
            type="button"
            disabled={isUploadingImages}
            onClick={handleAddImage}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingImages ? 'Uploading...' : 'Add Photo'}</span>
          </button>
        </div>
      </div>

      {/* Form Submission Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => navigateTo('PROPERTIES')}
          className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>Save Property Record</span>
        </button>
      </div>

      {/* Inline Dropdown Manager Modal for Society, Block, and Size */}
      <DropdownManagerModal
        category={managingDropdown || 'Society'}
        title={managingDropdown || 'Society'}
        isOpen={managingDropdown !== null}
        onClose={() => setManagingDropdown(null)}
        onSelectOption={(val) => {
          if (managingDropdown === 'Society') setSociety(val);
          if (managingDropdown === 'Block') setBlock(val);
          if (managingDropdown === 'Size') setSize(val);
        }}
      />
    </form>
  );
};
