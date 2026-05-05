#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const goldenCasesPath = path.join(repoRoot, "docs", "golden-cases.json");

const markerMap = {
  completePrompt: "DR_PROMPT_COMPLETE",
  lightweight: "DR_PROMPT_LIGHTWEIGHT",
  oneShot: "DR_PROMPT_ONE_SHOT",
  split: "DR_PROMPT_SPLIT",
  additional: "DR_PROMPT_ADDITIONAL",
  order: "DR_PROMPT_ORDER",
  decisionLedger: "DR_PROMPT_DECISION_LEDGER",
  answerLedger: "DR_PROMPT_ANSWER_LEDGER",
  questions: "DR_PROMPT_QUESTIONS",
  assumptions: "DR_PROMPT_ASSUMPTIONS",
  adoption: ["DR_REVIEW_ADOPTION", "DR_REVIEW_DECISION"],
  adoptionConditions: "DR_REVIEW_CONDITIONS",
  usable: "DR_REVIEW_USABLE",
  fixes: "DR_REVIEW_FIXES",
  dangerous: ["DR_REVIEW_RISK", "DR_REVIEW_DANGEROUS"],
  sourceReview: "DR_REVIEW_SOURCE_REVIEW",
  claimEvidence: "DR_REVIEW_CLAIM_EVIDENCE",
  gaps: "DR_REVIEW_GAPS",
  practicality: "DR_REVIEW_PRACTICALITY",
  artifact: ["DR_REVIEW_REVISED_ARTIFACT", "DR_REVIEW_ARTIFACT", "DR_REVIEW_REFINED_ARTIFACT"],
  researchBrief: "DR_REVIEW_RESEARCH_BRIEF",
  publicSafeArtifact: "DR_REVIEW_PUBLIC_SAFE_ARTIFACT",
  pharmacySafetyArtifact: "DR_REVIEW_PHARMACY_SAFETY_ARTIFACT",
  proInternalArtifact: "DR_REVIEW_PRO_INTERNAL_ARTIFACT",
  additionalPrompt: ["DR_REVIEW_ADDITIONAL_PROMPTS", "DR_REVIEW_ADDITIONAL_PROMPT"],
  nextActions: ["DR_REVIEW_NEXT_ACTION", "DR_REVIEW_NEXT_ACTIONS"],
  confidence: "DR_REVIEW_CONFIDENCE",
  issues: "DR_REVIEW_ISSUES",
  handoff: "DR_REVIEW_HANDOFF",
  handoffCard: "DR_REVIEW_HANDOFF_CARD",
};

const headingAliases = {
  completePrompt: [
    "Deep Researchに貼る完成プロンプト",
    "完成プロンプト",
    "Deep Research用プロンプト案",
  ],
  lightweight: ["2回目以降用・軽量版プロンプト", "2回目以降用・軽量版", "軽量版プロンプト"],
  oneShot: ["一発版プロンプト", "一発版"],
  split: ["分割版プロンプト", "分割版"],
  additional: ["追加Deep Researchプロンプト案", "追加調査案", "追加Deep Research案"],
  order: ["推奨する実行順", "推奨する調査構成", "次アクション"],
  decisionLedger: ["確定済み条件 / Decision Ledger", "Decision Ledger", "確定済み条件"],
  answerLedger: ["回答済み質問 / Answer Ledger", "Answer Ledger", "回答済み質問"],
  questions: ["ユーザーへの確認質問", "確認質問"],
  assumptions: ["未回答の場合の仮置き", "未回答時の仮置き"],
  adoption: ["採用可否"],
  adoptionConditions: ["採用条件"],
  usable: ["採用できる内容"],
  fixes: ["修正すべき内容"],
  dangerous: ["危険な内容", "危険なため使わない内容"],
  sourceReview: ["情報源レビュー"],
  claimEvidence: ["主張・根拠対応レビュー"],
  gaps: ["抜け漏れ"],
  practicality: ["実用性レビュー"],
  artifact: ["改訂版成果物"],
  researchBrief: ["Research Brief", "研究ブリーフ"],
  publicSafeArtifact: ["一般向け安全変換版", "public safe artifact", "public safe conversion", "public memo", "safe consultation memo"],
  pharmacySafetyArtifact: ["薬剤師・相談員向け安全確認版", "pharmacy safety artifact", "counselor safety artifact"],
  proInternalArtifact: ["専門職向け内部資料版", "professional internal artifact", "pro internal artifact"],
  additionalPrompt: ["追加Deep Researchプロンプト案", "追加Deep Researchプロンプト"],
  nextActions: ["次アクション"],
  confidence: ["結論の自信度"],
  issues: ["Issue / 未解決論点", "未解決Issue", "未解決論点"],
  handoff: ["次Stepへの引き継ぎ", "次Stepへの入力", "引き継ぎ"],
  handoffCard: ["次調査カード", "Handoff Card", "次調査議題カード"],
};

const exitCardAliases = {
  完成プロンプト: "completePrompt",
  "Deep Researchに貼る完成プロンプト": "completePrompt",
  completeprompt: "completePrompt",
  "wide deepprompt": "completePrompt",
  widedeepprompt: "completePrompt",
  widedeeprompt: "completePrompt",
  widedeep: "completePrompt",
  "2回目以降用軽量版": "lightweight",
  "2回目以降用": "lightweight",
  軽量版: "lightweight",
  lightweight: "lightweight",
  lightprompt: "lightweight",
  lightweightprompt: "lightweight",
  splitprompt: "split",
  一発版プロンプト: "oneShot",
  分割版プロンプト: "split",
  推奨実行順: "order",
  推奨する実行順: "order",
  order: "order",
  strategy: "order",
  追加調査案: "additional",
  追加DeepResearchプロンプト案: "additional",
  追加DeepResearch案: "additional",
  additionalprompts: ["additional", "additionalPrompt"],
  DecisionLedger: "decisionLedger",
  "Decision Ledger": "decisionLedger",
  decisionledger: "decisionLedger",
  AnswerLedger: "answerLedger",
  "Answer Ledger": "answerLedger",
  answerledger: "answerLedger",
  ユーザーへの確認質問: "questions",
  未回答時の仮置き: "assumptions",
  assumptions: "assumptions",
  adoption: "adoption",
  採用可否: "adoption",
  adoptionconditions: "adoptionConditions",
  採用条件: "adoptionConditions",
  usable: "usable",
  採用できる内容: "usable",
  fixes: "fixes",
  修正すべき内容: "fixes",
  risk: "dangerous",
  危険な内容: "dangerous",
  sourcereview: "sourceReview",
  情報源レビュー: "sourceReview",
  claimevidencereview: "claimEvidence",
  claimevidence: "claimEvidence",
  主張根拠対応レビュー: "claimEvidence",
  gaps: "gaps",
  抜け漏れ: "gaps",
  practicality: "practicality",
  実用性レビュー: "practicality",
  revisedartifact: "artifact",
  researchbrief: "researchBrief",
  brief: "researchBrief",
  knowledgebrief: "researchBrief",
  briefcard: "researchBrief",
  研究ブリーフ: "researchBrief",
  publicsafeartifact: "publicSafeArtifact",
  publicsafeconversion: "publicSafeArtifact",
  publicmemo: "publicSafeArtifact",
  safeconsultationmemo: "publicSafeArtifact",
  pharmacysafetyartifact: "pharmacySafetyArtifact",
  counselorsafetyartifact: "pharmacySafetyArtifact",
  professionalinternalartifact: "proInternalArtifact",
  prointernalartifact: "proInternalArtifact",
  改訂版成果物: "artifact",
  nextaction: "nextActions",
  次アクション: "nextActions",
  confidence: "confidence",
  結論の自信度: "confidence",
  issues: "issues",
  issue未解決論点: "issues",
  handoff: "handoff",
  次stepへの引き継ぎ: "handoff",
  handoffcard: "handoffCard",
  次調査カード: "handoffCard",
};

const defaultSafetyContextPatterns = [
  "禁止",
  "避ける",
  "しない",
  "行わない",
  "書かない",
  "除外",
  "断定しない",
  "推奨しない",
  "目的としない",
  "使わない",
  "扱わない",
];

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.list) {
      const cases = readGoldenCases();
      listGoldenCases(cases);
      return;
    }
    if (args.validate) {
      const cases = readGoldenCases();
      const result = validateGoldenCases(cases, { minCases: args.minCases });
      printValidationResult(result);
      process.exitCode = result.pass ? 0 : 1;
      return;
    }
    if (args.all) {
      const cases = readGoldenCases();
      const evaluation = evaluateAllGoldenCases(cases);
      if (args.json) {
        console.log(JSON.stringify(evaluation, null, 2));
      } else {
        printAllEvaluation(evaluation);
      }
      process.exitCode = evaluation.pass ? 0 : 1;
      return;
    }
    if (args.caseId) {
      const cases = readGoldenCases();
      const goldenCase = cases.find((caseDef) => caseMatches(caseDef, args.caseId));
      if (!goldenCase) {
        throw usageError(`Golden Case not found: ${args.caseId}`);
      }
      const actualPath = resolveActualPath(goldenCase, args.actualPath);
      const actualText = readTextFile(actualPath, "actual Final QA markdown");
      const evaluation = evaluateGoldenCase(goldenCase, actualText);
      if (args.json) {
        console.log(JSON.stringify(evaluation, null, 2));
      } else {
        printEvaluation(evaluation);
      }
      process.exitCode = evaluation.pass ? 0 : 1;
      return;
    }
    throw usageError("Specify --list, --validate, or --case <caseId> --actual <path>.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.exitCode || 2;
  }
}

function parseArgs(argv) {
  const args = {
    list: false,
    validate: false,
    json: false,
    all: false,
    caseId: "",
    actualPath: "",
    minCases: 4,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--list") {
      args.list = true;
    } else if (token === "--validate") {
      args.validate = true;
    } else if (token === "--json") {
      args.json = true;
    } else if (token === "--all") {
      args.all = true;
    } else if (token === "--case") {
      index += 1;
      if (!argv[index]) throw usageError("--case requires a caseId.");
      args.caseId = argv[index];
    } else if (token === "--actual") {
      index += 1;
      if (!argv[index]) throw usageError("--actual requires a file path.");
      args.actualPath = argv[index];
    } else if (token === "--min-cases") {
      index += 1;
      if (!argv[index]) throw usageError("--min-cases requires a number.");
      const parsed = Number.parseInt(argv[index], 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw usageError("--min-cases must be a non-negative integer.");
      }
      args.minCases = parsed;
    } else if (token === "--help" || token === "-h") {
      throw usageError(usageText());
    } else {
      throw usageError(`Unknown argument: ${token}`);
    }
  }
  const commandCount = [args.list, args.validate, args.all, Boolean(args.caseId)].filter(Boolean).length;
  if (commandCount !== 1) {
    throw usageError("Use exactly one command: --list, --validate, --all, or --case.");
  }
  return args;
}

function usageText() {
  return [
    "Usage:",
    "  node scripts/check-golden-cases.mjs --list",
    "  node scripts/check-golden-cases.mjs --validate [--min-cases <n>]",
    "  node scripts/check-golden-cases.mjs --all",
    "  node scripts/check-golden-cases.mjs --all --json",
    "  node scripts/check-golden-cases.mjs --case <caseId> --actual <path-to-finalqa.md>",
    "  node scripts/check-golden-cases.mjs --case <caseId>",
    "  node scripts/check-golden-cases.mjs --case <caseId> --actual <path-to-finalqa.md> --json",
  ].join("\n");
}

function usageError(message) {
  const error = new Error(`${message}\n\n${usageText()}`);
  error.exitCode = 2;
  return error;
}

function readGoldenCases() {
  const raw = readTextFile(goldenCasesPath, "docs/golden-cases.json");
  try {
    return JSON.parse(raw);
  } catch (error) {
    const parseError = new Error(`Golden Case JSON parse failed: ${error.message}`);
    parseError.exitCode = 2;
    throw parseError;
  }
}

function readTextFile(filePath, label) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    const readError = new Error(`Failed to read ${label}: ${filePath}\n${error.message}`);
    readError.exitCode = 2;
    throw readError;
  }
}

function resolveActualPath(caseDef, actualPath) {
  if (actualPath) return path.resolve(process.cwd(), actualPath);
  if (typeof caseDef.fixturePath === "string" && caseDef.fixturePath.trim()) {
    return path.resolve(repoRoot, caseDef.fixturePath);
  }
  throw usageError("--case requires --actual <path-to-finalqa.md> when fixturePath is not set.");
}

function evaluateAllGoldenCases(cases) {
  if (!Array.isArray(cases)) {
    return {
      pass: false,
      overall: "Fail",
      failures: ["docs/golden-cases.json must be an array."],
      warnings: [],
      checkedItems: [],
      cases: [],
      summary: "Fail: Golden Case JSON is not an array.",
    };
  }

  const caseResults = cases.map((caseDef) => {
    const caseId = getCaseId(caseDef) || "(missing caseId)";
    if (!caseDef.fixturePath) {
      return makeFailedCaseEvaluation(caseDef, [`${caseId} fixturePath is not set.`]);
    }
    try {
      const actualPath = resolveActualPath(caseDef, "");
      const actualText = readTextFile(actualPath, `${caseId} fixture`);
      return evaluateGoldenCase(caseDef, actualText);
    } catch (error) {
      return makeFailedCaseEvaluation(caseDef, [error.message]);
    }
  });

  const failures = caseResults.flatMap((result) => (
    result.failures.map((failure) => `${result.caseId}: ${failure}`)
  ));
  const warnings = caseResults.flatMap((result) => (
    result.warnings.map((warning) => `${result.caseId}: ${warning}`)
  ));
  const checkedItems = caseResults.flatMap((result) => (
    result.checkedItems.map((item) => `${result.caseId}: ${item}`)
  ));
  const pass = failures.length === 0;

  return {
    overall: pass ? "Pass" : "Fail",
    pass,
    failures,
    warnings,
    checkedItems,
    cases: caseResults,
    summary: `${pass ? "Pass" : "Fail"}: ${caseResults.length} cases, ${failures.length} failures, ${warnings.length} warnings, ${checkedItems.length} checked items`,
  };
}

function makeFailedCaseEvaluation(caseDef, failures) {
  const caseId = getCaseId(caseDef) || "(missing caseId)";
  return {
    caseId,
    title: caseDef.title || caseId,
    overall: "Fail",
    pass: false,
    failures,
    warnings: [],
    checkedItems: [],
    summary: `Fail: ${failures.length} failures`,
    extracted: {
      hasCompletePrompt: false,
      hasDecisionLedger: false,
      hasAnswerLedger: false,
      cards: {},
    },
    actual: {
      decisionLedger: "",
      answerLedger: "",
      completePrompt: "",
    },
  };
}

function listGoldenCases(cases) {
  if (!Array.isArray(cases)) {
    throw usageError("Golden Case JSON must be an array.");
  }
  cases.forEach((caseDef, index) => {
    const id = getCaseId(caseDef) || "(missing caseId)";
    const title = caseDef.title || "(missing title)";
    const mode = caseDef.mode || "(missing mode)";
    const topic = caseDef.initialTopic || caseDef.theme || "(missing initialTopic)";
    const fixture = caseDef.fixturePath ? `\n  fixturePath: ${caseDef.fixturePath}` : "";
    const note = caseDef.notes ? `\n  notes: ${caseDef.notes}` : "";
    console.log(`${index + 1}. ${id}`);
    console.log(`  title: ${title}`);
    console.log(`  mode: ${mode}`);
    console.log(`  initialTopic: ${topic}${fixture}${note}`);
  });
}

function validateGoldenCases(cases, options = {}) {
  const failures = [];
  const warnings = [];
  const checkedItems = [];
  const minCases = Number.isFinite(options.minCases) ? options.minCases : 4;

  if (!Array.isArray(cases)) {
    return {
      pass: false,
      failures: ["docs/golden-cases.json must be an array."],
      warnings,
      checkedItems: ["json.array"],
    };
  }

  checkedItems.push("json.array");
  if (cases.length === 0) {
    failures.push("docs/golden-cases.json must include at least one case.");
  } else {
    checkedItems.push("json.nonEmpty");
  }
  if (cases.length < minCases) {
    warnings.push(`docs/golden-cases.json has ${cases.length} cases; expected at least ${minCases}.`);
  } else {
    checkedItems.push(`json.minCases:${minCases}`);
  }

  const seenIds = new Map();
  cases.forEach((caseDef, index) => {
    const prefix = `case[${index}]`;
    const id = getCaseId(caseDef);
    if (!id || typeof id !== "string") {
      failures.push(`${prefix}.caseId is required.`);
    } else if (seenIds.has(id)) {
      failures.push(`${prefix}.caseId duplicates ${seenIds.get(id)}: ${id}`);
    } else {
      seenIds.set(id, prefix);
      checkedItems.push(`${id}.caseId`);
    }

    const topic = caseDef.initialTopic || caseDef.theme;
    if (!topic || typeof topic !== "string") {
      failures.push(`${id || prefix}.initialTopic is required.`);
    } else {
      checkedItems.push(`${id || prefix}.initialTopic`);
    }

    if (caseDef.steeringMemos !== undefined && !Array.isArray(caseDef.steeringMemos)) {
      failures.push(`${id || prefix}.steeringMemos must be an array.`);
    }
    if (caseDef.steeringNotes !== undefined && !Array.isArray(caseDef.steeringNotes)) {
      failures.push(`${id || prefix}.steeringNotes must be an array.`);
    }
    if (caseDef.aliases !== undefined && !Array.isArray(caseDef.aliases)) {
      failures.push(`${id || prefix}.aliases must be an array.`);
    }
    if (caseDef.fixturePath !== undefined && typeof caseDef.fixturePath !== "string") {
      failures.push(`${id || prefix}.fixturePath must be a string.`);
    } else if (caseDef.fixturePath) {
      checkedItems.push(`${id || prefix}.fixturePath`);
      const fixtureFullPath = path.resolve(repoRoot, caseDef.fixturePath);
      if (!fs.existsSync(fixtureFullPath)) {
        failures.push(`${id || prefix}.fixturePath does not exist: ${caseDef.fixturePath}`);
      } else {
        checkedItems.push(`${id || prefix}.fixturePath.exists`);
      }
    }

    const expectedKeys = collectExpectedKeys(caseDef);
    if (expectedKeys.length === 0) {
      failures.push(`${id || prefix} must include at least one expected* field or expected object.`);
    } else {
      checkedItems.push(`${id || prefix}.expected`);
    }

    validateArrayField(caseDef, "expectedDecisionLedger", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "expectedAnswerLedger", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "expectedPromptIncludes", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "expectedHandoffCardIncludes", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "expectedPromptExcludes", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "prohibitedRecommendationPatterns", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "allowedSafetyContextPatterns", id || prefix, failures, checkedItems);
    validateArrayField(caseDef, "expectedExitCards", id || prefix, failures, checkedItems);

    if (caseDef.expected && typeof caseDef.expected !== "object") {
      failures.push(`${id || prefix}.expected must be an object when present.`);
    } else if (caseDef.expected) {
      [
        "decisionLedger",
        "answerLedger",
        "exitCards",
        "includes",
        "excludes",
        "completePromptIncludes",
        "completePromptExcludes",
        "handoffCardIncludes",
      ].forEach((field) => {
        if (caseDef.expected[field] !== undefined && !Array.isArray(caseDef.expected[field])) {
          failures.push(`${id || prefix}.expected.${field} must be an array.`);
        }
      });
    }
  });

  return {
    pass: failures.length === 0,
    failures,
    warnings,
    checkedItems,
  };
}

function collectExpectedKeys(caseDef) {
  const directKeys = Object.keys(caseDef).filter((key) => key.startsWith("expected"));
  const nestedKeys = caseDef.expected && typeof caseDef.expected === "object"
    ? Object.keys(caseDef.expected).map((key) => `expected.${key}`)
    : [];
  return [...directKeys, ...nestedKeys];
}

function validateArrayField(caseDef, field, label, failures, checkedItems) {
  if (caseDef[field] === undefined) return;
  if (!Array.isArray(caseDef[field])) {
    failures.push(`${label}.${field} must be an array.`);
  } else {
    checkedItems.push(`${label}.${field}`);
  }
}

function printValidationResult(result) {
  console.log(`Golden Case JSON: ${result.pass ? "Pass" : "Fail"}`);
  console.log(`Failures: ${result.failures.length}`);
  console.log(`Warnings: ${result.warnings.length}`);
  console.log(`Checked Items: ${result.checkedItems.length}`);
  printList("Failures", result.failures);
  printList("Warnings", result.warnings);
}

function evaluateGoldenCase(caseDef, actualText) {
  const normalizedCase = normalizeCase(caseDef);
  const actual = extractActual(actualText);
  const failures = [];
  const warnings = [];
  const checkedItems = [];

  checkTextExpectations({
    label: "Decision Ledger",
    fieldName: "decisionLedger",
    expectations: normalizedCase.expectedDecisionLedger,
    primaryText: actual.parts.decisionLedger.text,
    fallbackText: actualText,
    failures,
    warnings,
    checkedItems,
  });

  checkTextExpectations({
    label: "Answer Ledger",
    fieldName: "answerLedger",
    expectations: normalizedCase.expectedAnswerLedger,
    primaryText: actual.parts.answerLedger.text,
    fallbackText: [
      actual.parts.decisionLedger.text,
      actual.parts.completePrompt.text,
      actualText,
    ].join("\n\n"),
    failures,
    warnings,
    checkedItems,
  });

  checkPromptIncludes({
    expectations: normalizedCase.expectedPromptIncludes,
    actual,
    fullText: actualText,
    failures,
    warnings,
    checkedItems,
  });

  checkTextExpectations({
    label: "Handoff Card",
    fieldName: "handoffCard",
    expectations: normalizedCase.expectedHandoffCardIncludes,
    primaryText: actual.parts.handoffCard.text,
    fallbackText: actualText,
    failures,
    warnings,
    checkedItems,
  });

  checkPromptExcludes({
    expectations: normalizedCase.expectedPromptExcludes,
    actual,
    fullText: actualText,
    failures,
    checkedItems,
  });

  checkForbiddenPatterns({
    patterns: normalizedCase.prohibitedRecommendationPatterns,
    safetyPatterns: normalizedCase.allowedSafetyContextPatterns,
    actual,
    fullText: actualText,
    failures,
    checkedItems,
  });

  checkExitCards({
    expectations: normalizedCase.expectedExitCards,
    actual,
    failures,
    checkedItems,
  });

  checkExitCardIncludes({
    expectations: normalizedCase.expectedExitCardIncludes,
    actual,
    failures,
    checkedItems,
  });

  const pass = failures.length === 0;
  return {
    caseId: normalizedCase.caseId,
    title: normalizedCase.title,
    overall: pass ? "Pass" : "Fail",
    pass,
    failures,
    warnings,
    checkedItems,
    summary: `${pass ? "Pass" : "Fail"}: ${failures.length} failures, ${warnings.length} warnings, ${checkedItems.length} checked items`,
    extracted: {
      hasCompletePrompt: Boolean(actual.parts.completePrompt.text),
      hasDecisionLedger: Boolean(actual.parts.decisionLedger.text),
      hasAnswerLedger: Boolean(actual.parts.answerLedger.text),
      cards: Object.fromEntries(
        Object.entries(actual.parts).map(([key, value]) => [
          key,
          { found: Boolean(value.text), source: value.source },
        ]),
      ),
    },
    actual: {
      decisionLedger: actual.parts.decisionLedger.text,
      answerLedger: actual.parts.answerLedger.text,
      completePrompt: actual.parts.completePrompt.text,
    },
  };
}

function normalizeCase(caseDef) {
  const expected = caseDef.expected && typeof caseDef.expected === "object" ? caseDef.expected : {};
  return {
    caseId: getCaseId(caseDef),
    title: caseDef.title || getCaseId(caseDef),
    expectedDecisionLedger: asStringArray(
      caseDef.expectedDecisionLedger
        || expected.decisionLedger
        || expected.ledger
        || [],
    ),
    expectedAnswerLedger: asStringArray(
      caseDef.expectedAnswerLedger
        || expected.answerLedger
        || [],
    ),
    expectedPromptIncludes: asStringArray(
      caseDef.expectedPromptIncludes
        || caseDef.completePromptIncludes
        || expected.includes
        || expected.completePromptIncludes
        || expected.promptIncludes
        || [],
    ),
    expectedHandoffCardIncludes: asStringArray(
      caseDef.expectedHandoffCardIncludes
        || expected.handoffCardIncludes
        || [],
    ),
    expectedPromptExcludes: asStringArray(
      caseDef.expectedPromptExcludes
        || caseDef.completePromptExcludes
        || expected.excludes
        || expected.completePromptExcludes
        || expected.promptExcludes
        || [],
    ),
    prohibitedRecommendationPatterns: asStringArray(
      caseDef.prohibitedRecommendationPatterns
        || expected.prohibitedRecommendationPatterns
        || [],
    ),
    allowedSafetyContextPatterns: asStringArray(
      caseDef.allowedSafetyContextPatterns
        || expected.allowedSafetyContextPatterns
        || defaultSafetyContextPatterns,
    ),
    expectedExitCards: asStringArray(
      caseDef.expectedExitCards
        || expected.exitCards
        || [],
    ),
    expectedExitCardIncludes: normalizeExitCardIncludes(
      caseDef.expectedExitCardIncludes
        || expected.exitCardIncludes
        || {},
    ),
  };
}

function getCaseId(caseDef) {
  return caseDef.caseId || caseDef.id || "";
}

function caseMatches(caseDef, requestedId) {
  const aliases = Array.isArray(caseDef.aliases) ? caseDef.aliases : [];
  return [getCaseId(caseDef), ...aliases].filter(Boolean).includes(requestedId);
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

function normalizeExitCardIncludes(value) {
  if (!value || typeof value !== "object") return {};
  if (Array.isArray(value)) {
    return Object.fromEntries(value
      .filter((item) => item && typeof item === "object")
      .map((item) => [item.card || item.name || "", asStringArray(item.includes || item.expectations || [])])
      .filter(([card, includes]) => card && includes.length > 0));
  }
  return Object.fromEntries(Object.entries(value)
    .map(([card, includes]) => [card, asStringArray(includes)])
    .filter(([card, includes]) => card && includes.length > 0));
}

function extractActual(text) {
  const parts = {};
  Object.entries(markerMap).forEach(([partName, markerNames]) => {
    const markerText = extractFirstAiBoardBlock(text, markerNames);
    if (markerText) {
      parts[partName] = { text: markerText, source: "marker" };
      return;
    }
    const fallbackText = extractMarkdownSubsection(text, headingAliases[partName] || []);
    if (fallbackText) {
      parts[partName] = { text: fallbackText, source: "heading" };
      return;
    }
    parts[partName] = { text: "", source: "missing" };
  });
  if (!parts.completePrompt.text && parts.artifact?.text) {
    parts.completePrompt = { text: parts.artifact.text, source: "reviewArtifactFallback" };
  }
  return { parts };
}

function extractFirstAiBoardBlock(text, markerNames) {
  const names = Array.isArray(markerNames) ? markerNames : [markerNames];
  for (const markerName of names) {
    const markerText = extractAiBoardBlock(text, markerName);
    if (markerText) return markerText;
  }
  return "";
}

function extractAiBoardBlock(text, key) {
  const pattern = new RegExp(
    `<!--\\s*AI_BOARD:${escapeRegExp(key)}:START\\s*-->\\s*([\\s\\S]*?)\\s*<!--\\s*AI_BOARD:${escapeRegExp(key)}:END\\s*-->`,
    "u",
  );
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function extractMarkdownSubsection(text, aliases) {
  for (const alias of aliases) {
    const escaped = escapeRegExp(alias);
    const headingRegex = new RegExp(`(^|\\n)(#{1,6})\\s*${escaped}\\s*\\n`, "u");
    const match = headingRegex.exec(text);
    if (!match) continue;
    const level = match[2].length;
    const start = match.index + match[0].length;
    const remainder = text.slice(start);
    const nextHeadingRegex = /\n(#{1,6})\s+/gu;
    let endOffset = remainder.length;
    let nextMatch = nextHeadingRegex.exec(remainder);
    while (nextMatch) {
      if (nextMatch[1].length <= level) {
        endOffset = nextMatch.index;
        break;
      }
      nextMatch = nextHeadingRegex.exec(remainder);
    }
    return remainder.slice(0, endOffset).trim();
  }
  return "";
}

function checkTextExpectations({
  label,
  fieldName,
  expectations,
  primaryText,
  fallbackText,
  failures,
  warnings,
  checkedItems,
}) {
  if (expectations.length === 0) return;
  expectations.forEach((expectation) => {
    const primaryMatch = expectationMatches(primaryText, expectation, true);
    if (primaryMatch) {
      checkedItems.push(`${fieldName}: ${expectation}`);
      return;
    }
    const fallbackMatch = expectationMatches(fallbackText, expectation, true);
    if (fallbackMatch) {
      warnings.push(`${label} expectation found only outside extracted ${label}: ${expectation}`);
      checkedItems.push(`${fieldName}.fallback: ${expectation}`);
      return;
    }
    failures.push(`${label} missing expected value: ${expectation}`);
  });
}

function checkPromptIncludes({ expectations, actual, fullText, failures, warnings, checkedItems }) {
  if (expectations.length === 0) return;
  const completePrompt = actual.parts.completePrompt.text;
  if (!completePrompt) {
    failures.push("Complete prompt was not extracted.");
    return;
  }
  expectations.forEach((expectation) => {
    if (expectationMatches(completePrompt, expectation, true)) {
      checkedItems.push(`completePrompt.includes: ${expectation}`);
      return;
    }
    if (expectationMatches(fullText, expectation, true)) {
      warnings.push(`Prompt include found outside complete prompt: ${expectation}`);
      checkedItems.push(`completePrompt.includes.fallback: ${expectation}`);
      return;
    }
    failures.push(`Complete prompt missing expected text: ${expectation}`);
  });
}

function checkPromptExcludes({ expectations, actual, fullText, failures, checkedItems }) {
  if (expectations.length === 0) return;
  const targetText = actual.parts.completePrompt.text || fullText;
  expectations.forEach((expectation) => {
    const unsafeMatches = findUnsafeLiteralMatches(targetText, expectation, defaultSafetyContextPatterns);
    if (unsafeMatches.length > 0) {
      failures.push(`Complete prompt contains excluded text outside safety context: ${expectation}`);
      return;
    }
    checkedItems.push(`completePrompt.excludes: ${expectation}`);
  });
}

function checkForbiddenPatterns({ patterns, safetyPatterns, actual, fullText, failures, checkedItems }) {
  if (patterns.length === 0) return;
  const targetText = actual.parts.completePrompt.text || fullText;
  patterns.forEach((pattern) => {
    const unsafeMatches = findUnsafeRegexMatches(targetText, pattern, safetyPatterns);
    if (unsafeMatches.length > 0) {
      failures.push(`Forbidden recommendation pattern found outside safety context: ${pattern}`);
      return;
    }
    checkedItems.push(`prohibitedRecommendationPattern.safe: ${pattern}`);
  });
}

function checkExitCards({ expectations, actual, failures, checkedItems }) {
  if (expectations.length === 0) return;
  expectations.forEach((cardName) => {
    const normalizedName = normalizeLabel(cardName);
    const partKeys = exitCardAliases[normalizedName] || exitCardAliases[cardName] || "";
    const keyList = Array.isArray(partKeys) ? partKeys : [partKeys].filter(Boolean);
    if (keyList.length === 0) {
      failures.push(`Unknown expected exit card label: ${cardName}`);
      return;
    }
    const found = keyList.some((partKey) => actual.parts[partKey] && actual.parts[partKey].text);
    if (!found) {
      failures.push(`Expected exit card was not extracted: ${cardName}`);
      return;
    }
    checkedItems.push(`exitCard.exists: ${cardName}`);
  });
}

function checkExitCardIncludes({ expectations, actual, failures, checkedItems }) {
  Object.entries(expectations).forEach(([cardName, includes]) => {
    const normalizedName = normalizeLabel(cardName);
    const partKeys = exitCardAliases[normalizedName] || exitCardAliases[cardName] || "";
    const keyList = Array.isArray(partKeys) ? partKeys : [partKeys].filter(Boolean);
    if (keyList.length === 0) {
      failures.push(`Unknown expected exit card include label: ${cardName}`);
      return;
    }
    const partKey = keyList.find((key) => actual.parts[key] && actual.parts[key].text);
    if (!partKey) {
      failures.push(`Expected exit card was not extracted for include check: ${cardName}`);
      return;
    }
    includes.forEach((expectation) => {
      if (!expectationMatches(actual.parts[partKey].text, expectation, true)) {
        failures.push(`Exit card "${cardName}" missing expected text: ${expectation}`);
        return;
      }
      checkedItems.push(`exitCard.includes:${cardName}: ${expectation}`);
    });
  });
}

function expectationMatches(text, expectation, splitColonValue) {
  if (!text) return false;
  return buildNeedles(expectation, splitColonValue).some((needle) => (
    normalizeForMatch(text).includes(normalizeForMatch(needle))
  ));
}

function buildNeedles(expectation, splitColonValue) {
  const needles = [expectation];
  if (splitColonValue) {
    const colonIndex = Math.max(expectation.lastIndexOf("："), expectation.lastIndexOf(":"));
    if (colonIndex >= 0 && colonIndex < expectation.length - 1) {
      needles.push(expectation.slice(colonIndex + 1).trim());
    }
  }
  return [...new Set(needles.filter(Boolean))];
}

function findUnsafeLiteralMatches(text, literal, safetyPatterns) {
  if (!text || !literal) return [];
  const matches = [];
  let start = 0;
  while (start < text.length) {
    const index = text.indexOf(literal, start);
    if (index < 0) break;
    const context = getContext(text, index, literal.length);
    if (!contextIsSafe(context, safetyPatterns)) {
      matches.push({ index, context });
    }
    start = index + literal.length;
  }
  return matches;
}

function findUnsafeRegexMatches(text, pattern, safetyPatterns) {
  if (!text || !pattern) return [];
  const matches = [];
  let regex;
  try {
    regex = new RegExp(pattern, "gu");
  } catch (error) {
    return [{ index: 0, context: `Invalid regex: ${pattern} (${error.message})` }];
  }
  let match = regex.exec(text);
  while (match) {
    const context = getContext(text, match.index, match[0].length);
    if (!contextIsSafe(context, safetyPatterns)) {
      matches.push({ index: match.index, context });
    }
    if (match[0].length === 0) regex.lastIndex += 1;
    match = regex.exec(text);
  }
  return matches;
}

function contextIsSafe(context, safetyPatterns) {
  const allPatterns = [...defaultSafetyContextPatterns, ...safetyPatterns];
  return allPatterns.some((pattern) => {
    if (!pattern) return false;
    if (context.includes(pattern)) return true;
    try {
      return new RegExp(pattern, "u").test(context);
    } catch {
      return false;
    }
  });
}

function getContext(text, index, length) {
  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + length + 80);
  return text.slice(start, end);
}

function normalizeLabel(label) {
  return label.replace(/\s+/g, "").replace(/[・\-/]/g, "");
}

function normalizeForMatch(value) {
  return String(value)
    .normalize("NFKC")
    .replace(/[：:]/g, ":")
    .replace(/[、。，．・\s]/g, "")
    .toLowerCase();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function printEvaluation(evaluation) {
  console.log(`Golden Case: ${evaluation.caseId}`);
  console.log(`Title: ${evaluation.title}`);
  console.log(`Overall: ${evaluation.overall}`);
  console.log(`Failures: ${evaluation.failures.length}`);
  console.log(`Warnings: ${evaluation.warnings.length}`);
  console.log(`Checked Items: ${evaluation.checkedItems.length}`);
  printList("Failures", evaluation.failures);
  printList("Warnings", evaluation.warnings);
  printList("Checked Items", evaluation.checkedItems);
}

function printAllEvaluation(evaluation) {
  console.log(`Golden Cases Overall: ${evaluation.overall}`);
  console.log(`Cases: ${evaluation.cases.length}`);
  console.log(`Failures: ${evaluation.failures.length}`);
  console.log(`Warnings: ${evaluation.warnings.length}`);
  console.log(`Checked Items: ${evaluation.checkedItems.length}`);
  console.log("");
  evaluation.cases.forEach((caseResult) => {
    console.log(`- ${caseResult.caseId}: ${caseResult.overall} (${caseResult.failures.length} failures, ${caseResult.warnings.length} warnings, ${caseResult.checkedItems.length} checked)`);
  });
  printList("Failures", evaluation.failures);
  printList("Warnings", evaluation.warnings);
}

function printList(label, items) {
  if (!items || items.length === 0) return;
  console.log("");
  console.log(`${label}:`);
  items.forEach((item) => {
    console.log(`- ${item}`);
  });
}

main();
