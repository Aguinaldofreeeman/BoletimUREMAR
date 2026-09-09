import { Bulletin, SocialPost } from '../types';

export function generateSocialPosts(bulletin: Bulletin, baseUrl?: string): Record<string, SocialPost> {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://marilia.educacao.sp.gov.br');
  const bulletinUrl = `${url}?edicao=${encodeURIComponent(bulletin.edition)}`;

  const highlights = bulletin.items.slice(0, 5).map(item => `📌 ${item.title}`);
  const topDates = bulletin.items
    .filter(item => item.dateInfo)
    .slice(0, 3)
    .map(item => `⏰ ${item.title.slice(0, 40)}... (${item.dateInfo})`);

  // 1. WhatsApp Formatted Post
  const whatsappText = `📢 *${bulletin.institution}*\n` +
    `📑 *${bulletin.title} — ${bulletin.edition}*\n` +
    `🗓️ _${bulletin.date}_\n\n` +
    `Olá, Gestores, Professores e Comunidade Escolar!\n\n` +
    `Já está disponível a nova edição do nosso Boletim Semanal com as principais orientações, cronogramas e boas práticas da nossa região:\n\n` +
    `*DESTAQUES DA SEMANA:*\n` +
    `${highlights.join('\n')}\n\n` +
    (topDates.length > 0 ? `*FIQUE ATENTO AOS PRAZOS & FORMAÇÕES:*\n${topDates.join('\n')}\n\n` : '') +
    `🌐 *Acesse a página interativa com sumário completo:*\n${bulletinUrl}\n\n` +
    `_Coordenação Dirigente Regional de Ensino de Marília_\n` +
    `Dúvidas: ${bulletin.email}`;

  // 2. Instagram Caption Post
  const instagramText = `📢 NOVO BOLETIM SEMANAL NO AR! 📚✨\n\n` +
    `A ${bulletin.institution} acaba de publicar a edição ${bulletin.edition} (${bulletin.date}).\n\n` +
    `Nesta semana, trazemos informações indispensáveis para nossas unidades escolares, professores e estudantes:\n\n` +
    `${highlights.slice(0, 4).join('\n')}\n` +
    `🌟 E uma cobertura especial de Boas Práticas das nossas escolas!\n\n` +
    `👉 Acesse o site interativo pelo link da bio para navegar pelo sumário completo, consultar o cronograma de turmas e baixar as orientações oficiais.\n\n` +
    `#UREMarilia #BoletimSemanal #EducacaoSP #SeducSP #EscolaPaulista #GestaoEscolar #ProfessoresSP #Marilia`;

  // 3. Facebook Post
  const facebookText = `🏛️ ${bulletin.institution} | BOLETIM OFICIAL\n` +
    `Edição: ${bulletin.edition} — ${bulletin.date}\n\n` +
    `Confira o resumo das principais pautas e diretrizes pedagógicas desta semana na rede estadual de ensino da nossa região:\n\n` +
    `${highlights.join('\n')}\n\n` +
    `Acesse a versão digital interativa com sumário por área de atuação e links diretos para cada procedimento no link abaixo:\n` +
    `🔗 ${bulletinUrl}\n\n` +
    `Dirigente Regional: ${bulletin.leader}\n` +
    `Contato oficial: ${bulletin.email}`;

  // 4. X (Twitter) Post
  const twitterText = `📢 ${bulletin.edition} do Boletim Semanal da URE Marília já está online!\n\n` +
    `Nesta edição:\n` +
    `• Formações Por Dentro do Currículo\n` +
    `• SARESP, Provão & Prova Paulista\n` +
    `• Medalhistas OMASP 2026\n` +
    `• Projetos e Boas Práticas das escolas\n\n` +
    `Confira o sumário interativo: ${bulletinUrl} #EducaçãoSP`;

  // 5. LinkedIn Post
  const linkedinText = `A Unidade Regional de Ensino de Marília divulga a publicação do ${bulletin.title} — ${bulletin.edition}.\n\n` +
    `O documento reúne as diretrizes estratégicas da SEDUC-SP, cronogramas de formações continuadas dos docentes, programas de internacionalização como o Prontos pro Mundo e os reconhecimentos acadêmicos obtidos na OMASP 2026.\n\n` +
    `Parabenizamos especialmente as equipes gestoras, coordenadores pedagógicos e professores pelo protagonismo em projetos esportivos, culturais e científicos evidenciados na sessão de Boas Práticas.\n\n` +
    `Consulte a edição completa e digitalizada: ${bulletinUrl}\n\n` +
    `#LiderançaEducacional #GestãoPública #EducaçãoBásica #InovaçãoPedagógica #MaríliaSP`;

  return {
    whatsapp: {
      platform: 'whatsapp',
      title: 'WhatsApp (Lista de Transmissão / Grupos)',
      content: whatsappText,
      characterCount: whatsappText.length,
      hashtags: ['#BoletimSemanal', '#UREMarilia']
    },
    instagram: {
      platform: 'instagram',
      title: 'Instagram (Legenda / Carrossel)',
      content: instagramText,
      characterCount: instagramText.length,
      hashtags: ['#UREMarilia', '#BoletimSemanal', '#EducacaoSP', '#SeducSP', '#GestaoEscolar']
    },
    facebook: {
      platform: 'facebook',
      title: 'Facebook (Página Institucional)',
      content: facebookText,
      characterCount: facebookText.length,
      hashtags: ['#UREMarilia', '#EducacaoSP']
    },
    twitter: {
      platform: 'twitter',
      title: 'X / Twitter (Publicação Curta)',
      content: twitterText,
      characterCount: twitterText.length,
      hashtags: ['#EducaçãoSP', '#UREMarília']
    },
    linkedin: {
      platform: 'linkedin',
      title: 'LinkedIn (Artigo Institucional)',
      content: linkedinText,
      characterCount: linkedinText.length,
      hashtags: ['#LiderançaEducacional', '#EducaçãoBásica']
    }
  };
}
