import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Link, navigate } from "../lib/router";
import { ArrowRightIcon, SearchIcon } from "../ui/Icons";

type SearchEntry = {
  to: string;
  title: string;
  body: string;
  terms: string[];
};

function words(value: string, locale: string): string[] {
  return value
    .toLocaleLowerCase(locale === "hi" ? "hi-IN" : "en-IN")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** A tiny local spelling tolerance for a deliberately local, private search index. */
function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        diagonal + Number(left[leftIndex - 1] !== right[rightIndex - 1])
      );
      diagonal = previous;
    }
  }
  return row[right.length];
}

function score(entry: SearchEntry, query: string, locale: string): number {
  const queryWords = words(query, locale);
  // Search intent labels and synonyms, not incidental words in descriptive prose.
  // Otherwise every page that mentions a "case" competes with the Track service.
  const indexTerms = [entry.title, ...entry.terms];
  const indexWords = indexTerms.flatMap((term) => words(term, locale));
  const normalizedQuery = queryWords.join(" ");
  let total = 0;

  for (const term of entry.terms) {
    const normalizedTerm = words(term, locale).join(" ");
    if (normalizedTerm && (normalizedQuery.includes(normalizedTerm) || normalizedTerm.includes(normalizedQuery))) {
      total += normalizedTerm === normalizedQuery ? 40 : 14;
    }
  }

  for (const queryWord of queryWords) {
    if (indexWords.includes(queryWord)) {
      total += 8;
      continue;
    }
    if (
      queryWord.length >= 4 &&
      indexWords.some((indexWord) =>
        indexWord.length >= 4 &&
        editDistance(queryWord, indexWord) <= (queryWord.length >= 5 ? 2 : 1)
      )
    ) {
      total += 5;
    }
  }
  return total;
}

/**
 * A private, assistive portal search. It recognises the jobs citizens describe
 * ("where is my case?"), their common wording and small spelling slips. It never
 * sends a person's words to a third-party search service.
 */
export function SearchScreen({ query }: { query: string }) {
  const { locale, t } = useI18n();
  const [value, setValue] = useState(query);

  useEffect(() => setValue(query), [query]);

  const entries: SearchEntry[] = [
    {
      to: "/apply", title: t.nav.apply,
      body: locale === "hi" ? "आवेदन शुरू करें, दस्तावेज़ चुनें और सहायता के साथ भरें।" : "Start an application, choose documents and apply with assistance.",
      terms: ["apply", "application", "how to apply", "start application", "new application", "register", "form", "certificate", "documents", "upload documents", "आवेदन", "कैसे आवेदन करें", "फॉर्म", "दस्तावेज़"]
    },
    {
      to: "/track", title: t.nav.track,
      body: locale === "hi" ? "आवेदन आईडी से चरण, जिम्मेदार कार्यालय और अगली तारीख देखें।" : "See your case stage, responsible office and next date using an application ID.",
      terms: ["track", "track case", "track application", "where is my case", "where is my application", "case status", "application status", "my case", "progress", "pending", "application id", "reference number", "file status", "ट्रैक", "मेरा केस कहाँ है", "स्थिति", "आवेदन की स्थिति"]
    },
    {
      to: "/board", title: t.board.navLabel,
      body: locale === "hi" ? "जिला मेडिकल बोर्ड की बैठकें, क्षमता, कतार और तारीख देखें।" : "See district medical-board sittings, capacity, queue and likely date.",
      terms: ["board", "medical board", "medical", "doctor", "appointment", "date", "hospital", "calendar", "schedule", "queue", "board date", "बोर्ड", "मेडिकल", "डॉक्टर", "तारीख", "अस्पताल", "कैलेंडर"]
    },
    {
      to: "/help", title: t.nav.help,
      body: locale === "hi" ? "सहायता, पहुँच और सही अगला कदम पाएं।" : "Find assistance, accessibility information and the right next step.",
      terms: ["help", "need help", "support", "assist", "assistance", "problem", "stuck", "accessibility", "disability help", "contact", "complaint", "सहायता", "मदद", "समस्या", "पहुँच"]
    },
    {
      to: "/about", title: t.nav.knowUdid,
      body: locale === "hi" ? "जानें कि हर UDID आवेदन को ट्रैक होने वाला केस क्यों होना चाहिए।" : "Understand why every UDID application must be a tracked case, not a black box.",
      terms: ["udid", "about", "why", "why udid", "delay", "missing application", "reconciliation", "transparency", "ten lakh", "यूडीआईडी", "क्यों", "देरी", "मिलान"]
    },
    {
      to: "/admin", title: t.nav.reconciliation,
      body: locale === "hi" ? "हर प्राप्त आवेदन का मिलान देखें और उन मामलों को नाम से देखें जो किसी चरण में नहीं हैं।" : "Check every received application against the stage totals and see unplaceable cases by name.",
      terms: ["reconciliation", "reconcile", "reconciliation report", "accounted for", "unaccounted", "gap", "orphan", "orphans", "oversight", "accountability", "missing applications", "मिलान", "जवाबदेही", "अंतर", "लापता आवेदन"]
    }
  ];

  const matches = useMemo(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];
    const scored = entries
      .map((entry) => ({ entry, score: score(entry, cleanQuery, locale) }))
      .filter((result) => result.score > 0);
    const strongest = Math.max(...scored.map((result) => result.score));
    return scored
      // A clear intent should not be diluted by a page that happens to contain one
      // generic word such as "case". Ambiguous one-word searches can still show more.
      .filter((result) => strongest < 16 || result.score >= strongest * 0.5)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title, locale))
      .map((result) => result.entry);
  }, [entries, locale, query]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search/${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="column section--tight stack-6">
      <div className="stack"><p className="eyebrow">{t.nav.citizenServices}</p><h1>{t.search.title}</h1><p className="lede">{t.search.lede}</p></div>
      <form className="portal-search" role="search" onSubmit={submit}>
        <label className="field__label" htmlFor="portal-search-query">{t.search.label}</label>
        <div className="field-row">
          <input id="portal-search-query" className="input" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="off" />
          <button type="submit" className="btn btn--primary"><SearchIcon size={18} />{t.search.button}</button>
        </div>
      </form>
      {query.trim().length === 0 ? <p className="callout callout--info small">{t.search.prompt}</p> : (
        <section className="stack" aria-labelledby="search-results-title" aria-live="polite">
          <h2 id="search-results-title">{t.search.results}</h2>
          {matches.length > 0 ? <ul className="search-results">
            {matches.map((entry) => <li key={entry.to}><Link to={entry.to} className="search-result"><span><strong>{entry.title}</strong><span>{entry.body}</span></span><ArrowRightIcon size={18} /></Link></li>)}
          </ul> : <p className="callout callout--attention">{t.search.noResults}</p>}
        </section>
      )}
    </div>
  );
}
