export const focusItems = [
  { owner: "cory", text: "Ship asset picker with industry + role filters", done: true },
  { owner: "james", text: "Close 4th design partner", done: true },
  { owner: "both", text: "Lock pricing copy for Starter and Growth", done: true },
  { owner: "cory", text: "Replace Mailgun with Postmark", done: true },
  { owner: "james", text: "Finalise demo script for Acme kickoff Friday", done: false }
] as const;

export const roadmapPhases = [
  { id: "01", name: "Foundation", desc: "Capture, library, Ask AI", current: true },
  { id: "02", name: "Signal Quality", desc: "Structured inputs, exports" },
  { id: "03", name: "Context", desc: "CRM, Slack, AI workflow" },
  { id: "04", name: "Activation", desc: "AI curation, Proof Signals" },
  { id: "05", name: "Distribution", desc: "Connectors, avatars" },
  { id: "06", name: "Evidence OS", desc: "Open API, governance" }
] as const;
