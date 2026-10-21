import { useState } from 'react'
import { CONTACT, CONTACT_CONFIG, SERVICES, suggestedMessage, type ServiceId } from '../content/portfolio'
import { ArrowLink } from './ArrowButton'
import { ContactForm } from './ContactForm'

// Só links wa.me/<número> aceitam texto pré-preenchido; outros links curtos ficam como estão.
function whatsappHref(url: string, message: string) {
  return /^https:\/\/wa\.me\/\d+$/.test(url) ? `${url}?text=${encodeURIComponent(message)}` : url
}

type Props = { topic: ServiceId | null; onTopic: (t: ServiceId | null) => void }

export function Contact({ topic, onTopic }: Props) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'error'>('idle')
  const message = suggestedMessage(topic)
  const whatsapp = CONTACT_CONFIG.whatsapp ? whatsappHref(CONTACT_CONFIG.whatsapp, message) : null
  const prefilled = whatsapp !== CONTACT_CONFIG.whatsapp
  const topicLabel = SERVICES.find((s) => s.id === topic)?.tab ?? CONTACT.unsure

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied('ok')
    } catch {
      setCopied('error')
    }
  }

  const options: { id: ServiceId | null; label: string }[] = [
    ...SERVICES.map((s) => ({ id: s.id, label: s.tab })),
    { id: null, label: CONTACT.unsure },
  ]

  return (
    <section className="contact" id="contacto" aria-labelledby="contact-title">
      <div className="contact__card reveal">
        <h2 id="contact-title" className="contact__title">{CONTACT.title}</h2>
        <p className="contact__text">{CONTACT.text}</p>

        <div className="contact__grid">
          <div className="contact__panel">
            <fieldset className="topics">
              <legend className="topics__label">{CONTACT.topicsLabel}</legend>
              <div className="topics__list">
                {options.map((o) => (
                  <label key={o.label} className="topic">
                    <input
                      type="radio"
                      name="topic"
                      checked={topic === o.id}
                      onChange={() => {
                        onTopic(o.id)
                        setCopied('idle')
                      }}
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="message">
              <p className="message__label" id="message-label">Mensagem sugerida</p>
              <p className="message__text" aria-labelledby="message-label">{message}</p>
            </div>

            <div className="contact__actions">
              {whatsapp && (
                <ArrowLink variant="glass" href={whatsapp} target="_blank" rel="noopener noreferrer">
                  Falar no WhatsApp
                </ArrowLink>
              )}
              <button type="button" className="ghost-btn" onClick={copy}>
                Copiar mensagem
              </button>
              <a className="ghost-btn" href={CONTACT_CONFIG.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </div>
            <p className="contact__note" role="status">
              {copied === 'ok' ? 'Mensagem copiada. ' : copied === 'error' ? 'Não foi possível copiar; seleciona o texto acima. ' : ''}
              {prefilled ? CONTACT.noteWhatsappPrefilled : CONTACT.noteWhatsappCopy}
            </p>
          </div>

          <ContactForm topic={topicLabel} />
        </div>
      </div>
    </section>
  )
}
