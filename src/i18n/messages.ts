export type Locale = "en" | "hi";

/**
 * Copy.
 *
 * Terminology rule, applied everywhere including the Hindi: "persons with disabilities"
 * or "PwD", never "Divyang" (दिव्यांग) — a term much of the disability community has
 * publicly rejected as a patronising euphemism — and never "handicapped" or
 * "differently abled". In Hindi that means विकलांगता / विकलांग व्यक्ति throughout.
 *
 * The citizen journey — home, apply, track, fix, appeal — is translated in full. The
 * officer console and the admin dashboard are internal tools and are English-only for
 * now; that cut is recorded in PENDING.md rather than papered over with machine
 * translation nobody has checked.
 */

const en = {
  meta: {
    serviceName: "Mera UDID",
    serviceTag: "Disability certificate, tracked",
    languageName: "English",
    otherLanguageName: "हिन्दी",
    switchTo: "Switch language to Hindi — हिन्दी में बदलें"
  },
  nav: {
    skip: "Skip to main content",
    home: "Home",
    apply: "Apply",
    track: "Track a case",
    myApplications: "My applications",
    officer: "Officer queue",
    admin: "Oversight",
    primary: "Main",
    portalLabel: "Citizen service portal",
    citizenServices: "Citizen services",
    servicePromise: "Apply, track and understand every stage of your case.",
    getHelp: "Get help",
    search: "Search",
    reconciliation: "Reconciliation",
    openSearch: "Open website search",
    closeSearch: "Close website search",
    knowUdid: "Know UDID",
    publicNotice: "Service notice",
    noticeText: "Application tracking, board calendars and assisted support are available in this prototype.",
    staff: "Staff view",
    staffNote: "Internal tools. Not part of the citizen experience.",
    signIn: "Sign in",
    signOut: "Sign out",
    menu: "Menu",
    closeMenu: "Close menu",
    signedInAs: "Signed in as",
    help: "Help",
    accessibility: "Accessibility statement",
    policies: "Website policies",
    sitemap: "Sitemap",
    why: "Why Mera UDID",
    services: "Services",
    resources: "Resources & media",
    about: "About this prototype",
    footerNav: "Footer"
  },
  disclaimer:
    "An independent prototype. Not an official government product. All data is synthetic.",
  search: {
    title: "Search Mera UDID",
    lede: "Find a service, guide or support route using plain words.",
    label: "What are you looking for?",
    button: "Search",
    results: "Search results",
    noResults: "No matching page was found. Try “apply”, “track”, “board”, “documents”, “help” or “delay”.",
    prompt: "Enter a word to search the portal."
  },
  footer: {
    title: "An independent prototype. Not an official government product. All data is synthetic.",
    body: "Mera UDID is a hackathon prototype. It uses no government logos, contacts no government system, and every person, application and record in it is invented. It does not represent the Government of India.",
    proposedSla:
      "All processing-time targets shown are proposed by this prototype. The real service publishes none.",
    standards:
      "Built to the structure the Guidelines for Indian Government Websites (GIGW 3.0) ask of a public service, and tested against WCAG 2.2 Level AA — one version ahead of the WCAG 2.1 AA that GIGW requires. No government logo, emblem or wordmark is used anywhere.",
    owner: "Content owner: the authors of this hackathon submission.",
    reviewed: "25 August 2026"
  },
  common: {
    applicationId: "Application ID",
    back: "Back",
    next: "Next",
    continue: "Continue",
    cancel: "Cancel",
    district: "District",
    lastUpdated: "Last updated",
    proposedTarget: "Proposed target",
    days: "days",
    day: "day",
    dayInStage: "Days at this desk",
    notStarted: "Not started",
    done: "Done",
    inProgress: "Happening now",
    step: "Step",
    of: "of",
    whatHappensHere: "What happens here",
    who: "Who",
    when: "When",
    reason: "Reason",
    close: "Close",
    onThisPage: "On this page",
    relatedPages: "Related pages",
    lastReviewed: "Last reviewed"
  },
  auth: {
    title: "Sign in to the demo",
    lede: "Every account below is invented, and every password is printed next to it. There is no real authentication here — this exists so you can try the product as a specific person in one click.",
    notGated: "Nothing is locked. You can track any application by ID without signing in.",
    usernameLabel: "Username",
    passwordLabel: "Password",
    submit: "Sign in",
    oneClick: "Sign in as this person",
    accountsTitle: "Demo accounts",
    citizenAccounts: "Citizens",
    staffAccounts: "Staff",
    passwordForAll: "Password for every account:",
    error: "That username and password do not match a demo account.",
    signedOut: "You have been signed out.",
    myTitle: "My applications",
    myLede: "Everything you have applied for, and what is happening to it right now.",
    myEmpty: "You have no applications yet.",
    startOne: "Start an application",
    openCase: "Open this case",
    needsYou: "Needs something from you",
    onTrack: "With the office, within target",
    late: "With the office, past target",
    finished: "Finished"
  },
  board: {
    navLabel: "Medical board",
    title: "District medical board calendar",
    lede: "The medical board is the one step nobody can skip, and today nothing about it is published — not when it sits, not how many people it can see, not how long the queue is. This is what publishing it looks like.",
    proposalNote: "Every calendar on this page is this prototype's proposal over synthetic data. The real service publishes no board calendar at all. That absence is the point.",
    ministerQuote: "Asked in Parliament how often district medical boards meet, the minister's answer was that it depends on the requirements of state governments and hospitals, and the availability of doctors. There is no schedule to be held to.",
    districtLabel: "District",
    searchDistrict: "Search a district",
    searchDistrictHint: "Type a district name",
    locationTitle: "Find your district anywhere in India",
    stateLabel: "State or Union Territory",
    stateHint: "Select a state or Union Territory",
    anyState: "All States and Union Territories",
    districtOrPin: "District name or PIN code",
    districtOrPinHint: "For example, Pune or 411001",
    locationHelp: "Start with your State or Union Territory, then enter your district or six-digit PIN code. You can search any location in India.",
    publishedCalendarTitle: "Published calendars in this prototype",
    showAllDistricts: "Show all published calendars",
    searchNoMatch: "This prototype only has a published calendar for the districts listed above. It does not invent an unpublished schedule.",
    venue: "Where it sits",
    sitsOn: "Sits on",
    perSitting: "People seen per sitting",
    weeklyCapacity: "People seen per week",
    queueDepth: "People waiting now",
    upstream: "Still at document checking",
    backlog: "Weeks to clear the queue",
    nextSittings: "Next sittings",
    joinToday: "If you joined this queue today",
    joinTodayAnswer: "You would be seen on",
    benchmarkTitle: "Sitting days a week",
    benchmarkOk: "Meets the two-days-a-week benchmark",
    benchmarkBelow: "Below the two-days-a-week benchmark",
    benchmarkNote: "Maharashtra told its district hospitals to reserve at least two days a week for disability certificate verification. It is the only published cadence benchmark this research found, so it is what these districts are measured against.",
    realityTitle: "Calendar against reality",
    realityBody: "At the published rate this queue clears in {weeks} week(s). The cases that actually got through this board took {observed} days at it, on average. When those two disagree, the board is not sitting as published — and publishing the calendar is what makes that visible.",
    realityNoData: "Not enough cases have been through this board yet to compare.",
    beyondHorizon: "At the published rate, this queue does not clear within two years.",
    yourDateTitle: "Your medical board date",
    yourPosition: "Your place in this district's board queue",
    yourExpected: "Expected date, if the board sits as published",
    yourExpectedIn: "That is {days} days from now.",
    sittingsAhead: "Sittings that have to happen first",
    forecastNote: "This is arithmetic on a published cadence, not a promise. A forecast that turns out wrong can at least be challenged — no date at all cannot.",
    seeCalendar: "See this district's full calendar",
    noBoard: "No board calendar is published for this district."
  },
  honesty: {
    title: "What works today, and what is still mocked",
    lede: "A judge should not have to open the repository to learn this, so it is said here.",
    realTitle: "Genuinely built and working",
    real: [
      "The event-sourced case store and state machine — a return or rejection without a structured reason code is refused by the system, not by the interface.",
      "The reconciliation engine: every application is always in exactly one stage, the counts must sum, and the seeded defects are caught and named on the oversight page.",
      "The statutory clock — three months under the RPwD Rules, 2017 — counted, shown, and escalatable, with the escalation recorded on the case.",
      "The medical board calendars, capacity arithmetic and expected-date forecast.",
      "The full journey in English and Hindi, the accessibility toolkit, and 42 automated accessibility checks on every build."
    ],
    mockTitle: "Mocked or synthetic, and why",
    mock: [
      "Every person, application and record is generated from a fixed seed. No real personal, health or Aadhaar-format data exists anywhere in this project.",
      "Document upload — ticking a box stands in for attaching a file, because storing real documents needs real custody rules a prototype should not pretend to have.",
      "Sign-in is a list of demo accounts with the credentials printed beside them. Nothing is gated behind it.",
      "There is no server: the store lives in memory and a reload re-seeds it. Notifications are described, never sent.",
      "The demo clock is pinned to 23 August 2026, so the figures always match the written walkthrough."
    ]
  },
  atScale: {
    title: "How this could work safely at a larger scale",
    lede: "Nothing in this prototype requires new personal data collection or a new law to exist.",
    points: [
      "The event log is the design, not a demo trick: the same append-only store runs on a real database, and the reconcile() contract runs as a nightly job plus write-time checks — the 10.12 lakh gap becomes a state the system cannot enter.",
      "Documents arrive through DigiLocker instead of uploads, and the finished certificate and UDID card are delivered back to it — no new document custody anywhere.",
      "District boards publish sitting days and capacity through the same schedule model this prototype uses; the expected date falls out of arithmetic the hospital already knows.",
      "Escalations file into the state's existing Right to Service machinery and CPGRAMS, rather than inventing a parallel channel.",
      "Rollout is one district first, reconciliation report public from day one, then statewide — the report is what makes the pilot auditable."
    ]
  },
  escalate: {
    navLabel: "Raise a delay",
    limitTitle: "The legal time limit for your certificate",
    limitWithin: "Your application is within the limit.",
    limitDue: "The certificate is due by {date}.",
    limitRemaining: "{days} days remaining.",
    limitOverdue: "This application is {days} days past the legal time limit.",
    limitBasis: "The Rights of Persons with Disabilities Rules, 2017 (rule 18, as amended in October 2024) give the certifying authority three months to issue a disability certificate and UDID card. The clock runs from the day you applied.",
    limitNotCounted: "The current service does not count this limit, does not show it, and does not act on it. This one does.",
    raiseTitle: "Raise this delay",
    raiseLead: "Your case has passed a deadline. You can put that on the record here — named, dated and timed — addressed to the escalation route this service proposes.",
    goesTo: "Proposed escalation route",
    windowNote: "Proposed window: {days} days at this level, modelled on the state service-guarantee Act.",
    groundsLabel: "Anything you want to add? (optional)",
    groundsHint: "The delay itself is already recorded with dates. Add anything the officer should know.",
    submit: "Raise this delay",
    cancel: "Not now",
    doneTitle: "Delay raised",
    doneBody: "It is on the case record with today's date and the proposed route below. In this prototype it is recorded, not transmitted to any government office.",
    alreadyRaised: "Follow-up recorded on {date} — proposed route: {authority}.",
    notTransmitted: "This prototype flags a delayed case for follow-up on its own case record. It does not submit a government grievance, does not contact any authority, and does not determine a legal breach.",
    exhausted: "Both levels of escalation have been used on this case.",
    notYet: "Nothing has passed a deadline on this case yet, so there is nothing to escalate.",
    structureNote: "Escalation levels here are modelled on the Madhya Pradesh Lok Sewaon Ke Pradan Ki Guarantee Adhiniyam, 2010, which has the state name a First Appeal Officer and a Second Appellate Authority for each notified service. Whether a disability certificate is notified under that Act, and against what time limit, could not be verified — so this prototype does not tell you a penalty is owed. It records the delay and sends it up.",
    backToCase: "Back to the case",
    seeEscalation: "Raise this delay"
  },
  a11yBar: {
    label: "Display",
    increase: "Increase text size",
    decrease: "Decrease text size",
    reset: "Reset text size",
    contrast: "High contrast"
  },
  aboutWhy: {
    eyebrow: "A tracked case, not a postbox",
    title: "The case for a new system",
    lede: "The evidence behind this service: what happens to applications in the current system, in the government's own numbers — and what this one is built to do about it."
  },
  home: {
    eyebrow: "Unique Disability ID (UDID)",
    headline: "Disability certificate services",
    lede: "Apply online, and track your application at every stage — which office is holding it, how long they have had it, and what happens next.",
    exampleIntro: "A disability certificate application passes through a district office and a hospital medical board over several months. Mera UDID gives it a stage, an owner and a clock — so a delay has a name attached to it. This is what that looks like for a real case.",
    stakes: "The UDID card is not a benefit. It is the key that unlocks every other benefit — job and college reservations, disability pension, scholarships, travel concessions, assistive devices. Maharashtra has made it compulsory for any government benefit at all. So if your card is stuck, you do not lose one thing. You lose everything at once.",
    checkTitle: "Already applied? Check it now.",
    checkLabel: "Your application ID",
    checkButton: "Show me where it is",
    tasksTitle: "What would you like to do?",
    tasksLede: "The five things people come here for. Everything else is one click from these.",
    tasks: [
      {
        title: "Apply for a disability certificate",
        body: "Four short steps, saved as you go, with a document check before you submit."
      },
      {
        title: "Track an application",
        body: "See which office is holding your file, how long they have had it, and what happens next."
      },
      {
        title: "Find your medical board date",
        body: "Every district's sitting days, capacity and queue — and when you would be seen."
      },
      {
        title: "See all your applications",
        body: "Sign in and skip the application ID. Six demo accounts, one click each."
      },
      {
        title: "Help and support",
        body: "How the process works, what to do if something is sent back, and how to appeal."
      }
    ],
    sourcesTitle: "Where these numbers come from",
    startAction: "Start a new application",
    trackAction: "Track an existing application",
    livePreviewTitle: "A live tracked case",
    livePreviewNote: "An example case — open it and explore.",
    viewFullCase: "See the full case",
    arithmeticTitle: "Why India needs a new system",
    arithmeticIntro:
      "In a written reply in the Rajya Sabha, reported on 12 August 2026, the government gave four numbers for UDID applications received since 2021.",
    received: "Applications received since 2021",
    generated: "Cards generated",
    rejected: "Applications rejected",
    pending: "Applications pending",
    accounted: "Issued + rejected + pending",
    gapLabel: "applications are in no column at all",
    gapNote:
      "An MP asked where they went. The reply did not say. The subtraction is ours; the four numbers are the government's.",
    gapPromise:
      "Mera UDID is built so this cannot happen. Every application is always in exactly one stage, with a named office holding it and a clock running on it — an application that is in no column is a state this system cannot enter.",
    diagnosisTitle: "A postbox where a tracking number was needed",
    diagnosisBody:
      "Drop a letter in a postbox and it is \"sent\". That is the only state there is, nobody is responsible for it, and if it never arrives there is nothing to check. A courier tracking number is the opposite: named steps, a time and a person at each one, and nothing can vanish quietly.",
    diagnosisPunch:
      "The system does not know where an application is, so nobody can be asked why it has not moved.",
    processTitle: "The journey, and what we propose it should take",
    processIntro:
      "Six stages, each with an office that owns it and a clock that runs on it. Every target below is our proposed commitment — the current system publishes none.",
    totalTarget: "Total proposed target",
    realWorld: "Reported average wait in Madhya Pradesh",
    realWorldNote: "From government data reported on 16 August 2026.",
    rightsTitle: "What Mera UDID promises you",
    rights: [
      {
        title: "You are never told \"rejected\" without being told why",
        body: "Every return and every rejection carries a structured code, a plain-language sentence, and the exact document at fault. The system will not accept one without a code."
      },
      {
        title: "An office mistake does not send you to the back of the queue",
        body: "If the fault was administrative, your place is protected when you resubmit. The screen says so explicitly."
      },
      {
        title: "You do not have to give fingerprints",
        body: "The fingerprint requirement is documented as excluding people with missing limbs, leprosy-related finger loss and acid-attack survivors. There is an officer-attested route here, offered openly rather than hidden."
      },
      {
        title: "Someone can apply on your behalf, on the record",
        body: "In practice a family member often fills the form. Assisted mode records who helped and that you consented, instead of pretending otherwise."
      }
    ]
  },
  track: {
    title: "Track an application",
    lede: "Enter an application ID to see where the case is, who is holding it, and how long it has been there.",
    label: "Application ID",
    hint: "Try UDID-DEMO-1024, UDID-DEMO-2048, UDID-DEMO-4096 or UDID-DEMO-8192.",
    button: "Track this case",
    landingTitle: "What you can do here",
    landingLead: "Tracking is more than checking whether an application was sent. It shows where your case is, who is responsible for it, and what you can do next.",
    needTitle: "What you need",
    needBody: "Keep your application ID from the submission receipt. It starts with “UDID-”.",
    seeTitle: "What you will see",
    seeBody: "Your current stage, the named office holding the case, and the time spent there.",
    actionTitle: "What you can do",
    actionBody: "Fix a returned document, see a medical-board date, or raise a delay when a deadline has passed.",
    journeyTitle: "Your case, in plain steps",
    journeySubmitted: "Application received",
    journeyChecking: "Documents checked",
    journeyOutcome: "Board and certificate outcome",
    noIdTitle: "Do not have an application ID yet?",
    noIdAction: "Start a new application",
    notFound: "No application with that ID exists in this prototype.",
    notFoundHint: "Check the ID and try again, or use one of the demo IDs listed above.",
    holderLabel: "Who has your file right now",
    stageLabel: "Stage",
    breached: "Past the proposed target",
    withinTarget: "Within the proposed target",
    nextStepTitle: "Your next step",
    noNextStep: "Nothing is required from you.",
    timelineTitle: "Every stage of this case",
    queueTitle: "Your place in the queue",
    queueBody: "Position {position} of {total} at this desk in {district}.",
    queueProtected: "Your place in the queue is protected.",
    queueProtectedWhy:
      "The problem was something this office could have flagged earlier, so you keep the place you already had.",
    queueLost: "Your place in the queue was not preserved.",
    queueLostWhy:
      "This reason code is recorded as an applicant-side failure. If you were not told in time, you can appeal.",
    returnedTitle: "This case has been sent back to you",
    rejectedTitle: "This application was rejected",
    documentAtFault: "Document at fault",
    fixAction: "Fix this and resubmit",
    appealAction: "Lodge an appeal",
    appealDeadline: "You can appeal until {date}, under section 59 of the RPwD Act 2016.",
    appealLodged: "An appeal has been lodged and recorded on this case.",
    historyTitle: "Full audit trail",
    historyNote:
      "Every line is an event appended to the case log. Nothing here can be edited or deleted.",
    detailsTitle: "Case details",
    applicant: "Applicant",
    disability: "Disability type",
    identity: "Identity verification",
    assistedBy: "Assisted by",
    submittedOn: "Submitted on",
    totalDays: "Days since you applied",
    assuranceTitle: "Why this case cannot go quiet",
    assuranceOne: "It is always in exactly one stage. There is no such thing here as an application that is simply “sent”.",
    assuranceTwo: "That stage always has a named office answerable for it — shown above, and shown to them too.",
    assuranceThree: "A clock runs on every stage, and it does not stop because nobody looked.",
    assuranceFour: "Nothing above can be edited or deleted. A correction is a new line on the trail, never a rewrite of it.",
    unplaceableTitle: "This application is not in any stage",
    unplaceableBody:
      "The case log for this application cannot say where it is. This is exactly the failure that leaves an application in no column at all — and in this prototype it is caught rather than hidden. It appears in the oversight reconciliation report.",
    unplaceableAction: "See it in the reconciliation report"
  },
  apply: {
    title: "Apply for a disability certificate",
    lede: "Four short steps. Your answers are saved on this device as you go, so a dropped connection does not lose your work.",
    resumeNotice: "We found a saved draft on this device and have restored it.",
    clearDraft: "Start again",
    steps: ["Your details", "Disability type", "Documents", "Review and submit"],
    detailsTitle: "Who is this application for?",
    nameLabel: "Full name of the person applying",
    nameHint: "As written on the identity document you will upload.",
    ageLabel: "Age in years",
    genderLabel: "Gender",
    genderOptions: { female: "Female", male: "Male", other: "Other" },
    districtLabel: "District",
    phoneLabel: "Mobile number",
    phoneHint: "Used only to tell you when the case moves. This prototype sends nothing.",
    assistedTitle: "Is someone helping fill this in?",
    assistedNo: "No, I am filling this in myself",
    assistedYes: "Yes, someone is helping me",
    assistedNameLabel: "Name of the person helping",
    assistedRelationLabel: "Their relationship to the applicant",
    assistedPhoneLabel: "Mobile number of the person helping",
    assistedPhoneHint: "Used only if the office needs to clarify something with this authorised helper. This prototype sends nothing.",
    assistedConsent:
      "The applicant consents to this person applying on their behalf. This consent is recorded on the case.",
    identityTitle: "How would you like your identity checked?",
    identityHint:
      "Fingerprints are one option here, not the only one. The real service's fingerprint requirement is documented as excluding people with missing limbs, leprosy-related finger loss and acid-attack survivors.",
    identityOptions: {
      FINGERPRINT: "Fingerprint",
      OFFICER_ATTESTED: "An officer checks my documents in person",
      DOCUMENT_ONLY: "I will upload my documents"
    },
    identityDocumentNote: "You will choose files in the Documents step next.",
    disabilityTitle: "Which condition are you applying for?",
    disabilityHint:
      "These are the 21 specified disabilities in the Schedule to the Rights of Persons with Disabilities Act, 2016.",
    documentsTitle: "Your documents",
    documentsHint:
      "Choose each document, then select its file from this device. You can attach PDF, JPG or PNG files.",
    chooseFile: "Choose file",
    noFileChosen: "No file chosen yet",
    fileChosen: "File chosen",
    fileSessionNote: "Prototype notice: selected files stay in this browser session and are not sent to a government system.",
    precheckTitle: "Document pre-check",
    precheckIntro:
      "This runs before you submit, so you find out now rather than in three months.",
    precheckPass: "Everything this category needs is attached.",
    precheckFail: "Some documents are missing. You can still submit, but the office is likely to send the case back.",
    precheckNote:
      "These rules are this prototype's proposal, not a published national checklist. They are fixed rules, not a model reading your files.",
    precheckWhy: "Why it is needed",
    reviewTitle: "Check this before you submit",
    submit: "Submit application",
    submittedTitle: "Application submitted",
    submittedBody: "Your application ID is below. Write it down — it is how you track this case.",
    receiptTitle: "Your submission receipt",
    receiptReference: "Application reference",
    nextStepsTitle: "What happens next",
    nextSteps: [
      "Your case starts as received and is assigned to the District Social Welfare Office.",
      "That office has a named stage and a visible clock. If anything is sent back, the reason and the next action will be shown.",
      "Use this reference whenever you return to track your application."
    ],
    sessionNotice:
      "Prototype notice: this new case is available in this browser session only. It is not sent to a government system or stored as a real application.",
    trackNow: "Track this application",
    validation: {
      name: "Enter the applicant's full name.",
      age: "Enter an age between 0 and 120.",
      district: "Choose a district.",
      phone: "Enter a 10-digit mobile number.",
      disability: "Choose the condition you are applying for.",
      assistedName: "Enter the name of the person helping.",
      assistedRelation: "Enter their relationship to the applicant.",
      assistedPhone: "Enter a 10-digit mobile number for the person helping.",
      summary: "There is a problem with {count} answer(s) on this page."
    }
  },
  fix: {
    title: "Fix and resubmit",
    lede: "Only the thing that is wrong is shown here. Nothing you have already given is asked for again.",
    problemTitle: "What needs fixing",
    replaceLabel: "Attach the replacement",
    replaceHint: "Ticking stands in for attaching a file in this prototype.",
    submit: "Send it back to the office",
    doneTitle: "Sent back to the office",
    doneBody: "The case has returned to the desk that sent it to you.",
    queueKept: "Your place in the queue was kept.",
    queueMoved: "Your place in the queue has moved to the back.",
    nothingToFix: "This case is not waiting on you.",
    backToCase: "Back to the case"
  },
  appeal: {
    title: "Appeal a rejection",
    lede: "Section 59 of the Rights of Persons with Disabilities Act, 2016 gives you 90 days to appeal.",
    reasonGiven: "The reason recorded for the rejection",
    groundsLabel: "Why do you think this decision is wrong?",
    groundsHint: "In your own words. This is recorded on the case and shown to the reviewing officer.",
    submit: "Lodge the appeal",
    doneTitle: "Appeal lodged",
    doneBody: "The appeal has been appended to the case log and appears on the timeline.",
    tooLate: "The 90-day appeal window for this case has closed.",
    notRejected: "This case has not been rejected, so there is nothing to appeal.",
    validation: "Write a sentence or two about why the decision is wrong."
  }
};

type Messages = typeof en;

const hi: Messages = {
  meta: {
    serviceName: "मेरा UDID",
    serviceTag: "विकलांगता प्रमाणपत्र, पूरी ट्रैकिंग के साथ",
    languageName: "हिन्दी",
    otherLanguageName: "English",
    switchTo: "Switch language to English — अंग्रेज़ी में बदलें"
  },
  nav: {
    skip: "मुख्य सामग्री पर जाएँ",
    home: "मुख्य पृष्ठ",
    apply: "आवेदन करें",
    track: "केस ट्रैक करें",
    myApplications: "मेरे आवेदन",
    officer: "अधिकारी कतार",
    admin: "निगरानी",
    primary: "मुख्य",
    portalLabel: "नागरिक सेवा पोर्टल",
    citizenServices: "नागरिक सेवाएँ",
    servicePromise: "आवेदन करें, केस ट्रैक करें और हर चरण को समझें।",
    getHelp: "सहायता लें",
    search: "खोजें",
    reconciliation: "मिलान रिपोर्ट",
    openSearch: "वेबसाइट खोज खोलें",
    closeSearch: "वेबसाइट खोज बंद करें",
    knowUdid: "UDID जानें",
    publicNotice: "सेवा सूचना",
    noticeText: "इस प्रोटोटाइप में आवेदन ट्रैकिंग, बोर्ड कैलेंडर और सहायता के साथ आवेदन की सुविधा उपलब्ध है।",
    staff: "कर्मचारी दृश्य",
    staffNote: "आंतरिक उपकरण। नागरिक अनुभव का हिस्सा नहीं।",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    menu: "मेनू",
    closeMenu: "मेनू बंद करें",
    signedInAs: "साइन इन:",
    help: "सहायता",
    accessibility: "सुगम्यता विवरण",
    policies: "वेबसाइट नीतियाँ",
    sitemap: "साइटमैप",
    why: "मेरा UDID क्यों",
    services: "सेवाएँ",
    resources: "संसाधन और मीडिया",
    about: "इस प्रोटोटाइप के बारे में",
    footerNav: "फ़ुटर"
  },
  disclaimer:
    "एक स्वतंत्र प्रोटोटाइप। यह सरकारी उत्पाद नहीं है। सारा डेटा काल्पनिक है।",
  search: {
    title: "मेरा UDID में खोजें",
    lede: "साधारण शब्दों में सेवा, मार्गदर्शिका या सहायता का रास्ता खोजें।",
    label: "आप क्या खोज रहे हैं?",
    button: "खोजें",
    results: "खोज के परिणाम",
    noResults: "मिलता-जुलता पृष्ठ नहीं मिला। “आवेदन”, “ट्रैक”, “बोर्ड”, “दस्तावेज़”, “सहायता” या “देरी” आज़माएँ।",
    prompt: "पोर्टल खोजने के लिए कोई शब्द लिखें।"
  },
  footer: {
    title: "एक स्वतंत्र प्रोटोटाइप। यह सरकारी उत्पाद नहीं है। सारा डेटा काल्पनिक है।",
    body: "मेरा UDID एक हैकाथॉन प्रोटोटाइप है। इसमें कोई सरकारी लोगो नहीं है, यह किसी सरकारी सिस्टम से संपर्क नहीं करता, और इसमें मौजूद हर व्यक्ति, आवेदन और रिकॉर्ड काल्पनिक है। यह भारत सरकार का प्रतिनिधित्व नहीं करता।",
    proposedSla:
      "यहाँ दिखाए गए सभी समय-लक्ष्य इस प्रोटोटाइप के प्रस्ताव हैं। असली सेवा कोई लक्ष्य प्रकाशित नहीं करती।",
    standards:
      "यह उसी ढाँचे में बना है जो भारतीय सरकारी वेबसाइट दिशानिर्देश (GIGW 3.0) एक सार्वजनिक सेवा से अपेक्षित करते हैं, और WCAG 2.2 स्तर AA पर जाँचा गया है — GIGW द्वारा आवश्यक WCAG 2.1 AA से एक संस्करण आगे। कहीं भी कोई सरकारी लोगो, प्रतीक या नाम-चिह्न इस्तेमाल नहीं हुआ है।",
    owner: "सामग्री स्वामी: इस हैकाथॉन प्रविष्टि के लेखक।",
    reviewed: "25 अगस्त 2026"
  },
  common: {
    applicationId: "आवेदन आईडी",
    back: "पीछे",
    next: "आगे",
    continue: "जारी रखें",
    cancel: "रद्द करें",
    district: "जिला",
    lastUpdated: "अंतिम अपडेट",
    proposedTarget: "प्रस्तावित लक्ष्य",
    days: "दिन",
    day: "दिन",
    dayInStage: "इस कार्यालय में दिन",
    notStarted: "शुरू नहीं हुआ",
    done: "पूरा",
    inProgress: "अभी चल रहा है",
    step: "चरण",
    of: "में से",
    whatHappensHere: "यहाँ क्या होता है",
    who: "कौन",
    when: "कब",
    reason: "कारण",
    close: "बंद करें",
    onThisPage: "इस पृष्ठ पर",
    relatedPages: "संबंधित पृष्ठ",
    lastReviewed: "अंतिम समीक्षा"
  },
  auth: {
    title: "डेमो में साइन इन करें",
    lede: "नीचे दिया हर खाता काल्पनिक है, और हर पासवर्ड उसी के साथ लिखा है। यहाँ कोई असली प्रमाणीकरण नहीं है — यह सिर्फ़ इसलिए है कि आप एक क्लिक में किसी व्यक्ति के रूप में उत्पाद आज़मा सकें।",
    notGated: "कुछ भी बंद नहीं है। बिना साइन इन किए भी आप किसी भी आवेदन को आईडी से ट्रैक कर सकते हैं।",
    usernameLabel: "उपयोगकर्ता नाम",
    passwordLabel: "पासवर्ड",
    submit: "साइन इन करें",
    oneClick: "इस व्यक्ति के रूप में साइन इन करें",
    accountsTitle: "डेमो खाते",
    citizenAccounts: "नागरिक",
    staffAccounts: "कर्मचारी",
    passwordForAll: "हर खाते का पासवर्ड:",
    error: "यह उपयोगकर्ता नाम और पासवर्ड किसी डेमो खाते से मेल नहीं खाते।",
    signedOut: "आप साइन आउट हो गए हैं।",
    myTitle: "मेरे आवेदन",
    myLede: "आपने जो भी आवेदन किए हैं, और अभी उनके साथ क्या हो रहा है।",
    myEmpty: "अभी आपका कोई आवेदन नहीं है।",
    startOne: "आवेदन शुरू करें",
    openCase: "यह केस खोलें",
    needsYou: "आपसे कुछ अपेक्षित है",
    onTrack: "कार्यालय के पास, लक्ष्य के भीतर",
    late: "कार्यालय के पास, लक्ष्य से आगे",
    finished: "पूरा हो गया"
  },
  board: {
    navLabel: "मेडिकल बोर्ड",
    title: "जिला मेडिकल बोर्ड कैलेंडर",
    lede: "मेडिकल बोर्ड वह इकलौता चरण है जिसे कोई नहीं छोड़ सकता, और आज इसके बारे में कुछ भी प्रकाशित नहीं होता — न यह कि बोर्ड कब बैठता है, न कितने लोगों को देख सकता है, न कतार कितनी लंबी है। इसे प्रकाशित करना ऐसा दिखता है।",
    proposalNote: "इस पृष्ठ का हर कैलेंडर इस प्रोटोटाइप का प्रस्ताव है, काल्पनिक डेटा पर। असली सेवा कोई बोर्ड कैलेंडर प्रकाशित ही नहीं करती। यही बात मुख्य है।",
    ministerQuote: "संसद में पूछे जाने पर कि जिला मेडिकल बोर्ड कितनी बार बैठते हैं, मंत्री का उत्तर था कि यह राज्य सरकारों और अस्पतालों की आवश्यकताओं तथा डॉक्टरों की उपलब्धता पर निर्भर करता है। यानी कोई तय समय-सारणी है ही नहीं।",
    districtLabel: "जिला",
    searchDistrict: "जिला खोजें",
    searchDistrictHint: "जिले का नाम लिखें",
    locationTitle: "भारत में अपना जिला खोजें",
    stateLabel: "राज्य या केंद्र शासित प्रदेश",
    stateHint: "राज्य या केंद्र शासित प्रदेश चुनें",
    anyState: "सभी राज्य और केंद्र शासित प्रदेश",
    districtOrPin: "जिले का नाम या पिन कोड",
    districtOrPinHint: "जैसे पुणे या 411001",
    locationHelp: "पहले अपना राज्य या केंद्र शासित प्रदेश चुनें, फिर जिला या छह अंकों का पिन कोड लिखें। आप भारत के किसी भी स्थान को खोज सकते हैं।",
    publishedCalendarTitle: "इस प्रोटोटाइप में प्रकाशित कैलेंडर",
    showAllDistricts: "सभी प्रकाशित कैलेंडर दिखाएँ",
    searchNoMatch: "इस प्रोटोटाइप में केवल ऊपर सूचीबद्ध जिलों का प्रकाशित कैलेंडर है। यह अप्रकाशित समय-सारणी नहीं गढ़ता।",
    venue: "कहाँ बैठता है",
    sitsOn: "किन दिनों बैठता है",
    perSitting: "एक बैठक में देखे जाने वाले लोग",
    weeklyCapacity: "हर हफ़्ते देखे जाने वाले लोग",
    queueDepth: "अभी प्रतीक्षा में लोग",
    upstream: "अभी दस्तावेज़ जाँच में",
    backlog: "कतार खाली होने में हफ़्ते",
    nextSittings: "आगामी बैठकें",
    joinToday: "अगर आप आज इस कतार में जुड़ें",
    joinTodayAnswer: "आपको देखा जाएगा",
    benchmarkTitle: "हफ़्ते में बैठक के दिन",
    benchmarkOk: "हफ़्ते में दो दिन के मानक पर खरा",
    benchmarkBelow: "हफ़्ते में दो दिन के मानक से कम",
    benchmarkNote: "महाराष्ट्र ने अपने जिला अस्पतालों से कहा था कि विकलांगता प्रमाणपत्र सत्यापन के लिए हफ़्ते में कम से कम दो दिन रखें। इस शोध में मिला यही एकमात्र प्रकाशित मानक है, इसलिए जिलों को इसी पर आँका गया है।",
    realityTitle: "कैलेंडर बनाम हकीकत",
    realityBody: "प्रकाशित दर से यह कतार {weeks} हफ़्ते में खाली होती है। जो केस वाकई इस बोर्ड से गुज़रे, उन्हें औसतन {observed} दिन लगे। जब ये दोनों मेल न खाएँ, तो इसका मतलब है बोर्ड प्रकाशित समय पर नहीं बैठ रहा — और कैलेंडर प्रकाशित करना ही इसे दिखाई देने लायक बनाता है।",
    realityNoData: "तुलना के लिए अभी इस बोर्ड से पर्याप्त केस नहीं गुज़रे हैं।",
    beyondHorizon: "प्रकाशित दर से यह कतार दो साल में भी खाली नहीं होती।",
    yourDateTitle: "आपकी मेडिकल बोर्ड तारीख",
    yourPosition: "इस जिले की बोर्ड कतार में आपका स्थान",
    yourExpected: "संभावित तारीख, अगर बोर्ड प्रकाशित समय पर बैठे",
    yourExpectedIn: "यह अब से {days} दिन बाद है।",
    sittingsAhead: "पहले कितनी बैठकें होनी हैं",
    forecastNote: "यह प्रकाशित समय-सारणी पर आधारित गणना है, वादा नहीं। गलत निकलने पर भी अनुमान को चुनौती दी जा सकती है — कोई तारीख न होने को नहीं।",
    seeCalendar: "इस जिले का पूरा कैलेंडर देखें",
    noBoard: "इस जिले के लिए कोई बोर्ड कैलेंडर प्रकाशित नहीं है।"
  },
  honesty: {
    title: "आज क्या सचमुच काम करता है, और क्या नकली है",
    lede: "यह जानने के लिए किसी को रिपॉज़िटरी नहीं खोलनी चाहिए, इसलिए यह यहीं लिखा है।",
    realTitle: "वास्तव में बना हुआ और चालू",
    real: [
      "इवेंट-आधारित केस स्टोर और स्टेट मशीन — बिना संरचित कारण कोड के वापसी या अस्वीकृति को सिस्टम ही ठुकरा देता है, सिर्फ़ इंटरफ़ेस नहीं।",
      "मिलान इंजन: हर आवेदन हमेशा ठीक एक चरण में रहता है, गिनतियों का योग मिलना ही चाहिए, और बीजित त्रुटियाँ निगरानी पृष्ठ पर पकड़ी और नामित होती हैं।",
      "कानूनी घड़ी — विकलांगजन अधिकार नियम, 2017 के तहत तीन महीने — गिनी जाती है, दिखती है, और बीतने पर देरी दर्ज कराई जा सकती है।",
      "मेडिकल बोर्ड कैलेंडर, क्षमता की गणना और संभावित तारीख का अनुमान।",
      "अंग्रेज़ी और हिंदी में पूरी यात्रा, सुगम्यता टूलकिट, और हर बिल्ड पर 42 स्वचालित सुगम्यता जाँचें।"
    ],
    mockTitle: "नकली या काल्पनिक, और क्यों",
    mock: [
      "हर व्यक्ति, आवेदन और रिकॉर्ड एक निश्चित बीज से बनता है। इस परियोजना में कहीं भी असली निजी, स्वास्थ्य या आधार-जैसा डेटा नहीं है।",
      "दस्तावेज़ अपलोड — निशान लगाना फ़ाइल लगाने के बराबर है, क्योंकि असली दस्तावेज़ रखने के लिए असली हिरासत-नियम चाहिए जिनका दिखावा प्रोटोटाइप को नहीं करना चाहिए।",
      "साइन-इन डेमो खातों की सूची है जिनके क्रेडेंशियल साथ ही छपे हैं। इसके पीछे कुछ बंद नहीं है।",
      "कोई सर्वर नहीं है: स्टोर मेमोरी में रहता है और पेज रीलोड पर फिर से बीजित होता है। सूचनाएँ बताई जाती हैं, भेजी कभी नहीं जातीं।",
      "डेमो घड़ी 23 अगस्त 2026 पर स्थिर है, ताकि आँकड़े हमेशा लिखित विवरण से मेल खाएँ।"
    ]
  },
  atScale: {
    title: "बड़े पैमाने पर यह सुरक्षित ढंग से कैसे चल सकता है",
    lede: "इस प्रोटोटाइप की किसी भी चीज़ के लिए नया निजी डेटा जुटाना या नया कानून बनाना ज़रूरी नहीं है।",
    points: [
      "इवेंट लॉग ही डिज़ाइन है, कोई डेमो-चाल नहीं: वही एपेंड-ओनली स्टोर असली डेटाबेस पर चलता है, और reconcile() अनुबंध रात्रि-कार्य और लिखते-समय जाँच के रूप में चलता है — 10.12 लाख का अंतर ऐसी स्थिति बन जाता है जिसमें सिस्टम जा ही नहीं सकता।",
      "दस्तावेज़ अपलोड की जगह DigiLocker से आते हैं, और बना हुआ प्रमाणपत्र व UDID कार्ड वापस उसी में पहुँचता है — कहीं भी नई दस्तावेज़-हिरासत नहीं।",
      "जिला बोर्ड इसी शेड्यूल मॉडल से बैठक के दिन और क्षमता प्रकाशित करते हैं; संभावित तारीख उसी गणित से निकलती है जो अस्पताल पहले से जानता है।",
      "देरी की शिकायतें राज्य की मौजूदा सेवा-गारंटी व्यवस्था और CPGRAMS में जाती हैं — कोई समानांतर चैनल नहीं गढ़ा जाता।",
      "शुरुआत एक जिले से, मिलान रिपोर्ट पहले दिन से सार्वजनिक, फिर पूरा राज्य — यही रिपोर्ट पायलट को जाँचने योग्य बनाती है।"
    ]
  },
  escalate: {
    navLabel: "देरी दर्ज कराएँ",
    limitTitle: "आपके प्रमाणपत्र के लिए कानूनी समय-सीमा",
    limitWithin: "आपका आवेदन समय-सीमा के भीतर है।",
    limitDue: "प्रमाणपत्र {date} तक मिलना चाहिए।",
    limitRemaining: "{days} दिन बाकी।",
    limitOverdue: "यह आवेदन कानूनी समय-सीमा से {days} दिन आगे निकल चुका है।",
    limitBasis: "विकलांगजन अधिकार नियम, 2017 (नियम 18, अक्टूबर 2024 में संशोधित) प्रमाणन प्राधिकारी को विकलांगता प्रमाणपत्र और UDID कार्ड जारी करने के लिए तीन महीने देते हैं। यह अवधि आपके आवेदन के दिन से गिनी जाती है।",
    limitNotCounted: "मौजूदा सेवा इस सीमा को न गिनती है, न दिखाती है, न उस पर कुछ करती है। यह सेवा करती है।",
    raiseTitle: "यह देरी दर्ज कराएँ",
    raiseLead: "आपका केस एक समय-सीमा पार कर चुका है। आप उसे यहाँ रिकॉर्ड पर दर्ज कर सकते हैं — नाम, तारीख और समय के साथ — उस अपील मार्ग के नाम, जो यह सेवा प्रस्तावित करती है।",
    goesTo: "प्रस्तावित अपील मार्ग",
    windowNote: "प्रस्तावित अवधि: इस स्तर पर {days} दिन, राज्य सेवा-गारंटी अधिनियम पर आधारित।",
    groundsLabel: "कुछ और जोड़ना चाहेंगे? (वैकल्पिक)",
    groundsHint: "देरी तारीखों सहित पहले ही दर्ज है। अगर अधिकारी को कुछ और जानना चाहिए तो लिखें।",
    submit: "देरी दर्ज कराएँ",
    cancel: "अभी नहीं",
    doneTitle: "देरी दर्ज हो गई",
    doneBody: "यह आज की तारीख और नीचे दिए प्रस्तावित मार्ग के साथ केस रिकॉर्ड में दर्ज है। इस प्रोटोटाइप में यह केवल दर्ज होता है — किसी सरकारी कार्यालय को भेजा नहीं जाता।",
    alreadyRaised: "{date} को अनुवर्तन दर्ज — प्रस्तावित मार्ग: {authority}।",
    notTransmitted: "यह प्रोटोटाइप देरी वाले केस को अपने ही रिकॉर्ड में अनुवर्तन के लिए चिह्नित करता है। यह कोई सरकारी शिकायत दर्ज नहीं करता, किसी प्राधिकारी से संपर्क नहीं करता, और कानूनी उल्लंघन तय नहीं करता।",
    exhausted: "इस केस पर दोनों स्तर की escalation इस्तेमाल हो चुकी है।",
    notYet: "इस केस पर अभी कोई समय-सीमा नहीं बीती है, इसलिए दर्ज कराने को कुछ नहीं है।",
    structureNote: "यहाँ escalation के स्तर मध्य प्रदेश लोक सेवाओं के प्रदान की गारंटी अधिनियम, 2010 पर आधारित हैं, जिसमें राज्य हर अधिसूचित सेवा के लिए प्रथम अपील अधिकारी और द्वितीय अपीलीय प्राधिकारी नियुक्त करता है। विकलांगता प्रमाणपत्र उस अधिनियम में अधिसूचित है या नहीं, और किस समय-सीमा के विरुद्ध — यह सत्यापित नहीं हो सका। इसलिए यह प्रोटोटाइप कोई जुर्माना मिलने का दावा नहीं करता। यह देरी दर्ज करता है और ऊपर भेजता है।",
    backToCase: "केस पर वापस जाएँ",
    seeEscalation: "यह देरी दर्ज कराएँ"
  },
  a11yBar: {
    label: "प्रदर्शन",
    increase: "अक्षर बड़े करें",
    decrease: "अक्षर छोटे करें",
    reset: "अक्षर सामान्य करें",
    contrast: "उच्च कंट्रास्ट"
  },
  aboutWhy: {
    eyebrow: "डाकपेटी नहीं, ट्रैक होने वाला केस",
    title: "नए सिस्टम की ज़रूरत क्यों",
    lede: "इस सेवा के पीछे के प्रमाण: मौजूदा व्यवस्था में आवेदनों के साथ क्या होता है — सरकार के अपने आँकड़ों में — और यह सेवा उसके बारे में क्या करती है।"
  },
  home: {
    eyebrow: "यूनिक डिसेबिलिटी आईडी (UDID)",
    headline: "विकलांगता प्रमाणपत्र सेवाएँ",
    lede: "ऑनलाइन आवेदन करें और हर चरण पर अपना आवेदन ट्रैक करें — फ़ाइल किस कार्यालय के पास है, कितने दिनों से है, और आगे क्या होगा।",
    exampleIntro: "विकलांगता प्रमाणपत्र का आवेदन कई महीनों में जिला कार्यालय और अस्पताल के मेडिकल बोर्ड से होकर गुजरता है। मेरा UDID उसे एक चरण, एक जिम्मेदार कार्यालय और एक घड़ी देता है — ताकि देरी के साथ एक नाम जुड़ा रहे। एक असली केस में यह ऐसा दिखता है।",
    stakes: "UDID कार्ड अपने आप में कोई लाभ नहीं है। यह वह चाबी है जो बाकी हर लाभ खोलती है — नौकरी और कॉलेज में आरक्षण, विकलांगता पेंशन, छात्रवृत्ति, यात्रा में छूट, सहायक उपकरण। महाराष्ट्र ने इसे हर सरकारी लाभ के लिए अनिवार्य कर दिया है। इसलिए कार्ड अटकने पर एक चीज़ नहीं छूटती — सब कुछ एक साथ छूट जाता है।",
    checkTitle: "पहले आवेदन कर चुके हैं? अभी देखिए।",
    checkLabel: "आपकी आवेदन आईडी",
    checkButton: "बताइए यह कहाँ है",
    tasksTitle: "आप क्या करना चाहेंगे?",
    tasksLede: "लोग यहाँ मुख्यतः इन्हीं पाँच कामों के लिए आते हैं। बाकी सब इन्हीं से एक क्लिक दूर है।",
    tasks: [
      {
        title: "विकलांगता प्रमाणपत्र के लिए आवेदन करें",
        body: "चार छोटे चरण, साथ-साथ सहेजे जाते हुए, और जमा करने से पहले दस्तावेज़ जाँच।"
      },
      {
        title: "आवेदन ट्रैक करें",
        body: "देखें कि आपकी फ़ाइल किस कार्यालय के पास है, कितने दिनों से है, और आगे क्या होगा।"
      },
      {
        title: "अपनी मेडिकल बोर्ड तारीख देखें",
        body: "हर जिले के बैठक दिन, क्षमता और कतार — और आपको कब देखा जाएगा।"
      },
      {
        title: "अपने सभी आवेदन देखें",
        body: "साइन इन करें और आईडी याद रखने की ज़रूरत नहीं। छह डेमो खाते, हर एक एक क्लिक पर।"
      },
      {
        title: "सहायता और समर्थन",
        body: "प्रक्रिया कैसे चलती है, वापस भेजे जाने पर क्या करें, और अपील कैसे करें।"
      }
    ],
    sourcesTitle: "ये आँकड़े कहाँ से आए हैं",
    startAction: "नया आवेदन शुरू करें",
    trackAction: "मौजूदा आवेदन ट्रैक करें",
    livePreviewTitle: "एक ट्रैक होता हुआ केस",
    livePreviewNote: "एक उदाहरण केस — खोलकर देखें।",
    viewFullCase: "पूरा केस देखें",
    arithmeticTitle: "भारत को नया सिस्टम क्यों चाहिए",
    arithmeticIntro:
      "12 अगस्त 2026 को रिपोर्ट किए गए राज्यसभा के लिखित उत्तर में सरकार ने 2021 से मिले UDID आवेदनों के चार आँकड़े दिए।",
    received: "2021 से मिले आवेदन",
    generated: "बने कार्ड",
    rejected: "अस्वीकार आवेदन",
    pending: "लंबित आवेदन",
    accounted: "जारी + अस्वीकार + लंबित",
    gapLabel: "आवेदन किसी भी कॉलम में नहीं हैं",
    gapNote:
      "एक सांसद ने पूछा कि वे कहाँ गए। उत्तर में यह नहीं बताया गया। घटाव हमारा है; चारों आँकड़े सरकार के हैं।",
    gapPromise:
      "मेरा UDID इसी लिए बना है कि ऐसा हो ही न सके। हर आवेदन हमेशा ठीक एक चरण में रहता है — एक जिम्मेदार कार्यालय और चलती घड़ी के साथ। किसी कॉलम में न होना इस सिस्टम में संभव ही नहीं है।",
    diagnosisTitle: "जहाँ ट्रैकिंग नंबर चाहिए था, वहाँ डाकपेटी बनी",
    diagnosisBody:
      "डाकपेटी में चिट्ठी डालिए और वह \"भेज दी गई\" हो जाती है। बस यही एक स्थिति होती है, कोई जिम्मेदार नहीं होता, और न पहुँचे तो जाँचने को कुछ नहीं होता। कूरियर का ट्रैकिंग नंबर इसका उलटा है: हर कदम का नाम, समय और व्यक्ति — और कुछ भी चुपचाप गायब नहीं हो सकता।",
    diagnosisPunch:
      "सिस्टम को पता ही नहीं कि आवेदन कहाँ है, इसलिए किसी से यह नहीं पूछा जा सकता कि वह आगे क्यों नहीं बढ़ा।",
    processTitle: "यात्रा, और हमारा प्रस्तावित समय",
    processIntro:
      "छह चरण, हर एक का एक जिम्मेदार कार्यालय और उस पर चलती एक घड़ी। नीचे दिया हर लक्ष्य हमारा प्रस्तावित वचन है — मौजूदा सेवा कोई लक्ष्य प्रकाशित नहीं करती।",
    totalTarget: "कुल प्रस्तावित लक्ष्य",
    realWorld: "मध्य प्रदेश में रिपोर्ट किया गया औसत इंतज़ार",
    realWorldNote: "16 अगस्त 2026 को रिपोर्ट किए गए सरकारी आँकड़ों से।",
    rightsTitle: "मेरा UDID आपसे क्या वादे करता है",
    rights: [
      {
        title: "\"अस्वीकार\" कभी बिना कारण नहीं बताया जाता",
        body: "हर वापसी और हर अस्वीकृति के साथ एक संरचित कोड, सरल भाषा में एक वाक्य, और वह दस्तावेज़ जुड़ा होता है जिसमें दिक्कत है। बिना कोड के सिस्टम इसे स्वीकार ही नहीं करता।"
      },
      {
        title: "कार्यालय की गलती से आप कतार के पीछे नहीं जाते",
        body: "अगर गलती प्रशासनिक थी, तो दोबारा भेजने पर आपकी जगह सुरक्षित रहती है। स्क्रीन पर यह साफ़ लिखा होता है।"
      },
      {
        title: "फ़िंगरप्रिंट देना ज़रूरी नहीं",
        body: "फ़िंगरप्रिंट की शर्त उन लोगों को बाहर करती है जिनके अंग नहीं हैं, जिनकी उँगलियाँ कुष्ठ रोग में चली गईं, या जो एसिड हमले से पीड़ित हैं। यहाँ अधिकारी द्वारा सत्यापन का रास्ता खुलकर दिया गया है।"
      },
      {
        title: "कोई आपकी ओर से आवेदन कर सकता है, रिकॉर्ड के साथ",
        body: "व्यवहार में अक्सर परिवार का कोई सदस्य फ़ॉर्म भरता है। सहायता मोड यह दर्ज करता है कि किसने मदद की और आपने सहमति दी।"
      }
    ]
  },
  track: {
    title: "आवेदन ट्रैक करें",
    lede: "आवेदन आईडी डालें और देखें कि केस कहाँ है, किसके पास है, और कितने दिनों से है।",
    label: "आवेदन आईडी",
    hint: "UDID-DEMO-1024, UDID-DEMO-2048, UDID-DEMO-4096 या UDID-DEMO-8192 आज़माएँ।",
    button: "यह केस ट्रैक करें",
    landingTitle: "यहाँ आप क्या कर सकते हैं",
    landingLead: "ट्रैकिंग सिर्फ़ यह देखने के लिए नहीं है कि आवेदन भेजा गया था या नहीं। यह बताती है कि केस कहाँ है, उसकी जिम्मेदारी किसकी है, और अब आप क्या कर सकते हैं।",
    needTitle: "आपको क्या चाहिए",
    needBody: "जमा रसीद से अपनी आवेदन आईडी रखें। यह “UDID-” से शुरू होती है।",
    seeTitle: "आपको क्या दिखेगा",
    seeBody: "वर्तमान चरण, केस रखने वाला नामित कार्यालय और वहाँ बीता समय।",
    actionTitle: "आप क्या कर सकते हैं",
    actionBody: "वापस किया गया दस्तावेज़ ठीक करें, मेडिकल बोर्ड की तारीख देखें, या समय-सीमा पार होने पर देरी दर्ज कराएँ।",
    journeyTitle: "आपका केस, आसान चरणों में",
    journeySubmitted: "आवेदन प्राप्त हुआ",
    journeyChecking: "दस्तावेज़ जाँचे गए",
    journeyOutcome: "बोर्ड और प्रमाणपत्र का परिणाम",
    noIdTitle: "अभी आवेदन आईडी नहीं है?",
    noIdAction: "नया आवेदन शुरू करें",
    notFound: "इस प्रोटोटाइप में इस आईडी का कोई आवेदन नहीं है।",
    notFoundHint: "आईडी जाँचकर दोबारा कोशिश करें, या ऊपर दी डेमो आईडी इस्तेमाल करें।",
    holderLabel: "अभी आपकी फ़ाइल किसके पास है",
    stageLabel: "चरण",
    breached: "प्रस्तावित लक्ष्य से आगे निकल चुका",
    withinTarget: "प्रस्तावित लक्ष्य के भीतर",
    nextStepTitle: "आपका अगला कदम",
    noNextStep: "आपको कुछ नहीं करना है।",
    timelineTitle: "इस केस के सभी चरण",
    queueTitle: "कतार में आपकी जगह",
    queueBody: "{district} के इस कार्यालय में {total} में से {position} नंबर पर।",
    queueProtected: "कतार में आपकी जगह सुरक्षित है।",
    queueProtectedWhy:
      "यह दिक्कत कार्यालय पहले भी पकड़ सकता था, इसलिए आपकी पुरानी जगह बनी रहती है।",
    queueLost: "कतार में आपकी जगह सुरक्षित नहीं रखी गई।",
    queueLostWhy:
      "यह कारण कोड आवेदक की ओर से हुई चूक के रूप में दर्ज है। अगर आपको समय पर सूचना नहीं मिली थी, तो आप अपील कर सकते हैं।",
    returnedTitle: "यह केस आपके पास वापस भेजा गया है",
    rejectedTitle: "यह आवेदन अस्वीकार कर दिया गया",
    documentAtFault: "जिस दस्तावेज़ में दिक्कत है",
    fixAction: "ठीक करके दोबारा भेजें",
    appealAction: "अपील दर्ज करें",
    appealDeadline: "आप {date} तक अपील कर सकते हैं, RPwD अधिनियम 2016 की धारा 59 के तहत।",
    appealLodged: "अपील दर्ज हो चुकी है और इस केस में जुड़ गई है।",
    historyTitle: "पूरा ऑडिट रिकॉर्ड",
    historyNote:
      "हर पंक्ति केस लॉग में जोड़ी गई एक घटना है। इसे न बदला जा सकता है, न मिटाया जा सकता है।",
    detailsTitle: "केस का विवरण",
    applicant: "आवेदक",
    disability: "विकलांगता का प्रकार",
    identity: "पहचान सत्यापन",
    assistedBy: "सहायता करने वाले",
    submittedOn: "जमा करने की तारीख",
    totalDays: "आवेदन किए हुए दिन",
    assuranceTitle: "यह केस चुपचाप क्यों नहीं खो सकता",
    assuranceOne: "यह हमेशा ठीक एक चरण में रहता है। यहाँ “भेज दिया गया” जैसी कोई अकेली स्थिति होती ही नहीं।",
    assuranceTwo: "उस चरण के लिए हमेशा एक कार्यालय जवाबदेह होता है — ऊपर दिखाया गया है, और उन्हें भी दिखता है।",
    assuranceThree: "हर चरण पर एक घड़ी चलती है, और किसी के न देखने से वह रुकती नहीं।",
    assuranceFour: "ऊपर कुछ भी बदला या मिटाया नहीं जा सकता। सुधार का मतलब है रिकॉर्ड में नई पंक्ति, पुरानी को बदलना नहीं।",
    unplaceableTitle: "यह आवेदन किसी भी चरण में नहीं है",
    unplaceableBody:
      "इस आवेदन का केस लॉग यह नहीं बता सकता कि वह कहाँ है। यही वह चूक है जिससे आवेदन किसी कॉलम में नहीं रहता — और इस प्रोटोटाइप में इसे छिपाया नहीं, पकड़ा जाता है। यह निगरानी रिपोर्ट में दिखता है।",
    unplaceableAction: "इसे मिलान रिपोर्ट में देखें"
  },
  apply: {
    title: "विकलांगता प्रमाणपत्र के लिए आवेदन",
    lede: "चार छोटे चरण। आपके उत्तर इसी डिवाइस पर सहेजे जाते रहते हैं, ताकि इंटरनेट टूटने पर मेहनत बेकार न जाए।",
    resumeNotice: "इस डिवाइस पर सहेजा गया ड्राफ़्ट मिला और बहाल कर दिया गया है।",
    clearDraft: "फिर से शुरू करें",
    steps: ["आपका विवरण", "विकलांगता का प्रकार", "दस्तावेज़", "जाँचकर जमा करें"],
    detailsTitle: "यह आवेदन किसके लिए है?",
    nameLabel: "आवेदक का पूरा नाम",
    nameHint: "जैसा आपके पहचान दस्तावेज़ में लिखा है।",
    ageLabel: "उम्र (वर्षों में)",
    genderLabel: "लिंग",
    genderOptions: { female: "महिला", male: "पुरुष", other: "अन्य" },
    districtLabel: "जिला",
    phoneLabel: "मोबाइल नंबर",
    phoneHint: "सिर्फ़ केस आगे बढ़ने की सूचना के लिए। यह प्रोटोटाइप कुछ नहीं भेजता।",
    assistedTitle: "क्या कोई आपकी मदद कर रहा है?",
    assistedNo: "नहीं, मैं खुद भर रहा/रही हूँ",
    assistedYes: "हाँ, कोई मेरी मदद कर रहा है",
    assistedNameLabel: "मदद करने वाले का नाम",
    assistedRelationLabel: "आवेदक से उनका रिश्ता",
    assistedPhoneLabel: "मदद करने वाले का मोबाइल नंबर",
    assistedPhoneHint: "केवल तभी इस्तेमाल होगा जब कार्यालय को इस अधिकृत सहायक से कुछ स्पष्ट करना हो। यह प्रोटोटाइप कुछ नहीं भेजता।",
    assistedConsent:
      "आवेदक इस व्यक्ति को अपनी ओर से आवेदन करने की सहमति देता/देती है। यह सहमति केस में दर्ज होती है।",
    identityTitle: "आपकी पहचान कैसे जाँची जाए?",
    identityHint:
      "फ़िंगरप्रिंट यहाँ एक विकल्प है, इकलौता रास्ता नहीं। असली सेवा की फ़िंगरप्रिंट शर्त उन लोगों को बाहर करती है जिनके अंग नहीं हैं, जिनकी उँगलियाँ कुष्ठ रोग में चली गईं, या जो एसिड हमले से पीड़ित हैं।",
    identityOptions: {
      FINGERPRINT: "फ़िंगरप्रिंट",
      OFFICER_ATTESTED: "अधिकारी मेरे दस्तावेज़ सामने से जाँचें",
      DOCUMENT_ONLY: "मैं अपने दस्तावेज़ अपलोड करूँगा/करूँगी"
    },
    identityDocumentNote: "आप अगले ‘दस्तावेज़’ चरण में फ़ाइलें चुनेंगे।",
    disabilityTitle: "आप किस स्थिति के लिए आवेदन कर रहे हैं?",
    disabilityHint:
      "ये विकलांगजन अधिकार अधिनियम, 2016 की अनुसूची में दर्ज 21 निर्दिष्ट विकलांगताएँ हैं।",
    documentsTitle: "आपके दस्तावेज़",
    documentsHint:
      "हर दस्तावेज़ चुनें, फिर इस डिवाइस से उसकी फ़ाइल चुनें। PDF, JPG या PNG फ़ाइलें लगाई जा सकती हैं।",
    chooseFile: "फ़ाइल चुनें",
    noFileChosen: "अभी कोई फ़ाइल नहीं चुनी गई",
    fileChosen: "चुनी गई फ़ाइल",
    fileSessionNote: "प्रोटोटाइप सूचना: चुनी गई फ़ाइलें केवल इस ब्राउज़र सत्र में रहती हैं और किसी सरकारी सिस्टम को नहीं भेजी जातीं।",
    precheckTitle: "दस्तावेज़ पूर्व-जाँच",
    precheckIntro:
      "यह जमा करने से पहले चलती है, ताकि आपको अभी पता चले, तीन महीने बाद नहीं।",
    precheckPass: "इस श्रेणी के लिए ज़रूरी सब कुछ लगा हुआ है।",
    precheckFail: "कुछ दस्तावेज़ नहीं हैं। आप फिर भी जमा कर सकते हैं, पर कार्यालय केस वापस भेज सकता है।",
    precheckNote:
      "ये नियम इस प्रोटोटाइप का प्रस्ताव हैं, कोई प्रकाशित राष्ट्रीय सूची नहीं। ये तय नियम हैं, आपकी फ़ाइलें पढ़ने वाला कोई मॉडल नहीं।",
    precheckWhy: "यह क्यों ज़रूरी है",
    reviewTitle: "जमा करने से पहले जाँच लें",
    submit: "आवेदन जमा करें",
    submittedTitle: "आवेदन जमा हो गया",
    submittedBody: "आपकी आवेदन आईडी नीचे है। इसे लिख लें — इसी से आप केस ट्रैक करेंगे।",
    receiptTitle: "आपकी जमा रसीद",
    receiptReference: "आवेदन संदर्भ",
    nextStepsTitle: "आगे क्या होगा",
    nextSteps: [
      "आपका केस ‘प्राप्त’ स्थिति से शुरू होता है और जिला सामाजिक कल्याण कार्यालय को सौंपा जाता है।",
      "उस कार्यालय के लिए एक तय चरण और दिखाई देने वाली समय-घड़ी होती है। कुछ वापस भेजा गया तो कारण और अगला कदम दिखेगा।",
      "जब भी आवेदन ट्रैक करने लौटें, इस संदर्भ का उपयोग करें।"
    ],
    sessionNotice:
      "प्रोटोटाइप सूचना: यह नया केस सिर्फ़ इस ब्राउज़र सत्र में उपलब्ध है। इसे किसी सरकारी सिस्टम को नहीं भेजा गया है और यह असली आवेदन के रूप में जमा नहीं होता।",
    trackNow: "यह आवेदन ट्रैक करें",
    validation: {
      name: "आवेदक का पूरा नाम भरें।",
      age: "0 से 120 के बीच उम्र भरें।",
      district: "जिला चुनें।",
      phone: "10 अंकों का मोबाइल नंबर भरें।",
      disability: "जिस स्थिति के लिए आवेदन कर रहे हैं वह चुनें।",
      assistedName: "मदद करने वाले का नाम भरें।",
      assistedRelation: "आवेदक से उनका रिश्ता भरें।",
      assistedPhone: "मदद करने वाले का 10 अंकों का मोबाइल नंबर भरें।",
      summary: "इस पेज पर {count} उत्तर में दिक्कत है।"
    }
  },
  fix: {
    title: "ठीक करके दोबारा भेजें",
    lede: "यहाँ सिर्फ़ वही दिखाया गया है जिसमें दिक्कत है। जो आप पहले दे चुके हैं, वह दोबारा नहीं माँगा जाता।",
    problemTitle: "क्या ठीक करना है",
    replaceLabel: "बदला हुआ दस्तावेज़ लगाएँ",
    replaceHint: "इस प्रोटोटाइप में निशान लगाना ही फ़ाइल लगाने के बराबर है।",
    submit: "कार्यालय को वापस भेजें",
    doneTitle: "कार्यालय को वापस भेज दिया गया",
    doneBody: "केस उसी कार्यालय के पास लौट गया है जिसने इसे आपको भेजा था।",
    queueKept: "कतार में आपकी जगह बनी रही।",
    queueMoved: "कतार में आपकी जगह पीछे चली गई है।",
    nothingToFix: "यह केस आपके किसी काम का इंतज़ार नहीं कर रहा।",
    backToCase: "केस पर वापस जाएँ"
  },
  appeal: {
    title: "अस्वीकृति के विरुद्ध अपील",
    lede: "विकलांगजन अधिकार अधिनियम, 2016 की धारा 59 आपको अपील के लिए 90 दिन देती है।",
    reasonGiven: "अस्वीकृति के लिए दर्ज कारण",
    groundsLabel: "आपको यह निर्णय गलत क्यों लगता है?",
    groundsHint: "अपने शब्दों में। यह केस में दर्ज होगा और समीक्षा अधिकारी को दिखेगा।",
    submit: "अपील दर्ज करें",
    doneTitle: "अपील दर्ज हो गई",
    doneBody: "अपील केस लॉग में जुड़ गई है और समयरेखा पर दिखती है।",
    tooLate: "इस केस के लिए 90 दिन की अपील अवधि बीत चुकी है।",
    notRejected: "यह केस अस्वीकार नहीं हुआ है, इसलिए अपील के लिए कुछ नहीं है।",
    validation: "एक-दो वाक्य लिखें कि निर्णय गलत क्यों है।"
  }
};

export const messages: Record<Locale, Messages> = { en, hi };

export type { Messages };
