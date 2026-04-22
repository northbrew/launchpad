import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        sidebar: "var(--bg-sidebar)",
        card: "var(--bg-card)",
        "card-hover": "var(--bg-card-hover)",
        elevated: "var(--bg-elevated)",
        subtle: "var(--bg-subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        green: "var(--green)",
        amber: "var(--amber)",
        red: "var(--red)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        james: "var(--james)",
        cory: "var(--cory)"
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.03)",
        elevated: "0 8px 24px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "16px"
      }
    }
  },
  plugins: []
};

export default config;
