import { useState, type FormEvent } from "react";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  homeRouteFor,
  signIn,
  verify,
  type DemoAccount
} from "../core/session";
import { useI18n } from "../i18n/I18nContext";
import { navigate } from "../lib/router";
import { AlertIcon, ArrowRightIcon, OfficeIcon, PersonIcon } from "../ui/Icons";

/**
 * Sign in.
 *
 * The rules ask for working test credentials so a judge can log in and use the product
 * as an end user. So the form is real — type a username and the password and it checks
 * them — and every credential is printed on the page beside a one-click button, because
 * making someone type is a tax on their attention, not a security measure.
 *
 * Nothing in the app is behind this. The note at the top says so.
 */
function AccountCard({ account }: { account: DemoAccount }) {
  const { t, locale } = useI18n();

  return (
    <div className="card stack-2">
      <div className="row" style={{ gap: "var(--space-3)", alignItems: "flex-start" }}>
        {account.role === "APPLICANT" ? <PersonIcon size={20} /> : <OfficeIcon size={20} />}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700 }}>{account.displayName}</p>
          <p className="small muted">{locale === "hi" ? account.storyHindi : account.story}</p>
        </div>
      </div>

      <p className="small numeric">
        <strong>{t.auth.usernameLabel}:</strong> {account.username}
        {"  ·  "}
        <strong>{t.auth.passwordLabel}:</strong> {account.password}
      </p>

      <button
        type="button"
        className="btn btn--secondary btn--small"
        onClick={() => {
          signIn(account);
          navigate(homeRouteFor(account));
        }}
      >
        {t.auth.oneClick}
        <ArrowRightIcon size={16} />
      </button>
    </div>
  );
}

export function SignInScreen() {
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = verify(username, password);
    if (!account) {
      setError(t.auth.error);
      return;
    }
    setError(null);
    signIn(account);
    navigate(homeRouteFor(account));
  };

  const citizens = DEMO_ACCOUNTS.filter((account) => account.role === "APPLICANT");
  const staff = DEMO_ACCOUNTS.filter((account) => account.role !== "APPLICANT");

  return (
    <div className="column section--tight stack-6">
      <div className="stack">
        <h1>{t.auth.title}</h1>
        <p className="lede">{t.auth.lede}</p>
      </div>

      <div className="callout callout--info">
        <p className="small">{t.auth.notGated}</p>
      </div>

      <form className="card stack" onSubmit={onSubmit}>
        {error && (
          <div className="callout callout--danger" role="alert">
            <p className="callout__title">
              <AlertIcon size={18} />
              {error}
            </p>
          </div>
        )}

        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label" htmlFor="username">
            {t.auth.usernameLabel}
          </label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setError(null);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label" htmlFor="password">
            {t.auth.passwordLabel}
          </label>
          <span className="field__hint" id="password-hint">
            {t.auth.passwordForAll} <strong className="numeric">{DEMO_PASSWORD}</strong>
          </span>
          {/* type="text", deliberately. There is nothing to hide, and masking a
              password that is printed on the same page would be theatre. */}
          <input
            id="password"
            className="input"
            type="text"
            value={password}
            aria-describedby="password-hint"
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div>
          <button type="submit" className="btn btn--primary">
            {t.auth.submit}
            <ArrowRightIcon size={18} />
          </button>
        </div>
      </form>

      <section className="stack-5" aria-labelledby="accounts-title">
        <h2 id="accounts-title">{t.auth.accountsTitle}</h2>

        <h3>{t.auth.citizenAccounts}</h3>
        <div className="grid-2">
          {citizens.map((account) => (
            <AccountCard key={account.username} account={account} />
          ))}
        </div>

        <h3>{t.auth.staffAccounts}</h3>
        <p className="small muted">{t.nav.staffNote}</p>
        <div className="grid-2">
          {staff.map((account) => (
            <AccountCard key={account.username} account={account} />
          ))}
        </div>
      </section>
    </div>
  );
}
