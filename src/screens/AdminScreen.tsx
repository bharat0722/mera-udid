import { useMemo } from "react";
import { daysBetween, formatDate, DEMO_NOW } from "../core/clock";
import { enteredStageAt } from "../core/projections";
import { reconcile } from "../core/reconciliation";
import { ALL_STAGE_KEYS, STAGE_DEFINITIONS } from "../core/stages";
import { WAIT_TIMES } from "../data/evidence";
import { DISTRICTS } from "../data/generator";
import { getPlantedDefects } from "../bootstrap";
import { useAllCaseViews, useCaseStore, useEscalatedIds } from "../lib/useCases";
import { Link } from "../lib/router";
import { TableScroll } from "../ui/TableScroll";
import { AlertIcon } from "../ui/Icons";
import { useI18n } from "../i18n/I18nContext";

/**
 * Oversight dashboard.
 *
 * District-level numbers, and the reconciliation panel.
 *
 * The panel reads the event log directly through the reconciliation engine. It does
 * not infer a happy state from a projection: contradictory and unplaceable histories
 * are named, so the control total cannot look balanced by silently dropping a case.
 *
 */

function reportDetail(problem: string, fallback: string, locale: "en" | "hi"): string {
  if (locale === "en") return fallback;
  const Hindi: Record<string, string> = {
    NO_STAGE_EVENTS: "इस आवेदन के लिए कोई चरण बदलने वाली घटना दर्ज नहीं है।",
    UNKNOWN_STAGE: "नवीनतम चरण-घटना ऐसे चरण का नाम देती है जिसे यह प्रणाली नहीं मानती।",
    CONTRADICTORY_HISTORY: "नवीनतम चरण-घटनाएँ इस आवेदन को एक से अधिक चरणों में रखती हैं।",
    MISSING_REASON_CODE: "वापसी या अस्वीकृति के लिए मान्य कारण कोड दर्ज नहीं है।",
    UNREACHABLE_TRANSITION: "यह चरण परिवर्तन तय चरण-क्रम में मान्य नहीं है।",
    EVENT_WITHOUT_APPLICATION: "यह घटना ऐसे आवेदन का संदर्भ देती है जो रजिस्टर में नहीं है।",
    ARITHMETIC_MISMATCH: "प्राप्त और दर्ज आवेदनों का योग मेल नहीं खाता।"
  };
  return Hindi[problem] ?? fallback;
}

function ReconciliationPanel() {
  const store = useCaseStore();
  const { locale } = useI18n();
  const report = reconcile(store.applications, store.events, { asOf: DEMO_NOW });
  const hi = locale === "hi";

  return (
    <section className="card stack-5 reconciliation-panel" aria-labelledby="reconciliation-title">
      <h2 className="card__title" id="reconciliation-title">
        {hi ? "मिलान रिपोर्ट" : "Reconciliation report"}
      </h2>
      <div className={`callout ${report.isBalanced ? "callout--success" : "callout--danger"}`}>
        <p className="callout__title">
          <AlertIcon size={18} />
          {report.isBalanced
            ? hi ? "हर प्राप्त आवेदन का हिसाब दर्ज है।" : "Every received application is accounted for."
            : hi
              ? `${report.gap} आवेदन किसी मॉडल किए गए चरण में नहीं हैं।`
              : `${report.gap} application${report.gap === 1 ? " is" : "s are"} not in a modelled stage.`}
        </p>
        <p className="small">
          {hi
            ? "नीचे की सूची नियंत्रण-योग है: हर आवेदन या तो किसी चरण में गिना गया है या अपवाद के रूप में दर्ज है। घटना-इतिहास में विरोध होने पर रिपोर्ट कोई चरण नहीं चुनती।"
            : "The list below is the control total: an application is either counted in one stage or named as an exception. The report refuses to choose when the event history is contradictory."}
        </p>
      </div>
      <div className="grid-3">
        <div className="stat">
          <span className="stat__value">{report.totalReceived}</span>
          <span className="stat__label">{hi ? "प्राप्त आवेदन" : "Applications received"}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{report.totalAccounted}</span>
          <span className="stat__label">{hi ? "हिसाब में शामिल" : "Accounted for"}</span>
        </div>
        <div className={`stat ${report.isBalanced ? "stat--good" : "stat--danger"}`}>
          <span className="stat__value">{report.gap}</span>
          <span className="stat__label">{hi ? "किसी भी चरण में नहीं" : "In no column at all"}</span>
        </div>
      </div>

      {report.orphans.length > 0 && (
        <TableScroll label={hi ? "बिना चरण वाले आवेदन" : "Orphaned applications"}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{hi ? "आवेदन" : "Application"}</th>
                <th scope="col">{hi ? "समस्या" : "Problem"}</th>
                <th scope="col">{hi ? "विवरण" : "Detail"}</th>
              </tr>
            </thead>
            <tbody>
              {report.orphans.map((orphan) => (
                <tr key={orphan.applicationId}>
                  <td className="numeric">{orphan.applicationId}</td>
                  <td>{hi ? reportDetail(orphan.detectedProblem, orphan.detectedProblem, locale) : orphan.detectedProblem}</td>
                  <td>{reportDetail(orphan.detectedProblem, orphan.detail, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}

      {report.anomalies.length > 0 && (
        <TableScroll label={hi ? "दर्ज घटना-लॉग विसंगतियाँ" : "Recorded event-log anomalies"}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{hi ? "आवेदन" : "Application"}</th>
                <th scope="col">{hi ? "दर्ज विसंगति" : "Logged anomaly"}</th>
                <th scope="col">{hi ? "विवरण" : "Detail"}</th>
              </tr>
            </thead>
            <tbody>
              {report.anomalies.map((anomaly, index) => (
                <tr key={`${anomaly.applicationId}-${anomaly.type}-${index}`}>
                  <td className="numeric">{anomaly.applicationId}</td>
                  <td>{hi ? reportDetail(anomaly.type, anomaly.type, locale) : anomaly.type}</td>
                  <td>{reportDetail(anomaly.type, anomaly.detail, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}

      <p className="small muted">{hi ? "तैयार किया गया " : "Generated "}{formatDate(report.generatedAt, locale)}.</p>
    </section>
  );
}

export function AdminScreen() {
  const { locale } = useI18n();
  const hi = locale === "hi";
  const store = useCaseStore();
  const manifest = getPlantedDefects();
  const views = useAllCaseViews();
  const escalated = useEscalatedIds();

  const countsByStage = useMemo(() => {
    const counts = Object.fromEntries(ALL_STAGE_KEYS.map((key) => [key, 0])) as Record<
      string,
      number
    >;
    for (const view of views) counts[view.currentStage] += 1;
    return counts;
  }, [views]);

  const medianDaysToCard = useMemo(() => {
    const durations = views
      .filter((view) => view.currentStage === "CARD_GENERATED")
      .map((view) => {
        const issued = enteredStageAt(view.events, "CARD_GENERATED");
        return issued ? daysBetween(view.application.createdAt, issued) : null;
      })
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b);
    if (durations.length === 0) return 0;
    return durations[Math.floor(durations.length / 2)];
  }, [views]);

  const breached = views.filter((view) => view.isBreached);
  const registerSize = store.applications.length;
  const placeable = views.length;
  const unplaceable = registerSize - placeable;

  const byDistrict = DISTRICTS.map((district) => {
    const inDistrict = views.filter(
      (view) => view.application.applicant.district === district.name
    );
    const done = inDistrict.filter((view) => view.currentStage === "CARD_GENERATED");
    return {
      name: district.name,
      open: inDistrict.filter((view) => !view.stageDefinition.isTerminal).length,
      breached: inDistrict.filter((view) => view.isBreached).length,
      cards: done.length,
      total: inDistrict.length
    };
  });

  return (
    <div className="container section--tight stack-6 oversight">
      <div className="oversight__head stack">
        <p className="eyebrow">{hi ? "लोक-सेवा संचालन" : "Public-service operations"}</p>
        <h1>{hi ? "निगरानी" : "Oversight"}</h1>
        <p className="lede">
          {hi
            ? "नागरिक और अधिकारी स्क्रीन जिस केस-रजिस्टर को पढ़ती हैं, उसी के जिला-स्तरीय आँकड़े। कतार कितनी चल रही है, कितने मामले प्रस्तावित लक्ष्य से आगे हैं और रजिस्टर का योग अभी भी सही है या नहीं।"
            : "District-level numbers from the same case store the citizen and officer screens read. Sunlight on the queue: how long a card takes here, how many are past the proposed target, and whether the register still adds up."}
        </p>
      </div>

      <ReconciliationPanel />

      <div className="grid-3 oversight__metrics">
        <div className="stat">
          <span className="stat__value">{registerSize}</span>
          <span className="stat__label">{hi ? "रजिस्टर में आवेदन" : "Applications in the register"}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{medianDaysToCard}</span>
          <span className="stat__label">
            {hi ? "पूरा हुए मामलों में आवेदन से कार्ड तक औसत दिन" : "Median days from applying to card, for cases that finished"}
          </span>
        </div>
        <div className="stat stat--danger">
          <span className="stat__value">{breached.length}</span>
          <span className="stat__label">{hi ? "प्रस्तावित लक्ष्य से आगे के मामले" : "Cases past the proposed target"}</span>
        </div>
        <div className="stat stat--danger">
          <span className="stat__value">{escalated.size}</span>
          <span className="stat__label">
            {hi ? "आवेदकों द्वारा उच्च अधिकारी तक पहुँचाई देरी" : "Delays raised by applicants to a higher authority"}
          </span>
        </div>
      </div>

      {/* The honest limitation of a dashboard built on projections alone. */}
      <div className="callout callout--attention stack">
        <p className="callout__title">
          <AlertIcon size={18} />
          {hi ? <>यह डैशबोर्ड {placeable} आवेदन गिन सकता है। रजिस्टर में {registerSize} आवेदन हैं।</> : <>This dashboard can count {placeable} applications. The register holds {registerSize}.</>}
        </p>
        <p className="small">
          {hi
            ? `${unplaceable} आवेदन किसी चरण में रखे नहीं जा सकते, इसलिए ऊपर का हर चार्ट उन्हें चुपचाप छोड़ देता है। यही असली समस्या का रूप है — संसदीय उत्तर में 10,12,616 आवेदन किसी भी कॉलम में नहीं थे, फिर भी साथ का डैशबोर्ड ठीक दिखता था। जो दिखे उसे ही कुल मान लेना विफलता है। नीचे का मिलान इंजन इस चुप्पी को नाम वाली सूची में बदलता है।`
            : `${unplaceable} application${unplaceable === 1 ? "" : "s"} cannot be placed in any stage, so every chart above silently leaves ${unplaceable === 1 ? "it" : "them"} out. That is the same shape as the real defect — 10,12,616 applications in no column of a parliamentary answer, with a dashboard beside them that looked fine. Counting what you can see and calling it the total is exactly the failure. The reconciliation engine below is what turns that silence into a named list.`}
        </p>
      </div>

      <section className="card card--flush oversight__register" aria-labelledby="manifest-title">
        <div className="card__header">
          <h2 className="card__title" id="manifest-title">
            {hi ? "दिए गए डेटासेट में क्या है" : "What the seeded dataset contains"}
          </h2>
          <span className="small muted">{hi ? "जनरेटर के मैनिफेस्ट से, मिलान-रन से नहीं" : "From the generator's manifest, not a reconciliation run"}</span>
        </div>
        <TableScroll label={hi ? "दिए गए डेटासेट में जानबूझकर रखी गई समस्याएँ" : "Planted defects in the seeded dataset"}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{hi ? "आवेदन" : "Application"}</th>
                <th scope="col">{hi ? "दर्ज की गई समस्या" : "Planted defect"}</th>
                <th scope="col">{hi ? "विवरण" : "Description"}</th>
              </tr>
            </thead>
            <tbody>
              {manifest.map((defect) => (
                <tr key={`${defect.applicationId}-${defect.kind}`}>
                  <td className="numeric">
                    <Link to={`/track/${defect.applicationId}`}>{defect.applicationId}</Link>
                  </td>
                  <td>{hi ? reportDetail(defect.kind, defect.kind, locale) : defect.kind}</td>
                  <td>{reportDetail(defect.kind, defect.description, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        <div className="card__body">
          <p className="small muted">
            {hi
              ? "ये समस्याएँ जानबूझकर डेटासेट में लिखी गई हैं, जैसे कोई पुराना आयात या सीधे डेटाबेस में बदलाव चरण-प्रणाली को पार कर दे। मिलान इंजन को इन्हीं मामलों को पकड़ना है। यह सूची जनरेटर का अपना विवरण है, रिपोर्ट नहीं।"
              : "These defects are written into the dataset on purpose, bypassing the state machine the way a legacy import or a direct database edit would. They are the cases the reserved engine has to catch. Listing them here is a build aid for the handoff — it is the generator describing itself, not a report."}
          </p>
        </div>
      </section>

      <section className="card card--flush oversight__register" aria-labelledby="stage-title">
        <div className="card__header">
          <h2 className="card__title" id="stage-title">
            {hi ? "चरण के अनुसार मामले" : "Cases by stage"}
          </h2>
        </div>
        <TableScroll label={hi ? "चरण के अनुसार मामले" : "Cases by stage"}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{hi ? "चरण" : "Stage"}</th>
                <th scope="col">{hi ? "जिम्मेदार" : "Owner"}</th>
                <th scope="col">{hi ? "प्रस्तावित लक्ष्य" : "Proposed target"}</th>
                <th scope="col">{hi ? "मामले" : "Cases"}</th>
              </tr>
            </thead>
            <tbody>
              {ALL_STAGE_KEYS.map((key) => (
                <tr key={key}>
                  <td>{hi ? STAGE_DEFINITIONS[key].labelHindi : STAGE_DEFINITIONS[key].label}</td>
                  <td>{hi ? STAGE_DEFINITIONS[key].ownerLabelHindi : STAGE_DEFINITIONS[key].ownerLabel}</td>
                  <td className="numeric">
                    {STAGE_DEFINITIONS[key].isTerminal ? "—" : hi ? `${STAGE_DEFINITIONS[key].slaDays} दिन` : `${STAGE_DEFINITIONS[key].slaDays} days`}
                  </td>
                  <td className="numeric">
                    <strong>{countsByStage[key]}</strong>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}>
                  <strong>{hi ? "किसी चरण में रखे गए कुल आवेदन" : "Total placed in a stage"}</strong>
                </td>
                <td className="numeric">
                  <strong>{placeable}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section className="card card--flush oversight__register" aria-labelledby="district-title">
        <div className="card__header">
          <h2 className="card__title" id="district-title">
            {hi ? "जिले के अनुसार" : "By district"}
          </h2>
          <span className="small muted">
            {hi ? "मध्य प्रदेश में दर्ज औसत प्रतीक्षा: " : "Reported average wait in Madhya Pradesh: "}{WAIT_TIMES.madhyaPradeshAverageDays}{" "}{hi ? "दिन" : "days"} ({WAIT_TIMES.source})
          </span>
        </div>
        <TableScroll label={hi ? "जिले के अनुसार मामले" : "Cases by district"}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{hi ? "जिला" : "District"}</th>
                <th scope="col">{hi ? "मामले" : "Cases"}</th>
                <th scope="col">{hi ? "खुले" : "Open"}</th>
                <th scope="col">{hi ? "लक्ष्य से आगे" : "Past target"}</th>
                <th scope="col">{hi ? "बने कार्ड" : "Cards generated"}</th>
              </tr>
            </thead>
            <tbody>
              {byDistrict.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td className="numeric">{row.total}</td>
                  <td className="numeric">{row.open}</td>
                  <td className="numeric">
                    <strong>{row.breached}</strong>
                  </td>
                  <td className="numeric">{row.cards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </section>
    </div>
  );
}
