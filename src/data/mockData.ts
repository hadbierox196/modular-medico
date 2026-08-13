import type { AdminQuestion, Subject, SubjectMeta } from "../types";

export const SUBJECT_META: Record<string, SubjectMeta> = {
  anatomy: { label: "Anatomy", tag: "Structure" },
  physiology: { label: "Physiology", tag: "Function" },
  pharmacology: { label: "Pharmacology", tag: "Mechanisms" },
  pathology: { label: "Pathology", tag: "Disease" },
  biochemistry: { label: "Biochemistry", tag: "Pathways" },
  microbiology: { label: "Microbiology", tag: "Organisms" },
  forensic: { label: "Forensic Medicine", tag: "Legal" },
  community: { label: "Community Medicine", tag: "Public health" },
};

export const SUBJECTS: Subject[] = [
  {
    id: "anatomy",
    modules: [
      {
        id: "upper-limb",
        name: "Upper Limb",
        sets: [
          {
            id: "brachial-plexus",
            title: "Brachial Plexus Basics",
            free: true,
            difficulty: "medium",
            highYield: true,
            questions: [
              {
                q: "Which nerve roots contribute to the brachial plexus?",
                options: ["C5\u2013T1", "C1\u2013C5", "T1\u2013T5", "C8\u2013T4"],
                correct: 0,
                explanation:
                  "The brachial plexus arises from the anterior rami of C5\u2013T1, which reorganize into trunks, divisions, cords, and terminal branches.",
              },
              {
                q: "Injury to the axillary nerve most commonly results from:",
                options: ["Anterior shoulder dislocation", "Humeral shaft fracture", "Elbow dislocation", "Distal radius fracture"],
                correct: 0,
                explanation:
                  "The axillary nerve wraps the surgical neck of the humerus, so anterior dislocation puts it at risk, causing deltoid weakness and regimental-badge sensory loss.",
              },
              {
                q: "The musculocutaneous nerve is the primary motor supply to which muscle?",
                options: ["Triceps brachii", "Biceps brachii", "Deltoid", "Flexor carpi ulnaris"],
                correct: 1,
                explanation: "It innervates the anterior arm compartment: biceps brachii, brachialis, and coracobrachialis.",
              },
              {
                q: "A classic \u201cclaw hand\u201d deformity points to injury of which nerve?",
                options: ["Median", "Radial", "Ulnar", "Axillary"],
                correct: 2,
                explanation: "Ulnar injury weakens the medial two lumbricals, leaving long flexors/extensors of digits 4\u20135 unopposed.",
              },
              {
                q: "Wrist drop is a hallmark finding in injury of which nerve?",
                options: ["Ulnar", "Median", "Radial", "Musculocutaneous"],
                correct: 2,
                explanation: "The radial nerve supplies posterior forearm extensors; its injury causes loss of wrist/finger extension.",
              },
            ],
          },
          { id: "shoulder-osteology", title: "Shoulder & Arm Osteology", free: false, difficulty: "easy", highYield: false, questionCount: 12 },
        ],
      },
      {
        id: "thorax",
        name: "Thorax",
        sets: [
          { id: "mediastinum", title: "Mediastinum Divisions", free: false, difficulty: "hard", highYield: true, questionCount: 10 },
          { id: "heart-borders", title: "Surface Anatomy of the Heart", free: false, difficulty: "medium", highYield: false, questionCount: 8 },
        ],
      },
    ],
  },
  {
    id: "physiology",
    modules: [
      {
        id: "cardiovascular",
        name: "Cardiovascular",
        sets: [
          { id: "cardiac-cycle", title: "Cardiac Cycle Fundamentals", free: false, difficulty: "medium", highYield: true, questionCount: 15 },
          { id: "starling", title: "Frank\u2013Starling Mechanism", free: false, difficulty: "hard", highYield: true, questionCount: 9 },
        ],
      },
      { id: "renal", name: "Renal", sets: [{ id: "gfr", title: "GFR & Clearance", free: false, difficulty: "hard", highYield: true, questionCount: 11 }] },
    ],
  },
  { id: "pharmacology", modules: [{ id: "autonomics", name: "Autonomic Pharmacology", sets: [{ id: "adrenergics", title: "Adrenergic Agonists", free: false, difficulty: "medium", highYield: true, questionCount: 13 }] }] },
  { id: "pathology", modules: [{ id: "cell-injury", name: "Cell Injury", sets: [{ id: "necrosis", title: "Necrosis vs. Apoptosis", free: false, difficulty: "medium", highYield: true, questionCount: 10 }] }] },
  { id: "biochemistry", modules: [{ id: "metabolism", name: "Metabolism", sets: [{ id: "glycolysis", title: "Glycolysis Pathway", free: false, difficulty: "hard", highYield: true, questionCount: 14 }] }] },
  { id: "microbiology", modules: [] },
  { id: "forensic", modules: [] },
  { id: "community", modules: [] },
];

export const totalQuestions = (subject: Subject): number =>
  subject.modules.reduce(
    (sum, m) => sum + m.sets.reduce((s, set) => s + (set.questions ? set.questions.length : set.questionCount || 0), 0),
    0
  );

export const findSubject = (id: string) => SUBJECTS.find((s) => s.id === id);
export const findModule = (subject: Subject, moduleId: string) => subject.modules.find((m) => m.id === moduleId);
export const findSet = (mod: ReturnType<typeof findModule>, setId: string) => mod?.sets.find((s) => s.id === setId);

export const ACCURACY_DATA = [
  { subject: "Anatomy", accuracy: 78 },
  { subject: "Physiology", accuracy: 64 },
  { subject: "Pharm", accuracy: 52 },
  { subject: "Pathology", accuracy: 71 },
  { subject: "Biochem", accuracy: 45 },
  { subject: "Micro", accuracy: 60 },
];

export const SEED_ADMIN_BANK: AdminQuestion[] = [
  {
    id: "seed-1",
    subject: "anatomy",
    module: "Upper Limb",
    q: "The radial nerve is a continuation of which cord of the brachial plexus?",
    options: ["Lateral cord", "Medial cord", "Posterior cord", "Upper trunk"],
    correct: 2,
    status: "published",
  },
  {
    id: "seed-2",
    subject: "physiology",
    module: "Cardiovascular",
    q: "Which phase of the cardiac cycle corresponds to the QRS complex?",
    options: ["Isovolumetric relaxation", "Ventricular filling", "Isovolumetric contraction", "Atrial systole"],
    correct: 2,
    status: "draft",
  },
];
