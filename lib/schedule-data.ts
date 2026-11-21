export interface TeacherInfo {
  name: string;
  title: string;
  department: string;
  email: string;
  consultation: string;
}

export interface HomeworkInfo {
  task: string;
  deadline: string;
  literature: string;
}

export interface LessonItem {
  id: string;
  discipline: string;
  kind: "lecture" | "seminar" | "lab" | "exam" | "practice";
  weekday: number; // 1 = Пн, 6 = Сб
  start_time: string;
  end_time: string;
  room: string;
  teacher: string;
  parity?: "all" | "odd" | "even";
  teacher_info?: TeacherInfo;
  homework?: HomeworkInfo;
  brs_points?: number; // e.g. 92
  change?: {
    cancelled?: boolean;
    new_room?: string;
    new_time?: string;
    reason?: string;
  };
}

export interface GroupConfig {
  id: string;
  shortName: string;
  fullName: string;
  faculty: string;
  semester: string;
}

export const SCHEDULE_GROUPS: GroupConfig[] = [
  {
    id: "07131-DB",
    shortName: "07131-ДБ • Международные отношения",
    fullName: "Группа 07131-ДБ • 41.03.05 «Международные отношения»",
    faculty: "Исторический факультет ИГУ, 1 курс (очная форма)",
    semester: "1 семестр 2026/2027",
  },
  {
    id: "CD-23-1",
    shortName: "ЦД-23-1 • IT",
    fullName: "Группа ЦД-23-1 • Информационные системы и программирование",
    faculty: "Факультет цифровых технологий, 1 курс",
    semester: "1 семестр 2026/2027",
  },
];

export const SCHEDULE_07131_DB: LessonItem[] = [
  // Понедельник (1)
  {
    id: "isu-mon-1",
    discipline: "Введение в специальность",
    kind: "lecture",
    weekday: 1,
    start_time: "10:10",
    end_time: "11:40",
    room: "ауд. 320",
    teacher: "доц. Елохина Ю.В.",
    teacher_info: {
      name: "Елохина Юлия Валерьевна",
      title: "Кандидат исторических наук, доцент",
      department: "Кафедра мировой истории и международных отношений",
      email: "elokhina.y@isu.ru",
      consultation: "Вторник, 14:00 – 15:30, ауд. 320",
    },
    homework: {
      task: "Подготовить обзор основных этапов эволюции современной дипломатической службы",
      deadline: "до 25 ноября 23:59",
      literature: "Введение в специальность «Международные отношения» / под ред. проф. Зуляра Ю.А., с. 42–85",
    },
    brs_points: 94,
  },
  {
    id: "isu-mon-2",
    discipline: "Введение в специальность",
    kind: "practice",
    weekday: 1,
    start_time: "11:50",
    end_time: "13:20",
    room: "ауд. 320",
    teacher: "преп. Середкина А.М.",
    teacher_info: {
      name: "Середкина Анна Михайловна",
      title: "Преподаватель",
      department: "Кафедра мировой истории и международных отношений",
      email: "seredkina.a@isu.ru",
      consultation: "Среда, 12:00 – 13:30, ауд. 315",
    },
    homework: {
      task: "Анализ кейса: Двусторонние соглашения в восточноазиатском регионе",
      deadline: "до 26 ноября 18:00",
      literature: "Хрестоматия по международным отношениям, Т. 1, статьи 4–7",
    },
    brs_points: 90,
  },
  {
    id: "isu-mon-3",
    discipline: "История мировой культуры",
    kind: "seminar",
    weekday: 1,
    start_time: "13:50",
    end_time: "15:20",
    room: "ауд. 320",
    teacher: "проф. Костров А.В.",
    parity: "all",
    teacher_info: {
      name: "Костров Александр Валерьевич",
      title: "Доктор исторических наук, профессор",
      department: "Кафедра истории и методики ИГУ",
      email: "kostrov.a@isu.ru",
      consultation: "Понедельник, 15:30 – 17:00, ауд. 320",
    },
    homework: {
      task: "Подготовить эссе по концепции Вестфальского мира (1648 г.) и зарождению суверенных государств",
      deadline: "до 27 ноября 23:59",
      literature: "История мировых цивилизаций и культур / Костров А.В., с. 112–148",
    },
    brs_points: 95,
  },

  // Вторник (2)
  {
    id: "isu-tue-1",
    discipline: "История России",
    kind: "practice",
    weekday: 2,
    start_time: "10:10",
    end_time: "11:40",
    room: "ауд. 307",
    teacher: "доц. Себекин С.А.",
    teacher_info: {
      name: "Себекин Сергей Александрович",
      title: "Кандидат исторических наук, доцент",
      department: "Кафедра истории России",
      email: "sebekin.s@isu.ru",
      consultation: "Четверг, 12:00 – 13:30, ауд. 307",
    },
    homework: {
      task: "Доклад: Внешнеполитическая доктрина Российской империи в XVIII веке",
      deadline: "до 26 ноября 10:00",
      literature: "Отечественная история / Себекин С.А., с. 95–130",
    },
    brs_points: 88,
  },
  {
    id: "isu-tue-2",
    discipline: "Безопасность жизнедеятельности",
    kind: "practice",
    weekday: 2,
    start_time: "11:50",
    end_time: "13:20",
    room: "ауд. 307",
    teacher: "ст.преп. Юрьева А.А.",
    parity: "even",
    teacher_info: {
      name: "Юрьева Алена Александровна",
      title: "Старший преподаватель",
      department: "Кафедра экологии и безопасности жизнедеятельности",
      email: "yurieva.a@isu.ru",
      consultation: "Пятница, 14:00 – 15:00, ауд. 105",
    },
    homework: {
      task: "Решение ситуационных задач по эвакуации при трансграничных ЧС техногенного характера",
      deadline: "до 28 ноября 20:00",
      literature: "Основы безопасности жизнедеятельности в городской среде, с. 34–56",
    },
    brs_points: 92,
  },
  {
    id: "isu-tue-3",
    discipline: "Иностранный язык (английский)",
    kind: "practice",
    weekday: 2,
    start_time: "13:50",
    end_time: "15:20",
    room: "ауд. 233",
    teacher: "ст.преп. Алексеева Е.Е.",
    teacher_info: {
      name: "Алексеева Екатерина Евгеньевна",
      title: "Старший преподаватель",
      department: "Кафедра иностранных языков гуманитарных направлений",
      email: "alekseeva.e@isu.ru",
      consultation: "Вторник, 15:30 – 16:30, ауд. 233",
    },
    homework: {
      task: "Diplomatic Vocabulary: Unit 4 Texts A & B, prepare summary and glossary",
      deadline: "до 26 ноября 13:00",
      literature: "English for International Relations / Алексеева Е.Е., pp. 64–78",
    },
    brs_points: 96,
  },
  {
    id: "isu-tue-4",
    discipline: "Информационно-библиографическая культура",
    kind: "practice",
    weekday: 2,
    start_time: "15:30",
    end_time: "17:00",
    room: "ул. Лермонтова, 124, НБ ИГУ",
    teacher: "преп. Шахнович А.Г.",
    teacher_info: {
      name: "Шахнович Алефтина Геннадьевна",
      title: "Преподаватель, библиограф Научной библиотеки ИГУ",
      department: "Научная библиотека ИГУ имени В.Г. Распутина",
      email: "shakhnovich.a@isu.ru",
      consultation: "Среда, 10:00 – 12:00, Зал электронных ресурсов НБ ИГУ",
    },
    homework: {
      task: "Составить библиографический список по ГОСТ Р 7.0.100-2018 из 15 источников по теме курсового исследования",
      deadline: "до 30 ноября 18:00",
      literature: "Методические указания по библиографическому описанию документов, НБ ИГУ, 2025",
    },
    brs_points: 91,
  },

  // Среда (3)
  {
    id: "isu-wed-1",
    discipline: "Основы российской государственности",
    kind: "lecture",
    weekday: 3,
    start_time: "11:50",
    end_time: "13:20",
    room: "ауд. 329",
    teacher: "проф. Зуляр Ю.А.",
    parity: "odd",
    teacher_info: {
      name: "Зуляр Юрий Анатольевич",
      title: "Доктор исторических наук, профессор, заведующий кафедрой",
      department: "Кафедра политологии, истории и регионоведения",
      email: "zulyar.y@isu.ru",
      consultation: "Среда, 14:00 – 15:30, ауд. 329",
    },
    homework: {
      task: "Подготовить тезисы к дискуссии: Геополитический код и цивилизационная идентичность России",
      deadline: "до 27 ноября 11:00",
      literature: "Основы российской государственности: Учебник для вузов / под ред. Зуляра Ю.А., гл. 3",
    },
    brs_points: 93,
  },
  {
    id: "isu-wed-1b",
    discipline: "Элективные дисциплины по физкультуре и спорту",
    kind: "practice",
    weekday: 3,
    start_time: "11:50",
    end_time: "13:20",
    room: "с/зал, ул. Ленина, 8",
    teacher: "доц. Плотникова И.И.",
    parity: "even",
    teacher_info: {
      name: "Плотникова Ирина Ивановна",
      title: "Доцент кафедры физического воспитания",
      department: "Кафедра физической культуры и спорта",
      email: "plotnikova.i@isu.ru",
      consultation: "Пятница, 10:00 – 11:30, спорткомплекс Ленина, 8",
    },
    homework: {
      task: "Сдача нормативов силовой выносливости и функционального тестирования",
      deadline: "до 29 ноября",
      literature: "Нормативы ОФП ИГУ для 1 курса, 2026",
    },
    brs_points: 100,
  },
  {
    id: "isu-wed-2",
    discipline: "Иностранный язык (английский)",
    kind: "practice",
    weekday: 3,
    start_time: "13:50",
    end_time: "15:20",
    room: "ауд. 233",
    teacher: "ст.преп. Алексеева Е.Е.",
    teacher_info: {
      name: "Алексеева Екатерина Евгеньевна",
      title: "Старший преподаватель",
      department: "Кафедра иностранных языков",
      email: "alekseeva.e@isu.ru",
      consultation: "Вторник, 15:30 – 16:30, ауд. 233",
    },
    homework: {
      task: "Presentations: Regional Security Organizations (ASEAN, SCO, BRICS)",
      deadline: "до 28 ноября 12:00",
      literature: "International Security Studies Readings, Oxford, 2024",
    },
    brs_points: 96,
  },
  {
    id: "isu-wed-3",
    discipline: "Политология",
    kind: "lecture",
    weekday: 3,
    start_time: "15:30",
    end_time: "17:00",
    room: "ауд. 233",
    teacher: "доц. Рыбалко М.Л.",
    teacher_info: {
      name: "Рыбалко Михаил Леонидович",
      title: "Кандидат исторических наук, доцент",
      department: "Кафедра политологии",
      email: "rybalko.m@isu.ru",
      consultation: "Четверг, 14:00 – 15:30, ауд. 233",
    },
    homework: {
      task: "Сравнительный анализ политических систем: президентская, парламентская и смешанная республики",
      deadline: "до 29 ноября 15:00",
      literature: "Политология: классические и современные теории / Рыбалко М.Л., с. 78–110",
    },
    brs_points: 89,
  },
  {
    id: "isu-wed-4",
    discipline: "Основы российской государственности",
    kind: "practice",
    weekday: 3,
    start_time: "17:10",
    end_time: "18:40",
    room: "ауд. 323",
    teacher: "проф. Зуляр Ю.А.",
    teacher_info: {
      name: "Зуляр Юрий Анатольевич",
      title: "Доктор исторических наук, профессор",
      department: "Кафедра политологии",
      email: "zulyar.y@isu.ru",
      consultation: "Среда, 14:00 – 15:30, ауд. 329",
    },
    homework: {
      task: "Кейс-стади: Федеративное устройство России и конституционные основы разделения властей",
      deadline: "до 29 ноября 20:00",
      literature: "Конституция РФ с комментариями, главы 1–3",
    },
    brs_points: 92,
  },

  // Четверг (4)
  {
    id: "isu-thu-1",
    discipline: "История России",
    kind: "lecture",
    weekday: 4,
    start_time: "08:30",
    end_time: "10:00",
    room: "Дистанционно (портал Educa ИГУ)",
    teacher: "доц. Метелкина Л.Н., доц. Шмидт С.Ф.",
    teacher_info: {
      name: "Шмидт Сергей Федорович / Метелкина Лариса Николаевна",
      title: "Кандидаты исторических наук, доценты",
      department: "Кафедра истории России ИГУ",
      email: "schmidt.s@isu.ru",
      consultation: "Вторник, 16:00 – 17:30 (онлайн в Zoom / ауд. 307)",
    },
    homework: {
      task: "Тестирование по разделу «Эпоха Петра Великого и модернизация государства» на портале Educa (код e23yky)",
      deadline: "до 28 ноября 23:59",
      literature: "Лекционный курс на платформе educa.isu.ru, раздел 4",
    },
    brs_points: 91,
    change: {
      reason: "Дистанционное подключение через портал Educa ИГУ (код доступа к курсу: e23yky, тесты 3evfuj)",
    },
  },
  {
    id: "isu-thu-2",
    discipline: "Безопасность жизнедеятельности",
    kind: "lecture",
    weekday: 4,
    start_time: "10:10",
    end_time: "11:40",
    room: "Дистанционно (портал Educa)",
    teacher: "доц. Деденко М.М.",
    parity: "odd",
    teacher_info: {
      name: "Деденко Михаил Михайлович",
      title: "Кандидат технических наук, доцент",
      department: "Кафедра БЖД",
      email: "dedenko.m@isu.ru",
      consultation: "Среда, 15:00 – 16:30, Educa",
    },
    homework: {
      task: "Прохождение контрольного тестирования по защите населения в условиях радиационной опасности (код vtfztd)",
      deadline: "до 29 ноября 18:00",
      literature: "Электронный курс БЖД на Educa ИГУ",
    },
    brs_points: 90,
    change: {
      reason: "Дистанционная лекция на портале Educa (код курса: vtfztd)",
    },
  },
  {
    id: "isu-thu-2b",
    discipline: "Физическая культура и спорт",
    kind: "lecture",
    weekday: 4,
    start_time: "10:10",
    end_time: "11:40",
    room: "Дистанционно (Educa)",
    teacher: "доц. Плотникова И.И.",
    parity: "even",
    teacher_info: {
      name: "Плотникова Ирина Ивановна",
      title: "Доцент",
      department: "Кафедра физкультуры",
      email: "plotnikova.i@isu.ru",
      consultation: "Пятница, 10:00 – 11:30, с/зал ул. Ленина, 8",
    },
    homework: {
      task: "Тест по методике самостоятельных занятий и самоконтролю (код zf26ec)",
      deadline: "до 29 ноября 20:00",
      literature: "Теория и методика физического воспитания, лекции на Educa",
    },
    brs_points: 98,
    change: {
      reason: "Теоретический курс в системе Educa (код доступа: zf26ec)",
    },
  },

  // Пятница (5)
  {
    id: "isu-fri-1",
    discipline: "Элективные дисциплины по физической культуре",
    kind: "practice",
    weekday: 5,
    start_time: "11:50",
    end_time: "13:20",
    room: "с/зал, ул. Ленина, 8",
    teacher: "доц. Плотникова И.И.",
    teacher_info: {
      name: "Плотникова Ирина Ивановна",
      title: "Доцент кафедры физического воспитания",
      department: "Кафедра физической культуры и спорта",
      email: "plotnikova.i@isu.ru",
      consultation: "Пятница, 10:00 – 11:30, спорткомплекс Ленина, 8",
    },
    homework: {
      task: "Практическое занятие: совершенствование техники игровых видов спорта (волейбол/баскетбол)",
      deadline: "на занятии 28 ноября",
      literature: "Правила соревнований по спортивным играм, ИГУ 2025",
    },
    brs_points: 100,
  },
  {
    id: "isu-fri-2",
    discipline: "Мировая история",
    kind: "lecture",
    weekday: 5,
    start_time: "13:50",
    end_time: "15:20",
    room: "ауд. 307",
    teacher: "доц. Матвеева Е.А.",
    teacher_info: {
      name: "Матвеева Елизавета Аркадьевна",
      title: "Кандидат исторических наук, декан исторического факультета, доцент",
      department: "Кафедра мировой истории и международных отношений",
      email: "matveeva.e@isu.ru",
      consultation: "Понедельник, 14:00 – 16:00, деканат ИФ (ауд. 301)",
    },
    homework: {
      task: "Подготовить развернутый историографический обзор концепций падения Римской империи",
      deadline: "до 30 ноября 23:59",
      literature: "История Древнего мира и Средних веков / Матвеева Е.А., с. 210–245",
    },
    brs_points: 95,
  },
  {
    id: "isu-fri-3",
    discipline: "Мировая история",
    kind: "practice",
    weekday: 5,
    start_time: "15:30",
    end_time: "17:00",
    room: "ауд. 307",
    teacher: "ст.преп. Уткина Н.Е.",
    teacher_info: {
      name: "Уткина Надежда Евгеньевна",
      title: "Старший преподаватель",
      department: "Кафедра мировой истории и международных отношений",
      email: "utkina.n@isu.ru",
      consultation: "Пятница, 17:00 – 18:00, ауд. 307",
    },
    homework: {
      task: "Семинар: Анализ средневековых феодальных грамот и хартий вольностей",
      deadline: "на семинаре 28 ноября",
      literature: "Практикум по истории средних веков / сост. Уткина Н.Е., док. № 3–5",
    },
    brs_points: 92,
  },
];

export const SCHEDULE_CD_23_1: LessonItem[] = [
  // Понедельник (1)
  {
    id: "cd-mon-1",
    discipline: "Математический анализ",
    kind: "lecture",
    weekday: 1,
    start_time: "09:00",
    end_time: "10:30",
    room: "ауд. 302",
    teacher: "Смирнов А.А.",
    teacher_info: {
      name: "Смирнов Алексей Алексеевич",
      title: "Кандидат физико-математических наук, доцент",
      department: "Кафедра высшей математики и информатики",
      email: "smirnov.a@dekanat.fake",
      consultation: "Вторник, 15:00 – 16:30, ауд. 302",
    },
    homework: {
      task: "Решить типовые задачи на вычисление пределов и производных функций (вариант 3, № 14–28)",
      deadline: "до 25 ноября 23:59",
      literature: "Сборник задач по матанализу / Кудрявцев Л.Д., с. 54–62",
    },
    brs_points: 90,
  },
  {
    id: "cd-mon-2",
    discipline: "Базы данных и SQL",
    kind: "lab",
    weekday: 1,
    start_time: "10:45",
    end_time: "12:15",
    room: "комп. класс 2",
    teacher: "Петров П.П.",
    teacher_info: {
      name: "Петров Петр Петрович",
      title: "Старший преподаватель, Lead Database Architect",
      department: "Кафедра информационных систем",
      email: "petrov.p@dekanat.fake",
      consultation: "Среда, 14:00 – 15:30, ауд. 410",
    },
    homework: {
      task: "Разработать DDL-схему с составными внешними ключами, индексами B-Tree и RLS-политиками",
      deadline: "до 26 ноября 18:00",
      literature: "PostgreSQL 17 Administration & Design CookBook, гл. 4–6",
    },
    brs_points: 95,
    change: {
      new_room: "ауд. 410",
      reason: "Плановая профилактика компьютерного класса 2",
    },
  },

  // Вторник (2)
  {
    id: "cd-tue-1",
    discipline: "Проектирование веб-систем",
    kind: "seminar",
    weekday: 2,
    start_time: "13:00",
    end_time: "14:30",
    room: "ауд. 415",
    teacher: "Волков В.В.",
    teacher_info: {
      name: "Волков Василий Васильевич",
      title: "Доцент, архитектор распределенных систем",
      department: "Кафедра программной инженерии",
      email: "volkov.v@dekanat.fake",
      consultation: "Четверг, 12:00 – 13:30, ауд. 415",
    },
    homework: {
      task: "Спроектировать REST/GraphQL API контракт и архитектурную диаграмму Mermaid C4 Level 2",
      deadline: "до 27 ноября 20:00",
      literature: "Designing Data-Intensive Applications / Kleppmann M., pp. 110–145",
    },
    brs_points: 94,
  },

  // Среда (3)
  {
    id: "cd-wed-1",
    discipline: "Алгоритмы и структуры данных",
    kind: "lecture",
    weekday: 3,
    start_time: "09:00",
    end_time: "10:30",
    room: "ауд. 210",
    teacher: "Иванов И.И.",
    teacher_info: {
      name: "Иванов Иван Иванович",
      title: "Кандидат технических наук, доцент",
      department: "Кафедра алгоритмизации и математической кибернетики",
      email: "ivanov.i@dekanat.fake",
      consultation: "Понедельник, 11:00 – 12:30, ауд. 210",
    },
    homework: {
      task: "Реализация красно-черного дерева и алгоритма Дейкстры с кучей Фибоначчи",
      deadline: "до 28 ноября 23:59",
      literature: "Алгоритмы: построение и анализ / Кормен Т., Лейзерсон Ч., гл. 13, 24",
    },
    brs_points: 96,
    change: {
      cancelled: true,
      reason: "Участие преподавателя в конференции МГИМО",
    },
  },

  // Четверг (4)
  {
    id: "cd-thu-1",
    discipline: "Машинное обучение",
    kind: "seminar",
    weekday: 4,
    start_time: "10:45",
    end_time: "12:15",
    room: "ауд. 305",
    teacher: "Ковалева Н.С.",
    teacher_info: {
      name: "Ковалева Надежда Сергеевна",
      title: "PhD in Machine Learning, доцент",
      department: "Кафедра искусственного интеллекта",
      email: "kovaleva.n@dekanat.fake",
      consultation: "Пятница, 13:00 – 14:30, ауд. 305",
    },
    homework: {
      task: "Обучить градиентный бустинг и провести кросс-валидацию с оценкой метрик ROC-AUC и F1",
      deadline: "до 29 ноября 18:00",
      literature: "Hands-On Machine Learning with Scikit-Learn, Keras and TensorFlow, гл. 7",
    },
    brs_points: 92,
  },

  // Пятница (5)
  {
    id: "cd-fri-1",
    discipline: "Информационная безопасность",
    kind: "lecture",
    weekday: 5,
    start_time: "12:30",
    end_time: "14:00",
    room: "ауд. 101",
    teacher: "Сергеев С.С.",
    teacher_info: {
      name: "Сергеев Сергей Сергеевич",
      title: "Эксперт по информационной безопасности, доцент",
      department: "Кафедра информационной безопасности",
      email: "sergeev.s@dekanat.fake",
      consultation: "Вторник, 10:00 – 11:30, ауд. 101",
    },
    homework: {
      task: "Аудит протоколов взаимной аутентификации TLS 1.3 и криптографических сертификатов X.509",
      deadline: "до 30 ноября 23:59",
      literature: "Прикладная криптография и безопасность веб-приложений, с. 140–185",
    },
    brs_points: 93,
  },
];

export function getLessonsByGroup(groupId: string, weekday: number): LessonItem[] {
  const pool = groupId === "07131-DB" ? SCHEDULE_07131_DB : SCHEDULE_CD_23_1;
  return pool.filter((l) => l.weekday === weekday);
}

export function getAllLessons(groupId: string): LessonItem[] {
  return groupId === "07131-DB" ? SCHEDULE_07131_DB : SCHEDULE_CD_23_1;
}

export function getLessonById(id: string): LessonItem | undefined {
  return (
    SCHEDULE_07131_DB.find((l) => l.id === id) ||
    SCHEDULE_CD_23_1.find((l) => l.id === id)
  );
}
