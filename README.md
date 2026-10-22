# Ulisses Dev — portfólio

React + TypeScript + Vite, implementado a partir do Figma “MEU PORTIFOLIO” (frame `161:16`).

```bash
npm ci
npm run dev       # desenvolvimento
npm run build     # typecheck + build para dist/
npm run preview   # serve dist/ em http://localhost:4173
npm run capture   # capturas em captures/ e verificações (precisa do preview a correr)
npm run capture -- --og   # regenera public/og-image.jpg
```

O `capture` usa o Chrome instalado; noutro browser: `CHROME_PATH=/caminho/chrome npm run capture`.

## Estrutura

- `src/content/portfolio.ts` — todo o conteúdo e `CONTACT_CONFIG`. Valores `null`, `published: false` ou listas vazias ficam fora da página, e o respetivo link de navegação desaparece.
- `src/components/` — uma secção por componente.
- `src/styles/tokens.css` — cores, raios, tipografia, movimento. `global.css` — layout.
- `public/media/` — retrato e os 14 SVG do Figma, sem alterações internas.
- `vercel.json` — cabeçalhos de cache e segurança.

## Decisões

- **Assets em `public/media/`, não em `public/assets/`.** O Vite gera ficheiros com hash em `dist/assets/`; só esses recebem `immutable` (1 ano). `media/` tem 7 dias e `fonts/` 30 dias, com `stale-while-revalidate`, para que um ficheiro substituído com o mesmo nome se atualize sem mudar caminhos.
- **Hero desktop a partir de 1200 px** com as coordenadas do Figma (unidade `100cqw / 1920`). Abaixo disso, composição empilhada; no tablet a imagem usa proporção 0,95 para o enquadramento não mostrar os recortes transparentes do PNG.
- **Navegação:** Projetos e Depoimentos não aparecem porque não há conteúdo publicável. Ficam “Sobre Mim”, “Serviços” e “Processo”; os outros voltam automaticamente quando houver dados.
- **Serviços:** abre em *Landing pages* (corrige a incoerência do rascunho). Tabs com setas/Home/End; indicadores sincronizados; “Saber mais” abre um `<dialog>` com ação que leva ao contacto com o interesse pré-selecionado. As ilustrações à esquerda são HTML/CSS, não trabalhos de clientes.
- **Contacto:** o WhatsApp é a ação principal (“Falar no WhatsApp”), com o LinkedIn como alternativa. Ao lado, um formulário de email envia para `api/contact.js` (Vercel Function → Resend). O formulário só mostra “enviada” quando o servidor confirma; sem configuração responde que o envio ainda não está ativo e aponta para o WhatsApp. Tem validação no cliente e no servidor, limites de tamanho e um campo-armadilha para robôs.
- **Vídeo do sorriso na hero:** `public/media/hero-ulisses-sorriso.webm` (VP9, 252 KB) e `.mp4` (H.264, 839 KB), cortados do vídeo original (1176 × 720 a partir de x = 52) para coincidirem com a fotografia (correlação 0,996 no 1.º fotograma) e recortados pela transparência do PNG. Começa parado; toca uma vez, sem som, no primeiro hover ou no primeiro scroll real com a hero visível (`src/components/useHeroVideo.ts`), e fica no último fotograma. Pré-carrega depois do `load`. Com "reduzir movimento" não é carregado. Com o vídeo a correr, a luz que segue o rato fica só com o brilho (a cópia luminosa é da foto séria).
- **Tipografia:** Clash Display Medium (500), Semibold (600) e Bold (700), convertidas de OTF para WOFF2, com preload da Medium; Inter 400/500/600 via `@fontsource`. A 1920 px: Developer 647 px (Figma 659, −1,8 %), & 90 px (101), Web Designer 1166 px (1184, −1,5 %), sem ajuste de `letter-spacing`. Nota: `document.fonts.check('500 40px "Clash Display"')` devolve `true` mesmo sem a fonte; o `npm run capture` reporta `clashLoaded`, que verifica faces efetivamente carregadas.
- **Ícones sociais:** Facebook, Instagram e WhatsApp na hero, pela ordem do Figma.

## Política de privacidade

Página própria em `/privacidade` (`privacidade.html`, texto em `src/content/privacy.ts`), ligada no rodapé. Descreve só o que o site faz hoje: formulário enviado por email via Resend, alojamento na Vercel, links externos, **sem cookies, sem armazenamento no navegador e sem analytics** (verificado no código). Se acrescentares analytics, pixels, fontes externas ou outro serviço, atualiza o texto e a data. É um rascunho cuidado, não aconselhamento jurídico: vale a pena uma revisão profissional.

## Ativar o envio de email (uma vez)

1. Criar conta em https://resend.com e gerar uma API key (permissão “Sending access”).
2. Na Vercel → projeto → Settings → Environment Variables (Production e Preview):
   - `RESEND_API_KEY` = a chave;
   - `CONTACT_TO_EMAIL` = o email onde queres receber as mensagens;
   - `CONTACT_FROM_EMAIL` (opcional) = remetente de um domínio verificado na Resend. Sem domínio próprio, fica `onboarding@resend.dev`, que só entrega no email da própria conta Resend — por isso usa esse mesmo email em `CONTACT_TO_EMAIL`.
3. Fazer redeploy e enviar uma mensagem de teste pelo site. Responder ao email recebido deve ir para o email do visitante (`reply_to`).

Em `npm run preview` não há `/api`, por isso o formulário mostra erro localmente; testa-se no deploy da Vercel (ou com `vercel dev`).

## Pendências

1. **Retrato:** `public/media/hero-ulisses-*.webp` foi gerado a partir de uma cópia WebP (1813 × 1110, com transparência) da composição, não do PNG original de 2,5 MB. Visualmente está bem, mas convém regenerar os dois WebP a partir do PNG original exportado do Figma (nó `163:22`).
2. **Contactos:** envio de email por ativar (ver acima). O WhatsApp usa `https://wa.me/351936787147`, com a mensagem sugerida pré-preenchida.
3. **Projetos:** Elevon.pt está como rascunho (`published: false`): confirmar a descrição da participação (manutenção), tecnologias, URL e imagem antes de publicar.
4. **Depoimentos:** nenhum; a secção só aparece com testemunhos reais.
5. **`wordpress.svg`:** o “P” de “WORDPRESS” falta no próprio export do Figma.
6. **Depois do deploy:** `og:image` com URL absoluto, `og:url` e `<link rel="canonical">` em `index.html`.
