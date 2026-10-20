export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startInternalSweepScheduler } = await import("@/utils/internalScheduler");
    startInternalSweepScheduler();
  }
}
