import { PRIVACY } from '../content/privacy'
import { SITE } from '../content/portfolio'
import { Footer } from './Footer'

export function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <header className="legal-bar">
        <a className="legal-bar__brand" href={import.meta.env.BASE_URL}>{SITE.brand}</a>
        <a className="legal-bar__back" href={import.meta.env.BASE_URL}>← Voltar ao início</a>
      </header>
      <main id="conteudo" className="legal">
        <h1 className="legal__title">{PRIVACY.title}</h1>
        <p className="legal__updated">Última atualização: {PRIVACY.updated}</p>
        <p className="legal__intro">{PRIVACY.intro}</p>
        {PRIVACY.sections.map((s) => (
          <section key={s.heading} className="legal__section">
            <h2>{s.heading}</h2>
            {s.body.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
        {PRIVACY.whatsapp && (
          <p className="legal__contact">
            <a href={PRIVACY.whatsapp} target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a>
          </p>
        )}
      </main>
      <Footer />
    </>
  )
}
