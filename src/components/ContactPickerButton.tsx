import React, { useState, useRef } from 'react';
import { Contact, Phone, User, Search, Upload, X } from 'lucide-react';
import { useCrm } from '../context/CrmContext';

interface ContactPickerButtonProps {
  onContactSelected: (name: string, phone: string) => void;
  title?: string;
  className?: string;
}

interface ParsedContact {
  name: string;
  phones: string[];
  role?: string;
}

export const ContactPickerButton: React.FC<ContactPickerButtonProps> = ({
  onContactSelected,
  title = 'Pick Contact from Device',
  className = '',
}) => {
  const { clients, leads, investors, properties, showToast } = useCrm();
  const [multiPhoneContact, setMultiPhoneContact] = useState<ParsedContact | null>(null);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const vcfInputRef = useRef<HTMLInputElement>(null);

  const normalizePhone = (raw: string): string => {
    return raw.trim();
  };

  const handleApplyContact = (name: string, phones: string[]) => {
    const cleanPhones = Array.from(new Set(phones.map(normalizePhone).filter(Boolean)));
    if (cleanPhones.length > 1) {
      setMultiPhoneContact({ name, phones: cleanPhones });
      setShowFallbackModal(false);
    } else {
      const phone = cleanPhones[0] || '';
      onContactSelected(name, phone);
      setShowFallbackModal(false);
      showToast(`Populated contact: ${name || phone}`, 'info');
    }
  };

  const handlePickClick = async () => {
    // 1. Try native Web Contact Picker API (Android Chrome / supported mobile browsers)
    const nav = navigator as any;
    if ('contacts' in navigator && nav.contacts && typeof nav.contacts.select === 'function') {
      try {
        let props = ['name', 'tel'];
        if (typeof nav.contacts.getProperties === 'function') {
          const supported: string[] = await nav.contacts.getProperties();
          props = ['name', 'tel'].filter((p) => supported.includes(p));
          if (props.length === 0) props = ['name', 'tel'];
        }

        const selected = await nav.contacts.select(props, { multiple: false });
        if (selected && selected.length > 0) {
          const item = selected[0];
          const pickedName = (item.name && item.name[0]) ? String(item.name[0]).trim() : '';
          const pickedPhones: string[] = Array.isArray(item.tel)
            ? item.tel.map((t: any) => String(t).trim()).filter(Boolean)
            : [];

          if (pickedName || pickedPhones.length > 0) {
            handleApplyContact(pickedName, pickedPhones);
          }
        }
        return;
      } catch (err: any) {
        // If user simply dismissed the native dialog, do nothing
        if (err?.name === 'AbortError' || err?.name === 'InvalidStateError') {
          return;
        }
        // If SecurityError (e.g., inside cross-origin iframe) or unsupported, open fallback modal
      }
    }

    // 2. Fallback modal for browsers/iframes without native navigator.contacts access
    setShowFallbackModal(true);
  };

  // Parse .vcf (vCard) file from mobile/desktop device
  const handleVcfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      const lines = content.split(/\r?\n/);
      let name = '';
      const phones: string[] = [];

      for (const line of lines) {
        if (line.toUpperCase().startsWith('FN:')) {
          name = line.substring(3).trim();
        } else if (!name && line.toUpperCase().startsWith('N:')) {
          const parts = line.substring(2).split(';').map(s => s.trim()).filter(Boolean);
          name = parts.reverse().join(' ');
        } else if (line.toUpperCase().startsWith('TEL')) {
          const idx = line.indexOf(':');
          if (idx !== -1) {
            const tel = line.substring(idx + 1).replace(/^tel:/i, '').trim();
            if (tel) phones.push(tel);
          }
        }
      }

      if (name || phones.length > 0) {
        handleApplyContact(name, phones);
      } else {
        showToast('Could not parse contact details from vCard file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Aggregate saved contacts from CRM for quick selection in fallback modal
  const savedDirectory: ParsedContact[] = React.useMemo(() => {
    const map = new Map<string, ParsedContact>();

    const addEntry = (name: string, phones: string[], role: string) => {
      const cleanName = name.trim();
      const validPhones = phones.map(p => p.trim()).filter(Boolean);
      if (!cleanName && validPhones.length === 0) return;
      const key = `${cleanName.toLowerCase()}-${validPhones[0] || ''}`;
      if (!map.has(key)) {
        map.set(key, { name: cleanName, phones: Array.from(new Set(validPhones)), role });
      }
    };

    clients.forEach(c => addEntry(c.name, [c.phone, c.whatsApp], c.type));
    leads.forEach(l => addEntry(l.clientName, [l.phone, l.whatsApp], 'Lead'));
    investors.forEach(i => addEntry(i.name, [i.mobileNumber, i.whatsappNumber], 'Investor'));
    properties.forEach(p => {
      if (p.ownerName || p.ownerPhone) {
        addEntry(p.ownerName, [p.ownerPhone, p.ownerWhatsApp], 'Owner');
      }
      if (p.dealerName || p.dealerPhone) {
        addEntry(p.dealerName, [p.dealerPhone, p.dealerWhatsApp], 'Dealer');
      }
    });

    return Array.from(map.values());
  }, [clients, leads, investors, properties]);

  const filteredDirectory = savedDirectory.filter(c => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phones.some(p => p.toLowerCase().includes(q)) ||
      (c.role && c.role.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <button
        type="button"
        onClick={handlePickClick}
        title={title}
        className={`shrink-0 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400 transition-colors flex items-center justify-center ${className}`}
      >
        <Contact className="w-4 h-4" />
      </button>

      {/* Multiple Phone Numbers Selection Dialog (Matches Android PhoneNumberSelectionDialog) */}
      {multiPhoneContact && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setMultiPhoneContact(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Select Phone Number
              </h4>
              {multiPhoneContact.name && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  for {multiPhoneContact.name}
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                This contact has multiple phone numbers. Please select one:
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {multiPhoneContact.phones.map((ph, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onContactSelected(multiPhoneContact.name, ph);
                    showToast(`Populated contact: ${multiPhoneContact.name || ph}`, 'info');
                    setMultiPhoneContact(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {ph}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Number #{idx + 1}
                    </div>
                  </div>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMultiPhoneContact(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Contact Picker Modal (Device vCard + CRM Contacts Directory) */}
      {showFallbackModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setShowFallbackModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Contact className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Select Contact
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowFallbackModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device vCard (.vcf) Picker for iOS / Desktop / Iframe */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <div className="text-[11px] text-slate-700 dark:text-slate-300">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">
                  Import from Device Contacts
                </p>
                <p className="text-[10px] text-slate-500">
                  Select a contact card (.vcf) or choose from directory below
                </p>
              </div>
              <button
                type="button"
                onClick={() => vcfInputRef.current?.click()}
                className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Device .VCF</span>
              </button>
              <input
                ref={vcfInputRef}
                type="file"
                accept=".vcf,text/vcard,text/x-vcard"
                onChange={handleVcfUpload}
                className="hidden"
              />
            </div>

            {/* Search CRM Contacts */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search saved contacts by name or phone..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Contact List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {filteredDirectory.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching contacts found.
                </div>
              ) : (
                filteredDirectory.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyContact(c.name, c.phones)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                        {c.name ? c.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {c.name || 'Unnamed Contact'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">
                          {c.phones.join(' • ')}
                        </div>
                      </div>
                    </div>
                    {c.role && (
                      <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {c.role}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
