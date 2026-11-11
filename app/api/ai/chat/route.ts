import { NextRequest, NextResponse } from "next/server";

// Fallback fictional regulation knowledge base for deterministic offline search
const REGULATION_KNOWLEDGE_BASE = [
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

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Поле message обязательно для заполнения" },
        { status: 400 }
      );
    }

    const aiKey = process.env.AI_API_KEY;
    const aiBaseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const aiModel = process.env.AI_MODEL || "gpt-4o-mini";

    // 1. Search matching regulation chunks
    const lower = message.toLowerCase();
    const matchedChunks = REGULATION_KNOWLEDGE_BASE.filter((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );

    const relevantChunks = matchedChunks.length > 0 ? matchedChunks : [REGULATION_KNOWLEDGE_BASE[0]];

    // 2. If AI_API_KEY is present, call OpenAI-compatible API
    if (aiKey && !aiKey.includes("placeholder")) {
      try {
        const systemPrompt = `Вы — официальный цифровой ассистент деканата вымышленного университета.
Отвечайте строго на русском языке, опираясь ТОЛЬКО на следующие статьи регламентов:
${relevantChunks.map((c) => `[${c.article}]: ${c.content}`).join("\n")}

Обязательно цитируйте номер статьи или пункта регламента в ответе. Если вопрос вне рамок предоставленных регламентов, вежливо направьте студента в раздел «Заявки».`;

        const response = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${aiKey}`,
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message },
            ],
            temperature: 0.2,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          return NextResponse.json({
            reply,
            sources: relevantChunks.map((c) => ({ article: c.article, content: c.content })),
          });
        }
      } catch (err) {
        console.warn("AI API request failed, falling back to heuristic engine", err);
      }
    }

    // 3. Deterministic Heuristic Fallback Engine
    const primary = relevantChunks[0];
    let replyText = "";

    if (matchedChunks.length > 0) {
      replyText = `Согласно **${primary.article}**, ${primary.content.charAt(0).toLowerCase() + primary.content.slice(1)}\n\nЕсли вам необходимо подать официальное заявление по данному вопросу, вы можете сделать это онлайн в разделе **«Заявки»** нашего портала.`;
    } else {
      replyText = `По вашему запросу точного совпадения в выдержках регламентов не найдено. Рекомендуем ознакомиться с общими положениями либо подать индивидуальное обращение в деканат через раздел **«Заявки»**.\n\nБазовое правило (${REGULATION_KNOWLEDGE_BASE[0].article}): ${REGULATION_KNOWLEDGE_BASE[0].content}`;
    }

    return NextResponse.json({
      reply: replyText,
      sources: relevantChunks.map((c) => ({
        article: c.article,
        content: c.content,
      })),
      isFallback: !aiKey,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Внутренняя ошибка сервиса ассистента" },
      { status: 500 }
    );
  }
}
