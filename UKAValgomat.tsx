import React, { useMemo, useState } from "react";

// UKA Valgomat – enkel én-filskomponent
// ------------------------------------------------------
// Slik bruker du denne malen:
// 1) Lim komponenten inn i et nytt React-prosjekt (Vite/Next) og rendrer <UKAValgomat /> på en side.
// 2) Tilpass QUESTIONS og POSITIONS nedenfor. Bytt ut eksempelrollene med UKAs 37 roller.
// 3) (Valgfritt) Endre tekstene under UI_STRINGS for bokmål/nynorsk/engelsk.
// 4) Del siden – ingen backend nødvendig. All logikk skjer i nettleseren.
// ------------------------------------------------------

// -------------------- Språk/tekster --------------------
const UI_STRINGS = {
  title: "Finn din UKA-rolle",
  intro:
    "Svar på noen raske påstander, så matcher vi deg med de rollene som passer best.",
  start: "Start",
  next: "Neste",
  back: "Tilbake",
  seeResults: "Se resultater",
  yourMatches: "Dine beste treff",
  filtersTitle: "Praktisk informasjon",
  languageLabel: "Hvilke språk er du komfortabel med på vakt?",
  nightOkLabel: "Ok med kvelds-/nattvakter ved behov",
  yes: "Ja",
  no: "Nei",
  norwegian: "Norsk",
  english: "Engelsk",
  questionsTitle: "Om deg",
  sliderLeft: "Uenig",
  sliderRight: "Enig",
  whyThisFits: "Hvorfor dette passer:",
  adjustPrefs: "Juster svarene dine under for å se endringer i sanntid.",
};

// -------------------- Spørsmål --------------------
// Skala-spørsmål måles 0–100 (fra venstre til høyre).
export type Question = {
  id: string;
  text: string;
  weight: number; // betydning i total score
  leftLabel?: string;
  rightLabel?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "people_facing",
    text: "Jeg trives med publikums-/gjestekontakt.",
    weight: 1.1,
  },
  {
    id: "creative",
    text: "Jeg liker kreative oppgaver (idé, design, innhold).",
    weight: 1.0,
  },
  {
    id: "operational",
    text: "Jeg liker operative/logistikk-oppgaver (flyt, rigg, koordinering).",
    weight: 1.0,
  },
  {
    id: "tech",
    text: "Jeg er komfortabel med teknikk/verktøy (lys/lyd/scene/IT).",
    weight: 1.1,
  },
  {
    id: "detail_oriented",
    text: "Jeg er detaljorientert og liker struktur og rutiner.",
    weight: 1.0,
  },
  {
    id: "fast_paced",
    text: "Jeg trives når det går fort og under litt press.",
    weight: 1.0,
  },
  {
    id: "leadership",
    text: "Jeg ønsker ansvar/ledelse for små team eller skift.",
    weight: 1.0,
  },
  {
    id: "physical",
    text: "Jeg liker fysisk arbeid (bæring/rigg) når det trengs.",
    weight: 1.0,
  },
  {
    id: "bar_service",
    text: "Bar-/servering høres gøy ut.",
    weight: 0.9,
  },
  {
    id: "safety",
    text: "Jeg er komfortabel med vakthold/sikkerhet/beredskap.",
    weight: 1.0,
  },
  {
    id: "media",
    text: "Foto/film/innholdsproduksjon interesserer meg.",
    weight: 0.9,
  },
  {
    id: "marketing",
    text: "Markedsføring/SoMe/partnerskap virker motiverende.",
    weight: 0.9,
  },
  {
    id: "finance_admin",
    text: "Økonomi/administrasjon/systemoppgaver passer meg.",
    weight: 0.9,
  },
  {
    id: "problem_solving",
    text: "Jeg liker å løse praktiske problemer på stedet.",
    weight: 1.0,
  },
  {
    id: "night_owl",
    text: "Jeg fungerer fint på kvelds-/natteskift.",
    weight: 0.8,
  },
];

// -------------------- Roller/vekter --------------------
// For hver rolle setter du et mål (target 0–100) for hvert spørsmål,
// samt en vekt (hvor viktig det er for rollen). Du kan la noen spørsmål mangle.
export type Position = {
  id: string;
  name: string;
  blurb: string;
  // mål og vekt per spørsmål
  q: Record<string, { target: number; weight: number }>;
  // enkle filtre/krav (knockouts)
  must?: {
    nightOk?: boolean; // krever natt-OK
    language?: "no" | "en" | "any"; // arbeidsspråk
    physical?: "low" | "med" | "high"; // fysisk krav
  };
};

// EKSEMPELROLLER (bytt ut med UKAs 37 roller)
const POSITIONS: Position[] = [
  // 1) Vertskapet Dødens Dal
  {
    id: "vert_dd",
    name: "Vert (Dødens dal)",
    blurb:
      "Sikkerhet, publikumsflyt og trivsel i Dødens dal. Ingen forkunnskaper – entusiasme viktig. (Norsk ikke krav)",
    q: {
      safety: { target: 85, weight: 1.3 },
      people_facing: { target: 75, weight: 1.0 },
      fast_paced: { target: 70, weight: 1.0 },
      problem_solving: { target: 65, weight: 0.9 },
      detail_oriented: { target: 60, weight: 0.8 },
      physical: { target: 60, weight: 0.8 },
      night_owl: { target: 70, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },

  // 2–4) Arrangement
  {
    id: "arr_backstage",
    name: "Backstageassistent",
    blurb:
      "Utforming og drift av backstage. Innkjøp, tidsplan og hospitality. Førerkort B er en fordel.",
    q: {
      detail_oriented: { target: 75, weight: 1.0 },
      operational: { target: 70, weight: 1.0 },
      people_facing: { target: 60, weight: 0.8 },
      fast_paced: { target: 65, weight: 0.9 },
      problem_solving: { target: 65, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },
  {
    id: "arr_stagehand",
    name: "Stagehand (Dødens dal)",
    blurb:
      "Teknisk produksjon på scenen: rigg, sceneskift, nedrigg. Opplæring gis.",
    q: {
      tech: { target: 80, weight: 1.2 },
      physical: { target: 85, weight: 1.2 },
      operational: { target: 80, weight: 1.0 },
      fast_paced: { target: 75, weight: 1.0 },
      problem_solving: { target: 70, weight: 1.0 },
      detail_oriented: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "high" },
  },
  {
    id: "arr_driver",
    name: "Sjåfør (artist/crew)",
    blurb:
      "Kjøre artister/crew/utstyr til/fra Dalen. Manuell førerkort kreves. Varierte oppgaver på arrangementsdager.",
    q: {
      people_facing: { target: 60, weight: 0.8 },
      detail_oriented: { target: 70, weight: 0.9 },
      operational: { target: 65, weight: 0.9 },
      fast_paced: { target: 55, weight: 0.7 },
      problem_solving: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },

  // 5–6) Event
  {
    id: "event_medarbeider",
    name: "Eventmedarbeider",
    blurb:
      "Planlegging og gjennomføring av temafester, show, kurs og foredrag på Samfundet.",
    q: {
      creative: { target: 75, weight: 1.0 },
      people_facing: { target: 70, weight: 1.0 },
      operational: { target: 65, weight: 0.9 },
      detail_oriented: { target: 60, weight: 0.8 },
      fast_paced: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "no", physical: "low" },
  },
  {
    id: "event_dj",
    name: "DJ",
    blurb:
      "Spille musikk i Samfundets lokaler og skape god stemning. Opplæring mulig.",
    q: {
      creative: { target: 85, weight: 1.1 },
      people_facing: { target: 65, weight: 0.9 },
      fast_paced: { target: 70, weight: 0.9 },
      tech: { target: 55, weight: 0.7 },
      night_owl: { target: 80, weight: 0.9 },
    },
    must: {nightOk: true, language: "no", physical: "low" },
  },

  // 7–9) HusU
  {
    id: "husu_band_trikken",
    name: "Bandmedlem – Trikken",
    blurb:
      "Spille i nyskrevet teaterproduksjon. Musikk utvikles sammen med kapellmester.",
    q: {
      creative: { target: 80, weight: 1.1 },
      people_facing: { target: 60, weight: 0.8 },
      detail_oriented: { target: 60, weight: 0.7 },
      night_owl: { target: 55, weight: 0.6 },
    },
    must: {nightOk: false, language: "no", physical: "low" },
  },
  {
    id: "husu_ukespiller_strindens",
    name: "UKE-spiller – Strindens",
    blurb:
      "Spilleopptredener (bl.a. UKE-blæst og UKErevy). Sosialt orkestermiljø.",
    q: {
      creative: { target: 75, weight: 1.0 },
      people_facing: { target: 70, weight: 0.9 },
      fast_paced: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "no", physical: "low" },
  },
  {
    id: "husu_skuespiller_trikken",
    name: "Skuespiller – Trikken",
    blurb:
      "En del av ensemblet i nyskrevet nattforestilling. Øvinger + forestillinger i oktober.",
    q: {
      creative: { target: 85, weight: 1.2 },
      people_facing: { target: 80, weight: 1.0 },
      detail_oriented: { target: 65, weight: 0.8 },
      fast_paced: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "no", physical: "low" },
  },

  // 10) Konsert
  {
    id: "konsert_medarbeider",
    name: "Konsertmedarbeider",
    blurb:
      "Kjøre artister/crew, klargjøre backstage og bidra til konsertgjennomføring på Samfundet.",
    q: {
      people_facing: { target: 60, weight: 0.9 },
      operational: { target: 65, weight: 1.0 },
      fast_paced: { target: 65, weight: 0.9 },
      detail_oriented: { target: 55, weight: 0.7 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },

  // 11–19) KSG (bar/kafé/restaurant/lager)
  {
    id: "ksg_spritbartender",
    name: "Spritbartender",
    blurb:
      "Cocktailbarene (20-års): miksing og service 2–3 vakter/uke. Må være 20 år.",
    q: {
      bar_service: { target: 90, weight: 1.2 },
      people_facing: { target: 85, weight: 1.1 },
      fast_paced: { target: 80, weight: 1.0 },
      detail_oriented: { target: 55, weight: 0.7 },
      night_owl: { target: 80, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_barsjef",
    name: "Barsjef (18-årsbarer)",
    blurb:
      "Drift og skiftledelse i barene. Opplæring gis. Fadderrolle før UKA.",
    q: {
      leadership: { target: 80, weight: 1.2 },
      people_facing: { target: 80, weight: 1.0 },
      bar_service: { target: 70, weight: 0.9 },
      fast_paced: { target: 75, weight: 1.0 },
      detail_oriented: { target: 65, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_bartender",
    name: "Bartender (18+ lokaler)",
    blurb:
      "2–3 skift i uken på konserter, revy og temafester. Full opplæring.",
    q: {
      bar_service: { target: 85, weight: 1.2 },
      people_facing: { target: 80, weight: 1.0 },
      fast_paced: { target: 80, weight: 1.0 },
      night_owl: { target: 75, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_kafefunk",
    name: "Kaféfunk – Edgar",
    blurb: "Barista/bartending light i Edgar. 2–3 vakter/uke. Opplæring gis.",
    q: {
      people_facing: { target: 85, weight: 1.1 },
      bar_service: { target: 65, weight: 0.9 },
      fast_paced: { target: 60, weight: 0.8 },
      detail_oriented: { target: 55, weight: 0.7 },
    },
    must: {nightOk: false, language: "any", physical: "low" },
  },
  {
    id: "ksg_daglighallen",
    name: "Daglighallen-bartender",
    blurb: "Ølbar med bredt utvalg. Drift i lite team. Opplæring gis.",
    q: {
      bar_service: { target: 80, weight: 1.1 },
      people_facing: { target: 80, weight: 1.0 },
      fast_paced: { target: 65, weight: 0.9 },
      detail_oriented: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_kokk_lyche",
    name: "Kokk – Lyche",
    blurb: "Kjøkken i høyt tempo med japansk-inspirert meny. Preppe- og serviceskift.",
    q: {
      creative: { target: 65, weight: 0.9 },
      operational: { target: 75, weight: 1.0 },
      fast_paced: { target: 80, weight: 1.0 },
      detail_oriented: { target: 75, weight: 1.0 },
      people_facing: { target: 35, weight: 0.5 },
    },
    must: {nightOk: false, language: "any", physical: "med" },
  },
  {
    id: "ksg_spritbarservitor",
    name: "Spritbarservitør – Lyche",
    blurb:
      "Servere mat på dagtid og mikse drinker på kveldstid. Må være 20 år.",
    q: {
      people_facing: { target: 85, weight: 1.1 },
      bar_service: { target: 85, weight: 1.1 },
      fast_paced: { target: 80, weight: 1.0 },
      detail_oriented: { target: 60, weight: 0.8 },
      night_owl: { target: 75, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_hovmester",
    name: "Hovmester – Lyche",
    blurb: "Overordnet ansvar for bar- og servering, skiftledelse og flyt. Må være 20 år.",
    q: {
      leadership: { target: 85, weight: 1.2 },
      people_facing: { target: 85, weight: 1.0 },
      bar_service: { target: 65, weight: 0.9 },
      detail_oriented: { target: 75, weight: 1.0 },
      fast_paced: { target: 75, weight: 1.0 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "ksg_lagerslusk",
    name: "Lagerslusk – KSG Lager",
    blurb:
      "Distribusjon fra lager til barer. Bli kjent med hele huset. Opplæring gis.",
    q: {
      physical: { target: 75, weight: 1.1 },
      operational: { target: 80, weight: 1.1 },
      problem_solving: { target: 60, weight: 0.8 },
      people_facing: { target: 30, weight: 0.5 },
      fast_paced: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "any", physical: "med" },
  },

  // 20) Næringsliv
  {
    id: "naeringsliv_bedrift",
    name: "Bedriftsmedarbeider",
    blurb:
      "Praktisk gjennomføring av bedriftsarrangementer. Oppfølging av bedrifter og UKEfunk.",
    q: {
      people_facing: { target: 80, weight: 1.0 },
      detail_oriented: { target: 75, weight: 1.0 },
      operational: { target: 70, weight: 0.9 },
      marketing: { target: 55, weight: 0.6 },
    },
    must: {nightOk: false, language: "any", physical: "low" },
  },

  // 21–22) Presse
  {
    id: "presse_akkreditor",
    name: "Presseakkreditør",
    blurb: "Ta imot og følge opp presse under UKAs arrangementer på Samfundet og i Dalen.",
    q: {
      people_facing: { target: 85, weight: 1.1 },
      detail_oriented: { target: 70, weight: 0.9 },
      fast_paced: { target: 65, weight: 0.9 },
      problem_solving: { target: 65, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "presse_radioprater",
    name: "UKEsenderen – radioprater",
    blurb: "Intervjue artister og frivillige, lage innslag og nettsaker. Norskkrav.",
    q: {
      media: { target: 85, weight: 1.2 },
      creative: { target: 75, weight: 1.0 },
      people_facing: { target: 80, weight: 1.0 },
      detail_oriented: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "no", physical: "low" },
  },

  // 23–26) Revy
  {
    id: "revy_kulisse",
    name: "Kulissearbeider",
    blurb:
      "Bygge/male/sveise kulisser før UKA. Scenearbeid under forestillingene.",
    q: {
      physical: { target: 80, weight: 1.1 },
      operational: { target: 80, weight: 1.0 },
      creative: { target: 60, weight: 0.8 },
      detail_oriented: { target: 65, weight: 0.9 },
      fast_paced: { target: 65, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "high" },
  },
  {
    id: "revy_kostymeslusk",
    name: "Kostymeslusk",
    blurb:
      "Påkledningslogistikk bak scenen i høyt tempo. Sikre rett kostyme til rett sketsj.",
    q: {
      detail_oriented: { target: 85, weight: 1.2 },
      fast_paced: { target: 80, weight: 1.0 },
      people_facing: { target: 60, weight: 0.8 },
      problem_solving: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "revy_mikrofontekniker",
    name: "Mikrofontekniker",
    blurb: "Sørge for fungerende mikrofoner på alle på scenen. Opplæring gis.",
    q: {
      tech: { target: 85, weight: 1.2 },
      detail_oriented: { target: 80, weight: 1.1 },
      fast_paced: { target: 65, weight: 0.9 },
      people_facing: { target: 40, weight: 0.6 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "revy_rekvisitt",
    name: "Rekvisitørassistent",
    blurb: "Bygging/maling/design/innkjøp av rekvisitter. Kreativt og praktisk.",
    q: {
      creative: { target: 80, weight: 1.1 },
      detail_oriented: { target: 70, weight: 0.9 },
      operational: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "any", physical: "low" },
  },

  // 27–29) Serveringen (Dødens dal)
  {
    id: "serv_grillmester",
    name: "Grillmester (Dødens dal)",
    blurb:
      "Skape festivalmatopplevelser i matteltet i Dalen. Arbeid i riggeperioder + arrangementsdager.",
    q: {
      operational: { target: 80, weight: 1.0 },
      fast_paced: { target: 80, weight: 1.0 },
      physical: { target: 65, weight: 0.9 },
      people_facing: { target: 55, weight: 0.7 },
      detail_oriented: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },
  {
    id: "serv_bartender",
    name: "Bartender (Dødens dal)",
    blurb:
      "Midt i festivalpulsen – sørge for flyt i barene i Dødens dal. 8 vakter totalt.",
    q: {
      bar_service: { target: 90, weight: 1.2 },
      people_facing: { target: 85, weight: 1.1 },
      fast_paced: { target: 85, weight: 1.1 },
      night_owl: { target: 85, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "serv_bartender_fadder",
    name: "Bartender‑fadder (Dødens dal)",
    blurb: "Bygge sosialt miljø og mentorere bartendere. Deltar også som bartender.",
    q: {
      leadership: { target: 75, weight: 1.0 },
      people_facing: { target: 85, weight: 1.0 },
      bar_service: { target: 70, weight: 0.9 },
      fast_paced: { target: 65, weight: 0.9 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "hr_massor",
    name: "Massør (HR)",
    blurb:
      "Gi UKEmassasje til frivillige i massasjestudio på Trafoen. Opplæring av profesjonell massør før oppstart.",
    q: {
      people_facing: { target: 85, weight: 1.1 },
      detail_oriented: { target: 70, weight: 1.0 },
      fast_paced: { target: 45, weight: 0.6 },
      problem_solving: { target: 50, weight: 0.7 },
    },
    must: {nightOk: false, language: "any", physical: "low" },
  },
  {
    id: "telt_rigger",
    name: "Rigger – Telt",
    blurb:
      "Bygge/nedrigge festivalområdet i Dødens dal (telt, gulv, infrastruktur). Praktisk og fysisk arbeid.",
    q: {
      physical: { target: 85, weight: 1.2 },
      operational: { target: 85, weight: 1.2 },
      problem_solving: { target: 65, weight: 0.9 },
      tech: { target: 55, weight: 0.7 },
      detail_oriented: { target: 60, weight: 0.8 },
    },
    must: {nightOk: false, language: "any", physical: "high" },
  },
  {
    id: "telt_runner",
    name: "Runner – Telt",
    blurb:
      "Allround støtte i Dødens dal: småreparasjoner, kjøre/handle, hjelpe der det trengs. Førerkort kreves.",
    q: {
      operational: { target: 75, weight: 1.0 },
      problem_solving: { target: 70, weight: 1.0 },
      fast_paced: { target: 70, weight: 0.9 },
      people_facing: { target: 55, weight: 0.7 },
      detail_oriented: { target: 55, weight: 0.7 },
      physical: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },
  {
    id: "telt_elektriker",
    name: "Elektriker – Telt",
    blurb:
      "Planlegge og legge midlertidig strømnett til hele Dalen (scener, barer, brakker m.m.). Fagbrev kreves.",
    q: {
      tech: { target: 95, weight: 1.3 },
      detail_oriented: { target: 85, weight: 1.1 },
      operational: { target: 85, weight: 1.1 },
      problem_solving: { target: 80, weight: 1.0 },
      physical: { target: 65, weight: 0.8 },
    },
    must: {nightOk: false, language: "any", physical: "med" },
  },
  {
    id: "velferd_hyggefunk",
    name: "Hyggefunk – Velferd",
    blurb:
      "Forpleining til frivillige (mat, kaffe, snacks) og god stemning – både før, under og etter UKA.",
    q: {
      people_facing: { target: 90, weight: 1.2 },
      operational: { target: 70, weight: 0.9 },
      fast_paced: { target: 65, weight: 0.9 },
      detail_oriented: { target: 65, weight: 0.9 },
      problem_solving: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "low" },
  },
  {
    id: "vert_huset",
    name: "Vert (Huset)",
    blurb:
      "Publikumssikkerhet og vertskap på Studentersamfundet (konserter, revy m.m.). Alltid i team.",
    q: {
      safety: { target: 85, weight: 1.2 },
      people_facing: { target: 75, weight: 1.0 },
      fast_paced: { target: 70, weight: 1.0 },
      detail_oriented: { target: 65, weight: 0.9 },
      physical: { target: 60, weight: 0.8 },
    },
    must: {nightOk: true, language: "any", physical: "med" },
  },
];

// -------------------- Skjema / tilstand --------------------
type Answers = Record<string, number>;

type Filters = {
  nightOk: boolean;
  langs: { no: boolean; en: boolean };
};

const DEFAULT_FILTERS: Filters = {
  nightOk: false,
  langs: { no: true, en: true },
};

// -------------------- Scoring --------------------
function applyKnockouts(p: Position, f: Filters): boolean {
  const m = p.must;
  if (!m) return true;
  if (m.nightOk && !f.nightOk) return false;
  if (m.language === "no" && !f.langs.no) return false;
  if (m.language === "en" && !f.langs.en) return false;
  return true;
}

function scorePosition(
  p: Position,
  answers: Answers,
  globalWeights: Record<string, number>
) {
  let sum = 0;
  let denom = 0;
  const breakdown: { qid: string; contribution: number }[] = [];

  for (const [qid, cfg] of Object.entries(p.q)) {
    const ans = answers[qid];
    if (typeof ans !== "number") continue; // ubesvart teller ikke
    const w = (cfg.weight || 1) * (globalWeights[qid] || 1);
    const closeness = 1 - Math.abs(ans - cfg.target) / 100; // 0..1
    const contrib = Math.max(0, closeness) * w;
    sum += contrib;
    denom += w;
    breakdown.push({ qid, contribution: contrib });
  }

  const score = denom > 0 ? (100 * sum) / denom : 0;
  breakdown.sort((a, b) => b.contribution - a.contribution);
  return { score, breakdown };
}

// -------------------- UI-Komponenter --------------------
function Slider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-current"
    />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      <span>{label}</span>
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded-full px-2 py-0.5 text-xs border">{children}</span>;
}

// -------------------- Hovedkomponent --------------------
export default function UKAValgomat() {
  const [step, setStep] = useState<"intro" | "filters" | "questions" | "results">("intro");
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [answers, setAnswers] = useState<Answers>(() => {
    const init: Answers = {};
    QUESTIONS.forEach((q) => (init[q.id] = 50));
    return init;
  });

  const globalWeights = useMemo(() => {
    const map: Record<string, number> = {};
    QUESTIONS.forEach((q) => (map[q.id] = q.weight));
    return map;
  }, []);

  const results = useMemo(() => {
    const rows = POSITIONS.map((p) => {
      const ok = applyKnockouts(p, filters);
      const { score, breakdown } = ok
        ? scorePosition(p, answers, globalWeights)
        : { score: 0, breakdown: [] as { qid: string; contribution: number }[] };
      return { p, score, ok, breakdown };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    return rows;
  }, [answers, filters, globalWeights]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{UI_STRINGS.title}</h1>
        <p className="text-white mt-2">{UI_STRINGS.intro}</p>
      </div>

      {step === "intro" && (
        <div className="grid gap-4">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold mb-2">Hva er dette?</h2>
            <p className="text-sm text-white">
              Dette er en enkel valgomat for å matche deg med roller i UKA basert på preferanser og praktiske
              rammer. Svar ærlig – du kan endre svarene senere og se hvordan matchene endres i sanntid.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("filters")}>
              {UI_STRINGS.start}
            </button>
          </div>
        </div>
      )}

      {step === "filters" && (
        <div className="grid gap-6">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold mb-3">{UI_STRINGS.filtersTitle}</h2>
                        <div className="mb-4">
              <div className="mb-2 text-sm">{UI_STRINGS.languageLabel}</div>
              <div className="flex gap-6">
                <Toggle
                  checked={filters.langs.no}
                  onChange={(v) => setFilters({ ...filters, langs: { ...filters.langs, no: v } })}
                  label={UI_STRINGS.norwegian}
                />
                <Toggle
                  checked={filters.langs.en}
                  onChange={(v) => setFilters({ ...filters, langs: { ...filters.langs, en: v } })}
                  label={UI_STRINGS.english}
                />
              </div>
            </div>

            <Toggle
              checked={filters.nightOk}
              onChange={(v) => setFilters({ ...filters, nightOk: v })}
              label={UI_STRINGS.nightOkLabel}
            />
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("intro")}>
              {UI_STRINGS.back}
            </button>
            <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("questions")}>
              {UI_STRINGS.next}
            </button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="grid gap-6">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold mb-1">{UI_STRINGS.questionsTitle}</h2>
            <p className="text-sm text-white">Dra i skalaen fra «{UI_STRINGS.sliderLeft}» til «{UI_STRINGS.sliderRight}».</p>

            <div className="mt-4 grid gap-6">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="grid gap-2">
                  <div className="font-medium">{q.text}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs whitespace-nowrap">{UI_STRINGS.sliderLeft}</span>
                    <Slider value={answers[q.id]} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
                    <span className="text-xs whitespace-nowrap">{UI_STRINGS.sliderRight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("filters")}>
              {UI_STRINGS.back}
            </button>
            <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("results")}>
              {UI_STRINGS.seeResults}
            </button>
          </div>
        </div>
      )}

      {step === "results" && (
        <div className="grid gap-6">
          <div className="rounded-2xl border p-5">
            <h2 className="font-semibold mb-1">{UI_STRINGS.yourMatches}</h2>
            <p className="text-sm text-white">{UI_STRINGS.adjustPrefs}</p>

            <div className="mt-4 grid gap-4">
              {results.map(({ p, score, ok, breakdown }) => (
                <div key={p.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{p.name}</div>
                      <p className="text-sm text-white">{p.blurb}</p>
                      {!ok && (
                        <div className="mt-2 text-xs text-red-600">
                          Ikke kvalifisert pga. praktiske krav (språk eller natt).
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tabular-nums">{Math.round(score)}%</div>
                      <div className="text-xs text-white">match</div>
                    </div>
                  </div>

                  {breakdown.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium mb-2">{UI_STRINGS.whyThisFits}</div>
                      <div className="flex flex-wrap gap-2">
                        {breakdown.slice(0, 3).map((b) => (
                          <Badge key={b.qid}>
                            {QUESTIONS.find((q) => q.id === b.qid)?.text || b.qid}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5 grid gap-3">
            <h3 className="font-semibold">Finjuster svar</h3>
            <div className="grid gap-6">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="grid gap-2">
                  <div className="text-sm">{q.text}</div>
                  <Slider value={answers[q.id]} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl border" onClick={() => setStep("questions")}>{UI_STRINGS.back}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
