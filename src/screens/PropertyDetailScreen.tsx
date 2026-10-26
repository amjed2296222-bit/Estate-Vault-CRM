import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Edit3,
  Trash2,
  Phone,
  MessageSquare,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PropertyEntity } from '../types/crm';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';
import { getSelectedPlotFeatures, getFullAddress } from '../utils/aiHelper';

interface PropertyDetailScreenProps {
  property: PropertyEntity;
  onOpenSmartShare: (property: PropertyEntity) => void;
}

export const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({
  property,
  onOpenSmartShare,
}) => {
  const { navigateTo, deleteProperty, hasPermission, investors, investorTransactions } = useCrm();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPurchasePrice, setShowPurchasePrice] = useState(false);

  const images = property.mediaGallery && property.mediaGallery.length > 0
    ? property.mediaGallery
    : property.coverImageUri
    ? [property.coverImageUri]
    : ['/estate_vault_icon.png'];

  const price = property.category === 'Home for Rent' ? property.monthlyRent : property.demandPrice;
  const features = getSelectedPlotFeatures(property);

  const plotHighlightsList = [
    { label: 'Corner Plot', active: property.isCornerPlot },
    { label: 'Park Facing', active: property.isParkFacing },
    { label: 'Main Boulevard', active: property.isMainBoulevard },
    { label: 'Possession Ready', active: property.hasPossession },
    { label: 'Ready for Construction', active: property.isReadyForConstruction },
    { label: 'Carpeted Wide Street', active: property.hasCarpetedStreet },
    { label: 'Electricity Connected', active: property.hasElectricity },
    { label: 'Sui Gas Available', active: property.hasGas },
    { label: 'Water Supply', active: property.hasWaterSupply },
    { label: 'Sewerage Installed', active: property.hasSewerage },
    { label: 'Balloted Plot', active: property.isBalloted },
    { label: 'Plot File', active: property.isFile },
    { label: 'Boundary Wall Built', active: property.hasBoundaryWall },
    { label: 'Disputed Record', active: property.isDisputed },
  ];

  const paidDevelopmentList = [
    { label: 'Cost of Land Paid', paid: property.paidLand },
    { label: 'Possession Charges', paid: property.paidPossession },
    { label: 'Development Paid', paid: property.paidDevelopment },
    { label: 'Corner Extra Paid', paid: property.paidCorner },
  ];

  const paidUtilitiesList = [
    { label: 'Utilities Paid', paid: property.paidUtilities },
    { label: 'Sui Gas Charges', paid: property.paidGas },
    { label: 'Water Supply Charges', paid: property.paidWater },
    { label: 'Electricity Charges', paid: property.paidElectricity },
  ];

  const totalRemainingDues = (property.remainingCharges || []).reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  // Linked investments
  const linkedTxs = investorTransactions.filter(
    (t) => t.propertyId === property.id && !t.isDeleted
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('PROPERTIES')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                {property.propertyId}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  property.status === 'Available'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {property.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {property.size} {property.propertyType} in {property.society}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onOpenSmartShare(property)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Share2 className="w-4 h-4" />
            <span>Smart Share</span>
          </button>

          {hasPermission('edit_property') && (
            <button
              onClick={() => navigateTo('ADD_EDIT_PROPERTY', property)}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 rounded-xl text-xs font-semibold"
              title="Edit Property"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {hasPermission('delete_property') && (
            <button
              onClick={() => {
                if (confirm(`Move property ${property.propertyId} to Trash?`)) {
                  deleteProperty(property.id);
                  navigateTo('PROPERTIES');
                }
              }}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-semibold"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Gallery & Financial Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gallery: 2 Cols */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800">
            <img
              src={images[activeImageIndex] || '/estate_vault_icon.png'}
              alt={property.society}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/estate_vault_icon.png';
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                {property.category}
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold">
                {property.size}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white font-black text-lg border border-emerald-500/40 shadow-xl">
              PKR {formatCommas(price)}
              {property.category === 'Home for Rent' && <span className="text-xs font-normal"> / mo</span>}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumb"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/estate_vault_icon.png';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Marketing Overview / Description */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Property Description & Highlights
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {property.description || 'No description provided. Click Edit Property to compose or generate one.'}
            </p>
          </div>
        </div>

        {/* Right 1 Col: Pricing Cards & Location */}
        <div className="space-y-4">
          {/* Demand Price Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white border border-emerald-800/40 shadow-lg">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              {property.category === 'Home for Rent' ? 'Monthly Rental Demand' : 'Asking Demand Price'}
            </span>
            <div className="text-2xl font-black mt-1">
              PKR {formatCommas(price)}
            </div>
            <p className="text-xs text-emerald-300 font-semibold mt-1">
              {formatAmountWithWords(price, 'PKR')}
            </p>

            {/* Confidential Purchase Price */}
            {property.purchasePrice > 0 && (
              <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Confidential Purchase:</span>
                  <p className="font-mono font-bold text-amber-400">
                    {showPurchasePrice ? `PKR ${formatCommas(property.purchasePrice)}` : '••••••••••••'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPurchasePrice(!showPurchasePrice)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="Toggle reveal"
                >
                  {showPurchasePrice ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Location Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location Specification
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Society:</span>
                <span className="font-bold text-slate-900 dark:text-white">{property.society}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Block / Sector:</span>
                <span className="font-bold text-slate-900 dark:text-white">{property.block || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Plot / House #:</span>
                <span className="font-bold text-slate-900 dark:text-white">{property.propertyNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Street / Lane:</span>
                <span className="font-bold text-slate-900 dark:text-white">{property.street || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Plot Size:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{property.size}</span>
              </div>
            </div>

            {property.locationUrl && (
              <a
                href={property.locationUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Dealer & Owner Contacts */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Dealer Contact */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Listing Dealer / Facilitator
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {property.dealerName || 'Direct Listing'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {property.dealerPhone && (
                  <a
                    href={`tel:${property.dealerPhone}`}
                    className="flex-1 py-1.5 px-3 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                {property.dealerWhatsApp && (
                  <a
                    href={`https://wa.me/${property.dealerWhatsApp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Owner Contact */}
            {property.ownerName && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Owner (Private)
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {property.ownerName}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {property.ownerPhone && (
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{property.ownerPhone}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plot Highlights & Infrastructure Amenities */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Plot Highlights & Infrastructure Amenities
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
          {plotHighlightsList.map((item) => (
            <div
              key={item.label}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                item.active
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
              }`}
            >
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  item.active ? 'text-emerald-600' : 'text-slate-300'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>

        {property.otherFeatures && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Custom Features:</span>
            {property.otherFeatures
              .split(',')
              .map((f) => f.trim())
              .filter(Boolean)
              .map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold"
                >
                  {f}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Specifications & Amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paid Charges Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Paid Development & Utility Status
          </h3>

          {/* Paid Development Charges */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paid Development Charges
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {paidDevelopmentList.map((c) => (
                <div
                  key={c.label}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    c.paid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      c.paid ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="truncate">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Paid Utilities Charges */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Paid Utilities Charges
            </h4>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {paidUtilitiesList.map((c) => (
                <div
                  key={c.label}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    c.paid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      c.paid ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="truncate">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Remaining Dues */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Remaining Dues & Installments
            </h3>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              Total: PKR {formatCommas(totalRemainingDues)}
            </span>
          </div>

          {property.remainingCharges && property.remainingCharges.length > 0 ? (
            <div className="space-y-2">
              {property.remainingCharges.map((rc, idx) => (
                <div
                  key={rc.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rc.name}</span>
                    {rc.notes && <p className="text-[10px] text-slate-500">{rc.notes}</p>}
                  </div>
                  <span className="font-black text-slate-900 dark:text-white">
                    PKR {formatCommas(rc.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              All dues and development charges are fully clear for this property!
            </div>
          )}
        </div>
      </div>

      {/* Linked Investor Capital */}
      {linkedTxs.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            Linked Investor Participations & Transactions
          </h3>

          <div className="space-y-2">
            {linkedTxs.map((t) => {
              const inv = investors.find((i) => i.id === t.investorId);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {inv?.name || `Investor #${t.investorId}`} ({t.type})
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-purple-700 dark:text-purple-300">
                      PKR {formatCommas(t.amount)}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
