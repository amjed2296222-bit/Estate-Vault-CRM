import React, { useState, useMemo } from 'react';
import {
  Users2,
  UserCheck,
  Plus,
  Search,
  Phone,
  MessageSquare,
  Calendar,
  Edit3,
  Trash2,
  DollarSign,
  ArrowRight,
  Filter,
  CheckCircle,
  X,
  MapPin,
  Tag,
  Briefcase,
  UserPlus,
} from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { ClientEntity, LeadEntity, LeadStatus } from '../types/crm';
import { formatAmountWithWords, formatCommas, formatInputWithCommas, parseAmountToNumber } from '../utils/amountFormat';
import { formatDate } from '../utils/investorAccounting';
import { ContactPickerButton } from '../components/ContactPickerButton';

export const ClientsLeadsScreen: React.FC = () => {
  const {
    clients,
    leads,
    saveClient,
    deleteClient,
    saveLead,
    deleteLead,
    hasPermission,
    dropdowns,
    searchQuery,
  } = useCrm();

  const [activeMainTab, setActiveMainTab] = useState<'clients' | 'leads'>('leads');
  const [leadViewMode, setLeadViewMode] = useState<'kanban' | 'list'>('kanban');

  // Client Modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientEntity | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [clientType, setClientType] = useState<'Client' | 'Owner' | 'Dealer'>('Client');
  const [clientCategory, setClientCategory] = useState('General');
  const [clientStatus, setClientStatus] = useState('Active');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('Lahore');
  const [clientAddress, setClientAddress] = useState('');
  const [clientBudget, setClientBudget] = useState('');
  const [clientFollowUp, setClientFollowUp] = useState('');
  const [clientInterestedProperty, setClientInterestedProperty] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [clientKhataBalance, setClientKhataBalance] = useState('');

  // Lead Modal
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadEntity | null>(null);
  const [leadClientName, setLeadClientName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadWhatsApp, setLeadWhatsApp] = useState('');
  const [leadCategory, setLeadCategory] = useState('Plot for Sale');
  const [leadType, setLeadType] = useState('Residential Plot');
  const [leadLocation, setLeadLocation] = useState('');
  const [leadBudget, setLeadBudget] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>('New');
  const [leadSource, setLeadSource] = useState('Direct Call');
  const [leadFollowUp, setLeadFollowUp] = useState('');
  const [leadNotes, setLeadNotes] = useState('');

  const leadStatusOptions: LeadStatus[] = [
    'New',
    'Contacted',
    'Visit Scheduled',
    'Negotiation',
    'Closed Won',
    'Lost / Dropped',
  ];

  // Lead sources from dropdown
  const leadSourceOptions = dropdowns.filter(d => d.category.toLowerCase() === 'leadsource' && d.isEnabled);

  const filteredClients = useMemo(() => {
    let list = clients;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.interestedProperty.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, searchQuery]);

  const filteredLeads = useMemo(() => {
    let list = leads;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        l =>
          l.clientName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.preferredLocation.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, searchQuery]);

  // Open Add/Edit Client
  const openClientForm = (client?: ClientEntity) => {
    if (client) {
      setEditingClient(client);
      setClientName(client.name);
      setClientPhone(client.phone);
      setClientWhatsApp(client.whatsApp);
      setClientType(client.type);
      setClientCategory(client.category);
      setClientStatus(client.status);
      setClientEmail(client.email);
      setClientCity(client.city);
      setClientAddress(client.address);
      setClientBudget(client.budget ? String(client.budget) : '');
      setClientFollowUp(client.followUpDate ? new Date(client.followUpDate).toISOString().slice(0, 10) : '');
      setClientInterestedProperty(client.interestedProperty);
      setClientNotes(client.notes);
      setClientKhataBalance(client.khataBalance ? String(client.khataBalance) : '');
    } else {
      setEditingClient(null);
      setClientName('');
      setClientPhone('');
      setClientWhatsApp('');
      setClientType('Client');
      setClientCategory('General');
      setClientStatus('Active');
      setClientEmail('');
      setClientCity('Lahore');
      setClientAddress('');
      setClientBudget('');
      setClientFollowUp('');
      setClientInterestedProperty('');
      setClientNotes('');
      setClientKhataBalance('');
    }
    setShowClientModal(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    saveClient({
      id: editingClient?.id,
      name: clientName.trim(),
      phone: clientPhone.trim(),
      whatsApp: clientWhatsApp.trim(),
      type: clientType,
      category: clientCategory.trim(),
      status: clientStatus,
      email: clientEmail.trim(),
      city: clientCity.trim(),
      address: clientAddress.trim(),
      budget: parseAmountToNumber(clientBudget),
      followUpDate: clientFollowUp ? new Date(clientFollowUp).getTime() : 0,
      interestedProperty: clientInterestedProperty.trim(),
      notes: clientNotes.trim(),
      khataBalance: parseAmountToNumber(clientKhataBalance),
      createdAt: editingClient?.createdAt || Date.now(),
    });
    setShowClientModal(false);
  };

  // Open Add/Edit Lead
  const openLeadForm = (lead?: LeadEntity) => {
    if (lead) {
      setEditingLead(lead);
      setLeadClientName(lead.clientName);
      setLeadPhone(lead.phone);
      setLeadWhatsApp(lead.whatsApp);
      setLeadCategory(lead.propertyCategory);
      setLeadType(lead.propertyType);
      setLeadLocation(lead.preferredLocation);
      setLeadBudget(lead.maxBudget ? String(lead.maxBudget) : '');
      setLeadStatus(lead.status);
      setLeadSource(lead.source);
      setLeadFollowUp(lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 10) : '');
      setLeadNotes(lead.notes);
    } else {
      setEditingLead(null);
      setLeadClientName('');
      setLeadPhone('');
      setLeadWhatsApp('');
      setLeadCategory('Plot for Sale');
      setLeadType('Residential Plot');
      setLeadLocation('');
      setLeadBudget('');
      setLeadStatus('New');
      setLeadSource('Direct Call');
      setLeadFollowUp('');
      setLeadNotes('');
    }
    setShowLeadModal(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    saveLead({
      id: editingLead?.id,
      clientName: leadClientName.trim(),
      phone: leadPhone.trim(),
      whatsApp: leadWhatsApp.trim(),
      propertyCategory: leadCategory,
      propertyType: leadType,
      preferredLocation: leadLocation.trim(),
      maxBudget: parseAmountToNumber(leadBudget),
      status: leadStatus,
      source: leadSource,
      assignedAgent: editingLead?.assignedAgent || 'Super Admin',
      followUpDate: leadFollowUp ? new Date(leadFollowUp).getTime() : 0,
      notes: leadNotes.trim(),
      createdAt: editingLead?.createdAt || Date.now(),
    });
    setShowLeadModal(false);
  };

  // Advance lead status
  const handleAdvanceLeadStatus = (lead: LeadEntity) => {
    const curIdx = leadStatusOptions.indexOf(lead.status);
    if (curIdx >= 0 && curIdx < leadStatusOptions.length - 1) {
      const nextStatus = leadStatusOptions[curIdx + 1];
      saveLead({ ...lead, status: nextStatus });
    }
  };

  // Convert lead to client
  const handleConvertLeadToClient = (lead: LeadEntity) => {
    saveClient({
      name: lead.clientName,
      phone: lead.phone,
      whatsApp: lead.whatsApp,
      type: 'Client',
      category: 'Converted Lead',
      status: 'Active',
      email: '',
      city: 'Lahore',
      address: '',
      budget: lead.maxBudget,
      followUpDate: lead.followUpDate,
      interestedProperty: `${lead.propertyCategory} (${lead.preferredLocation})`,
      notes: `Converted from lead. Source: ${lead.source}. Notes: ${lead.notes}`,
      khataBalance: 0,
      createdAt: Date.now(),
    });
    saveLead({ ...lead, status: 'Closed Won' });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
          <button
            onClick={() => setActiveMainTab('leads')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'leads'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Leads Pipeline ({leads.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('clients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMainTab === 'clients'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Contacts & Clients ({clients.length})</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {activeMainTab === 'leads' ? (
            <>
              <div className="hidden sm:flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs font-medium">
                <button
                  onClick={() => setLeadViewMode('kanban')}
                  className={`px-3 py-1 rounded-lg ${
                    leadViewMode === 'kanban' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'
                  }`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setLeadViewMode('list')}
                  className={`px-3 py-1 rounded-lg ${
                    leadViewMode === 'list' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500'
                  }`}
                >
                  List View
                </button>
              </div>

              <button
                onClick={() => openLeadForm()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Lead</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => openClientForm()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────── TAB 1: LEADS PIPELINE ─────────────────── */}
      {activeMainTab === 'leads' && (
        <>
          {leadViewMode === 'kanban' ? (
            /* KANBAN BOARD */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {leadStatusOptions.map((st) => {
                const columnLeads = filteredLeads.filter((l) => l.status === st);
                return (
                  <div
                    key={st}
                    className="p-3 rounded-3xl bg-slate-100/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col min-w-[240px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                        {st}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold shadow-sm">
                        {columnLeads.length}
                      </span>
                    </div>

                    {/* Column Items */}
                    <div className="space-y-3 flex-1">
                      {columnLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-2 group"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {lead.clientName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                                {lead.source}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                              {lead.propertyCategory} • {lead.preferredLocation}
                            </p>

                            {lead.maxBudget > 0 && (
                              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatAmountWithWords(lead.maxBudget, 'PKR')}
                              </p>
                            )}

                            {lead.notes && (
                              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg">
                                "{lead.notes}"
                              </p>
                            )}
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1 rounded-lg text-slate-400 hover:text-sky-600"
                                  title="Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {lead.whatsApp && (
                                <a
                                  href={`https://wa.me/${lead.whatsApp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600"
                                  title="WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => openLeadForm(lead)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Advance or Convert */}
                            <div className="flex items-center gap-1">
                              {st !== 'Closed Won' && st !== 'Lost / Dropped' && (
                                <button
                                  onClick={() => handleAdvanceLeadStatus(lead)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg"
                                  title="Advance Stage"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {st === 'Closed Won' && (
                                <button
                                  onClick={() => handleConvertLeadToClient(lead)}
                                  className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-bold"
                                  title="Add to permanent Clients ledger"
                                >
                                  + Client
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm(`Move lead ${lead.clientName} to Trash?`)) {
                                    deleteLead(lead.id);
                                  }
                                }}
                                className="p-1 text-slate-300 hover:text-rose-500 rounded-lg"
                                title="Trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Lead Name</th>
                    <th className="px-4 py-3">Requirement</th>
                    <th className="px-4 py-3">Max Budget</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Follow-up</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{l.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{l.phone}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        <div>{l.propertyCategory}</div>
                        <div className="text-[10px] text-slate-400">{l.preferredLocation}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {l.maxBudget > 0 ? `PKR ${formatCommas(l.maxBudget)}` : 'Flexible'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{l.source}</td>
                      <td className="px-4 py-3.5 text-slate-500">{formatDate(l.followUpDate)}</td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => openLeadForm(l)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteLead(l.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ─────────────────── TAB 2: CLIENTS & CONTACTS ─────────────────── */}
      {activeMainTab === 'clients' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Contact Name</th>
                <th className="px-4 py-3">Type & Category</th>
                <th className="px-4 py-3">Phone / WhatsApp</th>
                <th className="px-4 py-3">Interested Property</th>
                <th className="px-4 py-3">Khata Balance</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.city} • {c.email || 'No email'}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.type === 'Client'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : c.type === 'Owner'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {c.type}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">{c.category}</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                    <div>{c.phone}</div>
                    {c.whatsApp && <div className="text-[10px] text-emerald-600">WA: {c.whatsApp}</div>}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                    {c.interestedProperty || 'General Portfolio'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-mono font-bold ${
                        c.khataBalance > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : c.khataBalance < 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {c.khataBalance > 0 ? '+' : ''}PKR {formatCommas(c.khataBalance)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(c.followUpDate)}</td>
                  <td className="px-4 py-3.5 text-right space-x-1">
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 text-slate-400 hover:text-sky-600"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5 inline" />
                      </a>
                    )}
                    {c.whatsApp && (
                      <a
                        href={`https://wa.me/${c.whatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-600"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 inline" />
                      </a>
                    )}
                    <button
                      onClick={() => openClientForm(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Move contact ${c.name} to Trash?`)) {
                          deleteClient(c.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                      title="Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─────────────────── CLIENT ADD/EDIT MODAL ─────────────────── */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClient ? 'Edit Contact Profile' : 'New Contact Entry'}
              </h3>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Name *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Haji Rizwan"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setClientName(cName);
                        if (cPhone) {
                          setClientPhone(cPhone);
                          if (!clientWhatsApp) setClientWhatsApp(cPhone);
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Type *
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Client">Client / Buyer</option>
                    <option value="Owner">Property Owner / Seller</option>
                    <option value="Dealer">Realtor / Collaborating Dealer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setClientPhone(cPhone);
                        if (cName && !clientName) setClientName(cName);
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={clientWhatsApp}
                      onChange={(e) => setClientWhatsApp(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setClientWhatsApp(cPhone);
                        if (cName && !clientName) setClientName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="Lahore"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Khata Balance (PKR)
                  </label>
                  <input
                    type="text"
                    value={clientKhataBalance ? formatInputWithCommas(clientKhataBalance) : ''}
                    onChange={(e) => setClientKhataBalance(e.target.value)}
                    placeholder="+ Owed to us / - We owe"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interested Property / Inquiry
                </label>
                <input
                  type="text"
                  value={clientInterestedProperty}
                  onChange={(e) => setClientInterestedProperty(e.target.value)}
                  placeholder="e.g. 1 Kanal Plot in DHA Phase 6"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Reminder Date
                </label>
                <input
                  type="date"
                  value={clientFollowUp}
                  onChange={(e) => setClientFollowUp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Preferences, budget flexibility, background..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────── LEAD ADD/EDIT MODAL ─────────────────── */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLead ? 'Edit Lead Entry' : 'New Lead Entry'}
              </h3>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prospect Name *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={leadClientName}
                      onChange={(e) => setLeadClientName(e.target.value)}
                      placeholder="e.g. Waqas Rasheed"
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cName) setLeadClientName(cName);
                        if (cPhone) {
                          setLeadPhone(cPhone);
                          if (!leadWhatsApp) setLeadWhatsApp(cPhone);
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setLeadPhone(cPhone);
                        if (cName && !leadClientName) setLeadClientName(cName);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={leadWhatsApp}
                      onChange={(e) => setLeadWhatsApp(e.target.value)}
                      placeholder="+92 300..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                    <ContactPickerButton
                      onContactSelected={(cName, cPhone) => {
                        if (cPhone) setLeadWhatsApp(cPhone);
                        if (cName && !leadClientName) setLeadClientName(cName);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Property Category
                  </label>
                  <select
                    value={leadCategory}
                    onChange={(e) => setLeadCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Plot for Sale">Plot for Sale</option>
                    <option value="Home for Sale">Home for Sale</option>
                    <option value="Home for Rent">Home for Rent</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Budget (PKR)
                  </label>
                  <input
                    type="text"
                    value={leadBudget ? formatInputWithCommas(leadBudget) : ''}
                    onChange={(e) => setLeadBudget(e.target.value)}
                    placeholder="e.g. 35,000,000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                  {leadBudget && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {formatAmountWithWords(leadBudget, 'PKR')}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pipeline Status
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
                  >
                    {leadStatusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Direct Call">Direct Call</option>
                    <option value="WhatsApp Inquiry">WhatsApp Inquiry</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Walk-in Client">Walk-in Client</option>
                    <option value="Client Referral">Client Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Location / Societies
                </label>
                <input
                  type="text"
                  value={leadLocation}
                  onChange={(e) => setLeadLocation(e.target.value)}
                  placeholder="e.g. DHA Phase 6 or Lake City"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Follow-up Reminder Date
                </label>
                <input
                  type="date"
                  value={leadFollowUp}
                  onChange={(e) => setLeadFollowUp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Notes & Deal Status
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Client offer, feedback from site visit, negotiation points..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
