import { useState, type FormEvent } from 'react'
import { CONTACT } from '../content/portfolio'

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>
type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; text?: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Indica o teu nome.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'Indica um email válido.'
  if (f.message.trim().length < 10) e.message = 'Escreve pelo menos 10 caracteres.'
  return e
}

// Envia para /api/contact (Vercel Function). Só mostra sucesso quando o servidor confirma.
export function ContactForm({ topic }: { topic: string }) {
  const [fields, setFields] = useState<Fields>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [website, setWebsite] = useState('')

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const found = validate(fields)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0]
      document.getElementById(`cf-${first}`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, topic, website }),
      })
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; errors?: Errors } | null
      if (res.ok && body?.ok) {
        setStatus({ kind: 'sent', text: `Mensagem enviada. Vou responder para ${fields.email.trim()}.` })
        setFields({ name: '', email: '', message: '' })
        return
      }
      if (body?.errors) setErrors(body.errors)
      setStatus({ kind: 'error', text: body?.error ?? 'Não foi possível enviar agora. Tenta de novo ou fala comigo pelo WhatsApp.' })
    } catch {
      setStatus({ kind: 'error', text: 'Sem ligação ao servidor. Tenta de novo ou fala comigo pelo WhatsApp.' })
    }
  }

  const describedBy = (key: keyof Fields) => (errors[key] ? `cf-${key}-error` : undefined)

  return (
    <form className="contact-form" onSubmit={submit} noValidate aria-labelledby="cf-title">
      <h3 id="cf-title" className="contact-form__title">{CONTACT.formTitle}</h3>
      <p className="contact-form__text">{CONTACT.formText}</p>

      <div className="field">
        <label htmlFor="cf-name">Nome</label>
        <input id="cf-name" name="name" autoComplete="name" maxLength={100} value={fields.name}
          onChange={(e) => set('name')(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} />
        {errors.name && <p className="field__error" id="cf-name-error">{errors.name}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={200} value={fields.email}
          onChange={(e) => set('email')(e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
        {errors.email && <p className="field__error" id="cf-email-error">{errors.email}</p>}
      </div>
      <div className="field">
        <label htmlFor="cf-message">Mensagem</label>
        <textarea id="cf-message" name="message" rows={5} maxLength={5000} value={fields.message}
          placeholder="Conta-me o que fazes e o que precisas."
          onChange={(e) => set('message')(e.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message')} />
        {errors.message && <p className="field__error" id="cf-message-error">{errors.message}</p>}
      </div>
      {/* Armadilha para robôs: invisível para pessoas */}
      <div className="field--trap" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <button type="submit" className="submit-btn" disabled={status.kind === 'sending'}>
        {status.kind === 'sending' ? 'A enviar…' : 'Enviar email'}
      </button>
      <p className={`contact-form__status contact-form__status--${status.kind}`} role="status" aria-live="polite">
        {status.text}
      </p>
    </form>
  )
}
