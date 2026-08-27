import type { Locale } from "./messages";

/**
 * The statutory pages.
 *
 * GIGW 3.0 — the Guidelines for Indian Government Websites and apps — requires a
 * government service to publish a fixed set of pages: Help, FAQs, Contact, Feedback,
 * Terms and Conditions, Privacy Policy, Copyright Policy, Hyperlinking Policy, an
 * accessibility statement, and a sitemap reachable from the homepage. It also requires
 * a named content owner and a stated review cadence, and content in more than one
 * Indian language.
 *
 * This prototype follows that structure because the structure is good practice and
 * because a citizen who has used other Indian government services will know where to
 * look. It does **not** copy any government branding, emblem or wordmark, and every one
 * of these pages opens by saying what this is: an independent prototype that is not an
 * official government product. Adopting the layout conventions of government services
 * while being mistaken for one would be exactly the harm the hackathon rules forbid, so
 * the disclaimer gets more prominence here, not less.
 */

export interface PageSection {
  heading: string;
  /** Each entry is a paragraph. */
  body: string[];
}

export interface StaticPage {
  title: string;
  lede: string;
  sections: PageSection[];
}

const NOT_OFFICIAL_EN =
  "Mera UDID is an independent prototype built for a hackathon. It is not an official Government of India product, it is not affiliated with the Department of Empowerment of Persons with Disabilities, and it uses no government logo or emblem. Every person, application and record in it is invented.";

const NOT_OFFICIAL_HI =
  "मेरा UDID एक हैकाथॉन के लिए बनाया गया स्वतंत्र प्रोटोटाइप है। यह भारत सरकार का आधिकारिक उत्पाद नहीं है, यह विकलांगजन सशक्तिकरण विभाग से संबद्ध नहीं है, और इसमें कोई सरकारी लोगो या प्रतीक इस्तेमाल नहीं होता। इसमें मौजूद हर व्यक्ति, आवेदन और रिकॉर्ड काल्पनिक है।";

const en = {
  help: {
    title: "Help",
    lede: "What this service does, how to use it, and what to do when something goes wrong.",
    sections: [
      {
        heading: "What this is",
        body: [
          NOT_OFFICIAL_EN,
          "It demonstrates one idea: that an application for a disability certificate should behave like a tracked case with a stage, a named office responsible for it, and a clock — instead of a form that disappears after you press submit."
        ]
      },
      {
        heading: "How to apply",
        body: [
          "Choose Apply from the main menu. There are four short steps: your details, the condition you are applying for, your documents, and a review before you submit.",
          "Your answers are saved on your own device as you go, so a dropped connection does not lose your work. Nothing is sent anywhere until you press submit.",
          "Before you submit, a document pre-check tells you whether what you have attached will satisfy the category you chose. This is deliberately a fixed set of rules, not a model reading your files, so the answer is always explainable."
        ]
      },
      {
        heading: "How to track an application",
        body: [
          "Choose Track a case and enter your application ID, or sign in and use My applications to see everything you have applied for without needing an ID.",
          "The case page tells you which office is holding your file right now, how many days it has been there, how that compares with the proposed target, and what happens next."
        ]
      },
      {
        heading: "If your application is sent back",
        body: [
          "You will see the reason in plain language, the exact document that caused it, and a single action to fix it. Nothing you have already provided is asked for again.",
          "If the problem was something the office could have flagged earlier, your place in the queue is protected when you resubmit, and the page says so explicitly."
        ]
      },
      {
        heading: "If your application is rejected",
        body: [
          "Every rejection carries a structured reason code and a plain-language explanation. Section 59 of the Rights of Persons with Disabilities Act, 2016 gives you 90 days to appeal, and the case page shows the deadline and a link to lodge one."
        ]
      },
      {
        heading: "If you cannot give fingerprints",
        body: [
          "You do not have to. Identity verification is a question with three answers, and fingerprints are only one of them. The requirement in the real service is documented as excluding people with missing limbs, people with leprosy-related finger loss, and acid-attack survivors, so the alternative is offered openly rather than hidden."
        ]
      },
      {
        heading: "If someone is helping you apply",
        body: [
          "Say so on the first step of the form. The helper's name, their relationship to you, and the fact that you consented are recorded on the case and shown on the case page. In practice a family member often fills the form, and it is better to record that than to pretend otherwise."
        ]
      },
      {
        heading: "Signing in",
        body: [
          "There are six demo accounts. Every username and password is printed on the sign-in page next to a one-click button, because there is nothing to protect — no account holds real data.",
          "Nothing is locked. You can track any application by ID without signing in."
        ]
      },
      {
        heading: "Contact and feedback",
        body: [
          "This is a prototype. There is no helpline, no inbox and no case worker behind it, and it would be dishonest to publish one.",
          "For the real service, the responsible body is the Department of Empowerment of Persons with Disabilities, Ministry of Social Justice and Empowerment. This prototype has no connection to them and cannot pass a message on."
        ]
      }
    ]
  },
  accessibility: {
    title: "Accessibility statement",
    lede: "This is a service for persons with disabilities. Accessibility is the product, not a checklist item — so here is exactly what has been done and what has not.",
    sections: [
      {
        heading: "Conformance",
        body: [
          "This prototype aims to meet WCAG 2.2 Level AA. GIGW 3.0 requires Level AA of WCAG 2.1 for Indian government websites, so this target is one version ahead of that minimum.",
          "Every colour pair in use has been measured rather than eyeballed. The lowest contrast ratio anywhere in the interface is 5.67:1, against a 4.5:1 requirement for body text. The full table is published in STYLE.md in the source code."
        ]
      },
      {
        heading: "What has been tested, and how",
        body: [
          "Automated testing: axe-core runs against every screen at both a 360-pixel mobile viewport and a desktop viewport, on every build. The bar is zero serious or critical violations, and it is currently met.",
          "Keyboard: the entire main journey — find a case, read its reason for being returned, fix it, resubmit it — is driven by keyboard alone in an automated test, starting from the skip link.",
          "Zoom: every screen is checked at 640 CSS pixels, which is what a 1280-pixel window gives at 200% browser zoom. Nothing overflows sideways.",
          "Target size: every interactive element on every screen is checked to be at least 44 by 44 pixels, including the language toggle."
        ]
      },
      {
        heading: "How it is built",
        body: [
          "Semantic HTML throughout: real navigation landmarks, one main heading per screen, an ordered list for the case timeline, and form fields with labels and errors linked programmatically.",
          "No information is carried by colour alone. Every stage on the timeline has an icon and a written label as well as a colour.",
          "A visible focus ring on every interactive element, never removed. The ring is yellow over a dark edge, because yellow alone does not meet the required contrast against a white background.",
          "Status changes are announced through a live region for screen reader users.",
          "Motion is minimal, and the prefers-reduced-motion setting is respected.",
          "No web fonts and no external assets, so the interface loads on a low-end phone on a slow connection."
        ]
      },
      {
        heading: "Screen reader access",
        body: [
          "This site is built with standard HTML and has been checked to work without any special software. It has been tested with the accessibility tree that screen readers consume, rather than with a specific commercial reader.",
          "Free screen readers include NVDA on Windows, Orca on Linux, and the built-in VoiceOver on macOS, iOS and iPadOS, and TalkBack on Android."
        ]
      },
      {
        heading: "Known limitations",
        body: [
          "The officer console and the oversight dashboard are available in English only. The whole citizen journey is available in English and Hindi.",
          "This prototype has been tested with automated tools and by keyboard, but it has not yet been tested with people who use assistive technology daily. That is the most important gap in this statement, and no automated score substitutes for it.",
          "Languages beyond English and Hindi are not implemented, though the text is structured so that adding them requires no code changes."
        ]
      },
      {
        heading: "Reporting a problem",
        body: [
          "This is a hackathon prototype with no support channel. If you are reviewing it and find an accessibility barrier, the honest thing for us to say is that it should be raised with whoever showed you this, not with a helpdesk that does not exist."
        ]
      }
    ]
  },
  policies: {
    title: "Website policies",
    lede: "Terms, privacy, copyright and linking — published in the structure GIGW asks of an Indian government website, and written for what this actually is.",
    sections: [
      {
        heading: "Terms and conditions",
        body: [
          NOT_OFFICIAL_EN,
          "Nothing shown here is a decision, a certificate, an entitlement or a record of any kind. No status displayed on this site has any bearing on a real application. Do not rely on it for anything.",
          "This prototype does not contact, scrape, probe or test swavlambancard.gov.in or any other live government system, and contains no code capable of doing so."
        ]
      },
      {
        heading: "Privacy",
        body: [
          "This prototype has no server, no database and no analytics. Nothing you type is transmitted anywhere, because there is nowhere for it to go.",
          "Two things are stored in your own browser and never leave it: your language choice, and any application form you have part-filled, so that a dropped connection does not lose your work. Clearing your browser data removes both.",
          "The application form asks for a mobile number so that the form is realistic. It is deliberately discarded on submission and replaced with a masked placeholder, because nothing in this prototype needs it.",
          "No real personal data, no health data, and no Aadhaar-format identifier appears anywhere in this project. Every phone number in the sample data uses a leading-zero pattern that cannot be a real Indian mobile number."
        ]
      },
      {
        heading: "Copyright",
        body: [
          "The design, code and written content of this prototype belong to its authors and are offered for review as a hackathon submission.",
          "Facts, figures and quotations about the real UDID system are not ours. They belong to their sources — parliamentary answers, the Free Press Journal, ThePrint, Deccan Herald, NewsOnAir and the official app store listing — and each is attributed on the screen where it appears and in the source code."
        ]
      },
      {
        heading: "Hyperlinking",
        body: [
          "You may link directly to any page of this prototype. Its addresses are stable and shareable.",
          "This prototype links out only to the sources of the facts it states. Those sites are not under our control, and linking to one is not an endorsement of it."
        ]
      },
      {
        heading: "Content ownership and review",
        body: [
          "Content owner: the authors of this hackathon submission. There is no Web Information Manager, because there is no institution behind this.",
          "Sample data is regenerated from a fixed seed on every page load, so it never goes stale and never drifts. The demo clock is pinned to 23 August 2026 so that the figures shown always match the written walkthrough."
        ]
      }
    ]
  }
};

type Pages = typeof en;

const hi: Pages = {
  help: {
    title: "सहायता",
    lede: "यह सेवा क्या करती है, इसका उपयोग कैसे करें, और कुछ गलत होने पर क्या करें।",
    sections: [
      {
        heading: "यह क्या है",
        body: [
          NOT_OFFICIAL_HI,
          "यह एक ही विचार दिखाता है: विकलांगता प्रमाणपत्र का आवेदन एक ट्रैक होने वाले केस की तरह चलना चाहिए, जिसमें एक चरण हो, एक जिम्मेदार कार्यालय हो, और एक घड़ी चलती हो — न कि एक ऐसा फ़ॉर्म जो जमा करते ही गायब हो जाए।"
        ]
      },
      {
        heading: "आवेदन कैसे करें",
        body: [
          "मुख्य मेन्यू से 'आवेदन करें' चुनें। चार छोटे चरण हैं: आपका विवरण, जिस स्थिति के लिए आवेदन कर रहे हैं, आपके दस्तावेज़, और जमा करने से पहले एक जाँच।",
          "आपके उत्तर आपके ही डिवाइस पर सहेजे जाते रहते हैं, ताकि इंटरनेट टूटने पर मेहनत बेकार न जाए। जमा करने तक कुछ भी कहीं नहीं भेजा जाता।",
          "जमा करने से पहले दस्तावेज़ पूर्व-जाँच बताती है कि आपने जो लगाया है वह आपकी चुनी श्रेणी के लिए पर्याप्त है या नहीं। यह जानबूझकर तय नियमों पर आधारित है, आपकी फ़ाइलें पढ़ने वाला कोई मॉडल नहीं, ताकि उत्तर हमेशा समझाया जा सके।"
        ]
      },
      {
        heading: "आवेदन कैसे ट्रैक करें",
        body: [
          "'केस ट्रैक करें' चुनकर अपनी आवेदन आईडी डालें, या साइन इन करके 'मेरे आवेदन' देखें — वहाँ आईडी याद रखने की ज़रूरत नहीं।",
          "केस पेज बताता है कि अभी आपकी फ़ाइल किस कार्यालय के पास है, कितने दिनों से है, यह प्रस्तावित लक्ष्य से कैसी है, और आगे क्या होगा।"
        ]
      },
      {
        heading: "अगर आवेदन वापस भेजा जाए",
        body: [
          "आपको सरल भाषा में कारण दिखेगा, वह दस्तावेज़ जिसमें दिक्कत है, और उसे ठीक करने के लिए एक ही कदम। जो आप पहले दे चुके हैं, वह दोबारा नहीं माँगा जाता।",
          "अगर दिक्कत ऐसी थी जो कार्यालय पहले भी पकड़ सकता था, तो दोबारा भेजने पर कतार में आपकी जगह सुरक्षित रहती है, और पेज पर यह साफ़ लिखा होता है।"
        ]
      },
      {
        heading: "अगर आवेदन अस्वीकार हो जाए",
        body: [
          "हर अस्वीकृति के साथ एक संरचित कारण कोड और सरल भाषा में स्पष्टीकरण होता है। विकलांगजन अधिकार अधिनियम, 2016 की धारा 59 आपको अपील के लिए 90 दिन देती है, और केस पेज पर अंतिम तारीख तथा अपील का लिंक दिखता है।"
        ]
      },
      {
        heading: "अगर आप फ़िंगरप्रिंट नहीं दे सकते",
        body: [
          "देना ज़रूरी नहीं है। पहचान सत्यापन एक ऐसा प्रश्न है जिसके तीन उत्तर हैं, और फ़िंगरप्रिंट उनमें से सिर्फ़ एक है। असली सेवा की यह शर्त उन लोगों को बाहर करती है जिनके अंग नहीं हैं, जिनकी उँगलियाँ कुष्ठ रोग में चली गईं, या जो एसिड हमले से पीड़ित हैं — इसलिए विकल्प खुलकर दिया गया है, छिपाकर नहीं।"
        ]
      },
      {
        heading: "अगर कोई आपकी मदद कर रहा है",
        body: [
          "फ़ॉर्म के पहले चरण में यह बताएँ। मदद करने वाले का नाम, आपसे उनका रिश्ता, और आपकी सहमति केस में दर्ज होती है और केस पेज पर दिखती है। व्यवहार में अक्सर परिवार का कोई सदस्य फ़ॉर्म भरता है, और इसे दर्ज करना बेहतर है बजाय इसके कि इससे मुँह मोड़ा जाए।"
        ]
      },
      {
        heading: "साइन इन करना",
        body: [
          "छह डेमो खाते हैं। हर उपयोगकर्ता नाम और पासवर्ड साइन-इन पेज पर एक-क्लिक बटन के साथ लिखा है, क्योंकि यहाँ बचाने को कुछ है ही नहीं — किसी खाते में असली डेटा नहीं है।",
          "कुछ भी बंद नहीं है। बिना साइन इन किए भी आप किसी भी आवेदन को आईडी से ट्रैक कर सकते हैं।"
        ]
      },
      {
        heading: "संपर्क और प्रतिक्रिया",
        body: [
          "यह एक प्रोटोटाइप है। इसके पीछे कोई हेल्पलाइन, कोई इनबॉक्स और कोई कर्मचारी नहीं है, और ऐसा कुछ प्रकाशित करना बेईमानी होगी।",
          "असली सेवा के लिए जिम्मेदार निकाय है विकलांगजन सशक्तिकरण विभाग, सामाजिक न्याय और अधिकारिता मंत्रालय। इस प्रोटोटाइप का उनसे कोई संबंध नहीं है और यह कोई संदेश आगे नहीं पहुँचा सकता।"
        ]
      }
    ]
  },
  accessibility: {
    title: "सुगम्यता विवरण",
    lede: "यह सेवा विकलांग व्यक्तियों के लिए है। यहाँ सुगम्यता ही उत्पाद है, कोई जाँच-सूची नहीं — इसलिए नीचे साफ़ लिखा है कि क्या किया गया है और क्या नहीं।",
    sections: [
      {
        heading: "अनुरूपता",
        body: [
          "यह प्रोटोटाइप WCAG 2.2 स्तर AA का लक्ष्य रखता है। भारतीय सरकारी वेबसाइटों के लिए GIGW 3.0, WCAG 2.1 का स्तर AA अनिवार्य करता है — यानी यह लक्ष्य उस न्यूनतम से एक संस्करण आगे है।",
          "उपयोग में आने वाले हर रंग-युग्म को अनुमान से नहीं, माप कर जाँचा गया है। पूरे इंटरफ़ेस में सबसे कम कंट्रास्ट अनुपात 5.67:1 है, जबकि सामान्य पाठ के लिए 4.5:1 आवश्यक है। पूरी तालिका स्रोत कोड में STYLE.md में प्रकाशित है।"
        ]
      },
      {
        heading: "क्या जाँचा गया है, और कैसे",
        body: [
          "स्वचालित जाँच: हर बिल्ड पर axe-core हर स्क्रीन को 360 पिक्सल मोबाइल और डेस्कटॉप दोनों आकारों में जाँचता है। मानक है — कोई गंभीर या अति-गंभीर उल्लंघन नहीं, और यह अभी पूरा होता है।",
          "कीबोर्ड: पूरी मुख्य यात्रा — केस ढूँढ़ना, वापसी का कारण पढ़ना, सुधारना, दोबारा भेजना — एक स्वचालित जाँच में केवल कीबोर्ड से चलाई जाती है, स्किप लिंक से शुरू करके।",
          "ज़ूम: हर स्क्रीन 640 CSS पिक्सल पर जाँची जाती है, जो 1280 पिक्सल विंडो में 200% ज़ूम के बराबर है। कहीं भी क्षैतिज स्क्रॉल नहीं आता।",
          "स्पर्श क्षेत्र: हर स्क्रीन का हर नियंत्रण कम से कम 44 × 44 पिक्सल है, भाषा बदलने वाले बटन सहित।"
        ]
      },
      {
        heading: "यह कैसे बना है",
        body: [
          "पूरे पेज में अर्थपूर्ण HTML: असली नेविगेशन लैंडमार्क, हर स्क्रीन पर एक मुख्य शीर्षक, समयरेखा के लिए क्रमबद्ध सूची, और लेबल तथा त्रुटियों से प्रोग्रामेटिक रूप से जुड़े फ़ॉर्म फ़ील्ड।",
          "कोई भी जानकारी केवल रंग से नहीं बताई जाती। समयरेखा के हर चरण पर रंग के साथ-साथ एक चिह्न और लिखा हुआ लेबल भी होता है।",
          "हर नियंत्रण पर दिखने वाला फ़ोकस रिंग, जिसे कभी हटाया नहीं जाता। रिंग गहरे किनारे पर पीली है, क्योंकि सफ़ेद पृष्ठभूमि पर अकेला पीला आवश्यक कंट्रास्ट पूरा नहीं करता।",
          "स्थिति में बदलाव स्क्रीन रीडर उपयोगकर्ताओं के लिए लाइव क्षेत्र से घोषित होते हैं।",
          "गति न्यूनतम है, और prefers-reduced-motion सेटिंग का पालन होता है।",
          "कोई वेब फ़ॉन्ट नहीं और कोई बाहरी संसाधन नहीं, ताकि यह धीमे कनेक्शन पर साधारण फ़ोन में भी खुले।"
        ]
      },
      {
        heading: "स्क्रीन रीडर से उपयोग",
        body: [
          "यह साइट मानक HTML से बनी है और बिना किसी विशेष सॉफ़्टवेयर के काम करती है। इसे उस सुगम्यता संरचना पर जाँचा गया है जिसे स्क्रीन रीडर पढ़ते हैं, किसी एक व्यावसायिक रीडर पर नहीं।",
          "मुफ़्त स्क्रीन रीडर में शामिल हैं: विंडोज़ पर NVDA, लिनक्स पर Orca, तथा macOS, iOS और iPadOS में अंतर्निहित VoiceOver, और एंड्रॉइड पर TalkBack।"
        ]
      },
      {
        heading: "ज्ञात सीमाएँ",
        body: [
          "अधिकारी कंसोल और निगरानी डैशबोर्ड केवल अंग्रेज़ी में हैं। पूरी नागरिक यात्रा अंग्रेज़ी और हिंदी दोनों में उपलब्ध है।",
          "इस प्रोटोटाइप को स्वचालित उपकरणों और कीबोर्ड से जाँचा गया है, पर अभी उन लोगों के साथ नहीं जाँचा गया जो रोज़ सहायक तकनीक इस्तेमाल करते हैं। यही इस विवरण की सबसे बड़ी कमी है, और कोई स्वचालित अंक इसकी जगह नहीं ले सकता।",
          "अंग्रेज़ी और हिंदी के अलावा अन्य भाषाएँ अभी नहीं हैं, हालाँकि पाठ इस तरह संरचित है कि उन्हें जोड़ने में कोड बदलना नहीं पड़ेगा।"
        ]
      },
      {
        heading: "समस्या की सूचना देना",
        body: [
          "यह बिना किसी सहायता चैनल वाला हैकाथॉन प्रोटोटाइप है। अगर समीक्षा करते समय आपको कोई बाधा मिले, तो ईमानदार बात यही है कि उसे उसी व्यक्ति तक पहुँचाया जाए जिसने यह आपको दिखाया — किसी ऐसे हेल्पडेस्क तक नहीं जो मौजूद ही नहीं है।"
        ]
      }
    ]
  },
  policies: {
    title: "वेबसाइट नीतियाँ",
    lede: "शर्तें, निजता, कॉपीराइट और लिंकिंग — उसी ढाँचे में प्रकाशित जो GIGW भारतीय सरकारी वेबसाइट से अपेक्षित करता है, और उसी के अनुसार लिखी गई जो यह वास्तव में है।",
    sections: [
      {
        heading: "नियम और शर्तें",
        body: [
          NOT_OFFICIAL_HI,
          "यहाँ दिखाई गई कोई भी चीज़ न कोई निर्णय है, न प्रमाणपत्र, न कोई हक़, न किसी प्रकार का रिकॉर्ड। इस साइट पर दिखी कोई भी स्थिति किसी असली आवेदन से संबंधित नहीं है। किसी भी काम के लिए इस पर भरोसा न करें।",
          "यह प्रोटोटाइप swavlambancard.gov.in या किसी अन्य जीवित सरकारी सिस्टम से संपर्क नहीं करता, न उसे स्कैन या जाँचता है, और इसमें ऐसा कोई कोड है ही नहीं।"
        ]
      },
      {
        heading: "निजता",
        body: [
          "इस प्रोटोटाइप का कोई सर्वर, कोई डेटाबेस और कोई एनालिटिक्स नहीं है। आप जो लिखते हैं वह कहीं नहीं भेजा जाता, क्योंकि भेजने की जगह ही नहीं है।",
          "दो चीज़ें आपके अपने ब्राउज़र में रहती हैं और वहाँ से बाहर नहीं जातीं: आपकी भाषा का चुनाव, और अधूरा भरा हुआ आवेदन फ़ॉर्म, ताकि कनेक्शन टूटने पर मेहनत बेकार न जाए। ब्राउज़र डेटा हटाने पर दोनों मिट जाते हैं।",
          "आवेदन फ़ॉर्म मोबाइल नंबर इसलिए माँगता है ताकि फ़ॉर्म वास्तविक लगे। जमा करते समय उसे जानबूझकर हटाकर एक नकली प्लेसहोल्डर रख दिया जाता है, क्योंकि इस प्रोटोटाइप में उसकी कोई ज़रूरत नहीं।",
          "इस परियोजना में कहीं भी असली निजी डेटा, स्वास्थ्य डेटा या आधार जैसी कोई संख्या नहीं है। नमूना डेटा के हर फ़ोन नंबर में शुरुआती शून्य हैं, जिससे वह किसी असली भारतीय मोबाइल नंबर जैसा हो ही नहीं सकता।"
        ]
      },
      {
        heading: "कॉपीराइट",
        body: [
          "इस प्रोटोटाइप का डिज़ाइन, कोड और लिखित सामग्री इसके लेखकों की है और हैकाथॉन प्रविष्टि के रूप में समीक्षा हेतु प्रस्तुत है।",
          "असली UDID व्यवस्था के बारे में तथ्य, आँकड़े और उद्धरण हमारे नहीं हैं। वे अपने स्रोतों के हैं — संसदीय उत्तर, फ़्री प्रेस जर्नल, दप्रिंट, डेक्कन हेराल्ड, न्यूज़ऑनएयर और आधिकारिक ऐप स्टोर लिस्टिंग — और हर एक का श्रेय उसी स्क्रीन पर तथा स्रोत कोड में दिया गया है।"
        ]
      },
      {
        heading: "हाइपरलिंकिंग",
        body: [
          "आप इस प्रोटोटाइप के किसी भी पेज से सीधे लिंक कर सकते हैं। इसके पते स्थिर और साझा करने योग्य हैं।",
          "यह प्रोटोटाइप केवल उन्हीं स्रोतों से बाहर लिंक करता है जिनसे उसके तथ्य आए हैं। वे साइटें हमारे नियंत्रण में नहीं हैं, और किसी से लिंक करना उसका समर्थन नहीं है।"
        ]
      },
      {
        heading: "सामग्री का स्वामित्व और समीक्षा",
        body: [
          "सामग्री स्वामी: इस हैकाथॉन प्रविष्टि के लेखक। यहाँ कोई वेब सूचना प्रबंधक नहीं है, क्योंकि इसके पीछे कोई संस्था ही नहीं है।",
          "नमूना डेटा हर बार पेज खुलने पर एक निश्चित बीज से दोबारा बनता है, इसलिए वह न पुराना पड़ता है न भटकता है। डेमो घड़ी 23 अगस्त 2026 पर स्थिर है ताकि दिखाए गए आँकड़े हमेशा लिखित विवरण से मेल खाएँ।"
        ]
      }
    ]
  }
};

export const staticPages: Record<Locale, Pages> = { en, hi };

export type { Pages };
