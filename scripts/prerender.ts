import fs from "node:fs";
import path from "node:path";
import {
  NOT_FOUND_SEO,
  SEO_BY_PATH,
  SITE_URL,
  type SeoConfig,
} from "../shared/seo";
import { getStaticBodyHtml } from "./prerender-content";

const rootDir = process.cwd();
const outDir = path.join(rootDir, "dist", "public");
const templatePath = path.join(outDir, "index.html");

if (!fs.existsSync(templatePath)) {
  throw new Error(
    `Could not find ${templatePath}. Run Vite before prerendering.`,
  );
}

const template = fs.readFileSync(templatePath, "utf8");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function buildStructuredData(pathname: string, seo: SeoConfig): object {
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  const graph: any[] = [];

  // 1. Organization & Website baseline
  const orgSchema = {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: "ADHD Compass",
    alternateName: "ADHD Compass Educational Initiative",
    url: SITE_URL,
    logo: `${SITE_URL}/images/adhd-compass-logo.png`,
    description:
      "An independent, evidence-based, compassionate educational compass translating ADHD neurobiology, pharmacology, and lived experiences into accessible insights.",
    publishingPrinciples: `${SITE_URL}/about`,
    knowsAbout: [
      "Attention Deficit Hyperactivity Disorder (ADHD)",
      "Executive Functioning and Executive Dysfunction",
      "Prefrontal Cortex Neurobiology",
      "Dopamine and Norepinephrine Transporter Mechanisms",
      "ADHD Medication: Stimulant and Non-Stimulant Pharmacology",
      "Adult ADHD Diagnosis and Assessment Pathways",
      "Academic and Workplace Accommodations",
    ],
  };

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: "ADHD Compass",
    description:
      "Evidence-based, compassionate guide to ADHD neuroscience, treatments & lived experience.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };

  if (pathname === "/") {
    const homeMedicalSchema = {
      "@type": "MedicalWebPage",
      name: "ADHD Compass",
      url: `${SITE_URL}/`,
      description:
        "Evidence-based, interactive educational guide and assessment for Attention Deficit Hyperactivity Disorder.",
      about: {
        "@type": "MedicalCondition",
        name: "Attention Deficit Hyperactivity Disorder",
        alternateName: "ADHD",
      },
    };
    graph.push(orgSchema, websiteSchema, homeMedicalSchema);
  } else if (pathname === "/about") {
    graph.push(orgSchema, {
      "@type": "AboutPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    });
  }

  // 2. BreadcrumbList
  if (seo.breadcrumbs && seo.breadcrumbs.length > 0) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumbs`,
      itemListElement: seo.breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path === "/" ? "/" : crumb.path}`,
      })),
    });
  }

  // 3. MedicalWebPage for chapters
  if (pathname.startsWith("/chapter/")) {
    const medicalSchema: any = {
      "@type": "MedicalWebPage",
      "@id": `${canonicalUrl}#medicalwebpage`,
      url: canonicalUrl,
      name: seo.title,
      description: seo.description,
      inLanguage: "en-US",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: {
        "@type": "MedicalCondition",
        name: "Attention Deficit Hyperactivity Disorder",
        alternateName: ["ADHD", "ADD", "Attention Deficit Disorder"],
        code: [
          { "@type": "MedicalCode", code: "F90", codingSystem: "ICD-10-CM" },
          { "@type": "MedicalCode", code: "406506008", codingSystem: "SNOMED-CT" },
          { "@type": "MedicalCode", code: "D001289", codingSystem: "MeSH" },
        ],
        sameAs: "https://www.wikidata.org/wiki/Q178041",
      },
      medicalAudience: {
        "@type": "MedicalAudience",
        medicalAudienceType: "Patients, Caregivers, Healthcare Professionals, Students",
      },
      citation: [
        "NICE Guideline NG87: Attention deficit hyperactivity disorder: diagnosis and management (2018/2024)",
        "Cortese et al., Comparative efficacy and tolerability of medications for ADHD in children, adolescents, and adults: a systematic review and network meta-analysis, Lancet Psychiatry (2018)",
        "Faraone et al., The World Federation of ADHD International Consensus Statement, Neuroscience & Biobehavioral Reviews (2021)",
      ],
      publisher: { "@id": `${SITE_URL}/#organization` },
    };
    graph.push(medicalSchema);
  }

  // 4. FAQPage
  if (seo.faqItems && seo.faqItems.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      mainEntity: seo.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  // 5. Quiz schema for screening test
  if (seo.quizSchema || pathname === "/chapter/getting-diagnosed/test") {
    const quiz = seo.quizSchema || {
      name: "Adult ADHD Self-Report Scale (ASRS-v1.1) Screener",
      description:
        "An interactive 18-question screening tool based on the World Health Organization ASRS-v1.1 criteria to assess ADHD symptoms.",
      educationalLevel: "Adult",
      about: {
        "@type": "MedicalCondition",
        name: "ADHD",
      },
    };
    graph.push({
      "@context": "https://schema.org",
      "@type": "Quiz",
      name: quiz.name,
      description: quiz.description,
      educationalLevel: quiz.educationalLevel,
      about: quiz.about,
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function renderHtml(
  indexHtml: string,
  rawPathname: string,
  seo: SeoConfig,
) {
  const pathname = normalizePathname(rawPathname);
  const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

  let html = indexHtml.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(seo.title)}</title>`,
  );

  html = html
    .replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:site_name["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:type["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:title["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:description["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+property=["']og:url["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+[^>]*property=["']og:image(?::[^"']*)?["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']twitter:card["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']twitter:title["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+name=["']twitter:description["'][^>]*>/gi, "")
    .replace(/\s*<meta\s+[^>]*name=["']twitter:image(?::[^"']*)?["'][^>]*>/gi, "")
    .replace(
      /\s*<script[^>]+id=["']adhd-compass-website-schema["'][\s\S]*?<\/script>/gi,
      "",
    )
    .replace(
      /\s*<script[^>]+id=["']adhd-compass-structured-data["'][\s\S]*?<\/script>/gi,
      "",
    )
    .replace(
      /\s*<script[^>]+id=["']adhd-compass-quiz-schema["'][\s\S]*?<\/script>/gi,
      "",
    );

  if (pathname !== "/") {
    html = html.replace(
      /\s*<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type":\s*"MedicalWebPage"[\s\S]*?<\/script>/gi,
      "",
    );
  }

  const structuredData = buildStructuredData(pathname, seo);

  const tags = [
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${
      seo.index === false ? "noindex,follow" : "index,follow"
    }" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="ADHD Compass" />`,
    `<meta property="og:type" content="${seo.type || "website"}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${SITE_URL}/og-preview.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-preview.png" />`,
    `<script id="adhd-compass-structured-data" type="application/ld+json">${JSON.stringify(
      structuredData,
    )}</script>`,
  ];

  if (seo.quizSchema) {
    tags.push(
      `<script id="adhd-compass-quiz-schema" type="application/ld+json">${JSON.stringify(
        seo.quizSchema,
      )}</script>`,
    );
  }

  html = html.replace(
    "</head>",
    `  ${tags.join("\n    ")}\n  </head>`,
  );

  const bodyHtml = getStaticBodyHtml(pathname, seo);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`,
  );

  return html;
}

for (const [route, seo] of Object.entries(SEO_BY_PATH)) {
  if (route === "/404") {
    continue;
  }

  const pageHtml = renderHtml(template, route, seo);

  if (route === "/") {
    fs.writeFileSync(path.join(outDir, "index.html"), pageHtml, "utf8");
    console.log("Pre-rendered / -> dist/public/index.html");
  } else {
    const relative = route.replace(/^\/+/, "").replace(/\/+$/, "");
    
    // Write both `relative.html` AND `relative/index.html` for 100% routing compatibility
    const fileFlat = path.join(outDir, `${relative}.html`);
    const fileNested = path.join(outDir, relative, "index.html");

    fs.mkdirSync(path.dirname(fileFlat), { recursive: true });
    fs.mkdirSync(path.dirname(fileNested), { recursive: true });

    fs.writeFileSync(fileFlat, pageHtml, "utf8");
    fs.writeFileSync(fileNested, pageHtml, "utf8");

    console.log(`Pre-rendered ${route} -> ${relative}.html and ${relative}/index.html`);
  }
}

const notFoundHtml = renderHtml(template, "/404", NOT_FOUND_SEO);
fs.writeFileSync(path.join(outDir, "404.html"), notFoundHtml, "utf8");
console.log("Pre-rendered /404 -> dist/public/404.html");
