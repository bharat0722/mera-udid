/**
 * Demo sign-in.
 *
 * The hackathon rules ask for working test credentials so a judge can "log in and try
 * the product exactly like an end user". This is that, and nothing more: a fixed list
 * of invented accounts, checked against a string, held in localStorage.
 *
 * There is no authentication here and there is no attempt to look like there is. No
 * password is hashed, nothing is sent anywhere, and every credential is printed on the
 * sign-in screen next to a one-click button so nobody has to type. Building anything
 * that *resembled* real auth would be worse than useless in a prototype whose whole
 * argument is about being honest.
 *
 * Nothing in the app is gated behind this. Tracking a case by ID works signed out,
 * because a judge who lands on a deep link should never hit a wall.
 */

export type SessionRole = "APPLICANT" | "SW_OFFICER" | "OVERSIGHT";

export interface DemoAccount {
  username: string;
  password: string;
  role: SessionRole;
  displayName: string;
  /** Applications this person can see on their dashboard. */
  applicationIds: string[];
  /** What a judge will find if they sign in as this person. */
  story: string;
  storyHindi: string;
}

/** One password for every account, so a judge never has to cross-reference a table. */
export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "asha",
    password: DEMO_PASSWORD,
    role: "APPLICANT",
    displayName: "Asha Verma",
    applicationIds: ["UDID-DEMO-1024"],
    story: "An application moving normally. Day 4 of a 21-day target at the medical board.",
    storyHindi: "सामान्य रूप से आगे बढ़ता आवेदन। मेडिकल बोर्ड पर 21 दिन के लक्ष्य का चौथा दिन।"
  },
  {
    username: "ravi",
    password: DEMO_PASSWORD,
    role: "APPLICANT",
    displayName: "Ravi Kushwaha",
    applicationIds: ["UDID-DEMO-2048"],
    story: "Sent back for one document. Shows the plain-language reason and the one-click fix.",
    storyHindi: "एक दस्तावेज़ के लिए वापस भेजा गया। सरल भाषा में कारण और एक क्लिक में सुधार।"
  },
  {
    username: "meena",
    password: DEMO_PASSWORD,
    role: "APPLICANT",
    displayName: "Meena Ahirwar",
    applicationIds: ["UDID-DEMO-4096"],
    story: "Stuck at the medical board for 211 days against a 21-day target.",
    storyHindi: "21 दिन के लक्ष्य के मुकाबले 211 दिनों से मेडिकल बोर्ड पर अटका हुआ।"
  },
  {
    username: "sunita",
    password: DEMO_PASSWORD,
    role: "APPLICANT",
    displayName: "Sunita Malviya",
    applicationIds: ["UDID-DEMO-8192"],
    story: "The whole journey completed. Certificate issued and card generated.",
    storyHindi: "पूरी यात्रा पूरी। प्रमाणपत्र जारी और कार्ड बन गया।"
  },
  {
    username: "officer",
    password: DEMO_PASSWORD,
    role: "SW_OFFICER",
    displayName: "District Social Welfare Officer, Bhopal",
    applicationIds: [],
    story: "The staff queue. Try returning a case without a reason code and watch it refuse.",
    storyHindi: "कर्मचारी कतार। बिना कारण कोड केस लौटाकर देखें — सिस्टम मना कर देगा।"
  },
  {
    username: "oversight",
    password: DEMO_PASSWORD,
    role: "OVERSIGHT",
    displayName: "State Oversight, Madhya Pradesh",
    applicationIds: [],
    story: "District numbers, and the reconciliation panel reserved for Codex.",
    storyHindi: "जिला आँकड़े, और Codex के लिए आरक्षित मिलान पैनल।"
  }
];

const STORAGE_KEY = "mera-udid.session";

export function findAccount(username: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(
    (account) => account.username === username.trim().toLowerCase()
  );
}

/** Checks a typed username and password against the demo list. */
export function verify(username: string, password: string): DemoAccount | null {
  const account = findAccount(username);
  if (!account) return null;
  return account.password === password.trim() ? account : null;
}

type Listener = () => void;

let current: DemoAccount | null = null;
const listeners = new Set<Listener>();

function read(): DemoAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (findAccount(stored) ?? null) : null;
  } catch {
    return null;
  }
}

current = read();

export function getSession(): DemoAccount | null {
  return current;
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function publish(): void {
  for (const listener of listeners) listener();
}

export function signIn(account: DemoAccount): void {
  current = account;
  try {
    window.localStorage.setItem(STORAGE_KEY, account.username);
  } catch {
    // Storage refused. The session still works for this page view.
  }
  publish();
}

export function signOut(): void {
  current = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do.
  }
  publish();
}

/** Where a given role should land after signing in. */
export function homeRouteFor(account: DemoAccount): string {
  switch (account.role) {
    case "SW_OFFICER":
      return "/officer";
    case "OVERSIGHT":
      return "/admin";
    default:
      return "/my-applications";
  }
}
