import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { ArrowRightIcon, DocumentIcon, HospitalIcon, OfficeIcon } from "../ui/Icons";

const serviceStory = new URL("../assets/civic-service-hero.webp", import.meta.url).href;
const assistanceStory = new URL("../assets/assisted-service-desk.webp", import.meta.url).href;

/**
 * The public-information repository.
 *
 * This deliberately distinguishes useful service material from an invented press
 * office. It provides durable guides, clearly labelled prototype updates and visual
 * stories that explain a task. No fabricated government notice, official film or
 * contact detail is presented as real.
 */
export function ResourcesScreen() {
  const { locale, t } = useI18n();
  const isHindi = locale === "hi";
  const guides = [
    {
      to: "/apply",
      icon: <DocumentIcon size={24} />,
      title: isHindi ? "आवेदन और दस्तावेज़" : "Application and documents",
      body: isHindi
        ? "आवेदन शुरू करने से पहले चरण, दस्तावेज़ और सहायता विकल्प समझें।"
        : "Understand the steps, documents and support options before you apply."
    },
    {
      to: "/board",
      icon: <HospitalIcon size={24} />,
      title: isHindi ? "मेडिकल बोर्ड की तैयारी" : "Preparing for the medical board",
      body: isHindi
        ? "बैठक की तारीख, कतार और आपके जिले की प्रकाशित क्षमता देखें।"
        : "See the sitting date, queue and published capacity for your district."
    },
    {
      to: "/help",
      icon: <OfficeIcon size={24} />,
      title: isHindi ? "सहायता और अगला कदम" : "Help and the right next step",
      body: isHindi
        ? "अगर आवेदन लौटाया गया है, देरी हुई है, या कोई आपकी मदद कर रहा है, तो यहाँ से शुरू करें।"
        : "Start here if a document was returned, your case is delayed or someone is helping you apply."
    }
  ];

  return (
    <>
      <div className="page-head">
        <div className="container page-head__inner">
          <div>
            <p className="eyebrow">{t.nav.citizenServices}</p>
            <h1>{t.nav.resources}</h1>
            <p className="lede">
              {isHindi
                ? "UDID की प्रक्रिया, सहायता और जवाबदेही को समझने के लिए सार्वजनिक जानकारी।"
                : "Public information for understanding the UDID process, getting assistance and holding the service to account."}
            </p>
          </div>
        </div>
      </div>

      <section className="section--tight resource-section">
        <div className="container stack-5">
          <div className="stack">
            <h2>{isHindi ? "नागरिक मार्गदर्शिकाएँ" : "Citizen guides"}</h2>
            <p>
              {isHindi
                ? "हर मार्गदर्शिका सीधे उस सेवा पर ले जाती है जहाँ आप अगला काम कर सकते हैं।"
                : "Every guide leads directly to the service where you can take the next action."}
            </p>
          </div>
          <ul className="resource-grid">
            {guides.map((guide) => (
              <li key={guide.to}>
                <Link to={guide.to} className="resource-card">
                  <span className="resource-card__icon" aria-hidden="true">{guide.icon}</span>
                  <span>
                    <strong>{guide.title}</strong>
                    <span>{guide.body}</span>
                  </span>
                  <ArrowRightIcon size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section media-library">
        <div className="container stack-5">
          <div className="stack">
            <p className="eyebrow">{isHindi ? "दृश्य मार्गदर्शिकाएँ" : "Visual guides"}</p>
            <h2>{isHindi ? "सेवा कैसे काम करती है" : "How the service works"}</h2>
            <p>
              {isHindi
                ? "ये प्रोटोटाइप की दृश्य कहानियाँ हैं, सरकारी समाचार या वास्तविक व्यक्तियों की तस्वीरें नहीं।"
                : "These are prototype visual stories, not government news or photographs of real applicants."}
            </p>
          </div>
          <div className="media-grid">
            <figure className="media-card">
              <img src={serviceStory} alt="" />
              <figcaption>
                <strong>{isHindi ? "जिले से प्रमाणपत्र तक" : "From district desk to certificate"}</strong>
                <span>{isHindi ? "एक आवेदन के हर जिम्मेदार चरण को देखें।" : "See every accountable stage of one application."}</span>
                <Link to="/track">{t.nav.track}<ArrowRightIcon size={16} /></Link>
              </figcaption>
            </figure>
            <figure className="media-card">
              <img src={assistanceStory} alt="" />
              <figcaption>
                <strong>{isHindi ? "सहायता के साथ आवेदन" : "Applying with assistance"}</strong>
                <span>{isHindi ? "सहायक की भूमिका और सहमति को साफ़ रखें।" : "Keep a helper’s role and the applicant’s consent clear."}</span>
                <Link to="/help">{t.nav.getHelp}<ArrowRightIcon size={16} /></Link>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section--tight updates-panel">
        <div className="container grid-2">
          <div className="stack">
            <p className="eyebrow">{isHindi ? "प्रोटोटाइप अपडेट" : "Prototype updates"}</p>
            <h2>{isHindi ? "सेवा में क्या दिखाई देता है" : "What this service makes visible"}</h2>
            <p>
              {isHindi
                ? "यहाँ समाचार बनाने के बजाय हम उस जानकारी को प्राथमिकता देते हैं जो नागरिक को अपना केस समझने और उस पर कार्रवाई करने में मदद करती है।"
                : "Rather than inventing news, this portal prioritises information that helps a citizen understand and act on their case."}
            </p>
          </div>
          <div className="callout callout--info stack">
            <p><strong>{isHindi ? "वर्तमान प्राथमिकताएँ" : "Current priorities"}</strong></p>
            <ul className="bullet-list">
              <li><span aria-hidden="true">›</span>{isHindi ? "जिला बोर्ड की प्रकाशित बैठकें और क्षमता" : "Published district-board sittings and capacity"}</li>
              <li><span aria-hidden="true">›</span>{isHindi ? "लौटाए या अस्वीकार किए गए केस का कारण" : "A reason for every returned or rejected case"}</li>
              <li><span aria-hidden="true">›</span>{isHindi ? "ऐसा नियंत्रण-योग जो किसी आवेदन को चुपचाप गायब न होने दे" : "A control total that does not let an application disappear quietly"}</li>
            </ul>
            <Link to="/about" className="btn btn--secondary btn--small">
              {t.nav.why}<ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
