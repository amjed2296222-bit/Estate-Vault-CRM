import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { DropdownOptionEntity } from '../types/crm';

interface DropdownManagerModalProps {
  category: 'Society' | 'Block' | 'Size' | string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption?: (value: string) => void;
}

export const DropdownManagerModal: React.FC<DropdownManagerModalProps> = ({
  category,
  title,
  isOpen,
  onClose,
  onSelectOption,
}) => {
  const {
    dropdowns,
    properties,
    transactions,
    saveDropdownOption,
    deleteDropdownOption,
  } = useCrm();

  const [newOptionValue, setNewOptionValue] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Sync any existing database values from properties/transactions into dropdowns so user can manage all of them
  useEffect(() => {
    if (!isOpen) return;

    const existingInDropdowns = new Set(
      dropdowns
        .filter((d) => d.category.toLowerCase() === category.toLowerCase())
        .map((d) => d.optionValue.trim().toLowerCase())
    );

    const dbValues = new Set<string>();
    const catLower = category.toLowerCase();

    if (catLower === 'society') {
      properties.forEach((p) => {
        if (p.society && p.society.trim()) dbValues.add(p.society.trim());
      });
      transactions.forEach((t) => {
        if (t.society && t.society.trim()) dbValues.add(t.society.trim());
      });
    } else if (catLower === 'block') {
      properties.forEach((p) => {
        if (p.block && p.block.trim()) dbValues.add(p.block.trim());
      });
    } else if (catLower === 'size') {
      properties.forEach((p) => {
        if (p.size && p.size.trim()) dbValues.add(p.size.trim());
      });
    }

    let orderOffset = dropdowns.filter(
      (d) => d.category.toLowerCase() === catLower
    ).length;

    dbValues.forEach((val) => {
      if (!existingInDropdowns.has(val.toLowerCase())) {
        saveDropdownOption({
          category,
          optionValue: val,
          isEnabled: true,
          sortOrder: orderOffset++,
        });
        existingInDropdowns.add(val.toLowerCase());
      }
    });
  }, [isOpen, category]);

  if (!isOpen) return null;

  const categoryOptions = dropdowns
    .filter((d) => d.category.toLowerCase() === category.toLowerCase())
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newOptionValue.trim();
    if (!trimmed) return;

    const duplicate = categoryOptions.find(
      (o) => o.optionValue.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      if (!duplicate.isEnabled) {
        saveDropdownOption({ ...duplicate, isEnabled: true });
      }
      if (onSelectOption) {
        onSelectOption(duplicate.optionValue);
      }
      setNewOptionValue('');
      return;
    }

    const saved = saveDropdownOption({
      category,
      optionValue: trimmed,
      isEnabled: true,
      sortOrder: categoryOptions.length,
    });

    setNewOptionValue('');
    if (onSelectOption) {
      onSelectOption(saved.optionValue);
    }
  };

  const handleStartEdit = (opt: DropdownOptionEntity) => {
    setEditingId(opt.id);
    setEditingValue(opt.optionValue);
  };

  const handleSaveEdit = (opt: DropdownOptionEntity) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    saveDropdownOption({
      ...opt,
      optionValue: trimmed,
    });
    if (onSelectOption) {
      onSelectOption(trimmed);
    }
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Manage {title} Options
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add New Option Input */}
        <div className="py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption(e as unknown as React.FormEvent);
                }
              }}
              placeholder={`Add new ${title.toLowerCase()} option...`}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 my-2 pr-1">
          {categoryOptions.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">
              No options configured yet. Add one above.
            </p>
          ) : (
            categoryOptions.map((opt) => (
              <div
                key={opt.id}
                className="py-2.5 px-2 flex items-center justify-between gap-2 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
              >
                {editingId === opt.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEdit(opt);
                        }
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(opt)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`text-xs font-semibold truncate ${
                          opt.isEnabled
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 line-through'
                        }`}
                      >
                        {opt.optionValue}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelectOption && opt.isEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectOption(opt.optionValue);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-[10px] font-bold transition-colors"
                        >
                          Select
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(opt)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        title="Edit Option"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          saveDropdownOption({ ...opt, isEnabled: !opt.isEnabled })
                        }
                        className={`p-1.5 rounded-lg transition-colors ${
                          opt.isEnabled
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={opt.isEnabled ? 'Disable Option' : 'Enable Option'}
                      >
                        {opt.isEnabled ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDropdownOption(opt.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Option"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
