// Vercel Function: recebe o formulário de contacto e envia-o por email através da Resend.
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY      chave da conta Resend (obrigatória)
//   CONTACT_TO_EMAIL    email onde o Ulisses recebe as mensagens (obrigatório)
//   CONTACT_FROM_EMAIL  remetente; por omissão o endereço de testes da Resend

const LIMITS = { name: 100, email: 200, message: 5000, topic: 60 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

const field = (value) => (typeof value === 'string' ? value.trim() : '')
const oneLine = (value) => value.replace(/[\r\n]+/g, ' ')

export function validate(input) {
  const data = {
    name: oneLine(field(input?.name)),
    email: field(input?.email),
    message: field(input?.message),
    topic: oneLine(field(input?.topic)),
    website: field(input?.website),
  }
  const errors = {}
  if (!data.name) errors.name = 'Indica o teu nome.'
  else if (data.name.length > LIMITS.name) errors.name = 'O nome é demasiado longo.'
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.email = 'Indica um email válido.'
  if (data.message.length < 10) errors.message = 'Escreve pelo menos 10 caracteres.'
  else if (data.message.length > LIMITS.message) errors.message = 'A mensagem é demasiado longa.'
  if (data.topic.length > LIMITS.topic) data.topic = data.topic.slice(0, LIMITS.topic)
  return { data, errors }
}

export async function POST(request) {
  let input
  try {
    input = await request.json()
  } catch {
    return json(400, { ok: false, error: 'Pedido inválido.' })
  }

  const { data, errors } = validate(input)
  // Campo escondido preenchido = robô. Responde como se tivesse corrido bem, sem enviar.
  if (data.website) return json(200, { ok: true })
  if (Object.keys(errors).length > 0) return json(422, { ok: false, error: 'Revê os campos assinalados.', errors })

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  if (!apiKey || !to) {
    return json(503, { ok: false, error: 'O envio por email ainda não está ativo. Fala comigo pelo WhatsApp.' })
  }

  const from = process.env.CONTACT_FROM_EMAIL || 'Portfólio Ulisses Dev <onboarding@resend.dev>'
  const text = [
    `Nome: ${data.name}`,
    `Email: ${data.email}`,
    `Assunto: ${data.topic || 'Não indicado'}`,
    '',
    data.message,
  ].join('\n')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `Novo contacto do site: ${data.name}`,
        text,
      }),
    })
    if (!res.ok) {
      console.error('Resend respondeu', res.status, await res.text())
      return json(502, { ok: false, error: 'Não foi possível enviar agora. Tenta de novo ou fala comigo pelo WhatsApp.' })
    }
  } catch (err) {
    console.error('Falha ao contactar a Resend', err)
    return json(502, { ok: false, error: 'Não foi possível enviar agora. Tenta de novo ou fala comigo pelo WhatsApp.' })
  }

  return json(200, { ok: true })
}
