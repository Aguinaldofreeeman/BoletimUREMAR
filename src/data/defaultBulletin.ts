import { Bulletin } from '../types';

export const initialBulletin: Bulletin = {
  id: 'boletim-35-2026',
  title: 'BOLETIM SEMANAL',
  institution: 'UNIDADE REGIONAL DE ENSINO DE MARÍLIA',
  edition: 'Ano VI – nº35/2026',
  date: 'Marília, 07 de setembro de 2026',
  leader: 'Marcia Cavalcante Marcusso — Coordenadora Dirigente Regional de Ensino',
  email: 'demar@educacao.sp.gov.br',
  summary:
    'Edição nº 35/2026 com o cronograma das Formações Presenciais Por Dentro do Currículo, Mapeamento de Deficiência Visual, orientações do SARESP e Provão Paulista, medalhistas OMASP 2026, início do Pé na Estrada Prontos pro Mundo e galeria especial de Boas Práticas das escolas da região de Marília.',
  status: 'published',
  createdAt: '2026-09-07T08:00:00.000Z',
  updatedAt: '2026-09-07T08:00:00.000Z',
  items: [
    {
      id: 'item-1',
      title: 'Formação Presencial "Por Dentro do Currículo – Ciências Humanas"',
      category: 'Formação Pedagógica',
      department: 'ESE / EEC / ASURE / SEPES',
      targetAudience: 'Professores de Ciências Humanas convocados',
      dateInfo: '08/09/2026 e 10/09/2026 (8h30 às 17h30)',
      location: 'Auditório Prof. Antônio Ribeiro, Unidade Regional de Ensino de Marília',
      content:
        'Convocação de professores das unidades escolares da região para a formação presencial dedicada ao aprofundamento das diretrizes curriculares de Ciências Humanas. A formação visa alinhar metodologias ativas, planejamento de aulas e avaliação por competências.',
      importantNotes: [
        'Horário obrigatório: das 8h30 às 17h30 com intervalo para almoço.',
        'Comparecer munido de material para anotações e planejamento curricular.',
        'Turmas divididas entre os dias 08/09 e 10/09.'
      ],
      tags: ['Formação', 'Ciências Humanas', 'Presencial', 'Convocação']
    },
    {
      id: 'item-2',
      title: 'Formação Presencial CONVIVA – "É preciso amar as pessoas como se não houvesse amanhã"',
      category: 'Convivência e Clima Escolar',
      department: 'Programa CONVIVA SP',
      targetAudience: 'Diretores de Escola e Professores Articuladores',
      dateInfo: '09/09/2026 (08h30 às 17h30)',
      location: 'Auditório da EE Antonio Reginato (Rua Corifeu de Azevedo Marques, 807 - Marília/SP)',
      content:
        'Encontro presencial de formação e acolhimento focado nas práticas de mediação de conflitos, fortalecimento dos vínculos socioemocionais na comunidade escolar e promoção da cultura de paz nas unidades escolares de Marília.',
      importantNotes: [
        'Atividade Café Colaborativo durante o credenciamento.',
        'Público-alvo prioritário: Diretor(a) Escolar.'
      ],
      tags: ['CONVIVA', 'Clima Escolar', 'Gestão', 'Acolhimento']
    },
    {
      id: 'item-3',
      title: '16º Círculo de Cultura – Pacto Nacional pela Superação do Analfabetismo e Qualificação da EJA',
      category: 'Educação de Jovens e Adultos',
      department: 'Núcleo Pedagógico - EJA',
      targetAudience: 'CGP, CGPG ou Vice-Diretor das escolas com turmas de EJA e vinculadas a unidades prisionais/CEEJA',
      dateInfo: '09/09/2026 (12h às 18h)',
      location: 'Sala 23, Unidade Regional de Ensino de Marília',
      content:
        'Orientação técnica voltada à qualificação das práticas pedagógicas na EJA, estratégias de permanência e superação do analfabetismo com base nos princípios freirianos de círculos de cultura.',
      tags: ['EJA', 'Círculo de Cultura', 'Alfabetização']
    },
    {
      id: 'item-4',
      title: 'Formação Presencial "Por Dentro do Currículo – Linguagens" (Turmas 1 a 6)',
      category: 'Formação Pedagógica',
      department: 'Equipe de Linguagens - URE Marília',
      targetAudience: 'Professores de Língua Portuguesa, Redação e Leitura e Orientação de Estudos',
      dateInfo: '09/09, 11/09, 15/09, 16/09, 28/09, 06/10 e 13/10/2026',
      location: 'Auditório Prof. Antônio Ribeiro – Av. Pedro de Toledo, 542',
      content:
        'Cronograma detalhado em turmas para a formação de aprofundamento das habilidades leitoras, produção textual e análise dos descritores da Prova Paulista e SARESP.',
      importantNotes: [
        'Consulte a turma específica atribuída à sua unidade escolar no anexo oficial.',
        'Dia 11/09: Turma 1 com foco em redação e letramento digital.'
      ],
      tags: ['Linguagens', 'Língua Portuguesa', 'Currículo Paulista']
    },
    {
      id: 'item-5',
      title: 'Cerimônia Oficial de Premiação da OBMEP 2026',
      category: 'Eventos e Premiações',
      department: 'Coordenação Regional OBMEP / UNIMAR',
      targetAudience: 'Escolas premiadas, alunos medalhistas e equipes gestoras',
      dateInfo: '11/09/2026 às 13h00',
      location: 'Auditório Principal da UNIMAR (Universidade de Marília)',
      content:
        'Homenagem solene aos alunos e professores das escolas estaduais da região de Marília condecorados na Olimpíada Brasileira de Matemática das Escolas Públicas.',
      importantNotes: [
        'Orientações complementares enviadas para os e-mails das equipes gestoras e grupos de WhatsApp.'
      ],
      tags: ['OBMEP', 'Matemática', 'Destaque Acadêmico']
    },
    {
      id: 'item-6',
      title: 'Entrega dos Cadernos dos Alunos FDE – Fundação para o Desenvolvimento da Educação',
      category: 'Logística e Materiais',
      department: 'FDE / Logística Escolar',
      targetAudience: 'Diretores de Escola e Agentes de Organização Escolar (AOE)',
      dateInfo: 'Previsão de entrega: 10/09/2026 a 16/09/2026 (08h às 17h)',
      location: 'Unidades Escolares da Rede Estadual de Marília',
      content:
        'A transportadora Laser Brasil Logística realizará a distribuição dos materiais pedagógicos do Caderno do Aluno nas unidades escolares. É imprescindível atentar para as normas formais de recebimento.',
      importantNotes: [
        'Conferência obrigatória por item e ano no ato do descarregamento.',
        'Guia de Remessa deve conter 02 carimbos legíveis da escola e carimbo funcional com data e telefone.',
        'Não aceitar sem conferência prévia e registrar eventuais divergências no campo Apontamento.',
        'Central de suporte da transportadora: 0800-887-0480.'
      ],
      tags: ['FDE', 'Material Didático', 'Logística', 'Urgente']
    },
    {
      id: 'item-7',
      title: 'Educação Especial: Protocolo Obrigatório para Solicitação de PAE via SED e SEI',
      category: 'Educação Especial',
      department: 'DIESP / DVESP - Equipe de Educação Especial URE Marília',
      targetAudience: 'Diretores de Escola, Professores Especializados e Professores de Sala de Recursos',
      content:
        'Orientações da Diretoria de Educação Especial para solicitação de Profissional de Apoio Escolar (PAE), nas modalidades compartilhada ou exclusiva. Documentos obrigatórios (Estudo de Caso - Anexo II, PAEE - Anexo III, Questionário e Termo de Ciência) devem constar obrigatoriamente na Ficha do Aluno na SED antes do trâmite no SEI.',
      importantNotes: [
        'O nível de apoio na SED deve ser 100% compatível com o Estudo de Caso e laudo médico.',
        'Ofícios de solicitação devem conter assinatura digital do(a) Diretor(a) de Escola.',
        'Evitar as pendências recorrentes identificadas pela equipe técnica estadual.'
      ],
      tags: ['Educação Especial', 'PAE', 'Inclusão', 'SED', 'SEI']
    },
    {
      id: 'item-8',
      title: 'Mapeamento Estadual de Estudantes com Deficiência Visual – Prazo até 10/09',
      category: 'Educação Especial e Inclusiva',
      department: 'DIESPI / SUART',
      targetAudience: 'Trio Gestor das Unidades Escolares',
      dateInfo: 'Prazo impreterível: 10 de setembro de 2026',
      content:
        'Levantamento para identificar estudantes com baixa visão ou cegueira em toda a rede. Até o momento, cerca de 72% das escolas ainda não enviaram as informações. A omissão impede o envio de materiais adaptados, lupas eletrônicas e tecnologias assistivas.',
      links: [
        {
          label: 'Acessar Formulário de Mapeamento Oficial',
          url: 'https://forms.gle/vP26sBneJTLixPFL9'
        }
      ],
      importantNotes: [
        'Preenchimento rápido: cerca de 10 minutos.',
        'Dúvidas: acionar o Professor Especialista em Currículo (PEC) de Educação Especial da Diretoria.'
      ],
      tags: ['Mapeamento', 'Deficiência Visual', 'Prazo Crítico', 'Inclusão']
    },
    {
      id: 'item-9',
      title: 'Iniciativa Futuro Docente: Novo FAQ Unificado e Tutoriais de Estágio na Rede',
      category: 'Currículo e Formação',
      department: 'SUPED – CORRIC',
      targetAudience: 'Equipes Gestoras, Professores e Estagiários Licenciandos',
      content:
        'A SEDUC-SP centralizou a gestão dos estágios no sistema Futuro Docente (Resolução SEDUC nº 74/2026). Foi disponibilizado documento único de perguntas frequentes e tutoriais passo a passo para o candidato e para aprovação pela equipe gestora escolar.',
      links: [
        {
          label: 'Documento Permanente de Perguntas e Respostas (FAQ)',
          url: 'https://docs.google.com/document/d/1XbzSZY_PCTYxyIc_UfO2z97612cEcclVNxPowxFw_Sg/edit'
        }
      ],
      importantNotes: [
        'O trio gestor deve despachar solicitações de estágio em até 5 dias úteis a partir do recebimento.'
      ],
      tags: ['Futuro Docente', 'Estágio', 'Licenciatura', 'CORRIC']
    },
    {
      id: 'item-10',
      title: 'Avaliações Estaduais: Resultados SARESP 2º ano, Provão Paulista e Prova Paulista 3º Bimestre',
      category: 'Avaliação e Monitoramento',
      department: 'SUPED – DIAVAL',
      targetAudience: 'Diretores, Vice-Diretores, Coordenadores Pedagógicos e Docentes',
      dateInfo: 'Aplicação Prova Paulista: 22 a 25 de setembro de 2026',
      content:
        'Divulgação dos resultados do simulado SARESP 2º ano EF na plataforma CAEd. Publicação da lista de inscrições deferidas do Provão Paulista Seriado 2026 pela VUNESP e orientações para aplicação da Prova Paulista do 3º bimestre.',
      links: [
        {
          label: 'Edital e Informações Provão Paulista na VUNESP',
          url: 'https://www.vunesp.com.br/SEED2602'
        },
        {
          label: 'Portal de Atendimento da SEDUC-SP',
          url: 'https://atendimento.educacao.sp.gov.br'
        }
      ],
      importantNotes: [
        'Provas de itinerários formativos propedêuticos e noturno serão impressas.',
        'Live preparatória transmitida pelo CMSP em 11/09/2026.',
        'Tarefas SP passam a compor até 20% da nota do estudante no boletim escolar.'
      ],
      tags: ['SARESP', 'Provão Paulista', 'Prova Paulista', 'CMSP', 'DIAVAL']
    },
    {
      id: 'item-11',
      title: 'Recomposição das Aprendizagens: Acesso ao Painel BI e Replanejamento do 2º Semestre',
      category: 'Gestão Pedagógica',
      department: 'SUPED – DIGEP / CORAP',
      targetAudience: 'Professores Tutores de Anos Finais e Gestores Escolares',
      content:
        'Acesso liberado no portal Escola Total ao BI do Projeto Professor Tutor Anos Finais. Orientações pedagógicas para o disparo de tarefas do Material Horizonte respeitando o ritmo de cada estudante e critérios para remanejamento de turmas com base na 2ª AVD.',
      links: [
        {
          label: 'Acesso ao Painel Escola Total',
          url: 'https://escolatotal.educacao.sp.gov.br/Inicio/Home'
        }
      ],
      tags: ['Recomposição', 'Professor Tutor', 'Escola Total', 'BI']
    },
    {
      id: 'item-12',
      title: 'Escolha de Itinerários Formativos para o Ensino Médio 2027 – Até 18 de Setembro',
      category: 'Ensino Médio',
      department: 'SUPED – DIMAD / COEM-IF',
      targetAudience: 'Estudantes da 1ª série do Ensino Médio e Equipes Escolares',
      dateInfo: 'Período: 01 a 18 de setembro de 2026',
      content:
        'Todos os estudantes da 1ª série do Ensino Médio devem manifestar suas escolhas de Itinerários Formativos na Sala do Futuro, indicando até quatro opções por ordem de prioridade.',
      links: [
        {
          label: 'Portal Ensino Médio Paulista',
          url: 'https://ensinomediopaulista.educacao.sp.gov.br'
        },
        {
          label: 'Login do Aluno na Sala do Futuro',
          url: 'https://saladofuturo.educacao.sp.gov.br/login-alunos'
        }
      ],
      tags: ['Itinerários Formativos', 'Ensino Médio', 'Sala do Futuro']
    },
    {
      id: 'item-13',
      title: 'Medalhistas Estaduais da Fase 3 da OMASP 2026 – Orgulho da Região de Marília!',
      category: 'Olimpíadas Científicas',
      department: 'SUPED – DIMOD / Assessoria de Olimpíadas Educacionais (AOED)',
      targetAudience: 'Toda a Rede Estadual, Comunidade Escolar e Estudantes',
      content:
        'Com mais de 10.450 participantes na Fase 3, foram anunciados os 1.935 medalhistas estaduais da OMASP 2026 (225 ouros, 510 pratas e 1.200 bronzes). Alunos condecorados com ouro têm vaga garantida na OBM, medalhistas de ouro e prata na OBRL e todos os medalhistas ganham curso exclusivo de preparação com a Starboard Science.',
      links: [
        {
          label: 'Site Oficial da OBM (Olimpíada Brasileira de Matemática)',
          url: 'https://www.obm.org.br/'
        },
        {
          label: 'Formulário de Inscrição no Curso Starboard Science',
          url: 'https://forms.gle/G1PNGM1BZDQZrR5P7'
        }
      ],
      tags: ['OMASP 2026', 'Medalhistas', 'Matemática', 'OBM', 'Bolsas']
    },
    {
      id: 'item-14',
      title: 'Programa Prontos pro Mundo: 2ª Fase, Retomada Open English e Projeto Pé na Estrada',
      category: 'Intercâmbio e Internacionalização',
      department: 'Departamento de Intercâmbio (DPIN) / SEDUC-SP',
      targetAudience: 'Equipes Gestoras, Estudantes Convocados e Famílias',
      content:
        'Orientações cruciais para as entrevistas socioemocionais da Fase 2, reativação de estudantes com acesso inativo na Open English, início do atendimento psicológico telepresencial para intercambistas e confirmação da nova edição do Pé na Estrada descentralizado nas UREs de 05 a 10 de outubro de 2026.',
      links: [
        {
          label: 'Canal Oficial do Aluno Prontos pro Mundo no WhatsApp',
          url: 'https://whatsapp.com/channel/0029VbCBxz57DAWs4PJrjy1R'
        }
      ],
      tags: ['Prontos pro Mundo', 'Intercâmbio', 'Inglês', 'Pé na Estrada']
    },
    {
      id: 'item-15',
      title: 'Boas Práticas: Escolas da Região de Marília Brilham em Projetos e Protagonismo!',
      category: 'Boas Práticas Escolares',
      department: 'Núcleo Pedagógico - URE Marília',
      targetAudience: 'Toda a Comunidade Escolar e Sociedade',
      content:
        'Destaques das unidades escolares nesta semana: EE Amilcare Mattei sediou o Congresso Técnico dos Jogos Escolares Sub-10 e Sub-12 e é finalista do Concurso de Teatro TCESP; EE Abel Augusto Fragata emocionou com o Musical VIVA! no Teatro Municipal; EE Antônio Daun inovou com Detetives do Dicionário e Fruição Literária; EE Sylvia Ribeiro de Carvalho bateu 95,5% de inscrições no ENEM e realizou o Circuito Funcional; EE Antônio Augusto Netto promoveu a 3ª Feira de Profissões e visita ao SENAC; EE Hilmar Machado de Oliveira realizou palestra de Cafés Especiais com produtores de Garça; e EE Dr. Waldemar Moniz da Rocha Barros desenvolveu gamificação desplugada e painel do Agosto Lilás.',
      importantNotes: [
        'Parabéns a todos os professores, gestores e estudantes pelo engajamento e inspiração!',
        'Envie as boas práticas da sua unidade escolar para o próximo boletim semanal.'
      ],
      tags: ['Boas Práticas', 'Marília', 'Cultura', 'Esporte', 'ENEM', 'Protagonismo']
    }
  ]
};
