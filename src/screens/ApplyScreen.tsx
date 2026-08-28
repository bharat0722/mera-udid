import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_NOW, toIso } from "../core/clock";
import { createApplication, getApplications } from "../core/caseStore";
import { DOC_LABELS, requiredDocumentsFor, runPrecheck } from "../core/precheck";
import type { DocType, IdentityMethod } from "../core/types";
import { DISABILITY_TYPES } from "../data/disabilityTypes";
import { DISTRICTS } from "../data/generator";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { AlertIcon, ArrowRightIcon, CheckIcon, CrossIcon } from "../ui/Icons";

const assistedServiceDesk = new URL("../assets/assisted-service-desk.webp", import.meta.url).href;

/**
 * The apply flow.
 *
 * Four steps, one question group per screen, and the draft written to localStorage on
 * every change. That last part is not a nicety: this is a service used disproportionately
 * on cheap phones and patchy connections, and losing a half-finished form to a dropped
 * signal is a good way to make someone give up for another year.
 */

const DRAFT_KEY = "mera-udid.draft";

/** Keep numeric fields honest as they are typed or pasted, before validation is needed. */
function digitsOnly(value: string, maximumLength: number): string {
  return value.replace(/\D/g, "").slice(0, maximumLength);
}

interface Draft {
  step: number;
  name: string;
  age: string;
  gender: "female" | "male" | "other";
  district: string;
  phone: string;
  assisted: boolean;
  assistedName: string;
  assistedRelation: string;
  assistedPhone: string;
  identityMethod: IdentityMethod;
  disabilityType: string;
  documents: DocType[];
}

const emptyDraft: Draft = {
  step: 0,
  name: "",
  age: "",
  gender: "female",
  district: DISTRICTS[0].name,
  phone: "",
  assisted: false,
  assistedName: "",
  assistedRelation: "",
  assistedPhone: "",
  identityMethod: "DOCUMENT_ONLY",
  disabilityType: "",
  documents: []
};

function readDraft(): { draft: Draft; restored: boolean } {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return { draft: emptyDraft, restored: false };
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return { draft: { ...emptyDraft, ...parsed }, restored: true };
  } catch {
    return { draft: emptyDraft, restored: false };
  }
}

function nextApplicationId(): string {
  const existing = getApplications().filter((application) =>
    application.applicationId.startsWith("UDID-NEW-")
  ).length;
  return `UDID-NEW-${String(1001 + existing)}`;
}

type Errors = Partial<Record<keyof Draft, string>>;

export function ApplyScreen() {
  const { t, locale } = useI18n();
  const initial = useMemo(readDraft, []);
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [restored, setRestored] = useState(initial.restored);
  const [errors, setErrors] = useState<Errors>({});
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<DocType, string>>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage refused. The form still works; it just will not survive a reload.
    }
  }, [draft]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [draft.step, submittedId]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const precheck = useMemo(
    () =>
      draft.disabilityType
        ? runPrecheck(draft.disabilityType, draft.documents, draft.identityMethod)
        : null,
    [draft.disabilityType, draft.documents, draft.identityMethod]
  );

  function validateStep(step: number): Errors {
    const found: Errors = {};
    if (step === 0) {
      if (draft.name.trim().length < 2) found.name = t.apply.validation.name;
      const age = Number(draft.age);
      if (!draft.age || !Number.isInteger(age) || age < 0 || age > 120) {
        found.age = t.apply.validation.age;
      }
      if (!draft.district) found.district = t.apply.validation.district;
      if (!/^\d{10}$/.test(draft.phone.replace(/\s/g, ""))) {
        found.phone = t.apply.validation.phone;
      }
      if (draft.assisted && draft.assistedName.trim().length < 2) {
        found.assistedName = t.apply.validation.assistedName;
      }
      if (draft.assisted && draft.assistedRelation.trim().length < 2) {
        found.assistedRelation = t.apply.validation.assistedRelation;
      }
      if (draft.assisted && !/^\d{10}$/.test(draft.assistedPhone.replace(/\s/g, ""))) {
        found.assistedPhone = t.apply.validation.assistedPhone;
      }
    }
    if (step === 1 && !draft.disabilityType) {
      found.disabilityType = t.apply.validation.disability;
    }
    return found;
  }

  const goNext = () => {
    const found = validateStep(draft.step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      window.setTimeout(() => errorRef.current?.focus(), 0);
      return;
    }
    setErrors({});
    update("step", Math.min(3, draft.step + 1));
  };

  const goBack = () => {
    setErrors({});
    update("step", Math.max(0, draft.step - 1));
  };

  const goToCompletedStep = (step: number) => {
    if (step >= draft.step) return;
    setErrors({});
    update("step", step);
  };

  const submit = () => {
    const applicationId = nextApplicationId();
    const timestamp = toIso(DEMO_NOW);
    createApplication(
      {
        applicationId,
        applicant: {
          name: draft.name.trim(),
          age: Number(draft.age),
          gender: draft.gender,
          district: draft.district,
          state: "Madhya Pradesh",
          disabilityType: draft.disabilityType,
          // The number typed above is never stored. This prototype keeps a masked,
          // undialable placeholder instead, because a phone number is personal data
          // and nothing here needs it.
          contactPhone: "+91 00000 00000"
        },
        documents: draft.documents.map((docType) => ({
          docType,
          filename: uploadedFiles[docType] ?? `${docType.toLowerCase()}.pdf`,
          uploadedAt: timestamp,
          status: "PROVIDED" as const
        })),
        createdAt: timestamp,
        identityMethod: draft.identityMethod,
        assistedBy: draft.assisted
          ? {
              name: draft.assistedName.trim(),
              relationship: draft.assistedRelation.trim(),
              contactPhone: `+91 ${draft.assistedPhone.replace(/\s/g, "")}`,
              consentRecordedAt: timestamp
            }
          : null
      },
      timestamp
    );
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to do; the draft simply stays behind.
    }
    setUploadedFiles({});
    setSubmittedId(applicationId);
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignored deliberately.
    }
    setDraft(emptyDraft);
    setUploadedFiles({});
    setRestored(false);
    setErrors({});
  };

  if (submittedId) {
    return (
      <div className="column section--tight stack-5">
        <h1 tabIndex={-1} ref={headingRef}>
          {t.apply.submittedTitle}
        </h1>
        <div className="callout callout--success stack">
          <p className="callout__title">
            <CheckIcon size={18} />
            {t.apply.submittedBody}
          </p>
          <span className="small muted">{t.apply.receiptReference}</span>
          <p className="display numeric" style={{ fontSize: "var(--text-h1)" }}>{submittedId}</p>
        </div>
        <section className="card stack" aria-labelledby="next-steps-title">
          <h2 className="card__title" id="next-steps-title">
            {t.apply.nextStepsTitle}
          </h2>
          <ol className="receipt-steps">
            {t.apply.nextSteps.map((step, index) => (
              <li key={step}>
                <span className="receipt-steps__number" aria-hidden="true">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <p>
          <Link to={`/track/${submittedId}`} className="btn btn--primary">
            {t.apply.trackNow}
            <ArrowRightIcon size={18} />
          </Link>
        </p>
        <div className="callout callout--info">
          <p className="small">{t.apply.sessionNotice}</p>
        </div>
      </div>
    );
  }

  const errorList = Object.entries(errors).filter(([, message]) => Boolean(message));

  const stepStateLabel = (index: number) =>
    index < draft.step
      ? t.common.done
      : index === draft.step
        ? t.common.inProgress
        : t.common.notStarted;

  return (
    <>
      <div className="page-head service-page-head service-page-head--illustrated">
        <div className="container page-head__inner service-page-head__inner">
          <div>
            <p className="eyebrow">{t.nav.citizenServices}</p>
            <h1 tabIndex={-1} ref={headingRef}>
              {t.apply.title}
            </h1>
            <p className="lede">{t.apply.lede}</p>
          </div>
          <figure className="service-page-head__visual" aria-hidden="true">
            <img src={assistedServiceDesk} alt="" />
          </figure>
        </div>
      </div>

      <div className="container section--tight">
        <div className="form-layout">
          {/* Progress gets a column of its own: which step you are on, which are
              done, and what each one asks — not a strip of chips. */}
          <div className="form-layout__aside">
            <p className="form-layout__kicker" aria-hidden="true">
              {t.nav.citizenServices}
            </p>
            <ol
              className="steps"
              aria-label={`${t.common.step} ${draft.step + 1} ${t.common.of} 4`}
            >
              {t.apply.steps.map((label, index) => (
                <li
                  key={label}
                  className={`steps__item ${
                    index === draft.step
                      ? "steps__item--current"
                      : index < draft.step
                        ? "steps__item--done"
                        : ""
                  }`}
                  aria-current={index === draft.step ? "step" : undefined}
                >
                  {index < draft.step ? (
                    <button type="button" className="steps__jump" onClick={() => goToCompletedStep(index)}>
                      <span className="steps__marker" aria-hidden="true"><CheckIcon size={15} /></span>
                      <span className="steps__label">{label}<span className="steps__state">{stepStateLabel(index)}</span></span>
                    </button>
                  ) : <>
                    <span className="steps__marker" aria-hidden="true">{index + 1}</span>
                    <span className="steps__label">{label}<span className="steps__state">{stepStateLabel(index)}</span></span>
                  </>}
                </li>
              ))}
            </ol>

            {restored && draft.step === 0 && (
              <div className="callout callout--info stack-2">
                <p className="small">{t.apply.resumeNotice}</p>
                <button
                  type="button"
                  className="btn btn--quiet btn--small"
                  onClick={clearDraft}
                >
                  {t.apply.clearDraft}
                </button>
              </div>
            )}
            <div className="form-layout__help-panel">
              <img src={assistedServiceDesk} alt="" />
              <p className="small">{t.apply.assistedConsent}</p>
              <Link to="/help" className="btn btn--quiet btn--small">
                {t.nav.getHelp}
                <ArrowRightIcon size={16} />
              </Link>
            </div>
          </div>

          <div className="form-layout__main">

      {errorList.length > 0 && (
        <div
          className="callout callout--danger"
          tabIndex={-1}
          ref={errorRef}
          role="alert"
        >
          <p className="callout__title">
            <AlertIcon size={18} />
            {t.apply.validation.summary.replace("{count}", String(errorList.length))}
          </p>
          <ul className="bullet-list">
            {errorList.map(([field, message]) => (
              <li key={field}>
                <CrossIcon size={16} />
                <a href={`#field-${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {draft.step === 0 && (
        <div className="card stack">
          <h2>{t.apply.detailsTitle}</h2>

          <TextField
            id="name"
            label={t.apply.nameLabel}
            hint={t.apply.nameHint}
            value={draft.name}
            error={errors.name}
            onChange={(value) => update("name", value)}
          />

          <TextField
            id="age"
            label={t.apply.ageLabel}
            value={draft.age}
            error={errors.age}
            inputMode="numeric"
            maxLength={3}
            onChange={(value) => update("age", digitsOnly(value, 3))}
          />

          <fieldset>
            <legend>{t.apply.genderLabel}</legend>
            {(["female", "male", "other"] as const).map((option) => (
              <label
                key={option}
                className={`choice${draft.gender === option ? " choice--selected" : ""}`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={draft.gender === option}
                  onChange={() => update("gender", option)}
                />
                <span className="choice__text">
                  <span className="choice__title">{t.apply.genderOptions[option]}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="field" id="field-district">
            <label className="field__label" htmlFor="district">
              {t.apply.districtLabel}
            </label>
            <select
              id="district"
              className="select"
              value={draft.district}
              onChange={(event) => update("district", event.target.value)}
            >
              {DISTRICTS.map((district) => (
                <option key={district.name} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <TextField
            id="phone"
            label={t.apply.phoneLabel}
            hint={t.apply.phoneHint}
            value={draft.phone}
            error={errors.phone}
            inputMode="tel"
            maxLength={10}
            onChange={(value) => update("phone", digitsOnly(value, 10))}
          />

          <fieldset>
            <legend>{t.apply.assistedTitle}</legend>
            <label className={`choice${!draft.assisted ? " choice--selected" : ""}`}>
              <input
                type="radio"
                name="assisted"
                checked={!draft.assisted}
                onChange={() => update("assisted", false)}
              />
              <span className="choice__text">
                <span className="choice__title">{t.apply.assistedNo}</span>
              </span>
            </label>
            <label className={`choice${draft.assisted ? " choice--selected" : ""}`}>
              <input
                type="radio"
                name="assisted"
                checked={draft.assisted}
                onChange={() => update("assisted", true)}
              />
              <span className="choice__text">
                <span className="choice__title">{t.apply.assistedYes}</span>
                <span className="choice__note">{t.apply.assistedConsent}</span>
              </span>
            </label>
          </fieldset>

          {draft.assisted && (
            <>
              <TextField
                id="assistedName"
                label={t.apply.assistedNameLabel}
                value={draft.assistedName}
                error={errors.assistedName}
                onChange={(value) => update("assistedName", value)}
              />
              <TextField
                id="assistedRelation"
                label={t.apply.assistedRelationLabel}
                value={draft.assistedRelation}
                error={errors.assistedRelation}
                onChange={(value) => update("assistedRelation", value)}
              />
              <TextField
                id="assistedPhone"
                label={t.apply.assistedPhoneLabel}
                hint={t.apply.assistedPhoneHint}
                value={draft.assistedPhone}
                error={errors.assistedPhone}
                inputMode="tel"
                maxLength={10}
                onChange={(value) => update("assistedPhone", digitsOnly(value, 10))}
              />
            </>
          )}

          <fieldset>
            <legend>{t.apply.identityTitle}</legend>
            <p className="field__hint">{t.apply.identityHint}</p>
            {(["DOCUMENT_ONLY", "OFFICER_ATTESTED", "FINGERPRINT"] as const).map(
              (option) => (
                <label
                  key={option}
                  className={`choice${
                    draft.identityMethod === option ? " choice--selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="identity"
                    checked={draft.identityMethod === option}
                    onChange={() => update("identityMethod", option)}
                  />
                  <span className="choice__text">
                    <span className="choice__title">{t.apply.identityOptions[option]}</span>
                  </span>
                </label>
              )
            )}
            {draft.identityMethod === "DOCUMENT_ONLY" && (
              <p className="choice__note identity-choice-note">{t.apply.identityDocumentNote}</p>
            )}
          </fieldset>
        </div>
      )}

      {draft.step === 1 && (
        <div className="card stack">
          <h2>{t.apply.disabilityTitle}</h2>
          <p className="field__hint">{t.apply.disabilityHint}</p>
          <fieldset id="field-disabilityType">
            <legend className="visually-hidden">{t.apply.disabilityTitle}</legend>
            {DISABILITY_TYPES.map((type) => (
              <label
                key={type.key}
                className={`choice${
                  draft.disabilityType === type.key ? " choice--selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="disability"
                  checked={draft.disabilityType === type.key}
                  onChange={() => update("disabilityType", type.key)}
                />
                <span className="choice__text">
                  <span className="choice__title">
                    {locale === "hi" ? type.labelHindi : type.label}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {draft.step === 2 && (
        <div className="stack-5">
          <div className="card stack">
            <h2>{t.apply.documentsTitle}</h2>
            <p className="field__hint">{t.apply.documentsHint}</p>
            <fieldset>
              <legend className="visually-hidden">{t.apply.documentsTitle}</legend>
              {requiredDocumentsFor(draft.disabilityType).map((docType) => {
                const checked = draft.documents.includes(docType);
                return (
                  <div
                    key={docType}
                    className={`choice document-choice${checked ? " choice--selected" : ""}`}
                  >
                    <input
                      id={`document-${docType}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          update("documents", draft.documents.filter((item) => item !== docType));
                          setUploadedFiles((current) => ({ ...current, [docType]: undefined }));
                        } else {
                          update("documents", [...draft.documents, docType]);
                        }
                      }}
                    />
                    <span className="choice__text">
                      <label className="choice__title" htmlFor={`document-${docType}`}>
                        {locale === "hi" ? DOC_LABELS[docType].hi : DOC_LABELS[docType].en}
                      </label>
                      {checked && (
                        <span className="document-upload">
                          <label className="btn btn--secondary btn--small" htmlFor={`document-file-${docType}`}>
                            {t.apply.chooseFile}
                          </label>
                          <input
                            id={`document-file-${docType}`}
                            className="visually-hidden"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              if (file) setUploadedFiles((current) => ({ ...current, [docType]: file.name }));
                            }}
                          />
                          <span className="document-upload__name" aria-live="polite">
                            {uploadedFiles[docType] ? `${t.apply.fileChosen}: ${uploadedFiles[docType]}` : t.apply.noFileChosen}
                          </span>
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </fieldset>
            <p className="small muted">{t.apply.fileSessionNote}</p>
          </div>

          {precheck && (
            <section
              className={`callout ${precheck.ok ? "callout--success" : "callout--attention"}`}
              aria-live="polite"
            >
              <p className="callout__title">
                {precheck.ok ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
                {t.apply.precheckTitle}
              </p>
              <p className="small">{t.apply.precheckIntro}</p>
              <p>
                <strong>{precheck.ok ? t.apply.precheckPass : t.apply.precheckFail}</strong>
              </p>
              <ul className="bullet-list" style={{ marginTop: "var(--space-3)" }}>
                {precheck.items.map((item) => (
                  <li key={item.docType}>
                    {item.present ? <CheckIcon size={16} /> : <CrossIcon size={16} />}
                    <span>
                      <strong>{locale === "hi" ? item.labelHindi : item.label}</strong>
                      <br />
                      <span className="small muted">
                        {t.apply.precheckWhy}: {locale === "hi" ? item.whyHindi : item.why}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {precheck.advisories.map((advisory) => (
                <p key={advisory.text} className="small" style={{ marginTop: "var(--space-3)" }}>
                  {locale === "hi" ? advisory.textHindi : advisory.text}
                </p>
              ))}
              <p className="small muted" style={{ marginTop: "var(--space-3)" }}>
                {t.apply.precheckNote}
              </p>
            </section>
          )}
        </div>
      )}

      {draft.step === 3 && (
        <div className="card stack">
          <h2>{t.apply.reviewTitle}</h2>
          <dl className="meta-list" style={{ padding: 0 }}>
            <div>
              <dt>{t.apply.nameLabel}</dt>
              <dd>{draft.name}</dd>
            </div>
            <div>
              <dt>{t.apply.ageLabel}</dt>
              <dd>{draft.age}</dd>
            </div>
            <div>
              <dt>{t.apply.districtLabel}</dt>
              <dd>{draft.district}</dd>
            </div>
            <div>
              <dt>{t.apply.disabilityTitle}</dt>
              <dd>
                {DISABILITY_TYPES.find((type) => type.key === draft.disabilityType)?.[
                  locale === "hi" ? "labelHindi" : "label"
                ] ?? "—"}
              </dd>
            </div>
            <div>
              <dt>{t.apply.identityTitle}</dt>
              <dd>{t.apply.identityOptions[draft.identityMethod]}</dd>
            </div>
            {draft.assisted && (
              <div>
                <dt>{t.track.assistedBy}</dt>
                <dd>
                  {draft.assistedName} ({draft.assistedRelation})
                  <br />
                  <span className="small muted">{t.apply.assistedPhoneLabel}: {draft.assistedPhone}</span>
                </dd>
              </div>
            )}
            <div>
              <dt>{t.apply.documentsTitle}</dt>
              <dd>{draft.documents.length}</dd>
            </div>
          </dl>

          {precheck && !precheck.ok && (
            <div className="callout callout--attention">
              <p className="callout__title">
                <AlertIcon size={18} />
                {t.apply.precheckFail}
              </p>
              <p className="small">
                {precheck.missing
                  .map((docType) =>
                    locale === "hi" ? DOC_LABELS[docType].hi : DOC_LABELS[docType].en
                  )
                  .join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="row">
        {draft.step > 0 && (
          <button type="button" className="btn btn--quiet" onClick={goBack}>
            {t.common.back}
          </button>
        )}
        {draft.step < 3 ? (
          <button type="button" className="btn btn--primary" onClick={goNext}>
            {t.common.next}
            <ArrowRightIcon size={18} />
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={submit}>
            {t.apply.submit}
            <ArrowRightIcon size={18} />
          </button>
        )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  inputMode?: "numeric" | "tel" | "text";
  maxLength?: number;
  onChange: (value: string) => void;
}

function TextField({ id, label, hint, value, error, inputMode, maxLength, onChange }: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field${error ? " field--invalid" : ""}`} id={`field-${id}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {hint && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={errorId}>
          <AlertIcon size={16} />
          {error}
        </span>
      )}
      <input
        id={id}
        className="input"
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={inputMode === "numeric" || inputMode === "tel" ? "[0-9]*" : undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
