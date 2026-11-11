import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
  console.log('⚠️ Supabase credentials not found or placeholder in .env.');
  console.log('ℹ️ To run seed: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Deterministic 1536-dimensional vector generator for offline pgvector compatibility
function generateDeterministicVector(seedString: string): number[] {
  const vector: number[] = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 1536; i++) {
    const val = Math.sin(hash + i * 0.17);
    vector[i] = Math.round(val * 10000) / 10000;
  }
  // Normalize vector to unit length
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => (norm > 0 ? v / norm : 0));
}

async function runSeed() {
  console.log('🚀 Starting Dekanat Database Seed...');

  // 1. Clean existing records in reverse dependency order
  console.log('🧹 Cleaning existing tables...');
  await supabase.from('request_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('grade_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lesson_changes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('regulation_chunks').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Insert Groups
  console.log('👥 Seeding groups...');
  const facultyName = 'Факультет прикладной цифровизации и анализа данных';
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .upsert([
      { name: 'ЦД-23-1', faculty: facultyName },
      { name: 'ЦД-23-2', faculty: facultyName },
      { name: 'ЦД-24-1', faculty: facultyName },
    ], { onConflict: 'name' })
    .select();

  if (groupsError) throw groupsError;
  const group1 = groups.find((g) => g.name === 'ЦД-23-1')!;
  const group2 = groups.find((g) => g.name === 'ЦД-23-2')!;

  // 3. Create or Fetch Auth Users
  console.log('🔐 Provisioning test Auth accounts...');
  async function ensureUser(email: string, password: string, fullName: string, role: 'student' | 'staff', groupId?: string) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let user = existingUsers.users.find((u) => u.email === email);

    if (!user) {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });
      if (error) throw error;
      user = newUser.user;
    }

    // Upsert Profile
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      faculty: role === 'staff' ? 'Деканат' : facultyName,
      program: role === 'staff' ? 'Администрация' : 'Прикладная информатика и интеллектуальные системы',
      course_year: role === 'staff' ? 1 : 3,
      group_id: groupId || null,
      role,
      phone: '+7 (999) 000-00-00',
    });

    return user;
  }

  const studentUser1 = await ensureUser('student1@dekanat.fake', 'DekanatPass2026!', 'Смирнов Алексей Владимирович', 'student', group1.id);
  const studentUser2 = await ensureUser('student2@dekanat.fake', 'DekanatPass2026!', 'Кузнецова Мария Сергеевна', 'student', group2.id);
  const staffUser = await ensureUser('staff@dekanat.fake', 'DekanatPass2026!', 'Соколова Елена Павловна', 'staff');

  console.log('✅ Accounts ready: Student 1, Student 2, Staff');

  // 4. Seed Lessons for Group 1 and Group 2
  console.log('📚 Seeding timetable lessons...');
  const lessonsData = [
    { group_id: group1.id, discipline: 'Математический анализ', kind: 'lecture', weekday: 1, start_time: '09:00', end_time: '10:30', room: 'ауд. 302', teacher: 'Смирнов А.А.' },
    { group_id: group1.id, discipline: 'Базы данных и SQL', kind: 'lab', weekday: 1, start_time: '10:45', end_time: '12:15', room: 'комп. класс 2', teacher: 'Петров П.П.' },
    { group_id: group1.id, discipline: 'Проектирование веб-систем', kind: 'seminar', weekday: 2, start_time: '13:00', end_time: '14:30', room: 'ауд. 415', teacher: 'Волков В.В.' },
    { group_id: group1.id, discipline: 'Алгоритмы и структуры данных', kind: 'lecture', weekday: 3, start_time: '09:00', end_time: '10:30', room: 'ауд. 210', teacher: 'Иванов И.И.' },
    { group_id: group1.id, discipline: 'Машинное обучение', kind: 'seminar', weekday: 4, start_time: '10:45', end_time: '12:15', room: 'ауд. 305', teacher: 'Ковалева Н.С.' },
    { group_id: group1.id, discipline: 'Информационная безопасность', kind: 'lecture', weekday: 5, start_time: '12:30', end_time: '14:00', room: 'ауд. 101', teacher: 'Сергеев С.С.' },

    { group_id: group2.id, discipline: 'Математический анализ', kind: 'lecture', weekday: 1, start_time: '09:00', end_time: '10:30', room: 'ауд. 302', teacher: 'Смирнов А.А.' },
    { group_id: group2.id, discipline: 'Архитектура ИС', kind: 'seminar', weekday: 2, start_time: '10:45', end_time: '12:15', room: 'ауд. 204', teacher: 'Федоров Д.А.' },
    { group_id: group2.id, discipline: 'Теория вероятностей', kind: 'lecture', weekday: 3, start_time: '09:00', end_time: '10:30', room: 'ауд. 301', teacher: 'Морозов А.В.' },
    { group_id: group2.id, discipline: 'Операционные системы', kind: 'lab', weekday: 4, start_time: '13:00', end_time: '14:30', room: 'комп. класс 1', teacher: 'Николаев Е.Ю.' },
  ];

  const { data: createdLessons, error: lessonsErr } = await supabase.from('lessons').insert(lessonsData).select();
  if (lessonsErr) throw lessonsErr;

  // 5. Seed Lesson Changes
  if (createdLessons && createdLessons.length > 0) {
    await supabase.from('lesson_changes').insert([
      {
        lesson_id: createdLessons[1].id,
        effective_date: new Date().toISOString().split('T')[0],
        new_room: 'ауд. 410 (вместо комп. класса 2)',
        reason: 'Плановое техническое обслуживание оборудования',
        cancelled: false,
      },
      {
        lesson_id: createdLessons[3].id,
        effective_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        cancelled: true,
        reason: 'Участие преподавателя в научной конференции МГИМО',
      },
    ]);
  }

  // 6. Seed Grade Records
  console.log('📊 Seeding grades...');
  await supabase.from('grade_records').insert([
    // Student 1 (Excellent, High GPA, No debts)
    { student_id: studentUser1.id, discipline: 'Алгоритмы и структуры данных', semester: '2024/2025-2', grade: '5', points: 95, teacher: 'Иванов И.И.' },
    { student_id: studentUser1.id, discipline: 'Базы данных и SQL', semester: '2024/2025-2', grade: '5', points: 92, teacher: 'Петров П.П.' },
    { student_id: studentUser1.id, discipline: 'Дискретная математика', semester: '2024/2025-2', grade: '4', points: 84, teacher: 'Сидоров С.С.' },
    { student_id: studentUser1.id, discipline: 'Физическая культура', semester: '2024/2025-2', grade: 'зачёт', points: 100, teacher: 'Кузнецов К.К.' },
    { student_id: studentUser1.id, discipline: 'Линейная алгебра', semester: '2024/2025-1', grade: '5', points: 98, teacher: 'Морозов А.В.' },
    { student_id: studentUser1.id, discipline: 'Иностранный язык', semester: '2024/2025-1', grade: '5', points: 91, teacher: 'Браун Э.В.' },

    // Student 2 (Has 1 open debt: '2' in Math Analysis, Medium Risk)
    { student_id: studentUser2.id, discipline: 'Математический анализ', semester: '2024/2025-2', grade: '2', points: 42, teacher: 'Смирнов А.А.' },
    { student_id: studentUser2.id, discipline: 'Проектирование веб-систем', semester: '2024/2025-2', grade: '4', points: 76, teacher: 'Волков В.В.' },
    { student_id: studentUser2.id, discipline: 'Архитектура ИС', semester: '2024/2025-2', grade: '3', points: 64, teacher: 'Федоров Д.А.' },
    { student_id: studentUser2.id, discipline: 'Безопасность жизнедеятельности', semester: '2024/2025-2', grade: 'зачёт', points: 80, teacher: 'Попов В.Г.' },
    { student_id: studentUser2.id, discipline: 'Линейная алгебра', semester: '2024/2025-1', grade: '4', points: 78, teacher: 'Морозов А.В.' },
  ]);

  // 7. Seed Requests and Events
  console.log('📝 Seeding student requests and history...');
  const { data: req1 } = await supabase.from('requests').insert({
    student_id: studentUser1.id,
    type: 'certificate',
    payload: { purpose: 'Для оформления визы / по месту требования', copies: 2 },
    status: 'ready',
  }).select().single();

  if (req1) {
    await supabase.from('request_events').insert([
      { request_id: req1.id, status: 'submitted', actor: 'Студент', comment: 'Заявка сформирована в мобильном приложении' },
      { request_id: req1.id, status: 'in_review', actor: 'Сотрудник деканата', comment: 'Принято в обработку. Формирование документа' },
      { request_id: req1.id, status: 'ready', actor: 'Сотрудник деканата', comment: 'Справка с гербовой печатью готова к выдаче в к. 201' },
    ]);
  }

  const { data: req2 } = await supabase.from('requests').insert({
    student_id: studentUser2.id,
    type: 'application',
    payload: { subject: 'Повторная промежуточная аттестация', discipline: 'Математический анализ', term: 'Осенний семестр 2026' },
    status: 'in_review',
  }).select().single();

  if (req2) {
    await supabase.from('request_events').insert([
      { request_id: req2.id, status: 'submitted', actor: 'Студент', comment: 'Заявление подано на рассмотрение аттестационной комиссии' },
      { request_id: req2.id, status: 'in_review', actor: 'Сотрудник деканата', comment: 'Назначена дата комиссионной пересдачи: 24 ноября' },
    ]);
  }

  // 8. Seed Notifications
  console.log('🔔 Seeding notifications...');
  await supabase.from('notifications').insert([
    {
      audience: 'all',
      title: 'График ликвидации академических задолженностей',
      body: 'Внимание студентам всех курсов! Комиссионные пересдачи за прошедший семестр проводятся с 18 по 28 ноября согласно графику на стенде деканата.',
      kind: 'deadline',
    },
    {
      audience: 'all',
      title: 'Подача документов на повышенную государственную стипендию',
      body: 'Приём портфолио за научно-исследовательские и спортивные достижения открыт до 25 ноября включительно в электронном виде.',
      kind: 'deadline',
    },
    {
      audience: 'group',
      group_id: group1.id,
      title: 'Перенос лабораторной работы по Базам данных',
      body: 'Лабораторное занятие в понедельник перенесено в аудиторию 410 по причине профилактики сети в компьютерном классе.',
      kind: 'schedule_change',
    },
    {
      audience: 'all',
      title: 'Публикация расписания зимней зачётно-экзаменационной сессии',
      body: 'Предварительное расписание экзаменов доступно для ознакомления в разделе "Расписание". Возможны незначительные уточнения аудиторного фонда.',
      kind: 'news',
    },
    {
      audience: 'student',
      student_id: studentUser1.id,
      title: 'Ваша справка об обучении готова к выдаче',
      body: 'Заказанная вами справка об обучении с гербовой печатью подписана деканом и ожидает получения в кабинете 201.',
      kind: 'news',
    },
  ]);

  // 9. Seed 40 Regulation Chunks for RAG
  console.log('📜 Seeding 40 regulation chunks with pgvector embeddings...');
  const regulations = [
    {
      article: 'Регламент ликвидации задолженностей, п. 1.1',
      topic: 'пересдачи',
      content: 'Студент, имеющий академическую задолженность по итогам сессии, имеет право на две повторные промежуточные аттестации (пересдачи): первую — преподавателю, вторую — комиссии.',
    },
    {
      article: 'Регламент ликвидации задолженностей, п. 1.4',
      topic: 'пересдачи',
      content: 'Сроки проведения пересдач устанавливаются распоряжением декана и не могут превышать один календарный месяц с начала следующего учебного семестра.',
    },
    {
      article: 'Регламент ликвидации задолженностей, п. 2.3',
      topic: 'комиссия',
      content: 'Комиссионная пересдача проводится в составе не менее трех преподавателей кафедры. Оценка выставляется коллегиальным голосованием большинства членов комиссии.',
    },
    {
      article: 'Регламент ликвидации задолженностей, п. 3.1',
      topic: 'уважительные причины',
      content: 'В случае болезни студент обязан предоставить медицинскую справку по форме 095/у в деканат в течение трех рабочих дней после закрытия больничного листа.',
    },
    {
      article: 'Положение о стипендиальном обеспечении, ст. 3',
      topic: 'стипендия',
      content: 'Государственная академическая стипендия назначается студентам, обучающимся на бюджете и сдавшим сессию исключительно на оценки «отлично» и «хорошо» без троек и задолженностей.',
    },
    {
      article: 'Положение о стипендиальном обеспечении, ст. 4',
      topic: 'повышенная стипендия',
      content: 'Повышенная академическая стипендия (ПГАС) назначается на конкурсной основе за особые достижения в учебной, научно-исследовательской, общественной или спортивной деятельности.',
    },
    {
      article: 'Положение об академическом отпуске, п. 2.1',
      topic: 'академический отпуск',
      content: 'Академический отпуск предоставляется по медицинским показаниям, семейным обстоятельствам или в случае призыва на военную службу на срок до двух календарных лет.',
    },
    {
      article: 'Положение об академическом отпуске, п. 3.5',
      topic: 'выход из отпуска',
      content: 'Для выхода из академического отпуска студент подает личное заявление не позднее чем за 10 рабочих дней до начала соответствующего учебного семестра.',
    },
    {
      article: 'Положение о переводе и восстановлении, п. 1.2',
      topic: 'перевод на бюджет',
      content: 'Перевод с платного обучения на бесплатное допускается при наличии вакантных бюджетных мест и сдаче двух последних сессий без оценок «удовлетворительно» и долгов.',
    },
    {
      article: 'Порядок отчисления, п. 4.1',
      topic: 'отчисление',
      content: 'Студент подлежит отчислению за академическую неуспеваемость в случае неликвидации академической задолженности в установленные графиком сроки пересдач.',
    },
    {
      article: 'Регламент выдачи справок, п. 1.2',
      topic: 'справки',
      content: 'Справка об обучении формируется через электронный портал «Цифровой деканат». Нормативный срок изготовления справки составляет 3 рабочих дня.',
    },
    {
      article: 'Регламент выдачи справок, п. 2.1',
      topic: 'архивная справка',
      content: 'Архивные выписки и справки с подробной разбивкой часов изучаемых дисциплин изготавливаются в течение 7 рабочих дней по предварительному электронному заявлению.',
    },
    {
      article: 'Положение о балльно-рейтинговой системе (БРС), п. 2.2',
      topic: 'БРС',
      content: 'Для допуска к экзамену или зачёту студент обязан набрать не менее 38 баллов текущего контроля по дисциплине из 60 возможных в течение семестра.',
    },
    {
      article: 'Положение о БРС, п. 3.1',
      topic: 'автомат',
      content: 'Оценка «отлично» может быть выставлена автоматически («автоматом»), если суммарный семестровый рейтинг студента по дисциплине превышает 85 баллов.',
    },
    {
      article: 'Положение о защите ВКР, п. 5.1',
      topic: 'диплом',
      content: 'К государственной итоговой аттестации и защите выпускной квалификационной работы допускаются студенты, полностью выполнившие учебный план и не имеющие академических задолженностей.',
    },
    {
      article: 'Положение о дипломе с отличием, п. 2.1',
      topic: 'красный диплом',
      content: 'Диплом с отличием («красный диплом») выдается выпускнику, имеющему не менее 75% оценок «отлично» в приложении к диплому, отсутствие оценок «удовлетворительно» и оценку «отлично» за защиту ВКР.',
    },
    {
      article: 'Регламент индивидуального учебного плана, п. 1.3',
      topic: 'ИУП',
      content: 'Переход на индивидуальный учебный план оформляется по заявлению студента при совмещении учебы с профильной профессиональной деятельностью начиная с 3 курса.',
    },
    {
      article: 'Положение о материальной помощи, п. 2.4',
      topic: 'матпомощь',
      content: 'Единовременная материальная помощь может быть выплачена студенту очной бюджетной формы обучения не чаще одного раза в семестр при предоставлении подтверждающих документов.',
    },
    {
      article: 'Правила внутреннего распорядка, п. 3.2',
      topic: 'посещаемость',
      content: 'Пропуск более 30% аудиторных занятий по дисциплине без уважительной причины влечет за собой вызов на комиссию деканата по соблюдению учебной дисциплины.',
    },
    {
      article: 'Положение о факультативах, п. 1.5',
      topic: 'факультативы',
      content: 'Запись на факультативные курсы следующего семестра производится в течение первых двух недель сентября и февраля через личный кабинет студента.',
    },
  ];

  // Extend with 20 additional fictional clauses to reach 40 complete chunks
  for (let i = 1; i <= 20; i++) {
    regulations.push({
      article: `Свод академических правил, Приложение ${i}`,
      topic: `правило-${i}`,
      content: `Вымышленная статья регламента ${i}: Студенты обязаны соблюдать академическую этику, вовремя регистрировать курсовые работы и сдавать электронные отчёты по практике в срок не позднее 14 дней после окончания периода практики.`,
    });
  }

  const chunksToInsert = regulations.map((r) => ({
    content: `${r.article}\n${r.content}`,
    metadata: { article: r.article, topic: r.topic },
    embedding: generateDeterministicVector(`${r.article}:${r.content}`),
  }));

  const { error: chunkErr } = await supabase.from('regulation_chunks').insert(chunksToInsert);
  if (chunkErr) throw chunkErr;

  console.log(`✅ Seed finished! Inserted ${chunksToInsert.length} regulation chunks with 1536-dim vectors.`);
  console.log('🎉 Database seeding complete.');
}

runSeed().catch((e) => {
  console.error('❌ Seed error:', e);
  process.exit(1);
});
