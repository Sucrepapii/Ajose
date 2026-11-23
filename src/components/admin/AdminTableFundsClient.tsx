"use client";

import { useState, useEffect } from "react";
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
  Filter
} from "lucide-react";

interface MemberSlot {
  slot: number;
  name: string;
  paid: boolean;
  amount: number;
  paidAt?: string;
}

interface TableFundItem {
  id: string;
  squadName: string;
  event: string;
  tier: "silver" | "gold";
  tableName: string;
  tablePrice: number;
  totalTargetWithFees: number;
  perMemberTotal: number;
  leaderName: string;
  leaderPhone: string;
  createdAt: string;
  status: "collecting" | "fully_funded" | "released" | "refunded";
  contributions: MemberSlot[];
}

const DEFAULT_MOCK_FUNDS: TableFundItem[] = [
  {
    id: "owambe-lekki-babes",
    squadName: "Lekki Babes Table",
    event: "The Owambe Party (Wazobia Extravaganza)",
    tier: "gold",
    tableName: "Gold Table",
    tablePrice: 1000000,
    totalTargetWithFees: 1030000,
    perMemberTotal: 128750,
    leaderName: "Kemi Adeleke",
    leaderPhone: "08031234567",
    createdAt: "2026-11-20T10:30:00Z",
    status: "fully_funded",
    contributions: [
      { slot: 1, name: "Kemi Adeleke (Leader)", paid: true, amount: 128750, paidAt: "2026-11-20" },
      { slot: 2, name: "Folake Williams", paid: true, amount: 128750, paidAt: "2026-11-21" },
      { slot: 3, name: "Zainab Ahmed", paid: true, amount: 128750, paidAt: "2026-11-21" },
      { slot: 4, name: "Chidinma Okafor", paid: true, amount: 128750, paidAt: "2026-11-21" },
      { slot: 5, name: "Blessing Bassey", paid: true, amount: 128750, paidAt: "2026-11-22" },
      { slot: 6, name: "Amaka Eze", paid: true, amount: 128750, paidAt: "2026-11-22" },
      { slot: 7, name: "Ronke Alabi", paid: true, amount: 128750, paidAt: "2026-11-22" },
      { slot: 8, name: "Simi Oladipo", paid: true, amount: 128750, paidAt: "2026-11-23" },
    ],
  },
  {
    id: "owambe-tech-squad",
    squadName: "Yaba Tech Founders VIP",
    event: "The Owambe Party (Wazobia Extravaganza)",
    tier: "silver",
    tableName: "Silver Table",
    tablePrice: 500000,
    totalTargetWithFees: 515000,
    perMemberTotal: 64375,
    leaderName: "Tunde Adeyemi",
    leaderPhone: "08029876543",
    createdAt: "2026-11-21T14:15:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Tunde Adeyemi (Leader)", paid: true, amount: 64375, paidAt: "2026-11-21" },
      { slot: 2, name: "Damilola Coker", paid: true, amount: 64375, paidAt: "2026-11-22" },
      { slot: 3, name: "Ifeanyi Nnamdi", paid: true, amount: 64375, paidAt: "2026-11-22" },
      { slot: 4, name: "Femi Balogun", paid: true, amount: 64375, paidAt: "2026-11-23" },
      { slot: 5, name: "Squad Member #5", paid: false, amount: 64375 },
      { slot: 6, name: "Squad Member #6", paid: false, amount: 64375 },
      { slot: 7, name: "Squad Member #7", paid: false, amount: 64375 },
      { slot: 8, name: "Squad Member #8", paid: false, amount: 64375 },
    ],
  },
  {
    id: "owambe-alumni-squad",
    squadName: "Unilag 2018 Alumni",
    event: "The Owambe Party (Wazobia Extravaganza)",
    tier: "silver",
    tableName: "Silver Table",
    tablePrice: 500000,
    totalTargetWithFees: 515000,
    perMemberTotal: 64375,
    leaderName: "Gbenga Salami",
    leaderPhone: "08055554321",
    createdAt: "2026-11-22T09:00:00Z",
    status: "collecting",
    contributions: [
      { slot: 1, name: "Gbenga Salami (Leader)", paid: true, amount: 64375, paidAt: "2026-11-22" },
      { slot: 2, name: "Bukky Shonubi", paid: true, amount: 64375, paidAt: "2026-11-22" },
      { slot: 3, name: "Squad Member #3", paid: false, amount: 64375 },
      { slot: 4, name: "Squad Member #4", paid: false, amount: 64375 },
      { slot: 5, name: "Squad Member #5", paid: false, amount: 64375 },
      { slot: 6, name: "Squad Member #6", paid: false, amount: 64375 },
      { slot: 7, name: "Squad Member #7", paid: false, amount: 64375 },
      { slot: 8, name: "Squad Member #8", paid: false, amount: 64375 },
    ],
  },
];

export function AdminTableFundsClient() {
  const [funds, setFunds] = useState<TableFundItem[]>(DEFAULT_MOCK_FUNDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedFund, setSelectedFund] = useState<TableFundItem | null>(null);

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
      f.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export Door List CSV
  const exportDoorListCSV = () => {
    const headers = [
      "Table Fund ID",
      "Squad Name",
      "Tier",
      "Event",
      "Slot Number",
      "Member Name",
      "Amount (NGN)",
      "Payment Status",
      "Paid Date",
      "Squad Leader",
      "Squad Leader WhatsApp"
    ];

    const rows: string[][] = [];

    funds.forEach((f) => {
      f.contributions.forEach((c) => {
        rows.push([
          f.id,
          `"${f.squadName.replace(/"/g, '""')}"`,
          f.tableName,
          `"${f.event}"`,
          c.slot.toString(),
          `"${c.name.replace(/"/g, '""')}"`,
          c.amount.toString(),
          c.paid ? "CONFIRMED_PAID" : "PENDING",
          c.paidAt || "N/A",
          `"${f.leaderName.replace(/"/g, '""')}"`,
          f.leaderPhone
        ]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Owambe_Party_Table_Door_List_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="space-y-6">
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
            Track squad table contributions, monitor Paylode escrow balances, and export verified attendee door lists.
          </p>
        </div>

        <button
          onClick={exportDoorListCSV}
          className="py-2.5 px-5 bg-[#0B3022] hover:bg-[#124230] text-[#F3EEE3] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#D4A843]" />
          <span>Export Door List (CSV)</span>
        </button>
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
            Confirmed Guests
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B3022]">
            {totalConfirmedGuests}
          </span>
          <span className="text-[11px] text-[#0B3022]/60 block mt-1">
            Individual Paid Attendees
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#0B3022]/10 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search squad, leader, or fund ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#0B3022]/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3022]"
          >
            <option value="all">All Statuses</option>
            <option value="collecting">Collecting (In Progress)</option>
            <option value="fully_funded">100% Fully Funded</option>
            <option value="released">Released to Owambe Party</option>
          </select>
        </div>
      </div>

      {/* Table Funds Roster */}
      <div className="bg-white rounded-2xl border border-[#0B3022]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-[#0B3022]/10 text-[#0B3022] font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Squad & Table</th>
                <th className="py-3.5 px-4">Tier & Price</th>
                <th className="py-3.5 px-4">Funding Progress</th>
                <th className="py-3.5 px-4">Squad Leader</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFunds.map((fund) => {
                const paidCount = fund.contributions.filter((c) => c.paid).length;
                const currentAmount = paidCount * fund.perMemberTotal;
                const pct = Math.round((paidCount / 8) * 100);

                return (
                  <tr key={fund.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-sm text-[#0B3022]">{fund.squadName}</div>
                      <span className="font-mono text-[10px] text-gray-500">ID: {fund.id}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded-md ${
                        fund.tier === "gold" ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-slate-100 text-slate-800"
                      }`}>
                        {fund.tableName}
                      </span>
                      <span className="block font-mono text-[11px] text-gray-600 mt-0.5">
                        ₦{fund.tablePrice.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[160px]">
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <strong className="text-[#0B3022]">₦{currentAmount.toLocaleString()}</strong>
                        <span className="text-gray-500">{paidCount}/8 ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            paidCount === 8 ? "bg-emerald-600" : "bg-[#D4A843]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0B3022]">{fund.leaderName}</div>
                      <a
                        href={`https://wa.me/${fund.leaderPhone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {fund.leaderPhone}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      {fund.status === "fully_funded" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Fully Funded
                        </span>
                      )}
                      {fund.status === "collecting" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Collecting ({paidCount}/8)
                        </span>
                      )}
                      {fund.status === "released" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <ShieldCheck className="w-3 h-3" /> Payout Released
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedFund(fund)}
                        className="py-1.5 px-3 bg-gray-100 hover:bg-[#0B3022] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Slots</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Slots Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 text-left shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-mono font-bold text-[#D4A843] uppercase tracking-wider bg-[#0B3022] px-2.5 py-0.5 rounded-full">
                  {selectedFund.tableName} (8 Seats)
                </span>
                <h3 className="text-xl font-bold text-[#0B3022] mt-1.5">{selectedFund.squadName}</h3>
                <p className="text-xs text-gray-500 font-mono">Leader: {selectedFund.leaderName} • {selectedFund.leaderPhone}</p>
              </div>
              <button
                onClick={() => setSelectedFund(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-4">
              {selectedFund.contributions.map((c) => (
                <div
                  key={c.slot}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    c.paid ? "bg-emerald-50/70 border-emerald-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-white border text-center font-bold font-mono leading-6 text-[11px]">
                      #{c.slot}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 block">{c.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {c.paid ? `Paid: ${c.paidAt || "Yes"}` : "Pending payment"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-gray-900 block">
                      ₦{c.amount.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-bold ${c.paid ? "text-emerald-700" : "text-amber-700"}`}>
                      {c.paid ? "CONFIRMED" : "PENDING"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <a
                href={`/table/${selectedFund.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#0B3022] hover:underline flex items-center gap-1"
              >
                <span>Open Live Public Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {selectedFund.status === "fully_funded" && (
                <button
                  onClick={() => handleMarkReleased(selectedFund.id)}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Mark Payout Released
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
