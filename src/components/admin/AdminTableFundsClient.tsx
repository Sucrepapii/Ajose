"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PartyPopper, 
  Download, 
  Search, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Eye, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from "lucide-react";

interface MemberSlot {
  slot: number;
  name: string;
  email?: string;
  phone?: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
}

interface TableFundItem {
  id: string;
  squadName: string;
  event: string;
  venue?: string;
  eventDate?: string;
  deadline?: string;
  tier: "silver" | "gold";
  tableName: string;
  tablePrice: number;
  totalTargetWithFees: number;
  perMemberTotal: number;
  leaderName: string;
  leaderEmail?: string;
  leaderPhone: string;
  createdAt: string;
  status: "collecting" | "fully_funded" | "released" | "refunded";
  contributions: MemberSlot[];
}

const DEFAULT_MOCK_FUNDS: TableFundItem[] = [
  {
    id: "owambe-lekki-babes",
    squadName: "Lekki Babes VIP Table",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "gold",
    tableName: "Gold Table (₦1,000,000)",
    tablePrice: 1000000,
    totalTargetWithFees: 1030000,
    perMemberTotal: 128750,
    leaderName: "Kemi Adeleke",
    leaderEmail: "kemi.adeleke@gmail.com",
    leaderPhone: "08031234567",
    createdAt: "2026-11-20T10:30:00Z",
    status: "fully_funded",
    contributions: [
      { slot: 1, name: "Kemi Adeleke (Squad Leader)", email: "kemi.adeleke@gmail.com", phone: "08031234567", paid: true, amount: 128750, paidAt: "2026-11-20 10:32" },
      { slot: 2, name: "Folake Williams", email: "folake.w@yahoo.com", phone: "08021112233", paid: true, amount: 128750, paidAt: "2026-11-21 11:15" },
      { slot: 3, name: "Zainab Ahmed", email: "zainab.ahmed@outlook.com", phone: "08093334455", paid: true, amount: 128750, paidAt: "2026-11-21 14:02" },
      { slot: 4, name: "Chidinma Okafor", email: "chidinma.o@gmail.com", phone: "07035556677", paid: true, amount: 128750, paidAt: "2026-11-21 18:40" },
      { slot: 5, name: "Blessing Bassey", email: "b.bassey@gmail.com", phone: "08147778899", paid: true, amount: 128750, paidAt: "2026-11-22 09:12" },
      { slot: 6, name: "Amaka Eze", email: "amaka.eze@gmail.com", phone: "08089990011", paid: true, amount: 128750, paidAt: "2026-11-22 13:45" },
      { slot: 7, name: "Ronke Alabi", email: "ronke.alabi@gmail.com", phone: "09022223344", paid: true, amount: 128750, paidAt: "2026-11-22 17:30" },
      { slot: 8, name: "Simi Oladipo", email: "simi.oladipo@gmail.com", phone: "08064445566", paid: true, amount: 128750, paidAt: "2026-11-23 08:20" },
    ],
  },
  {
    id: "owambe-tech-squad",
    squadName: "Yaba Tech Founders VIP",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "silver",
    tableName: "Silver Table (₦500,000)",
    tablePrice: 500000,
    totalTargetWithFees: 515000,
    perMemberTotal: 64375,
    leaderName: "Tunde Adeyemi",
    leaderEmail: "tunde.adeyemi@founder.ng",
    leaderPhone: "08029876543",
    createdAt: "2026-11-21T14:15:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Tunde Adeyemi (Squad Leader)", email: "tunde.adeyemi@founder.ng", phone: "08029876543", paid: true, amount: 64375, paidAt: "2026-11-21 14:18" },
      { slot: 2, name: "Damilola Coker", email: "dami.coker@paystack.com", phone: "08034441122", paid: true, amount: 64375, paidAt: "2026-11-22 10:04" },
      { slot: 3, name: "Ifeanyi Nnamdi", email: "ifeanyi@flutterwave.com", phone: "08126663344", paid: true, amount: 64375, paidAt: "2026-11-22 16:22" },
      { slot: 4, name: "Femi Balogun", email: "femi.b@techcabal.com", phone: "07068885566", paid: true, amount: 64375, paidAt: "2026-11-23 11:30" },
      { slot: 5, name: "Squad Member #5", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 6, name: "Squad Member #6", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 7, name: "Squad Member #7", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 8, name: "Squad Member #8", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
    ],
  },
  {
    id: "owambe-alumni-squad",
    squadName: "Unilag 2018 Alumni",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "silver",
    tableName: "Silver Table (₦500,000)",
    tablePrice: 500000,
    totalTargetWithFees: 515000,
    perMemberTotal: 64375,
    leaderName: "Gbenga Salami",
    leaderEmail: "gbenga.salami@yahoo.co.uk",
    leaderPhone: "08055554321",
    createdAt: "2026-11-22T09:00:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Gbenga Salami (Squad Leader)", email: "gbenga.salami@yahoo.co.uk", phone: "08055554321", paid: true, amount: 64375, paidAt: "2026-11-22 09:05" },
      { slot: 2, name: "Bukky Shonubi", email: "bukky.shonubi@gmail.com", phone: "08039998877", paid: true, amount: 64375, paidAt: "2026-11-22 15:40" },
      { slot: 3, name: "Squad Member #3", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 4, name: "Squad Member #4", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 5, name: "Squad Member #5", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 6, name: "Squad Member #6", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 7, name: "Squad Member #7", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
      { slot: 8, name: "Squad Member #8", email: "pending@member.ng", phone: "N/A", paid: false, amount: 64375 },
    ],
  },
];

export function AdminTableFundsClient() {
  const [funds, setFunds] = useState<TableFundItem[]>(DEFAULT_MOCK_FUNDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFund, setSelectedFund] = useState<TableFundItem | null>(null);

  // In-App Double Opt-In confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    type: "delete_table" | "remove_member";
    fundId: string;
    slotNumber?: number;
    title: string;
    message: string;
    isPaid?: boolean;
  } | null>(null);

  // Load any created funds from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const customFunds: TableFundItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("table_fund_")) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || "");
            if (parsed && parsed.id) {
              const paidCount = parsed.contributions.filter((c: any) => c.paid).length;
              parsed.status = paidCount === 8 ? "fully_funded" : "collecting";
              customFunds.push(parsed);
            }
          } catch (_) {}
        }
      }
      if (customFunds.length > 0) {
        // Merge with mock, avoiding duplicate IDs
        const existingIds = new Set(customFunds.map((f) => f.id));
        const merged = [...customFunds, ...DEFAULT_MOCK_FUNDS.filter((f) => !existingIds.has(f.id))];
        setFunds(merged);
      }
    }
  }, []);

  // Compute Metrics
  const totalFundsCount = funds.length;
  const fullyFundedCount = funds.filter((f) => f.status === "fully_funded" || f.status === "released").length;
  
  let totalRaisedNGN = 0;
  let totalConfirmedGuests = 0;

  funds.forEach((f) => {
    f.contributions.forEach((c) => {
      if (c.paid) {
        totalRaisedNGN += c.amount;
        totalConfirmedGuests += 1;
      }
    });
  });

  // Filtered list
  const filteredFunds = funds.filter((f) => {
    const matchesSearch = 
      f.squadName.toLowerCase().includes(search.toLowerCase()) ||
      f.leaderName.toLowerCase().includes(search.toLowerCase()) ||
      (f.leaderEmail && f.leaderEmail.toLowerCase().includes(search.toLowerCase())) ||
      f.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /**
   * Export 1: Comprehensive Guest Door List (1 row per seat with full table metadata & group names)
   * Opens directly in Microsoft Excel or Google Sheets.
   */
  const exportDoorListCSV = () => {
    const headers = [
      "Table Fund ID",
      "Table / Squad Name",
      "Ticket Type (Tier)",
      "Event Name",
      "Event Venue",
      "Event Date",
      "Table Target Price (NGN)",
      "Total Target With Fees (NGN)",
      "Total Amount Collected (NGN)",
      "Table Funding Status",
      "Squad Leader Name",
      "Squad Leader Email",
      "Squad Leader WhatsApp",
      "Slot Number",
      "Guest / Member Name",
      "Guest Email",
      "Guest Phone",
      "Individual Share Paid (NGN)",
      "Slot Payment Status",
      "Payment Date & Time",
      "All Group Member Names (Complete Squad Roster)"
    ];

    const rows: string[][] = [];

    funds.forEach((f) => {
      // Calculate current total collected for this table
      const tableCollected = f.contributions
        .filter((c) => c.paid)
        .reduce((sum, c) => sum + c.amount, 0);

      // Semicolon-separated list of all names in this squad
      const allNamesInGroup = f.contributions
        .map((c) => `${c.name} (${c.paid ? "PAID" : "PENDING"})`)
        .join("; ");

      f.contributions.forEach((c) => {
        rows.push([
          `"${f.id}"`,
          `"${f.squadName.replace(/"/g, '""')}"`,
          `"${f.tableName.replace(/"/g, '""')}"`,
          `"${f.event.replace(/"/g, '""')}"`,
          `"${f.venue || "Amore Gardens, Lekki"}"`,
          `"${f.eventDate || "20 December 2026"}"`,
          f.tablePrice.toString(),
          f.totalTargetWithFees.toString(),
          tableCollected.toString(),
          `"${f.status.toUpperCase()}"`,
          `"${f.leaderName.replace(/"/g, '""')}"`,
          `"${f.leaderEmail || "N/A"}"`,
          `"${f.leaderPhone}"`,
          c.slot.toString(),
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.email || "N/A"}"`,
          `"${c.phone || "N/A"}"`,
          c.amount.toString(),
          c.paid ? "CONFIRMED_PAID" : "PENDING_PAYMENT",
          `"${c.paidAt || "N/A"}"`,
          `"${allNamesInGroup.replace(/"/g, '""')}"`
        ]);
      });
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Owambe_Party_Door_List_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Export 2: Tables Master Summary (1 row per table with aggregated attendee names, financials, and status)
   */
  const exportTablesSummaryCSV = () => {
    const headers = [
      "Table Fund ID",
      "Table / Squad Name",
      "Ticket Type",
      "Base Table Price (NGN)",
      "Total Target With Fees (NGN)",
      "Total Amount Collected (NGN)",
      "Net Payout Due to Owambe Party (NGN)",
      "Funding Status",
      "Paid Slots Count",
      "Squad Leader Name",
      "Squad Leader Email",
      "Squad Leader WhatsApp",
      "All Group Member Names (Full Squad Roster)",
      "All Member Emails",
      "All Member Phone Numbers",
      "Table Created Date"
    ];

    const rows: string[][] = [];

    funds.forEach((f) => {
      const paidMembers = f.contributions.filter((c) => c.paid);
      const paidCount = paidMembers.length;
      const totalCollected = paidMembers.reduce((sum, c) => sum + c.amount, 0);

      // Payout to Owambe party is the base table price (or proportional if partially funded)
      const payoutDue = (f.tablePrice / 8) * paidCount;

      const allNames = f.contributions.map((c) => c.name).join("; ");
      const allEmails = f.contributions.map((c) => c.email || "N/A").join("; ");
      const allPhones = f.contributions.map((c) => c.phone || "N/A").join("; ");

      rows.push([
        `"${f.id}"`,
        `"${f.squadName.replace(/"/g, '""')}"`,
        `"${f.tableName.replace(/"/g, '""')}"`,
        f.tablePrice.toString(),
        f.totalTargetWithFees.toString(),
        totalCollected.toString(),
        payoutDue.toString(),
        `"${f.status.toUpperCase()}"`,
        `"${paidCount} of 8"`,
        `"${f.leaderName.replace(/"/g, '""')}"`,
        `"${f.leaderEmail || "N/A"}"`,
        `"${f.leaderPhone}"`,
        `"${allNames.replace(/"/g, '""')}"`,
        `"${allEmails.replace(/"/g, '""')}"`,
        `"${allPhones.replace(/"/g, '""')}"`,
        `"${f.createdAt}"`
      ]);
    });

    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Owambe_Party_Tables_Summary_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleMarkReleased = (id: string) => {
    const updated = funds.map((f) => {
      if (f.id === id) {
        return { ...f, status: "released" as const };
      }
      return f;
    });
    setFunds(updated);
    if (selectedFund && selectedFund.id === id) {
      setSelectedFund({ ...selectedFund, status: "released" });
    }
  };

  const handleDeleteTable = (id: string) => {
    const target = funds.find((f) => f.id === id);
    if (!target) return;

    const paidCount = target.contributions.filter((c) => c.paid).length;

    setConfirmModal({
      type: "delete_table",
      fundId: id,
      title: "Delete Squad Table?",
      message:
        paidCount > 0
          ? `Warning: "${target.squadName}" has ${paidCount} paid contribution(s) amounting to ₦${(paidCount * target.perMemberTotal).toLocaleString()} held in Paylode escrow.\n\nAre you sure you want to permanently delete/archive this squad table?`
          : `Are you sure you want to permanently delete squad table "${target.squadName}"? This action cannot be undone.`,
      isPaid: paidCount > 0,
    });
  };

  const handleRemoveMember = (fundId: string, slotNumber: number) => {
    const fund = funds.find((f) => f.id === fundId);
    if (!fund) return;
    const slot = fund.contributions.find((c) => c.slot === slotNumber);
    if (!slot) return;

    setConfirmModal({
      type: "remove_member",
      fundId,
      slotNumber,
      title: slot.paid ? "Refund & Release Seat?" : "Reset Seat to Open?",
      message: slot.paid
        ? `Slot #${slotNumber} (${slot.name}) has paid ₦${slot.amount.toLocaleString()} into Paylode escrow. Do you want to process an escrow refund and reset this slot back to an open seat for another guest?`
        : `Reset Slot #${slotNumber} ("${slot.name}") back to an open, unoccupied seat?`,
      isPaid: slot.paid,
    });
  };

  const executeConfirmedAction = () => {
    if (!confirmModal) return;

    if (confirmModal.type === "delete_table") {
      const id = confirmModal.fundId;
      setFunds((prev) => prev.filter((f) => f.id !== id));
      if (selectedFund && selectedFund.id === id) {
        setSelectedFund(null);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(`table_fund_${id}`);
      }
    } else if (confirmModal.type === "remove_member" && confirmModal.slotNumber) {
      const { fundId, slotNumber } = confirmModal;
      const fund = funds.find((f) => f.id === fundId);
      if (fund) {
        const updatedContributions = fund.contributions.map((c) => {
          if (c.slot === slotNumber) {
            return {
              slot: slotNumber,
              name: `Squad Member #${slotNumber}`,
              paid: false,
              amount: fund.perMemberTotal,
            };
          }
          return c;
        });

        const paidCount = updatedContributions.filter((c) => c.paid).length;
        const updatedFund: TableFundItem = {
          ...fund,
          status: paidCount === 8 ? "fully_funded" : "collecting",
          contributions: updatedContributions,
        };

        setFunds((prev) => prev.map((f) => (f.id === fundId ? updatedFund : f)));
        if (selectedFund && selectedFund.id === fundId) {
          setSelectedFund(updatedFund);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(`table_fund_${fundId}`, JSON.stringify(updatedFund));
        }
      }
    }

    setConfirmModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#0B3022]/70 hover:text-[#0B3022] bg-white border border-[#0B3022]/15 px-3.5 py-1.5 rounded-full shadow-xs hover:shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4A843]" />
          <span>Back to Operations Dashboard</span>
        </Link>
      </div>

      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0B3022]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <PartyPopper className="w-3.5 h-3.5" /> Event Partnership Monitor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3022] font-serif">
            The Owambe Party: Table Funds Desk
          </h1>
          <p className="text-xs text-[#0B3022]/70 mt-1">
            Track squad table contributions, monitor Paylode escrow balances, and export verified attendee door lists for 20 Dec.
          </p>
        </div>

        {/* 2 CSV Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={exportTablesSummaryCSV}
            className="py-2.5 px-4 bg-white hover:bg-gray-50 text-[#0B3022] border border-[#0B3022]/20 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            title="Download high-level summary with 1 row per table"
          >
            <Download className="w-3.5 h-3.5 text-[#0B3022]" />
            <span>Tables Summary (CSV)</span>
          </button>
          
          <button
            onClick={exportDoorListCSV}
            className="py-2.5 px-5 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            title="Download complete guest check-in roster with all member names and status"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4A843]" />
            <span>Export Door List (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#0B3022]/10 shadow-xs">
          <span className="text-[11px] font-mono text-[#0B3022]/60 uppercase tracking-wider block mb-1">
            Total Squad Funds
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B3022]">
            {totalFundsCount}
          </span>
          <span className="text-[11px] text-[#0B3022]/60 block mt-1">
            Active Table Campaigns
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#0B3022]/10 shadow-xs">
          <span className="text-[11px] font-mono text-[#0B3022]/60 uppercase tracking-wider block mb-1">
            Total Capital Pooled
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#D4A843]">
            ₦{totalRaisedNGN.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#0B3022]/60 block mt-1">
            Held in Paylode Escrow
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#0B3022]/10 shadow-xs">
          <span className="text-[11px] font-mono text-[#0B3022]/60 uppercase tracking-wider block mb-1">
            100% Funded Tables
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
            {fullyFundedCount}
          </span>
          <span className="text-[11px] text-emerald-700/80 block mt-1 font-medium">
            Ready for Gate Issuance
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#0B3022]/10 shadow-xs">
          <span className="text-[11px] font-mono text-[#0B3022]/60 uppercase tracking-wider block mb-1">
            Confirmed Attendees
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B3022]">
            {totalConfirmedGuests}
          </span>
          <span className="text-[11px] text-[#0B3022]/60 block mt-1">
            Paid Guest Wristbands
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#0B3022]/10 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Squad Name, Leader Name, or Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#0B3022]/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022] bg-white text-[#0B3022] font-medium"
          >
            <option value="all">All Statuses ({funds.length})</option>
            <option value="fully_funded">100% Fully Funded</option>
            <option value="collecting">Collecting Shares</option>
            <option value="released">Payout Released</option>
          </select>
        </div>
      </div>

      {/* Squad Tables Roster Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table List Column (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredFunds.map((fund) => {
            const paidMembers = fund.contributions.filter((c) => c.paid);
            const paidCount = paidMembers.length;
            const progress = Math.round((paidCount / 8) * 100);
            const isSelected = selectedFund?.id === fund.id;

            return (
              <div
                key={fund.id}
                onClick={() => setSelectedFund(fund)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0B3022] text-[#F3EEE3] border-[#D4A843] shadow-lg"
                    : "bg-white text-[#0B3022] border-gray-200 hover:border-[#D4A843]/60 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        fund.tier === "gold"
                          ? isSelected ? "bg-[#D4A843]/20 text-[#D4A843]" : "bg-amber-100 text-amber-800"
                          : isSelected ? "bg-white/10 text-white" : "bg-gray-100 text-gray-700"
                      }`}>
                        {fund.tableName}
                      </span>
                      <span className={`text-xs font-mono ${isSelected ? "text-[#F3EEE3]/60" : "text-gray-400"}`}>
                        #{fund.id}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mt-1 font-serif">
                      {fund.squadName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${
                      isSelected ? "text-[#D4A843]" : "text-[#0B3022]"
                    }`}>
                      ₦{(paidCount * fund.perMemberTotal).toLocaleString()} / ₦{fund.totalTargetWithFees.toLocaleString()}
                    </span>
                    <span className={`text-[11px] font-mono ${isSelected ? "text-[#F3EEE3]/70" : "text-gray-500"}`}>
                      {paidCount} of 8 Shares Paid ({progress}%)
                    </span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200/40 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      progress === 100 ? "bg-emerald-500" : isSelected ? "bg-[#D4A843]" : "bg-[#0B3022]"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-current/10">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span>{fund.leaderName}</span>
                    </span>
                    <span className="opacity-60">{fund.leaderPhone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      fund.status === "fully_funded" || fund.status === "released"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {fund.status.replace("_", " ")}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-60" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Inspector Details Column (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#0B3022]/15 shadow-md self-start sticky top-20">
          {selectedFund ? (
            <div className="space-y-5">
              <div className="pb-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-[#0B3022]/[0.06] text-[#0B3022] font-bold px-2 py-0.5 rounded-full">
                    Squad Inspector
                  </span>
                  <h2 className="text-xl font-bold font-serif text-[#0B3022] mt-1.5">
                    {selectedFund.squadName}
                  </h2>
                  <p className="text-xs text-[#0B3022]/60 mt-0.5">
                    {selectedFund.tableName} &bull; Target: ₦{selectedFund.totalTargetWithFees.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFund(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#0B3022] text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
                  title="Close and return to full table list"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Leader & Contact Details */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#0B3022]/10 space-y-2 text-xs">
                <div className="font-bold text-[#0B3022] flex items-center justify-between">
                  <span>Squad Leader:</span>
                  <span>{selectedFund.leaderName}</span>
                </div>
                {selectedFund.leaderEmail && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email:</span>
                    <span className="font-mono">{selectedFund.leaderEmail}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp:</span>
                  <span className="font-mono">{selectedFund.leaderPhone}</span>
                </div>
              </div>

              {/* 8 Member Slots List */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B3022] mb-3">
                  Attendee Roster (8 Slots)
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedFund.contributions.map((slot) => (
                    <div
                      key={slot.slot}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        slot.paid
                          ? "bg-emerald-500/[0.04] border-emerald-500/20 text-[#0B3022]"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate text-[#0B3022]">
                          #{slot.slot} {slot.name}
                        </div>
                        {slot.email && (
                          <div className="text-[10px] text-gray-500 truncate">
                            {slot.email}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-gray-400">
                          ₦{slot.amount.toLocaleString()} &bull; {slot.paidAt || "Pending"}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          slot.paid ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                        }`}>
                          {slot.paid ? "Paid" : "Unpaid"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(selectedFund.id, slot.slot)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title={slot.paid ? "Refund member & reset slot to empty" : "Reset slot to empty"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {selectedFund.status === "fully_funded" && (
                  <button
                    onClick={() => handleMarkReleased(selectedFund.id)}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Payout Released to Owambe Party</span>
                  </button>
                )}

                <a
                  href={`/table/${selectedFund.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#0B3022] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Live Squad Link</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleDeleteTable(selectedFund.id)}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all border border-rose-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete / Discard Squad Table</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-xs">Select any squad table to inspect attendee slots, emails, and payment receipts.</p>
            </div>
          )}
        </div>
      </div>

      {/* In-App Double Opt-In Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-left shadow-2xl border border-gray-100">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              confirmModal.isPaid
                ? "bg-rose-50 border border-rose-200 text-rose-600"
                : "bg-amber-50 border border-amber-200 text-amber-600"
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold font-serif text-[#0B3022] mb-2">
              {confirmModal.title}
            </h3>

            <p className="text-xs text-[#0B3022]/80 leading-relaxed whitespace-pre-line mb-6">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
