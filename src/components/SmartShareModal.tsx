import React, { useState, useRef } from 'react';
import {
  Share2,
  Download,
  Copy,
  Printer,
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  MessageSquare,
  Sparkles,
  Sliders,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PropertyEntity } from '../types/crm';
import {
  DEFAULT_SHAREABLE_COLUMNS,
  generateWhatsAppMessage,
  ShareableColumn,
} from '../utils/smartShare';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';
import {
  getFullAddress,
  getSelectedPlotFeatures,
  getSelectedPaidDevelopmentCharges,
  getSelectedPaidUtilityCharges,
} from '../utils/aiHelper';
import { ContactPickerButton } from './ContactPickerButton';

interface SmartShareModalProps {
  property: PropertyEntity;
  onClose: () => void;
}

export const SmartShareModal: React.FC<SmartShareModalProps> = ({ property, onClose }) => {
  const { settings, smartShareConfig, saveSmartShareConfig, showToast } = useCrm();

  const [columns, setColumns] = useState<ShareableColumn[]>(() => {
    return DEFAULT_SHAREABLE_COLUMNS.map(col => ({
      ...col,
      isSelected: smartShareConfig.selectedFields.includes(col.id),
    }));
  });

  const [companyName, setCompanyName] = useState(smartShareConfig.companyName || settings.agencyName);
  const [agentName, setAgentName] = useState(smartShareConfig.agentName || property.dealerName || 'Director of Sales');
  const [contactNumber, setContactNumber] = useState(smartShareConfig.contactNumber || property.dealerPhone || settings.agencyPhone);
  const [showWatermark, setShowWatermark] = useState(smartShareConfig.showWatermark ?? true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (id: string) => {
    setColumns(prev =>
      prev.map(c => (c.id === id ? { ...c, isSelected: !c.isSelected } : c))
    );
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage(
      property,
      { companyName, agentName, contactNumber, showWatermark },
      columns
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('WhatsApp brochure copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectWhatsApp = () => {
    const text = generateWhatsAppMessage(
      property,
      { companyName, agentName, contactNumber, showWatermark },
      columns
    );
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Canvas Image Download
  const handleDownloadCard = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    // Use Canvas API to draw a high-res marketing card
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Header badge
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(80, 70, 320, 60, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(property.category.toUpperCase(), 110, 110);

    // Size badge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(420, 70, 200, 60, 20);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(property.size, 450, 110);

    // Company Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(companyName.toUpperCase(), 80, 190);

    // Property Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    const title = `${property.size} ${property.propertyType} in ${property.society}`;
    ctx.fillText(title, 80, 260);

    // Address
    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px sans-serif';
    ctx.fillText(`📍 ${getFullAddress(property)}`, 80, 310);

    // Demand Box
    const price = property.category === 'Home for Rent' ? property.monthlyRent : property.demandPrice;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.roundRect(80, 350, 920, 140, 24);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('DEMAND ASKING PRICE', 120, 395);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(`PKR ${formatCommas(price)}`, 120, 460);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`(${formatAmountWithWords(price, '')})`, 540, 460);

    // Highlights & Features Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(80, 520, 920, 360, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('KEY INFRASTRUCTURE HIGHLIGHTS', 120, 570);

    const features = [
      ...getSelectedPlotFeatures(property),
      ...getSelectedPaidDevelopmentCharges(property),
      ...getSelectedPaidUtilityCharges(property),
    ];
    const featureLines = features.length > 0 ? features.slice(0, 8) : ['Complete documentation', 'Prime direct listing'];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px sans-serif';
    featureLines.forEach((f, idx) => {
      const col = idx % 2 === 0 ? 120 : 540;
      const row = 625 + Math.floor(idx / 2) * 55;
      ctx.fillText(`✓  ${f}`, col, row);
    });

    // Contact Footer
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(80, 910, 920, 110, 24);
    ctx.fill();

    ctx.fillStyle = '#022c22';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`📞 Contact: ${agentName} | ${contactNumber}`, 120, 975);

    // Save image
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `EstateVault_${property.propertyId}_Card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Marketing card generated and downloaded!', 'success');
  };

  const isColActive = (id: string) => columns.find(c => c.id === id)?.isSelected ?? true;
  const price = property.category === 'Home for Rent' ? property.monthlyRent : property.demandPrice;
  const features = getSelectedPlotFeatures(property);
  const paidDevCharges = getSelectedPaidDevelopmentCharges(property);
  const paidUtilCharges = getSelectedPaidUtilityCharges(property);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-600" />
              Smart Share Marketing Card & Brochure
            </h3>
            <p className="text-xs text-slate-500">
              Export professional branded cards and WhatsApp messages for clients
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column: Interactive Visual Card Preview */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Card Preview
            </span>

            <div
              ref={cardRef}
              className="rounded-3xl p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border-2 border-emerald-500/50 shadow-2xl space-y-4"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isColActive('category') && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase">
                      {property.category}
                    </span>
                  )}
                  {isColActive('size') && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-slate-900">
                      {property.size}
                    </span>
                  )}
                </div>

                {isColActive('propertyId') && (
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {property.propertyId}
                  </span>
                )}
              </div>

              {/* Title & Location */}
              <div>
                <p className="text-[11px] text-emerald-400 font-bold tracking-wider uppercase">
                  {companyName}
                </p>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {property.size} {property.propertyType} in {property.society}
                </h4>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{getFullAddress(property)}</span>
                </p>
              </div>

              {/* Demand Price */}
              {isColActive('demandPrice') && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Asking Demand
                  </span>
                  <div className="text-2xl font-black text-white font-mono">
                    PKR {formatCommas(price)}
                  </div>
                  <p className="text-xs text-emerald-300 font-semibold">
                    {formatAmountWithWords(price, 'PKR')}
                  </p>
                </div>
              )}

              {/* Features List */}
              {isColActive('plotFeatures') && features.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Plot Highlights & Infrastructure Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {features.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Paid Development & Utilities Charges List */}
              {isColActive('paidCharges') && (paidDevCharges.length > 0 || paidUtilCharges.length > 0) && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Paid Development & Utility Charges
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[...paidDevCharges, ...paidUtilCharges].map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-500/30 text-[10px] text-teal-300 font-medium"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Contact Footer */}
              <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{agentName}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">{contactNumber}</p>
                </div>
                {showWatermark && (
                  <span className="text-[10px] text-slate-400">Estate Vault CRM</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Column Toggles */}
          <div className="space-y-4 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Branding & Included Fields
            </span>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Agency Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agent Name
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setAgentName(cName);
                        if (cPhone) setContactNumber(cPhone);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setContactNumber(cPhone);
                        if (cName && !agentName) setAgentName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Watermark toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Show Estate Vault CRM Watermark</span>
                </label>
              </div>

              {/* Field Toggles */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Included Details:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  {columns.map((col) => (
                    <div
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className="flex items-center gap-2 cursor-pointer p-1 text-[11px] text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                    >
                      {col.isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="pt-2 grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadCard}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save PNG Card</span>
              </button>

              <button
                onClick={handleCopyWhatsApp}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold text-xs rounded-xl transition-all ${
                  copied
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy WhatsApp'}</span>
              </button>

              <button
                onClick={handleDirectWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 font-bold text-xs rounded-xl hover:bg-teal-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Brochure</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
