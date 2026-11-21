import React from 'react';
import path from 'path';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register local Noto Sans fonts for deterministic Cyrillic rendering
const fontsDir = path.join(process.cwd(), 'public', 'fonts');
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'normal' },
    { src: path.join(fontsDir, 'NotoSans-Bold.ttf'), fontWeight: 'bold' },
  ],
});

export interface CertificateData {
  requestId: string;
  studentName: string;
  courseYear: number;
  groupName: string;
  faculty?: string;
  program?: string;
  specialization?: string;
  enrolmentOrder?: string;
  studyBasis?: string;
  studyDuration?: string;
  purpose?: string;
  issueDate?: string;
  regNumber?: string;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSans',
    fontSize: 9.5,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 45,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 4,
  },
  headerMinistry: {
    fontSize: 7.5,
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerInstitution: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerUniversity: {
    fontSize: 11,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerFaculty: {
    fontSize: 9.5,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0284c7',
    textAlign: 'center',
    marginBottom: 3,
  },
  headerContacts: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
  },
  accentLine: {
    height: 1.5,
    backgroundColor: '#0284c7',
    marginTop: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  metaLeft: {
    flexDirection: 'column',
  },
  metaRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  regNumber: {
    fontSize: 9,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  validityNotice: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  dateText: {
    fontSize: 9,
    color: '#334155',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  titleSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 3,
  },
  bodySection: {
    lineHeight: 1.55,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 8,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bulletList: {
    marginTop: 4,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    fontSize: 9,
    marginBottom: 4,
  },
  bulletLabel: {
    width: 200,
    color: '#475569',
  },
  bulletValue: {
    flex: 1,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  purposeBox: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    borderRadius: 2,
  },
  purposeLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  purposeText: {
    fontSize: 9.5,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  signaturesSection: {
    marginTop: 18,
    marginBottom: 16,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 9,
  },
  signatureRole: {
    color: '#475569',
  },
  signatureName: {
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  stampsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  // Circular Seal
  sealOuter: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 2,
    borderColor: '#1d4ed8',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-5deg)',
  },
  sealInner: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  sealCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 0.8,
    borderColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  sealTopText: {
    fontSize: 5.5,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#1d4ed8',
    textAlign: 'center',
    marginBottom: 2,
  },
  sealCenterText: {
    fontSize: 7.5,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#1d4ed8',
    textAlign: 'center',
    lineHeight: 1.1,
  },
  sealBottomText: {
    fontSize: 5,
    fontFamily: 'NotoSans',
    color: '#1d4ed8',
    textAlign: 'center',
    marginTop: 2,
  },
  // Digital Signature Stamp (ЭЦП)
  ecpBox: {
    width: 230,
    borderWidth: 1.2,
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
    borderRadius: 4,
    padding: 7,
  },
  ecpHeader: {
    fontSize: 7,
    fontFamily: 'NotoSans',
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
    borderBottomWidth: 0.8,
    borderBottomColor: '#bae6fd',
    paddingBottom: 2,
    textTransform: 'uppercase',
  },
  ecpLine: {
    fontSize: 6.5,
    fontFamily: 'NotoSans',
    color: '#0f172a',
    marginBottom: 2,
    lineHeight: 1.25,
  },
  ecpLabel: {
    color: '#0369a1',
    fontWeight: 'bold',
  },
  footer: {
    borderTopWidth: 0.8,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 2,
  },
  verificationLink: {
    fontSize: 6.5,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export function CertificateDocument({
  requestId,
  studentName,
  courseYear,
  groupName,
  faculty = 'Факультет прикладной цифровизации и анализа данных',
  program = '09.03.03 Прикладная информатика',
  specialization = 'Искусственный интеллект и большие данные',
  enrolmentOrder = '№ 412-ст от 25.08.2025 г.',
  studyBasis = 'за счет бюджетных ассигнований федерального бюджета (бюджетная)',
  studyDuration = '4 года (очная форма обучения)',
  purpose = 'по месту требования',
  issueDate,
  regNumber,
}: CertificateData) {
  const shortId = requestId.replace(/-/g, '').slice(0, 8).toUpperCase();
  const formattedRegNumber = regNumber || `№ 2026/СПР-${shortId}`;

  const formattedDate =
    issueDate ||
    new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

  return (
    <Document
      title={`Справка об обучении — ${studentName}`}
      author="Деканат ИГУ (Концепт)"
      subject="Официальная справка об обучении установленного образца"
      keywords="справка, обучение, деканат, ИГУ, ЭЦП"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          {/* University Header */}
          <View style={styles.header}>
            <Text style={styles.headerMinistry}>
              МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ
            </Text>
            <Text style={styles.headerInstitution}>
              ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ
            </Text>
            <Text style={styles.headerUniversity}>
              «ИРКУТСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ» (ИГУ)
            </Text>
            <Text style={styles.headerFaculty}>{faculty}</Text>
            <Text style={styles.headerContacts}>
              664003, г. Иркутск, ул. Карла Маркса, д. 1 • Тел.: +7 (3952) 521-000 • dekanat@isu.fake
            </Text>
          </View>

          {/* Accent Blue Line */}
          <View style={styles.accentLine} />

          {/* Registration metadata */}
          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Text style={styles.regNumber}>{formattedRegNumber}</Text>
              <Text style={styles.validityNotice}>
                Срок действия: 30 календарных дней со дня выдачи
              </Text>
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.dateText}>Дата выдачи: {formattedDate}</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>СПРАВКА ОБ ОБУЧЕНИИ</Text>
            <Text style={styles.titleSub}>Установленного образца для предоставления по месту требования</Text>
          </View>

          {/* Legal Body Statement */}
          <View style={styles.bodySection}>
            <Text style={styles.paragraph}>
              Дана <Text style={styles.bold}>{studentName}</Text> в том, что он(а) действительно является студентом{' '}
              <Text style={styles.bold}>{courseYear}-го курса</Text> очной формы обучения учебной группы{' '}
              <Text style={styles.bold}>{groupName}</Text> по направлению подготовки{' '}
              <Text style={styles.bold}>{program}</Text> (направленность/профиль «{specialization}»).
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletLabel}>• Основа обучения:</Text>
                <Text style={styles.bulletValue}>{studyBasis}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletLabel}>• Приказ о зачислении:</Text>
                <Text style={styles.bulletValue}>{enrolmentOrder}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletLabel}>• Срок освоения программы:</Text>
                <Text style={styles.bulletValue}>{studyDuration}</Text>
              </View>
            </View>

            <View style={styles.purposeBox}>
              <Text style={styles.purposeLabel}>Цель выдачи документа:</Text>
              <Text style={styles.purposeText}>Выдана для представления: {purpose}</Text>
            </View>
          </View>

          {/* Signatures of Authority */}
          <View style={styles.signaturesSection}>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureRole}>Декан факультета:</Text>
              <Text style={styles.signatureName}>проф. Костров А.В.</Text>
            </View>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureRole}>Секретарь деканата:</Text>
              <Text style={styles.signatureName}>Соколова Е.П.</Text>
            </View>
          </View>

          {/* Stamps Row: Blue Seal + Digital Signature Stamp */}
          <View style={styles.stampsContainer}>
            {/* Circular University Seal */}
            <View style={styles.sealOuter}>
              <View style={styles.sealInner}>
                <Text style={styles.sealTopText}>МИНОБРНАУКИ РОССИИ * ИГУ</Text>
                <View style={styles.sealCenter}>
                  <Text style={styles.sealCenterText}>ЦИФРОВОЙ{'\n'}ДЕКАНАТ</Text>
                </View>
                <Text style={styles.sealBottomText}>ДЛЯ СПРАВОК И ДОКУМЕНТОВ</Text>
              </View>
            </View>

            {/* Qualified Electronic Digital Signature (ЭЦП) Stamp */}
            <View style={styles.ecpBox}>
              <Text style={styles.ecpHeader}>ДОКУМЕНТ ПОДПИСАН ЭЛЕКТРОННОЙ ПОДПИСЬЮ</Text>
              <Text style={styles.ecpLine}>
                <Text style={styles.ecpLabel}>Сертификат: </Text>00E10351543E1928BA4171092F
              </Text>
              <Text style={styles.ecpLine}>
                <Text style={styles.ecpLabel}>Владелец: </Text>Деканат ИГУ (Концепт)
              </Text>
              <Text style={styles.ecpLine}>
                <Text style={styles.ecpLabel}>Действителен: </Text>с 01.09.2026 по 31.08.2027
              </Text>
            </View>
          </View>
        </View>

        {/* Footer with Contest Disclaimer & Verification */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            Концепт для конкурса MGIMO × AI Challenge. Не является официальным сервисом ИГУ. 100% вымышленные данные.
          </Text>
          <Text style={styles.verificationLink}>
            Документ ID: {requestId} • Проверка подлинности ЭЦП: https://153.51.174.89.sslip.io
          </Text>
        </View>
      </Page>
    </Document>
  );
}
