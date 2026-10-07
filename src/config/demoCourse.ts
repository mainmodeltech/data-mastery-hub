/**
 * demoCourse.ts — données de démonstration du Lot 5 (cours, progression, tableau de bord).
 * Utilisées UNIQUEMENT quand le backend n'expose pas encore les endpoints (voir
 * src/types/course.type.ts) ; l'UI affiche alors un bandeau « données de démonstration ».
 * Chiffres alignés sur docs/design/screens/app (36 éléments, 23 terminés, 64 %).
 */
import type {
  CourseContent,
  CourseModule,
  DashboardData,
  Lesson,
  LearnerCourse,
  LessonProgress,
} from "@/types/course.type";

export const DEMO_FORMATION_ID = "demo-power-bi";

let seq = 0;
function lesson(title: string, partial: Partial<Lesson> = {}): Lesson {
  seq += 1;
  return {
    id: `demo-l${seq}`,
    order: seq,
    title,
    type: "VIDEO",
    status: "PUBLISHED",
    durationSeconds: 480 + ((seq * 37) % 300),
    resources: [],
    ...partial,
  };
}

function quiz(title: string, questionCount = 10): Lesson {
  return lesson(title, {
    type: "QUIZ",
    durationSeconds: null,
    quiz: { questionCount, passThreshold: 70, maxAttempts: 3 },
  });
}

function mod(order: number, title: string, lessons: Lesson[]): CourseModule {
  return { id: `demo-m${order}`, order, title, lessons: lessons.map((l, i) => ({ ...l, order: i + 1 })) };
}

function lesson34(): Lesson {
  return lesson("3.4 CALCULATE et contexte", {
    subtitle: "CALCULATE et le contexte de filtre",
    durationSeconds: 760,
    description:
      "Comprendre comment CALCULATE modifie le contexte de filtre, et pourquoi c'est la fonction centrale de DAX.",
    resources: [
      { id: "demo-r1", name: "Support — CALCULATE expliqué", fileType: "PDF", sizeLabel: "12 pages · 1,4 Mo", url: null },
      { id: "demo-r2", name: "ventes_agences.xlsx — jeu de données", fileType: "XLSX", note: "Utilisé dans l'exercice", url: null },
      { id: "demo-r3", name: "Correction de l'exercice 3.4", fileType: "PBIX", note: "Disponible après le quiz", url: null, lockedUntilQuiz: true },
    ],
  });
}

function buildModules(): CourseModule[] {
  seq = 0;
  return [
    mod(1, "Module 1 — Power Query", [
      lesson("1.1 Se connecter aux sources"),
      lesson("1.2 Nettoyer un export bancaire"),
      lesson("1.3 Fusionner et ajouter des requêtes"),
      lesson("1.4 Colonnes personnalisées"),
      lesson("1.5 Types de données et erreurs"),
      lesson("1.6 Dépivoter des colonnes"),
      lesson("1.7 Paramètres et sources dynamiques"),
      lesson("1.8 Dossiers de fichiers"),
      lesson("1.9 Bonnes pratiques d'actualisation"),
      lesson("1.10 Atelier guidé"),
      quiz("Quiz Module 1"),
    ]),
    mod(2, "Module 2 — Modélisation", [
      lesson("2.1 Le modèle en étoile"),
      lesson("2.2 Relations et cardinalité"),
      lesson("2.3 Tables de dimension"),
      lesson("2.4 Table calendrier"),
      lesson("2.5 Hiérarchies"),
      lesson("2.6 Sens de filtrage"),
      lesson("2.7 Rôles et sécurité (RLS)"),
      lesson("2.8 Atelier guidé"),
      quiz("Quiz Module 2"),
    ]),
    mod(3, "Module 3 — Mesures DAX", [
      lesson("3.1 Mesures vs colonnes"),
      lesson("3.2 SUM, AVERAGE, COUNTROWS"),
      lesson("3.3 Fonctions de temps"),
      lesson34(),
      lesson("3.5 Atelier guidé"),
      quiz("Quiz Module 3"),
    ]),
    mod(4, "Module 4 — Visualisation", [
      lesson("4.1 Choisir le bon visuel"),
      lesson("4.2 Interactions et segments"),
      lesson("4.3 Mise en forme conditionnelle"),
      lesson("4.4 Infobulles et drill-through"),
      lesson("4.5 Storytelling de données"),
      lesson("4.6 Atelier guidé"),
      quiz("Quiz Module 4"),
    ]),
    mod(5, "Module 5 — Projet final", [
      lesson("5.1 Cahier des charges du projet"),
      lesson("5.2 Dépôt du brouillon", { type: "RESOURCE", durationSeconds: null }),
      lesson("5.3 Présentation devant le jury", { type: "LIVE", durationSeconds: null }),
    ]),
  ];
}

export function buildDemoContent(formationId: string = DEMO_FORMATION_ID, title = "Power BI"): CourseContent {
  return {
    formationId,
    title,
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    settings: { sequentialUnlock: true, accessDuration: "12_MONTHS" },
    certificateRules: {
      lessonsCompletedPercent: 80,
      quizPassPercent: 70,
      livePresencePercent: 75,
      finalProjectValidated: true,
      template: "Standard co-signé",
    },
    modules: buildModules(),
  };
}

export function buildDemoCourse(formationId: string = DEMO_FORMATION_ID, title = "Power BI"): LearnerCourse {
  const content = buildDemoContent(formationId, title);
  const done = new Set<string>();
  for (const m of content.modules.slice(0, 2)) m.lessons.forEach((l) => done.add(l.id));
  content.modules[2].lessons.slice(0, 3).forEach((l) => done.add(l.id));
  const current = content.modules[2].lessons[3];
  const progress: LessonProgress[] = [
    ...Array.from(done).map((lessonId) => ({ lessonId, completed: true, positionSeconds: 0 })),
    { lessonId: current.id, completed: false, positionSeconds: 268 },
  ];
  return { content, cohortLabel: "Cohorte octobre 2026", trainerName: "[Nom du formateur]", progress };
}

export function buildDemoDashboard(): DashboardData {
  const course = buildDemoCourse();
  const current = course.content.modules[2].lessons[3];
  return {
    firstName: "Awa",
    streakDays: 4,
    stats: { hoursWatched: 18, lessonsDone: 23, lessonsTotal: 36, averageQuizScore: 82, certificates: 1 },
    resume: {
      formationId: course.content.formationId,
      lessonId: current.id,
      courseTitle: "Power BI",
      moduleIndex: 3,
      moduleCount: 5,
      lessonTitle: "CALCULATE et le contexte de filtre",
      lessonLabel: "3.4",
      durationSeconds: current.durationSeconds ?? 760,
      positionSeconds: 268,
      percent: 64,
    },
    courses: [
      { formationId: course.content.formationId, title: "Power BI", providerLabel: "Model Technologie · Cohorte oct. 2026", progressPercent: 64, statusNote: "64 % · prochain live jeudi", status: "IN_PROGRESS" },
      { formationId: "demo-excel-vba", title: "Excel VBA", providerLabel: "Model Technologie · Accès à vie", progressPercent: 100, statusNote: "100 % · certificat disponible", status: "CERTIFIED" },
      { formationId: "demo-psm1", title: "Préparation PSM I", providerLabel: "[Partenaire] · démarre le [date]", progressPercent: 0, statusNote: "0 % · accès le [date]", status: "UPCOMING" },
    ],
    todos: [
      { id: "t1", title: "Quiz Module 3 — DAX", subtitle: "10 questions · 70 % requis", badge: "Avant ven.", tone: "warning" },
      { id: "t2", title: "Déposer le brouillon du projet final", subtitle: "Tableau de bord .pbix", badge: "Avant le 15", tone: "warning" },
      { id: "t3", title: "Télécharger le jeu de données du Module 4", subtitle: "ventes_agences.xlsx", badge: "Nouveau", tone: "info" },
    ],
    certificateReady: { title: "Excel VBA" },
    lives: [
      { id: "lv1", startsAt: "2026-10-08T19:00:00", title: "Atelier DAX — questions/réponses", timeLabel: "19h00 – 20h30", place: "Google Meet", joinUrl: null },
      { id: "lv2", startsAt: "2026-10-10T10:00:00", title: "Revue des projets finaux", timeLabel: "10h00 – 12h00", place: "Dakar + en ligne", joinUrl: null },
    ],
  };
}
