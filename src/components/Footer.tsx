import { CONTACT_CONFIG, SITE } from '../content/portfolio'

export const PRIVACY_HREF = `${import.meta.env.BASE_URL}privacidade.html`

export function Footer() {
  const links = [
    { label: 'LinkedIn', href: CONTACT_CONFIG.linkedin },
    { label: 'GitHub', href: CONTACT_CONFIG.github },
    { label: 'Instagram', href: CONTACT_CONFIG.instagram },
    { label: 'Facebook', href: CONTACT_CONFIG.facebook },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__id">
          <p className="footer__brand">{SITE.brand}</p>
          <p className="footer__desc">{SITE.description}</p>
        </div>
        <nav aria-label="Redes sociais">
          <ul className="footer__links">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">© {new Date().getFullYear()} {SITE.name}</p>
        <a className="footer__legal" href={PRIVACY_HREF}>Política de privacidade</a>
      </div>
    </footer>
  )
}
