"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";
import type { Step, EventData } from "react-joyride";

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run tour if they haven't seen it yet
    const hasSeenTour = localStorage.getItem("ajose_onboarding_tour");
    if (!hasSeenTour) {
      setRun(true);
    }
    
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const targetPrefix = isMobile ? ".tour-mobile-" : ".tour-desktop-";

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Welcome to Àjọṣe! 🎉",
      content: "Let's take a quick tour to show you how to set up your account, verify your identity, and start saving with your circle.",
      skipBeacon: true,
    },
    {
      target: `${targetPrefix}verify`,
      title: "Verify Your Identity",
      content: "Before you can join or create groups, you need to verify your BVN through Mono Open Banking. It's secure and instant.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: `${targetPrefix}link-bank`,
      title: "Link Your Bank Account",
      content: "After verifying your identity, link the bank account you want to use for auto-debits and receiving payouts.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: `${targetPrefix}create-group`,
      title: "Create or Join a Group",
      content: "Ready to start? Create your own savings circle and invite friends, or join an existing one using an invite link.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: `${targetPrefix}transactions`,
      title: "Track Activity",
      content: "Monitor all your automated contributions and incoming payouts here in real-time.",
      placement: "top",
      skipBeacon: true,
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("ajose_onboarding_tour", "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      options={{
        primaryColor: "#0B3022",
        textColor: "#1F2937",
        backgroundColor: "#FDFBF7",
        arrowColor: "#FDFBF7",
        width: 320,
        showProgress: true,
        buttons: ['back', 'primary', 'skip'],
      }}
      styles={{
        tooltip: {
          borderRadius: '16px',
          padding: '24px 16px',
        },
        tooltipTitle: {
          fontWeight: 900,
          fontSize: '20px',
          color: '#0B3022',
        },
        tooltipContent: {
          fontWeight: 600,
          fontSize: '15px',
          color: '#4B5563',
          padding: '12px 0',
        },
        buttonPrimary: {
          backgroundColor: "#C5A059",
          color: "#0B3022",
          fontWeight: "800",
          fontSize: '14px',
          padding: '10px 16px',
          borderRadius: "8px",
        },
        buttonBack: {
          marginRight: 10,
          fontWeight: 700,
          color: "#6B7280"
        },
        buttonSkip: {
          color: "#9CA3AF",
          fontWeight: 700,
        },
      }}
    />
  );
}
