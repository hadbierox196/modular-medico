import type { SubjectMeta } from "../types";

export const TOTAL_BLOCKS = 15;

export const SUBJECT_LIST = [
  "gross_anatomy",
  "embryology",
  "histology",
  "biochemistry",
  "physiology",
  "pathology",
  "pharmacology",
  "community_medicine",
  "behavioural_science",
  "forensics",
  "medicine",
  "surgery",
] as const;

export type SubjectId = (typeof SUBJECT_LIST)[number];

export const SUBJECT_META: Record<SubjectId, SubjectMeta & { short: string; defaultYear: string }> = {
  gross_anatomy: { label: "Gross Anatomy", tag: "Structure & Regional Dissection", short: "GA", defaultYear: "1st & 2nd Year" },
  embryology: { label: "Embryology", tag: "Development & Teratology", short: "EM", defaultYear: "1st & 2nd Year" },
  histology: { label: "Histology", tag: "Microscopic Tissue Structure", short: "HI", defaultYear: "1st & 2nd Year" },
  biochemistry: { label: "Biochemistry", tag: "Metabolic Pathways & Genetics", short: "BC", defaultYear: "1st & 2nd Year" },
  physiology: { label: "Physiology", tag: "Organ Systems & Homeostasis", short: "PH", defaultYear: "1st & 2nd Year" },
  pathology: { label: "Pathology", tag: "General & Systemic Disease", short: "PA", defaultYear: "3rd & 4th Year" },
  pharmacology: { label: "Pharmacology", tag: "Mechanisms & Therapeutics", short: "PK", defaultYear: "3rd & 4th Year" },
  community_medicine: { label: "Community Medicine", tag: "Public Health & Epidemiology", short: "CM", defaultYear: "3rd & 4th Year" },
  behavioural_science: { label: "Behavioural Science", tag: "Medical Ethics & Psychology", short: "BS", defaultYear: "3rd Year" },
  forensics: { label: "Forensic Medicine", tag: "Forensics, Autopsy & Toxicology", short: "FM", defaultYear: "3rd Year" },
  medicine: { label: "Medicine", tag: "Internal Medicine & Specialties", short: "ME", defaultYear: "Final Year" },
  surgery: { label: "Surgery", tag: "General & Operative Surgery", short: "SU", defaultYear: "Final Year" },
};

export const isSubjectId = (id: string): id is SubjectId => (SUBJECT_LIST as readonly string[]).includes(id);

/** Structure for a Module within a Block comprising multiple Subjects */
export interface ModuleDefinition {
  id: string;
  name: string;
  block: number;
  description?: string;
  subjects: SubjectId[];
}

/** Structure for a Block containing 1 or 2 Modules */
export interface BlockDefinition {
  block: number;
  title: string;
  year: string;
  description: string;
  modules: ModuleDefinition[];
}

export const DEFAULT_BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    block: 1,
    title: "Foundation & Hematopoietic-I",
    year: "1st Year MBBS",
    description: "General anatomy, cell biology, basic histology, hematology, and biochemical pathways.",
    modules: [
      {
        id: "b1-m1",
        name: "Foundation-I Module",
        block: 1,
        description: "Cell biology, introductory terminology, basic histology tissues, and enzymes.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology", "biochemistry"],
      },
      {
        id: "b1-m2",
        name: "Hematopoietic & Lymphatic-I Module",
        block: 1,
        description: "Erythropoiesis, hemostasis, blood groups, hemoglobin synthesis, and lymphoid anatomy.",
        subjects: ["physiology", "biochemistry", "histology", "gross_anatomy"],
      },
    ],
  },
  {
    block: 2,
    title: "Musculoskeletal, CVS-I & Respiratory-I",
    year: "1st Year MBBS",
    description: "Upper and lower limbs locomotion, heart embryology, cardiac electrophysiology, and breathing mechanics.",
    modules: [
      {
        id: "b2-m1",
        name: "Musculoskeletal & Locomotor-I Module",
        block: 2,
        description: "Limbs osteology, brachial plexus, joints, skeletal muscle contraction and mechanics.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology"],
      },
      {
        id: "b2-m2",
        name: "Cardiovascular-I & Respiratory-I Module",
        block: 2,
        description: "Heart development, cardiac cycle, thorax anatomy, mechanics of breathing, and gas exchange.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology", "biochemistry"],
      },
    ],
  },
  {
    block: 3,
    title: "GIT & Nutrition-I, Renal-I & Endocrine-I",
    year: "1st Year MBBS",
    description: "Gastrointestinal tract, digestive enzymes, nephron physiology, endocrine axes, and gametogenesis.",
    modules: [
      {
        id: "b3-m1",
        name: "Gastrointestinal & Nutrition-I Module",
        block: 3,
        description: "Abdominal viscera, digestive enzymes, motility, lipid/carbohydrate absorption.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology", "biochemistry"],
      },
      {
        id: "b3-m2",
        name: "Renal-I, Endocrine & Reproductive-I Module",
        block: 3,
        description: "Glomerular filtration, nephron transport, pituitary-gonadal axes, and reproductive anatomy.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology", "biochemistry"],
      },
    ],
  },
  {
    block: 4,
    title: "Head & Neck, Special Senses & Neurosciences-I",
    year: "2nd Year MBBS",
    description: "Cranial nerves, skull base, neuroanatomy, sensory pathways, and brainstem tracts.",
    modules: [
      {
        id: "b4-m1",
        name: "Head & Neck & Special Senses Module",
        block: 4,
        description: "Cranial osteology, pharyngeal arches, facial nerve pathways, orbit, ear, and sensory receptors.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology"],
      },
      {
        id: "b4-m2",
        name: "Neurosciences-I Module",
        block: 4,
        description: "Cerebral cortex, ascending/descending tracts, cerebellum, brainstem nuclei, and CSF flow.",
        subjects: ["gross_anatomy", "histology", "embryology", "physiology"],
      },
    ],
  },
  {
    block: 5,
    title: "Foundation-II, Pharmacology & Immunity",
    year: "2nd Year MBBS",
    description: "Principles of pharmacokinetics, pharmacodynamics, immunological hypersensitivity, and cell injury.",
    modules: [
      {
        id: "b5-m1",
        name: "Foundation-II & General Pharmacology Module",
        block: 5,
        description: "Pharmacokinetics, receptor dynamics, toxicokinetics, cellular adaptation, and molecular pathology.",
        subjects: ["pharmacology", "pathology", "biochemistry"],
      },
      {
        id: "b5-m2",
        name: "Immunity, Inflammation & Hematology-II Module",
        block: 5,
        description: "Acute and chronic inflammation, hypersensitivity reactions, autoimmune disorders, and anemias.",
        subjects: ["pathology", "pharmacology", "biochemistry"],
      },
    ],
  },
  {
    block: 6,
    title: "Forensic Med-I, Neoplasia & Infectious Disease",
    year: "2nd Year MBBS",
    description: "Medical jurisprudence, thanatology, toxicology basics, carcinogenesis, and clinical microbiology.",
    modules: [
      {
        id: "b6-m1",
        name: "Forensic Medicine & Toxicology-I Module",
        block: 6,
        description: "Medical ethics, jurisprudence, thanatology, postmortem changes, and general toxicology principles.",
        subjects: ["forensics", "pathology"],
      },
      {
        id: "b6-m2",
        name: "Neoplasia & Infectious Diseases Module",
        block: 6,
        description: "Carcinogenesis, oncogenes, bacteriology, virology, and systemic antimicrobial pharmacology.",
        subjects: ["pathology", "pharmacology"],
      },
    ],
  },
  {
    block: 7,
    title: "Musculoskeletal-II, CVS-II & Systemic Pathology",
    year: "3rd Year MBBS",
    description: "Systemic pathology of bones and joints, ischemic heart disease, and cardiac pharmacology.",
    modules: [
      {
        id: "b7-m1",
        name: "Musculoskeletal-II & Locomotor-II Module",
        block: 7,
        description: "Osteomyelitis, bone neoplasms, arthritis, NSAIDs, fractures, and muscle dystrophies.",
        subjects: ["pathology", "pharmacology", "medicine", "surgery"],
      },
      {
        id: "b7-m2",
        name: "Cardiovascular-II & Systemic Pathology Module",
        block: 7,
        description: "Atherosclerosis, MI, cardiac arrhythmias, antihypertensives, and heart failure.",
        subjects: ["pathology", "pharmacology", "medicine"],
      },
    ],
  },
  {
    block: 8,
    title: "Respiratory-II, Community Med & Forensic Med-II",
    year: "3rd Year MBBS",
    description: "Obstructive/restrictive lung pathology, epidemiology, family health programs, and trauma.",
    modules: [
      {
        id: "b8-m1",
        name: "Respiratory-II & Forensic Medicine-II Module",
        block: 8,
        description: "COPD, restrictive lung disease, asthma therapeutics, mechanical asphyxia, and firearm trauma.",
        subjects: ["pathology", "pharmacology", "forensics", "medicine"],
      },
      {
        id: "b8-m2",
        name: "Community Medicine & Epidemiology-I Module",
        block: 8,
        description: "Epidemiological study designs, biostatistics, maternal and child healthcare, and vaccination schedules.",
        subjects: ["community_medicine", "forensics"],
      },
    ],
  },
  {
    block: 9,
    title: "GIT & Hepatobiliary-II, Public Health-II & Eye/ENT-I",
    year: "3rd Year MBBS",
    description: "Biostatistics, environmental health, hepatic/GI systemic pathology, and introductory sensory surgery.",
    modules: [
      {
        id: "b9-m1",
        name: "Gastrointestinal & Hepatobiliary-II Module",
        block: 9,
        description: "Cirrhosis, hepatitis, peptic ulcers, GI bleeding, and acute abdomen surgical management.",
        subjects: ["pathology", "pharmacology", "surgery", "medicine"],
      },
      {
        id: "b9-m2",
        name: "Community Medicine & Public Health-II Module",
        block: 9,
        description: "Environmental sanitation, occupational health, infectious disease surveillance, and bioethics.",
        subjects: ["community_medicine", "behavioural_science", "surgery"],
      },
    ],
  },
  {
    block: 10,
    title: "Neurosciences-II, Psychiatry & Renal-II",
    year: "4th Year MBBS",
    description: "CNS pharmacology, mood and psychotic disorders, behavioral science ethics, and glomerulonephritis.",
    modules: [
      {
        id: "b10-m1",
        name: "Neurosciences-II & Behavioral Sciences Module",
        block: 10,
        description: "CNS infections, stroke syndromes, psychotic disorders, neuroleptics, and medical communication.",
        subjects: ["behavioural_science", "pathology", "pharmacology", "medicine"],
      },
      {
        id: "b10-m2",
        name: "Renal-II & Urology Module",
        block: 10,
        description: "Glomerulonephritis, nephrotic syndrome, acute kidney injury, renal cell carcinoma, and urolithiasis.",
        subjects: ["pathology", "pharmacology", "medicine", "surgery"],
      },
    ],
  },
  {
    block: 11,
    title: "Eye & ENT-II, Endocrinology-II & Dermatology",
    year: "4th Year MBBS",
    description: "Cataracts, glaucoma, otitis media, diabetic complications, thyroid disease, and cutaneous lesions.",
    modules: [
      {
        id: "b11-m1",
        name: "Ophthalmology (Eye) & Otorhinolaryngology (ENT) Module",
        block: 11,
        description: "Glaucoma, cataract, retinal detachment, otitis media, sinusitis, and epistaxis management.",
        subjects: ["surgery", "medicine", "pathology", "pharmacology"],
      },
      {
        id: "b11-m2",
        name: "Endocrinology-II & Dermatology Module",
        block: 11,
        description: "Diabetes complications, thyroid crises, Cushing syndrome, eczema, psoriasis, and cutaneous ulcers.",
        subjects: ["medicine", "pathology", "pharmacology", "surgery"],
      },
    ],
  },
  {
    block: 12,
    title: "Surgical Subspecialties, Anesthesia & Forensic Med-III",
    year: "4th Year MBBS",
    description: "Advanced ophthalmic surgery, head and neck neoplasms, anesthesia, and sexual assault forensics.",
    modules: [
      {
        id: "b12-m1",
        name: "Surgical Subspecialties & Anesthesia Module",
        block: 12,
        description: "Neurosurgery, burns, plastic repairs, general/regional anesthetics, and surgical airways.",
        subjects: ["surgery", "pathology", "pharmacology"],
      },
      {
        id: "b12-m2",
        name: "Clinical Forensics & Medical Jurisprudence Module",
        block: 12,
        description: "Sexual assault examination, asphyxial deaths, autopsy protocols, and medical negligence law.",
        subjects: ["forensics", "behavioural_science"],
      },
    ],
  },
  {
    block: 13,
    title: "General, Emergency & Operative Surgery",
    year: "Final Year MBBS",
    description: "Acute abdomen, surgical oncology, trauma care, fluid-electrolyte balance, and wound management.",
    modules: [
      {
        id: "b13-m1",
        name: "General & Emergency Surgery Module",
        block: 13,
        description: "Appendicitis, bowel obstruction, acute pancreatitis, shock resuscitation, and surgical critical care.",
        subjects: ["surgery", "pathology"],
      },
      {
        id: "b13-m2",
        name: "Operative Surgery & Surgical Oncology Module",
        block: 13,
        description: "Thyroidectomy, breast cancer, gastrectomy, colorectal surgery, and surgical oncology principles.",
        subjects: ["surgery", "pathology"],
      },
    ],
  },
  {
    block: 14,
    title: "Internal Medicine & Obstetrics/Gynecology",
    year: "Final Year MBBS",
    description: "Cardiology, pulmonology, emergency medicine, high-risk obstetrics, and gynecology oncology.",
    modules: [
      {
        id: "b14-m1",
        name: "Internal Medicine & Acute Care Module",
        block: 14,
        description: "Critical care, ACS management, sepsis protocols, endocrine emergencies, and systemic rheumatology.",
        subjects: ["medicine", "pharmacology"],
      },
      {
        id: "b14-m2",
        name: "Obstetrics & Gynecology Module",
        block: 14,
        description: "Antepartum hemorrhage, preeclampsia, labor management, infertility, and gynecologic malignancies.",
        subjects: ["surgery", "medicine", "pathology"],
      },
    ],
  },
  {
    block: 15,
    title: "Pediatrics & Comprehensive Clinical Integration",
    year: "Final Year MBBS",
    description: "Neonatal resuscitation, pediatric infectious diseases, genetic anomalies, and clerkship synthesis.",
    modules: [
      {
        id: "b15-m1",
        name: "Pediatrics & Neonatology Module",
        block: 15,
        description: "Neonatal APGAR, congenital anomalies, pediatric dehydration, EPI immunization, and milestones.",
        subjects: ["medicine", "community_medicine"],
      },
      {
        id: "b15-m2",
        name: "Comprehensive Clinical Integration Module",
        block: 15,
        description: "Multi-disciplinary clinical synthesis, integrated OSCE cases, and emergency triage.",
        subjects: ["medicine", "surgery", "community_medicine"],
      },
    ],
  },
];

/** Master List of 37 Modules */
export interface MasterModuleDef {
  id: string;
  num: number;
  name: string;
  suggestedBlock?: number;
}

export const MASTER_MODULES: MasterModuleDef[] = [
  { id: "mod-1", num: 1, name: "Foundation-I", suggestedBlock: 1 },
  { id: "mod-2", num: 2, name: "Hematopoietic & Lymphatic", suggestedBlock: 1 },
  { id: "mod-3", num: 3, name: "Musculoskeletal & Locomotion-I", suggestedBlock: 2 },
  { id: "mod-4", num: 4, name: "Cardiovascular-I", suggestedBlock: 2 },
  { id: "mod-5", num: 5, name: "Respiratory-I", suggestedBlock: 2 },
  { id: "mod-6", num: 6, name: "GIT & Nutrition-I", suggestedBlock: 3 },
  { id: "mod-7", num: 7, name: "Renal-I", suggestedBlock: 3 },
  { id: "mod-8", num: 8, name: "Endocrinology & Reproduction-I", suggestedBlock: 3 },
  { id: "mod-9", num: 9, name: "Head & Neck, Special Senses", suggestedBlock: 4 },
  { id: "mod-10", num: 10, name: "Neurosciences-I", suggestedBlock: 4 },
  { id: "mod-11", num: 11, name: "Inflammation", suggestedBlock: 4 },
  { id: "mod-12", num: 12, name: "Foundation-2 & EBM", suggestedBlock: 5 },
  { id: "mod-13", num: 13, name: "General & Clinical Pharmacology", suggestedBlock: 5 },
  { id: "mod-14", num: 14, name: "Hematopoietic & Immunity & Transplant", suggestedBlock: 5 },
  { id: "mod-15", num: 15, name: "Forensic Medicine & Toxicology-I", suggestedBlock: 6 },
  { id: "mod-16", num: 16, name: "Neoplasia", suggestedBlock: 6 },
  { id: "mod-17", num: 17, name: "Infectious Disease", suggestedBlock: 6 },
  { id: "mod-18", num: 18, name: "Musculoskeletal & Locomotion-II", suggestedBlock: 7 },
  { id: "mod-19", num: 19, name: "Forensic Medicine & Toxicology-II", suggestedBlock: 7 },
  { id: "mod-20", num: 20, name: "Cardiovascular-II", suggestedBlock: 7 },
  { id: "mod-21", num: 21, name: "Respiratory-II", suggestedBlock: 8 },
  { id: "mod-22", num: 22, name: "Community Medicine & Family Health", suggestedBlock: 8 },
  { id: "mod-23", num: 23, name: "Forensic Medicine & Toxicology-III", suggestedBlock: 8 },
  { id: "mod-24", num: 24, name: "Community Medicine & Family Health-II", suggestedBlock: 9 },
  { id: "mod-25", num: 25, name: "GIT & Nutrition-II", suggestedBlock: 9 },
  { id: "mod-26", num: 26, name: "Eye & ENT-I", suggestedBlock: 9 },
  { id: "mod-27", num: 27, name: "Neurosciences-II", suggestedBlock: 10 },
  { id: "mod-28", num: 28, name: "Psychiatry & Behavioral Sciences", suggestedBlock: 10 },
  { id: "mod-29", num: 29, name: "Renal-II", suggestedBlock: 10 },
  { id: "mod-30", num: 30, name: "Eye & ENT-II", suggestedBlock: 11 },
  { id: "mod-31", num: 31, name: "Endocrinology & Reproduction-II", suggestedBlock: 11 },
  { id: "mod-32", num: 32, name: "Dermatology", suggestedBlock: 11 },
  { id: "mod-33", num: 33, name: "Eye & ENT-III", suggestedBlock: 12 },
  { id: "mod-34", num: 34, name: "Surgery", suggestedBlock: 13 },
  { id: "mod-35", num: 35, name: "Gynecology & Obstetrics", suggestedBlock: 14 },
  { id: "mod-36", num: 36, name: "Medicine", suggestedBlock: 14 },
  { id: "mod-37", num: 37, name: "Pediatrics", suggestedBlock: 15 },
];

/** Default starter module assignments per subject */
export const DEFAULT_SUBJECT_MODULE_IDS: Record<SubjectId, string[]> = {
  gross_anatomy: ["mod-1", "mod-3", "mod-4", "mod-5", "mod-6", "mod-7", "mod-8", "mod-9", "mod-10", "mod-18"],
  embryology: ["mod-1", "mod-4", "mod-5", "mod-6", "mod-7", "mod-8", "mod-9", "mod-10"],
  histology: ["mod-1", "mod-2", "mod-3", "mod-4", "mod-5", "mod-6", "mod-7", "mod-8", "mod-9", "mod-10"],
  biochemistry: ["mod-1", "mod-2", "mod-6", "mod-7", "mod-8", "mod-12", "mod-25"],
  physiology: ["mod-1", "mod-2", "mod-3", "mod-4", "mod-5", "mod-6", "mod-7", "mod-8", "mod-10", "mod-20", "mod-21"],
  pathology: ["mod-11", "mod-14", "mod-16", "mod-17", "mod-20", "mod-21", "mod-25", "mod-29"],
  pharmacology: ["mod-13", "mod-14", "mod-17", "mod-20", "mod-21", "mod-25", "mod-29"],
  community_medicine: ["mod-12", "mod-22", "mod-24"],
  behavioural_science: ["mod-28"],
  forensics: ["mod-15", "mod-19", "mod-23"],
  medicine: ["mod-20", "mod-21", "mod-25", "mod-27", "mod-29", "mod-31", "mod-32", "mod-36", "mod-37"],
  surgery: ["mod-20", "mod-21", "mod-25", "mod-26", "mod-30", "mod-33", "mod-34", "mod-35"],
};
