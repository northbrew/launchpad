import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "launchpad-demo";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ids = {
  james: "0f79e2be-4f2b-4b0d-8f1e-2c6db6d64a11",
  cory: "a36534d8-7d88-4dc2-8d4d-b2fb1f848b22",
  tags: {
    pricing: "cb624a38-1111-4adf-aad7-7a40fe8ea201",
    competitor: "cb624a38-2222-4adf-aad7-7a40fe8ea202",
    design: "cb624a38-3333-4adf-aad7-7a40fe8ea203",
    build: "cb624a38-4444-4adf-aad7-7a40fe8ea204",
    customers: "cb624a38-5555-4adf-aad7-7a40fe8ea205",
    brand: "cb624a38-6666-4adf-aad7-7a40fe8ea206",
    reference: "cb624a38-7777-4adf-aad7-7a40fe8ea207",
    pitch: "cb624a38-8888-4adf-aad7-7a40fe8ea208",
    gtm: "cb624a38-9999-4adf-aad7-7a40fe8ea209"
  }
};

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function ensureAuthUser({ id, email, password, metadata }) {
  const { data: listed } = await admin.auth.admin.listUsers();
  const existing = listed.users.find((user) => user.email === email);

  if (!existing) {
    const { error } = await admin.auth.admin.createUser({
      id,
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    });
    if (error) throw error;
    return id;
  }

  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    email,
    password,
    user_metadata: metadata
  });
  if (error) throw error;
  return existing.id;
}

async function main() {
  const jamesId = await ensureAuthUser({
    id: ids.james,
    email: "james@proofbridge.io",
    password: DEMO_PASSWORD,
    metadata: { full_name: "James", slug: "james" }
  });

  const coryId = await ensureAuthUser({
    id: ids.cory,
    email: "cory@proofbridge.io",
    password: DEMO_PASSWORD,
    metadata: { full_name: "Cory", slug: "cory" }
  });

  await admin.from("users").upsert(
    [
      {
        id: jamesId,
        slug: "james",
        full_name: "James",
        email: "james@proofbridge.io",
        timezone: "EST",
        initials: "J",
        color_token: "james"
      },
      {
        id: coryId,
        slug: "cory",
        full_name: "Cory",
        email: "cory@proofbridge.io",
        timezone: "CET",
        initials: "C",
        color_token: "cory"
      }
    ],
    { onConflict: "id" }
  );

  const tags = [
    { id: ids.tags.pricing, name: "Pricing", slug: "pricing" },
    { id: ids.tags.competitor, name: "Competitor", slug: "competitor" },
    { id: ids.tags.design, name: "Design", slug: "design" },
    { id: ids.tags.build, name: "Build", slug: "build" },
    { id: ids.tags.customers, name: "Customers", slug: "customers" },
    { id: ids.tags.brand, name: "Brand", slug: "brand" },
    { id: ids.tags.reference, name: "Reference", slug: "reference" },
    { id: ids.tags.pitch, name: "Pitch", slug: "pitch" },
    { id: ids.tags.gtm, name: "GTM", slug: "gtm" }
  ];
  await admin.from("tags").upsert(tags, { onConflict: "id" });

  const libraryItems = [
    ["11111111-1111-4111-8111-111111111111", "screenshot", "UserEvidence pricing — Apr 21", "Their Starter just jumped to $499. Worth discussing where we land.", coryId, ids.tags.pricing, 2, "png"],
    ["11111111-1111-4111-8111-111111111112", "loom", "Microsite builder walkthrough v2", "End-to-end flow with the new asset picker. 6 min, watch at 1.5x.", coryId, ids.tags.build, 4, null],
    ["11111111-1111-4111-8111-111111111113", "doc", "Acme discovery notes — three quotes", "Direct quotes for the Sales Leader messaging doc. Quote #2 is gold.", jamesId, ids.tags.customers, 9, "doc"],
    ["11111111-1111-4111-8111-111111111114", "figma", "Capture intro screen — consent copy v3", "Need your eyes on this before I push to staging tomorrow.", coryId, ids.tags.design, 11, null],
    ["11111111-1111-4111-8111-111111111115", "link", "Lavender's onboarding email teardown", "Good ideas for our day-1 to day-7 sequence. Saving for Phase 2.", jamesId, ids.tags.reference, 24, null],
    ["11111111-1111-4111-8111-111111111116", "doc", "Series A deck v0.3 — pre-feedback", "Rough cut. Slide 7 is where I keep getting stuck.", jamesId, ids.tags.pitch, 28, "pdf"],
    ["11111111-1111-4111-8111-111111111117", "screenshot", "Stripe billing flow reference", "How they handle plan upgrades mid-cycle. Useful for our Starter to Growth path.", coryId, ids.tags.build, 48, "png"],
    ["11111111-1111-4111-8111-111111111118", "figma", "Microsite mobile breakpoints", "Mobile reads cramped. Pushed asset cards to single column under 480px.", coryId, ids.tags.design, 52, null],
    ["11111111-1111-4111-8111-111111111119", "doc", "Cold outbound sequence v4", "New opener pulls from real prospect language. 18% reply rate in test.", jamesId, ids.tags.gtm, 72, "doc"],
    ["11111111-1111-4111-8111-111111111120", "link", "Linear changelog — March release", "Their changelog format is clean. Worth borrowing for our P1 launch post.", jamesId, ids.tags.reference, 74, null],
    ["11111111-1111-4111-8111-111111111121", "loom", "Auth flow demo — passwordless", "Walking through the magic-link approach. Less friction than OAuth.", coryId, ids.tags.build, 96, null],
    ["11111111-1111-4111-8111-111111111122", "screenshot", "Buying committee research — Forrester", "B2B buying groups grew from 5 to 9 stakeholders since 2017. Backs up our deck claim.", jamesId, ids.tags.reference, 120, "png"]
  ].map(([id, type, title, note, poster_id, tag_id, hoursAgo, file_ext], index) => ({
    id,
    type,
    title,
    note,
    poster_id,
    source_url: type === "link" ? `https://example.com/library/${index + 1}` : type === "loom" ? `https://www.loom.com/share/demo-${index + 1}` : type === "figma" ? `https://www.figma.com/file/demo-${index + 1}` : null,
    storage_path: null,
    mime_type: null,
    file_ext,
    created_at: isoHoursAgo(hoursAgo),
    tag_id
  }));

  await admin.from("library_items").upsert(
    libraryItems.map(({ tag_id, ...item }) => item),
    { onConflict: "id" }
  );

  await admin.from("library_item_tags").delete().in("library_item_id", libraryItems.map((item) => item.id));
  await admin.from("library_item_tags").insert(
    libraryItems.map((item) => ({
      library_item_id: item.id,
      tag_id: item.tag_id
    }))
  );

  const decisions = [
    {
      id: "22222222-2222-4222-8222-222222222221",
      status: "blocking",
      question: "Starter plan: include 1 microsite or zero?",
      context: "Cory has the gating logic ready either way. Including 1 microsite makes the upgrade moment less clear. Zero microsites makes Starter feel limited. We need to decide before Cory ships the gating today.",
      waiting_on_user_id: jamesId,
      waiting_on_both: false,
      resolution: null,
      created_at: isoHoursAgo(5)
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      status: "open",
      question: "Acme wants a custom subdomain for their microsite. Honor it as a one-off?",
      context: "Custom subdomains are scoped to Enterprise. Acme is a design partner, not paying yet. Saying yes sets a precedent. Saying no risks the relationship.",
      waiting_on_user_id: coryId,
      waiting_on_both: false,
      resolution: null,
      created_at: isoHoursAgo(48)
    },
    {
      id: "22222222-2222-4222-8222-222222222223",
      status: "open",
      question: "Public launch date: end of May or push to mid-June?",
      context: "End of May rides the spring B2B SaaS launch wave. Mid-June gives us 6 logos at launch instead of 4. Tradeoff is momentum vs. credibility.",
      waiting_on_user_id: null,
      waiting_on_both: true,
      resolution: null,
      created_at: isoHoursAgo(96)
    },
    {
      id: "22222222-2222-4222-8222-222222222224",
      status: "resolved",
      question: "Should we use Postmark or Mailgun for transactional email?",
      context: "Both work. Postmark has cleaner deliverability, Mailgun is cheaper at scale.",
      waiting_on_user_id: null,
      waiting_on_both: false,
      resolution: "Postmark. Worth the price difference for B2B — bounce rates kill outbound credibility.",
      created_at: isoHoursAgo(168)
    },
    {
      id: "22222222-2222-4222-8222-222222222225",
      status: "resolved",
      question: "Three-tier pricing or two-tier (Starter, Growth)?",
      context: "Three-tier with Enterprise on the page vs. just Starter and Growth with Talk to Sales for Enterprise.",
      waiting_on_user_id: null,
      waiting_on_both: false,
      resolution: "Two visible tiers, Talk to Sales for Enterprise. Cleaner.",
      created_at: isoHoursAgo(336)
    }
  ];

  await admin.from("decisions").upsert(decisions, { onConflict: "id" });

  const positions = [
    {
      id: "33333333-3333-4333-8333-333333333331",
      decision_id: decisions[0].id,
      user_id: coryId,
      vote: "Zero",
      take: "Starter is the proof system. Microsite is the deployment layer. Keep them separate. The upgrade logic writes itself."
    },
    {
      id: "33333333-3333-4333-8333-333333333332",
      decision_id: decisions[1].id,
      user_id: jamesId,
      vote: "Yes, one-off",
      take: "Design partners earn special treatment. We document it as a design-partner perk, not a feature."
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      decision_id: decisions[2].id,
      user_id: jamesId,
      vote: "Mid-June",
      take: "Six logos at launch is a story. Four logos is a list."
    },
    {
      id: "33333333-3333-4333-8333-333333333334",
      decision_id: decisions[2].id,
      user_id: coryId,
      vote: "End of May",
      take: "Building too long without market signal is how startups die."
    },
    {
      id: "33333333-3333-4333-8333-333333333335",
      decision_id: decisions[3].id,
      user_id: jamesId,
      vote: "Postmark",
      take: "Better for B2B sender reputation."
    },
    {
      id: "33333333-3333-4333-8333-333333333336",
      decision_id: decisions[3].id,
      user_id: coryId,
      vote: "Postmark",
      take: "Easier to debug. Done."
    },
    {
      id: "33333333-3333-4333-8333-333333333337",
      decision_id: decisions[4].id,
      user_id: jamesId,
      vote: "Two visible",
      take: "Three tiers anchor the middle. We don't need to anchor anything yet."
    },
    {
      id: "33333333-3333-4333-8333-333333333338",
      decision_id: decisions[4].id,
      user_id: coryId,
      vote: "Two visible",
      take: "Less clutter, easier to ship."
    }
  ];

  await admin.from("decision_positions").upsert(positions, { onConflict: "decision_id,user_id" });

  console.log("Seed complete.");
  console.log(`James: james@proofbridge.io / ${DEMO_PASSWORD}`);
  console.log(`Cory: cory@proofbridge.io / ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
