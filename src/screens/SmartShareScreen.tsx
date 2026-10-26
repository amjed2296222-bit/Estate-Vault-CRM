import React, { useState } from 'react';
import { Share2, Building2, MapPin, Search, ArrowRight } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PropertyEntity } from '../types/crm';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';

interface SmartShareScreenProps {
  onOpenSmartShare: (property: PropertyEntity) => void;
}

export const SmartShareScreen: React.FC<SmartShareScreenProps> = ({ onOpenSmartShare }) => {
  const { properties, searchQuery } = useCrm();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filtered = properties.filter((p) => {
    if (p.isTrashed) return false;
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.propertyId?.toLowerCase().includes(q) ||
        p.society?.toLowerCase().includes(q) ||
        p.block?.toLowerCase().includes(q) ||
        p.size?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-600" />
          Smart Share & Marketing Hub
        </h2>
        <p className="text-xs text-slate-500">
          Select any property to generate marketing cards, downloadable PNG brochures, and formatted WhatsApp message templates
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Plot for Sale', 'Home for Sale', 'Home for Rent'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const price = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
          return (
            <div
              key={p.id}
              className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-800 mb-3">
                  <img
                    src={p.coverImageUri || (p.mediaGallery && p.mediaGallery[0]) || '/estate_vault_icon.png'}
                    alt={p.society}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/estate_vault_icon.png';
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950/80 text-emerald-400 backdrop-blur-md">
                    {p.category}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/90 text-white font-bold text-xs">
                    PKR {formatCommas(price)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-emerald-600 font-bold">{p.propertyId}</span>
                  <span>{p.size}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 transition-colors truncate">
                  {p.size} {p.propertyType} in {p.society}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Plot #{p.propertyNumber || 'N/A'}, Street {p.street || 'N/A'}</span>
                </p>
              </div>

              <button
                onClick={() => onOpenSmartShare(p)}
                className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800/80 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Launch Smart Share Designer</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
