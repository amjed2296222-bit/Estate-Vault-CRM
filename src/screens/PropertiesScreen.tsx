import React, { useState, useMemo } from 'react';
import {
  Building2,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  Edit3,
  Trash2,
  MapPin,
  CheckCircle,
  AlertCircle,
  Home,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { PropertyEntity, PropertyCategory, PropertyStatus } from '../types/crm';
import { formatAmountWithWords, formatCommas } from '../utils/amountFormat';
import { getSelectedPlotFeatures, getSelectedPaidCharges } from '../utils/aiHelper';

interface PropertiesScreenProps {
  onOpenSmartShare: (property: PropertyEntity) => void;
}

export const PropertiesScreen: React.FC<PropertiesScreenProps> = ({ onOpenSmartShare }) => {
  const {
    properties,
    searchQuery,
    setSearchQuery,
    navigateTo,
    toggleFavorite,
    deleteProperty,
    hasPermission,
    dropdowns,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Filters state
  const [selectedSociety, setSelectedSociety] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'size'>('newest');

  // Categories
  const categories = ['All', 'Plot for Sale', 'Home for Sale', 'Home for Rent', 'Personal'];

  const societies = useMemo(() => {
    const fromDropdowns = dropdowns
      .filter(d => d.category.toLowerCase() === 'society' && d.isEnabled)
      .map(d => d.optionValue);
    const fromProps = properties.map(p => p.society).filter(Boolean);
    return Array.from(new Set([...fromDropdowns, ...fromProps]));
  }, [dropdowns, properties]);

  const blocks = useMemo(() => {
    const fromDropdowns = dropdowns
      .filter(d => d.category.toLowerCase() === 'block' && d.isEnabled)
      .map(d => d.optionValue);
    const fromProps = properties.map(p => p.block).filter(Boolean);
    return Array.from(new Set([...fromDropdowns, ...fromProps]));
  }, [dropdowns, properties]);

  const sizes = useMemo(() => {
    const fromDropdowns = dropdowns
      .filter(d => d.category.toLowerCase() === 'size' && d.isEnabled)
      .map(d => d.optionValue);
    const fromProps = properties.map(p => p.size).filter(Boolean);
    return Array.from(new Set([...fromDropdowns, ...fromProps]));
  }, [dropdowns, properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    let result = properties.filter(p => !p.isTrashed);

    // Tab filter
    if (activeTab !== 'All') {
      result = result.filter(p => p.category === activeTab);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.propertyId?.toLowerCase().includes(q) ||
          p.society?.toLowerCase().includes(q) ||
          p.block?.toLowerCase().includes(q) ||
          p.street?.toLowerCase().includes(q) ||
          p.propertyNumber?.toLowerCase().includes(q) ||
          p.ownerName?.toLowerCase().includes(q) ||
          p.dealerName?.toLowerCase().includes(q) ||
          p.propertyType?.toLowerCase().includes(q)
      );
    }

    // Detailed filters
    if (selectedSociety) {
      result = result.filter(p => p.society === selectedSociety);
    }
    if (selectedBlock) {
      result = result.filter(p => p.block === selectedBlock);
    }
    if (selectedStatus) {
      result = result.filter(p => p.status === selectedStatus);
    }
    if (selectedSize) {
      result = result.filter(p => p.size === selectedSize);
    }
    if (onlyFavorites) {
      result = result.filter(p => p.isFavorite);
    }
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => {
          const val = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
          return val >= min;
        });
      }
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => {
          const val = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
          return val <= max;
        });
      }
    }
    if (selectedFeature) {
      result = result.filter(p => getSelectedPlotFeatures(p).includes(selectedFeature));
    }

    // Sort
    return result.sort((a, b) => {
      const priceA = a.category === 'Home for Rent' ? a.monthlyRent : a.demandPrice;
      const priceB = b.category === 'Home for Rent' ? b.monthlyRent : b.demandPrice;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'size') return a.size.localeCompare(b.size);
      return b.createdAt - a.createdAt; // newest first
    });
  }, [
    properties,
    activeTab,
    searchQuery,
    selectedSociety,
    selectedBlock,
    selectedStatus,
    selectedSize,
    onlyFavorites,
    minPrice,
    maxPrice,
    selectedFeature,
    sortBy,
  ]);

  const activeFiltersCount = [
    selectedSociety,
    selectedBlock,
    selectedStatus,
    selectedSize,
    minPrice,
    maxPrice,
    onlyFavorites,
    selectedFeature,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedSociety('');
    setSelectedBlock('');
    setSelectedStatus('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyFavorites(false);
    setSelectedFeature('');
  };

  return (
    <div className="space-y-5">
      {/* Action Bar & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter button */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="size">Sort by Size</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Add property button */}
          {hasPermission('add_property') && (
            <button
              onClick={() => navigateTo('ADD_EDIT_PROPERTY')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Applied Filters:</span>
          {selectedSociety && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
              Society: {selectedSociety}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSociety('')} />
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
              Status: {selectedStatus}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus('')} />
            </span>
          )}
          {selectedSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium text-[11px]">
              Size: {selectedSize}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSize('')} />
            </span>
          )}
          {onlyFavorites && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-medium text-[11px]">
              Favorites Only
              <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyFavorites(false)} />
            </span>
          )}
          {selectedFeature && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-medium text-[11px]">
              Feature: {selectedFeature}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedFeature('')} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold ml-2 underline underline-offset-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Listing Content */}
      {filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No properties found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or adding a new property listing.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((p) => {
            const price = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
            const features = getSelectedPlotFeatures(p);

            return (
              <div
                key={p.id}
                className="group rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Image and Badges */}
                <div
                  onClick={() => navigateTo('PROPERTY_DETAIL', p)}
                  className="relative h-48 w-full bg-slate-800 cursor-pointer overflow-hidden"
                >
                  <img
                    src={p.coverImageUri || (p.mediaGallery && p.mediaGallery[0]) || '/estate_vault_icon.png'}
                    alt={p.society}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/estate_vault_icon.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-950/85 text-emerald-400 backdrop-blur-md border border-emerald-500/30">
                      {p.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-sm">
                      {p.size}
                    </span>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(p.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/60 backdrop-blur-md text-white hover:bg-slate-950/90 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        p.isFavorite ? 'text-rose-500 fill-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Demand Price */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md text-white font-extrabold text-sm border border-emerald-500/40 shadow-lg">
                    PKR {formatCommas(price)}
                  </div>

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-300 font-mono text-[10px] backdrop-blur-sm">
                    {p.propertyId}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div onClick={() => navigateTo('PROPERTY_DETAIL', p)} className="cursor-pointer">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {p.propertyType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Available'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 transition-colors">
                      {p.size} in {p.society} {p.block ? `(${p.block})` : ''}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Plot #{p.propertyNumber || 'N/A'}, Street {p.street || 'N/A'}</span>
                    </p>

                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatAmountWithWords(price, 'PKR')}
                    </p>

                    {/* Features & Paid Charges tags */}
                    {(features.length > 0 || getSelectedPaidCharges(p).length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {features.slice(0, 3).map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium"
                          >
                            {f}
                          </span>
                        ))}
                        {features.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{features.length - 3} more
                          </span>
                        )}
                        {getSelectedPaidCharges(p).length > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 text-[10px] text-teal-700 dark:text-teal-300 font-semibold">
                            ✓ {getSelectedPaidCharges(p).length} Paid Charges
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {/* WhatsApp Share */}
                      <button
                        onClick={() => onOpenSmartShare(p)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 transition-colors"
                        title="Smart Share card & WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Call Dealer */}
                      {p.dealerPhone && (
                        <a
                          href={`tel:${p.dealerPhone}`}
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 transition-colors"
                          title={`Call ${p.dealerName || 'Dealer'}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      {/* WhatsApp direct chat */}
                      {p.dealerWhatsApp && (
                        <a
                          href={`https://wa.me/${p.dealerWhatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-600 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {hasPermission('edit_property') && (
                        <button
                          onClick={() => navigateTo('ADD_EDIT_PROPERTY', p)}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Property"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {hasPermission('delete_property') && (
                        <button
                          onClick={() => {
                            if (confirm(`Move property ${p.propertyId} to Trash?`)) {
                              deleteProperty(p.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Property ID</th>
                  <th className="px-4 py-3">Category & Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Demand Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dealer / Contact</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProperties.map((p) => {
                  const price = p.category === 'Home for Rent' ? p.monthlyRent : p.demandPrice;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => navigateTo('PROPERTY_DETAIL', p)}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.propertyId}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {p.category}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.propertyType}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {p.society} {p.block ? `(${p.block})` : ''}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Plot #{p.propertyNumber}, St {p.street}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {p.size}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-900 dark:text-white">
                          PKR {formatCommas(price)}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatAmountWithWords(price, '')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Available'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{p.dealerName || 'Direct'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.dealerPhone}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenSmartShare(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {hasPermission('edit_property') && (
                          <button
                            onClick={() => navigateTo('ADD_EDIT_PROPERTY', p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('delete_property') && (
                          <button
                            onClick={() => {
                              if (confirm(`Move property ${p.propertyId} to Trash?`)) {
                                deleteProperty(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Advanced Property Filters
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Society & Block */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Society / Housing Project
                  </label>
                  <select
                    value={selectedSociety}
                    onChange={(e) => setSelectedSociety(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Societies</option>
                    {societies.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Block / Sector
                  </label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Blocks</option>
                    {blocks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Availability Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plot / House Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Sizes</option>
                    {sizes.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Demand Price Range (PKR)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min Price (e.g. 5000000)"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (e.g. 50000000)"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Specific Feature */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Plot Amenity
                </label>
                <select
                  value={selectedFeature}
                  onChange={(e) => setSelectedFeature(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="">Any Amenities</option>
                  <option value="Corner">Corner Plot</option>
                  <option value="Park Facing">Park Facing</option>
                  <option value="Main Boulevard">Main Boulevard</option>
                  <option value="Possession Ready">Possession Ready</option>
                  <option value="Ready For Construction">Ready for Construction</option>
                  <option value="Carpeted Wide Street">Carpeted Wide Street</option>
                  <option value="Electricity Connected">Electricity Connected</option>
                  <option value="Sui Gas Available">Sui Gas Available</option>
                  <option value="Water Supply Available">Water Supply</option>
                  <option value="Sewerage Available">Sewerage Installed</option>
                  <option value="Balloted">Balloted Plot</option>
                  <option value="File">Plot File</option>
                  <option value="Boundary Wall">Boundary Wall Built</option>
                  <option value="Disputed">Disputed Record</option>
                </select>
              </div>

              {/* Favorite toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyFavorites}
                    onChange={(e) => setOnlyFavorites(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Show Starred / Favorite Properties Only</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
