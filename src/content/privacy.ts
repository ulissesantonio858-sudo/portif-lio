// Política de privacidade. Descreve só o que o site faz de facto (ver README › Política de privacidade).
// Rever com um profissional antes de considerar o texto final.
import { CONTACT_CONFIG, SITE } from './portfolio'

export const PRIVACY = {
  title: 'Política de privacidade',
  updated: '22 de outubro de 2026',
  intro: `Esta política explica que dados pessoais o site ${SITE.brand} recolhe, para que os usa e que direitos tens sobre eles.`,
  sections: [
    {
      heading: 'Quem é o responsável',
      body: [
        `${SITE.name} (${SITE.brand}), developer e web designer em Portugal, é o responsável pelo tratamento dos dados recolhidos neste site.`,
        'Para qualquer questão sobre os teus dados, fala comigo pelo WhatsApp ou pelo formulário de contacto deste site.',
      ],
    },
    {
      heading: 'Que dados recolho e porquê',
      body: [
        'Formulário de contacto: o nome, o email, a mensagem e o assunto que escolheres. Uso-os apenas para responder ao teu pedido e, se avançarmos, para preparar uma proposta.',
        'A base legal é o teu pedido de contacto e as diligências pré-contratuais que ele implica (artigo 6.º, n.º 1, alínea b) do RGPD).',
        'Não uso os teus dados para publicidade nem os vendo ou cedo a terceiros para esse fim.',
      ],
    },
    {
      heading: 'Quem trata os dados por mim',
      body: [
        'As mensagens do formulário são enviadas por email através da Resend, um serviço de envio de email.',
        'O site está alojado na Vercel. Como qualquer servidor, o alojamento pode registar dados técnicos dos pedidos (por exemplo, endereço IP e tipo de navegador) para funcionar e por segurança.',
        'Estes fornecedores podem tratar dados fora da União Europeia, nomeadamente nos Estados Unidos, com as garantias previstas no RGPD.',
      ],
    },
    {
      heading: 'Links para outros serviços',
      body: [
        'Os botões de WhatsApp, LinkedIn, Instagram, Facebook e GitHub levam-te para fora deste site. A partir daí aplica-se a política de privacidade de cada um desses serviços.',
        'Quando usas o botão "Falar no WhatsApp", a mensagem sugerida só é enviada se tu a enviares na aplicação.',
      ],
    },
    {
      heading: 'Cookies',
      body: [
        'Este site não usa cookies, não guarda dados no teu navegador e não usa ferramentas de análise de tráfego nem de publicidade.',
      ],
    },
    {
      heading: 'Durante quanto tempo guardo os dados',
      body: [
        'Guardo as mensagens apenas durante o tempo necessário para responder e acompanhar o teu pedido. Depois disso são apagadas, salvo se a lei me obrigar a conservá-las.',
      ],
    },
    {
      heading: 'Os teus direitos',
      body: [
        'Podes pedir acesso, retificação, apagamento, limitação ou portabilidade dos teus dados, e opor-te ao seu tratamento. Basta contactares-me pelos meios indicados acima.',
        'Tens também o direito de apresentar reclamação à Comissão Nacional de Proteção de Dados (CNPD), em www.cnpd.pt.',
      ],
    },
    {
      heading: 'Alterações',
      body: [
        'Se esta política mudar, a nova versão é publicada nesta página com a data de atualização.',
      ],
    },
  ],
  whatsapp: CONTACT_CONFIG.whatsapp,
}
