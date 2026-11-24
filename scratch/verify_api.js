const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const env = fs.readFileSync(".env", "utf8");
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?([^"'\r\n]+)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/) || fs.readFileSync(".env.local", "utf8").match(/SUPABASE_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/);

const supabaseUrl = urlMatch ? urlMatch[1] : "https://npvwtzmlhpagsdohkuvm.supabase.co";
const serviceKey = keyMatch ? keyMatch[1] : "";

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("category", "owambe_table")
    .eq("location", "owambe-awb59cr");

  console.log("Database lookup result:", data ? data.length + " row(s)" : error);
  if (data && data[0]) {
    console.log("Table ID:", data[0].location);
    console.log("Phone:", data[0].country_code);
    console.log("Message:", data[0].message);
  }
}

check();
