import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Building2,
  Receipt,
  Users,
  Sliders,
  X,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { formatDate } from '../utils/investorAccounting';

export const RecycleBinScreen: React.FC = () => {
  const {
    trashItems,
    restoreTrashItem,
    permanentlyDeleteTrash,
    emptyTrash,
  } = useCrm();

  const [filterModule, setFilterModule] = useState<string>('All');

  const modules = ['All', 'Properties', 'Transactions', 'Clients', 'Leads', 'Investors'];

  const filtered = trashItems.filter((item) => {
    if (filterModule === 'All') return true;
    return item.moduleName.toLowerCase() === filterModule.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" />
            Recycle Bin / Safety Archive
          </h2>
          <p className="text-xs text-slate-500">
            Deleted properties, contacts, khata transactions, and leads can be restored with 1 click
          </p>
        </div>

        {trashItems.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Permanently purge all items from the recycle bin? This cannot be undone.')) {
                emptyTrash();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Recycle Bin</span>
          </button>
        )}
      </div>

      {/* Module Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {modules.map((m) => (
          <button
            key={m}
            onClick={() => setFilterModule(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterModule === m
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Trash Items List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              The Recycle Bin is Clean
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              No deleted items found in this section.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {item.moduleName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.recordTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.recordSummary}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Deleted by {item.deletedBy} on {new Date(item.deletedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => restoreTrashItem(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Permanently wipe "${item.recordTitle}"?`)) {
                        permanentlyDeleteTrash(item.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                    title="Permanently Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
