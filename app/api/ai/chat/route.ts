import { NextRequest, NextResponse } from "next/server";
import { SocksProxyAgent } from "socks-proxy-agent";
import { createAdminClient } from "@/lib/supabase/admin";

export interface RegulationItem {
  article: string;
  content: string;
  keywords?: string[];
}

// Fallback fictional regulation knowledge base for deterministic offline search
const REGULATION_KNOWLEDGE_BASE: RegulationItem[] = [
  {
    article: "Регламент ликвидации академических задолженностей, п. 1.1",
    keywords: ["пересдач", "пересдать", "задолженност", "долг", "хвост", "повторн"],
    content: "Студент, имеющий академическую задолженность по итогам сессии, имеет право на две повторные промежуточные аттестации (пересдачи): первую — ведущему преподавателю, вторую — предметной комиссии кафедры.",
  },
  {
    article: "Регламент ликвидации задолженностей, п. 1.4",
    keywords: ["срок", "когда пересдавать", "период пересдач", "месяц"],
    content: "Сроки проведения пересдач устанавливаются распоряжением декана и не могут превышать один календарный месяц с начала следующего учебного семестра (в осеннем семестре — до 28 ноября).",
  },
  {
    article: "Положение о стипендиальном обеспечении, ст. 3",
    keywords: ["стипенди", "академическ", "выплат", "деньги", "бюджет"],
    content: "Государственная академическая стипендия назначается студентам бюджетной формы обучения, сдавшим сессию исключительно на оценки «отлично» и «хорошо» без троек и академических задолженностей.",
  },
  {
    article: "Положение об академическом отпуске, п. 2.1",
    keywords: ["академ", "отпуск", "болезн", "семейн", "арми"],
    content: "Академический отпуск предоставляется по медицинским показаниям (справка врачебной комиссии), семейным обстоятельствам или призыву на военную службу на срок до двух календарных лет.",
  },
  {
    article: "Положение о переводе и восстановлении, п. 1.2",
    keywords: ["перевод", "бюджет", "платн", "вакантн"],
    content: "Перевод с платного обучения на бесплатное допускается при наличии вакантных бюджетных мест и сдаче двух последних сессий без оценок «удовлетворительно» и долгов.",
  },
  {
    article: "Регламент выдачи справок, п. 1.2",
    keywords: ["справк", "документ", "заказ", "срок справки", "печать"],
    content: "Справка об обучении с гербовой печатью формируется через электронный раздел «Заявки» портала «Цифровой деканат». Срок изготовления составляет до 3 рабочих дней.",
  },
  {
    article: "Положение о защите ВКР, п. 2.1",
    keywords: ["красный диплом", "отличи", "вкр", "диплом"],
    content: "Диплом с отличием («красный диплом») выдается при наличии не менее 75% оценок «отлично», отсутствии троек за весь период обучения и оценке «отлично» за защиту выпускной квалификационной работы.",
  },
];

async function fetchRelevantRegulations(message: string): Promise<RegulationItem[]> {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const lower = message.toLowerCase();
      const tokens = lower
        .replace(/[.,?!;:()]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 3);

      if (tokens.length > 0) {
        const orFilter = tokens.slice(0, 5).map((t) => `content.ilike.%${t}%`).join(",");
        const { data, error } = await supabase
          .from("regulation_chunks")
          .select("content, metadata")
          .or(orFilter)
          .limit(4);

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            article: (d.metadata as { article?: string })?.article || "Регламент университета",
            content: d.content,
          }));
        }
      }
    }
  } catch (err) {
    console.warn("Supabase regulation search failed, using local fallback base", err);
  }

  // Fallback to local memory base
  const lower = message.toLowerCase();
  const matched = REGULATION_KNOWLEDGE_BASE.filter((item) =>
    item.keywords?.some((kw) => lower.includes(kw))
  );
  return matched.length > 0 ? matched : [REGULATION_KNOWLEDGE_BASE[0]];
}

async function queryLLM(
  systemPrompt: string,
  userMessage: string,
  model: string,
  apiKey: string,
  baseUrl: string,
  proxyUrl?: string
): Promise<string | null> {
  const agent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const fetchOptions: RequestInit & { agent?: SocksProxyAgent } = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
      }),
      signal: controller.signal,
    };

    if (agent) {
      fetchOptions.agent = agent;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, fetchOptions);

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } else {
      console.warn(`LLM model ${model} returned HTTP ${response.status}`);
      return null;
    }
  } catch (err) {
    console.warn(`LLM call to ${model} failed`, err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Поле message обязательно для заполнения" },
        { status: 400 }
      );
    }

    // 0. Academic Guardrail: Filter offtopic queries (cooking recipes, weather, horoscopes, entertainment)
    const lowerMessage = message.toLowerCase().trim();
    const OFFTOPIC_PATTERNS = [
      "лазань", "рецепт", "приготов", "пирог", "суп", "кулинар", "выпечк", "блюд",
      "погод", "гороскоп", "зодиак", "стих", "песн", "анекдот", "фильм", "сериал",
      "похудет", "диета", "код на python", "напиши скрипт", "сыграем", "сказка"
    ];

    const isOfftopic = OFFTOPIC_PATTERNS.some((pattern) => lowerMessage.includes(pattern));
    if (isOfftopic) {
      return NextResponse.json({
        reply: "Я специализированный помощник цифрового деканата ИГУ и консультирую только по вопросам учебного процесса, расписания, стипендий, сессий и регламентов университета. Пожалуйста, задайте вопрос по вашей учебе.",
        sources: [],
        model: "guardrail-refusal",
        isFallback: false,
      });
    }

    const aiKey = process.env.AI_API_KEY;
    const aiBaseUrl = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    const primaryModel = process.env.AI_MODEL || "google/gemma-4-31b-it:free";
    const backupModel = "baidu/ernie-5.5-flash-preview:free";
    const proxyUrl = process.env.AI_PROXY_URL || process.env.OUTBOUND_FOREIGN_PROXY_URL;

    // 1. Hybrid RAG retrieval: search Supabase regulation_chunks with memory fallback
    const relevantChunks = await fetchRelevantRegulations(message);

    // 2. If AI_API_KEY is present, call OpenRouter with primary and backup models
    let generatedReply: string | null = null;
    let usedModel = "offline-heuristic";

    if (aiKey && !aiKey.includes("placeholder")) {
      const systemPrompt = `Вы — официальный цифровой ассистент деканата университета (концепт «Цифровой деканат ИГУ»).
Ваша компетенция строго ограничена вопросами учебного процесса, расписания, сессий, пересдач, стипендий, академических отпусков и регламентов университета.

КРИТИЧЕСКИ ВАЖНОЕ ПРАВИЛО:
Если студент задает посторонний вопрос (кулинарные рецепты, погода, гороскопы, сочинение стихов, развлечения и т.д.), ВЫ ОБЯЗАНЫ ВЕЖЛИВО ОТКАЗАТЬ:
«Я специализированный помощник цифрового деканата ИГУ и консультирую только по вопросам учебного процесса, расписания, стипендий, сессий и регламентов университета. Пожалуйста, задайте вопрос по вашей учебе.»

Отвечайте строго на русском языке, опираясь ТОЛЬКО на следующие статьи регламентов:
${relevantChunks.map((c) => `[${c.article}]: ${c.content}`).join("\n\n")}

Требования к ответу:
1. Обязательно прямо цитируйте номер статьи или пункта регламента в квадратных скобках или жирным шрифтом.
2. Отвечайте вежливо, лаконично и по существу вопроса студента.
3. Если вопрос касается подачи официального заявления, вежливо порекомендуйте оформить обращение в разделе «Заявки» мобильного портала.`;

      // Try Primary Model (google/gemma-4-31b-it:free)
      generatedReply = await queryLLM(systemPrompt, message, primaryModel, aiKey, aiBaseUrl, proxyUrl);
      if (generatedReply) {
        usedModel = primaryModel;
      } else {
        // Fallback to Backup Free Model (baidu/ernie-5.5-flash-preview:free)
        generatedReply = await queryLLM(systemPrompt, message, backupModel, aiKey, aiBaseUrl, proxyUrl);
        if (generatedReply) {
          usedModel = backupModel;
        }
      }
    }

    // 3. Return LLM reply if successful
    if (generatedReply) {
      return NextResponse.json({
        reply: generatedReply,
        sources: relevantChunks.map((c) => ({ article: c.article, content: c.content })),
        model: usedModel,
        isFallback: false,
      });
    }

    // 4. Deterministic Heuristic Fallback Engine (Zero Downtime Guarantee)
    const primary = relevantChunks[0];
    let fallbackText = "";

    if (relevantChunks.length > 0 && relevantChunks[0].article !== "Регламент университета") {
      fallbackText = `Согласно **${primary.article}**, ${primary.content.charAt(0).toLowerCase() + primary.content.slice(1)}\n\nЕсли вам необходимо подать официальное заявление по данному вопросу, вы можете сделать это онлайн в разделе **«Заявки»** нашего портала.`;
    } else {
      fallbackText = `По вашему запросу точного совпадения в выдержках регламентов не найдено. Рекомендуем ознакомиться с общими положениями либо подать индивидуальное обращение в деканат через раздел **«Заявки»**.\n\nБазовое правило (${REGULATION_KNOWLEDGE_BASE[0].article}): ${REGULATION_KNOWLEDGE_BASE[0].content}`;
    }

    return NextResponse.json({
      reply: fallbackText,
      sources: relevantChunks.map((c) => ({
        article: c.article,
        content: c.content,
      })),
      model: "offline-heuristic",
      isFallback: true,
    });
  } catch (err: unknown) {
    console.error("AI route internal error:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервиса ассистента" },
      { status: 500 }
    );
  }
}
