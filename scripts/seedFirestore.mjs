/**
 * Seeds Firestore with a handful of real modules/blocks/questions so the app has
 * something to show immediately, instead of every block being empty.
 *
 * Setup: same as scripts/setAdminClaim.mjs — put your service account key at
 * scripts/serviceAccountKey.json, then:
 *   node scripts/seedFirestore.mjs
 *
 * Safe to re-run — it checks for an existing module with the same name before
 * creating a duplicate, but will add duplicate questions if run twice, so only run
 * it once (or clear the `questions`/`modules` collections first if you want a clean re-seed).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8"));
} catch {
  console.error("Missing scripts/serviceAccountKey.json — see scripts/setAdminClaim.mjs for how to get one.");
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SEED = [
  {
    subjectId: "anatomy",
    moduleName: "Upper Limb",
    block: 1,
    difficulty: "medium",
    questions: [
      {
        q: "Which nerve roots contribute to the brachial plexus?",
        options: ["C5\u2013T1", "C1\u2013C5", "T1\u2013T5", "C8\u2013T4"],
        correct: 0,
        explanation: "The brachial plexus arises from the anterior rami of C5\u2013T1, which reorganize into trunks, divisions, cords, and terminal branches.",
      },
      {
        q: "Injury to the axillary nerve most commonly results from:",
        options: ["Anterior shoulder dislocation", "Humeral shaft fracture", "Elbow dislocation", "Distal radius fracture"],
        correct: 0,
        explanation: "The axillary nerve wraps the surgical neck of the humerus, so anterior dislocation puts it at risk, causing deltoid weakness and regimental-badge sensory loss.",
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
  {
    subjectId: "physiology",
    moduleName: "Cardiovascular",
    block: 1,
    difficulty: "medium",
    questions: [
      {
        q: "The QRS complex on an ECG corresponds to which phase of the cardiac cycle?",
        options: ["Atrial systole", "Isovolumetric contraction", "Ventricular ejection", "Isovolumetric relaxation"],
        correct: 1,
        explanation: "Ventricular depolarization (QRS) triggers isovolumetric contraction, just before the semilunar valves open.",
      },
      {
        q: "Which factor increases stroke volume according to the Frank\u2013Starling mechanism?",
        options: ["Decreased venous return", "Increased afterload", "Increased end-diastolic volume", "Decreased contractility"],
        correct: 2,
        explanation: "Greater ventricular filling (preload) stretches cardiac muscle fibers, increasing the force of contraction and stroke volume.",
      },
      {
        q: "Which heart sound corresponds to closure of the AV valves?",
        options: ["S1", "S2", "S3", "S4"],
        correct: 0,
        explanation: "S1 (\u201club\u201d) marks the closure of the mitral and tricuspid valves at the start of systole.",
      },
    ],
  },
  {
    subjectId: "biochemistry",
    moduleName: "Metabolism",
    block: 1,
    difficulty: "hard",
    questions: [
      {
        q: "Which enzyme catalyzes the rate-limiting step of glycolysis?",
        options: ["Hexokinase", "Phosphofructokinase-1", "Pyruvate kinase", "Aldolase"],
        correct: 1,
        explanation: "PFK-1 catalyzes the committed, rate-limiting step of glycolysis and is the main site of regulation.",
      },
      {
        q: "Under anaerobic conditions, pyruvate is converted to:",
        options: ["Acetyl-CoA", "Oxaloacetate", "Lactate", "Citrate"],
        correct: 2,
        explanation: "Without oxygen, lactate dehydrogenase regenerates NAD+ by converting pyruvate to lactate, allowing glycolysis to continue.",
      },
    ],
  },
  {
    subjectId: "pathology",
    moduleName: "Cell Injury",
    block: 1,
    difficulty: "medium",
    questions: [
      {
        q: "Which type of cell death is characterized by cell swelling and membrane rupture?",
        options: ["Apoptosis", "Necrosis", "Autophagy", "Senescence"],
        correct: 1,
        explanation: "Necrosis involves ATP depletion, cell swelling, and membrane rupture, triggering an inflammatory response \u2014 unlike the controlled, energy-dependent process of apoptosis.",
      },
    ],
  },
  {
    subjectId: "pharmacology",
    moduleName: "Autonomic Pharmacology",
    block: 1,
    difficulty: "medium",
    questions: [
      {
        q: "Which receptor does epinephrine primarily act on to increase heart rate?",
        options: ["Alpha-1", "Beta-1", "Muscarinic M2", "Nicotinic"],
        correct: 1,
        explanation: "Beta-1 adrenergic receptors in the heart increase heart rate and contractility when stimulated by epinephrine/norepinephrine.",
      },
    ],
  },
];

async function findOrCreateModule(subjectId, name) {
  const snap = await db.collection("modules").where("subjectId", "==", subjectId).where("name", "==", name).limit(1).get();
  if (!snap.empty) return snap.docs[0].id;
  const orderSnap = await db.collection("modules").where("subjectId", "==", subjectId).get();
  const ref = await db.collection("modules").add({ subjectId, name, order: orderSnap.size });
  return ref.id;
}

async function main() {
  let count = 0;
  for (const group of SEED) {
    const moduleId = await findOrCreateModule(group.subjectId, group.moduleName);
    const batch = db.batch();
    group.questions.forEach((q) => {
      const ref = db.collection("questions").doc();
      batch.set(ref, {
        subjectId: group.subjectId,
        moduleId,
        moduleName: group.moduleName,
        block: group.block,
        difficulty: group.difficulty,
        q: q.q,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        status: "published",
        createdAt: Date.now(),
      });
      count += 1;
    });
    await batch.commit();
    console.log(`Seeded ${group.questions.length} questions into ${group.subjectId} \u203a ${group.moduleName} \u203a Block ${group.block}`);
  }
  console.log(`\n\u2705 Done \u2014 ${count} questions seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
