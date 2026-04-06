import { addDays, format } from "date-fns";

export const dashboardStats = [
  { label: "Meetings Processed", value: "126" },
  { label: "Action Items Captured", value: "421" },
  { label: "Avg. Summary Accuracy", value: "97.4%" },
];

export const insights = {
  summary:
    "The team finalized Q2 launch milestones, aligned on integration dependencies, and assigned ownership for customer onboarding readiness.",
  entities: [
    {
      id: 1,
      name: "Maya Patel",
      type: "Person",
      details: "Product Lead owning launch timeline and cross-team coordination.",
      relatedAction: "Create follow-up check-in with engineering and support.",
    },
    {
      id: 2,
      name: "Acme Health",
      type: "Organization",
      details: "Pilot customer requesting custom reporting before onboarding.",
      relatedAction: "Draft rollout notes and share with customer success.",
    },
    {
      id: 3,
      name: "Nimbus Analytics",
      type: "Organization",
      details: "Data partner for event ingestion and KPI dashboards.",
      relatedAction: "Schedule technical sync for API schema updates.",
    },
  ],
  actions: [
    {
      id: 1,
      meetingId: "MT-LINK-101",
      meetingName: "Q2 Launch Planning Sync",
      task: "Send recap email to stakeholders",
      assignee: "Me",
      status: "Open",
    },
    {
      id: 2,
      meetingId: "MT-LINK-101",
      meetingName: "Q2 Launch Planning Sync",
      task: "Share launch checklist with support",
      assignee: "Me",
      status: "In Progress",
    },
    {
      id: 3,
      meetingId: "MT-LINK-101",
      meetingName: "Q2 Launch Planning Sync",
      task: "Book launch readiness review",
      assignee: "Maya",
      status: "Open",
    },
    {
      id: 4,
      meetingId: "MT-LINK-101",
      meetingName: "Q2 Launch Planning Sync",
      task: "Confirm API dependency completion",
      assignee: "Arjun",
      status: "Open",
    },
  ],
  transcript: [
    "Speaker 1 (Maya): We are aiming to lock release candidate by April 15.",
    "Speaker 2 (Arjun): Engineering can complete dependency cleanup by end of next week.",
    "Speaker 3 (Dana): Support team needs enablement docs at least 10 days before launch.",
    "Speaker 1 (Maya): Great, let's align owners and send the updated checklist today.",
  ],
};

export const historyMeetings = Array.from({ length: 8 }).map((_, index) => {
  const date = addDays(new Date(), -index * 3);
  return {
    id: `MT-${4100 + index}`,
    title: `Weekly Sync ${index + 1}`,
    date: format(date, "MMM dd, yyyy"),
    participants: 5 + (index % 4),
    duration: `${30 + index * 6} min`,
    status: index % 2 === 0 ? "Analyzed" : "Pending Review",
  };
});

export const team = [
  { name: "Aanya Bose", role: "Founder & CEO" },
  { name: "Ravi Menon", role: "Head of AI Research" },
  { name: "Leah Carter", role: "Director of Product" },
];
