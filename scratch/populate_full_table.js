const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync(".env", "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || fs.readFileSync(".env.local", "utf8").match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/);

const supabaseUrl = urlMatch ? urlMatch[1] : "https://npvwtzmlhpagsdohkuvm.supabase.co";
const serviceKey = keyMatch ? keyMatch[1] : "";

const supabase = createClient(supabaseUrl, serviceKey);

async function populateFullTable() {
  const fullFund = {
    id: "owambe-awb59cr",
    squadName: "Mayowa Squad Table",
    event: "The Owambe Party (Wazobia Extravaganza)",
    venue: "Amore Gardens, Lekki",
    eventDate: "20 December 2026",
    deadline: "10 December 2026",
    tier: "silver",
    tableName: "Silver Table",
    tablePrice: 500000,
    totalTargetWithFees: 505000,
    memberCount: 10,
    perMemberTotal: 50500,
    perMemberShare: 50000,
    perMemberFee: 500,
    leaderName: "Mayowa",
    leaderEmail: "mayowa@gmail.com",
    leaderPhone: "09024129891",
    createdAt: new Date().toISOString(),
    status: "collecting",
    contributions: [
      {
        name: "Mayowa (Squad Leader)",
        email: "mayowa@gmail.com",
        phone: "09024129891",
        paid: false,
        amount: 50500,
        slot: 1
      },
      ...Array.from({ length: 9 }, (_, i) => ({
        name: `Squad Member #${i + 2}`,
        paid: false,
        amount: 50500,
        slot: i + 2
      }))
    ]
  };

  const { data, error } = await supabase
    .from("feedback")
    .update({
      message: JSON.stringify(fullFund),
      name: fullFund.squadName,
      country_code: fullFund.leaderPhone
    })
    .eq("category", "owambe_table")
    .eq("location", "owambe-awb59cr");

  console.log("Updated table successfully:", error ? error.message : "OK");
}

populateFullTable();
