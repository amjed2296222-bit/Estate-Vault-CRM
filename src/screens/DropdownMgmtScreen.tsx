import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  X,
  List,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Settings2,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { DropdownOptionEntity } from '../types/crm';

export const DropdownMgmtScreen: React.FC = () => {
  const { dropdowns, saveDropdownOption, deleteDropdownOption } = useCrm();

  const categories = [
    'Society',
    'Block',
    'PropertyType',
    'Size',
    'RentalUnitType',
    'LeadSource',
    'LeadStatus',
    'ClientStatus',
    'PaymentMethod',
    'TransactionCategory',
  ];

  const [activeCategory, setActiveCategory] = useState<string>('Society');
  const [newValue, setNewValue] = useState('');
  const [editingOption, setEditingOption] = useState<DropdownOptionEntity | null>(null);
  const [editValue, setEditValue] = useState('');

  const currentOptions = dropdowns
    .filter((d) => d.category.toLowerCase() === activeCategory.toLowerCase())
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    saveDropdownOption({
      category: activeCategory,
      optionValue: newValue.trim(),
      isEnabled: true,
      sortOrder: currentOptions.length,
    });
    setNewValue('');
  };

  const handleToggle = (opt: DropdownOptionEntity) => {
    saveDropdownOption({
      ...opt,
      isEnabled: !opt.isEnabled,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOption || !editValue.trim()) return;
    saveDropdownOption({
      ...editingOption,
      optionValue: editValue.trim(),
    });
    setEditingOption(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          Universal Dropdown Management
        </h2>
        <p className="text-xs text-slate-500">
          Centralized database taxonomy for societies, blocks, property sizes, unit types, and financial categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Category Selector List */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Categories ({categories.length})
          </span>
          {categories.map((cat) => {
            const count = dropdowns.filter((d) => d.category.toLowerCase() === cat.toLowerCase()).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setEditingOption(null);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-800 text-emerald-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Items & Add New */}
        <div className="md:col-span-3 space-y-4">
          {/* Add New Option Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Add New Option to {activeCategory}
            </h3>
            <form onSubmit={handleAdd} className="flex gap-2">
              <input
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Enter new ${activeCategory} name...`}
                className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Options List */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Options for {activeCategory} ({currentOptions.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Disabled items will not appear in dropdown forms
              </span>
            </div>

            <div className="space-y-2">
              {currentOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    opt.isEnabled
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  {editingOption?.id === opt.id ? (
                    <form onSubmit={handleUpdate} className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 p-1.5 rounded-lg border text-xs bg-white dark:bg-slate-800"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingOption(null)}
                        className="p-1.5 bg-slate-300 text-slate-700 rounded-lg text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-mono font-bold text-[10px]">
                        {opt.sortOrder + 1}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          opt.isEnabled
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-400 line-through'
                        }`}
                      >
                        {opt.optionValue}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(opt)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-colors ${
                        opt.isEnabled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {opt.isEnabled ? 'Active' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingOption(opt);
                        setEditValue(opt.optionValue);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove "${opt.optionValue}" from ${activeCategory}?`)) {
                          deleteDropdownOption(opt.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
