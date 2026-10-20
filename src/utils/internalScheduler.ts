/**
 * Àjọṣe In-Process Autonomous Sweep Scheduler
 *
 * Runs inside the Node/PM2 server process so automated direct debit sweeps
 * fire reliably every morning (06:00 AM WAT) and evening retry (06:00 PM WAT)
 * for all active Daily, Weekly, and Monthly circles, without requiring manual clicks.
 */

let isSchedulerRunning = false;
let lastSweepHour = -1;

export function startInternalSweepScheduler() {
  if (isSchedulerRunning) return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  isSchedulerRunning = true;
  console.log("[Àjọṣe Scheduler] Autonomous sweep engine initialized. Monitoring Daily, Weekly & Monthly circles.");

  // Run initial check 45 seconds after server startup
  setTimeout(() => {
    checkAndExecuteSweep("Server Startup Initial Check");
  }, 45 * 1000);

  // Check every 15 minutes to accurately catch scheduled sweep windows
  setInterval(() => {
    const now = new Date();
    // West Africa Time (WAT) is UTC+1
    const watHour = (now.getUTCHours() + 1) % 24;

    // Target windows:
    // 06:00 AM WAT (Primary Morning Auto-Sweep)
    // 18:00 PM WAT (Evening Retry Auto-Sweep)
    const isTargetHour = watHour === 6 || watHour === 18;

    if (isTargetHour && lastSweepHour !== watHour) {
      lastSweepHour = watHour;
      checkAndExecuteSweep(`${watHour === 6 ? "Morning" : "Evening"} Scheduled Sweep (${watHour}:00 WAT)`);
    }
  }, 15 * 60 * 1000);
}

async function checkAndExecuteSweep(triggerReason: string) {
  try {
    const port = process.env.PORT || 3000;
    const cronSecret = process.env.CRON_SECRET || "ajose_sec_cron_99f2b810d7a6e4c";
    const targetUrl = `http://127.0.0.1:${port}/api/cron/sweep`;

    console.log(`[Àjọṣe Scheduler] Triggering automated sweep [${triggerReason}] via ${targetUrl}...`);

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cronSecret}`,
        "Content-Type": "application/json"
      }
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log(`[Àjọṣe Scheduler] Automated sweep completed successfully:`, data?.message || data?.results?.length ? `${data?.results?.length} circles processed` : "Reconciled");
    } else {
      console.warn(`[Àjọṣe Scheduler] Automated sweep returned status ${res.status}`);
    }
  } catch (err: any) {
    // If local fetch fails (e.g. build phase or custom port), log without crashing process
    console.warn(`[Àjọṣe Scheduler] Internal sweep trigger warning:`, err?.message || err);
  }
}
