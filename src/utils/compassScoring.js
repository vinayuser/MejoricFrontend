import {
  QUESTIONS,
  TRAIT_DIMS,
  FUNCTION_INFO,
  TYPE_FAMILY,
} from "../data/compassQuestions";

const OPPOSITE_FN = { S: "N", N: "S", T: "F", F: "T" };
const OPPOSITE_ATT = { e: "i", i: "e" };

function avg(answers, dim) {
  const vals = [];
  QUESTIONS.forEach((q, i) => {
    if (q.dim === dim && answers[i] != null) vals.push(answers[i]);
  });
  if (!vals.length) return 3;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function pct100(average) {
  return Math.round(((average - 1) / 4) * 100);
}

export function computeJung(answers) {
  const Ea = avg(answers, "E");
  const Ia = avg(answers, "I");
  const Sa = avg(answers, "S");
  const Na = avg(answers, "N");
  const Ta = avg(answers, "T");
  const Fa = avg(answers, "F");

  const attitude = Ea >= Ia ? "E" : "I";
  const attitudePct = Math.round((Math.max(Ea, Ia) / (Ea + Ia)) * 100);
  const perceiving = Sa >= Na ? "S" : "N";
  const perceivingPct = Math.round((Math.max(Sa, Na) / (Sa + Na)) * 100);
  const judging = Ta >= Fa ? "T" : "F";
  const judgingPct = Math.round((Math.max(Ta, Fa) / (Ta + Fa)) * 100);

  const funcScores = { S: Sa, N: Na, T: Ta, F: Fa };
  const domFunc = Object.keys(funcScores).reduce((a, b) =>
    funcScores[a] >= funcScores[b] ? a : b,
  );
  const domCategory =
    domFunc === "S" || domFunc === "N" ? "perceiving" : "judging";
  const auxFunc = domCategory === "perceiving" ? judging : perceiving;

  const domAttitude = attitude === "E" ? "e" : "i";
  const auxAttitude = OPPOSITE_ATT[domAttitude];
  const tertiaryFunc = OPPOSITE_FN[auxFunc];
  const tertiaryAttitude = domAttitude;
  const inferiorFunc = OPPOSITE_FN[domFunc];
  const inferiorAttitude = OPPOSITE_ATT[domAttitude];

  let jp;
  if (attitude === "E") {
    jp = domFunc === "T" || domFunc === "F" ? "J" : "P";
  } else {
    jp = domFunc === "T" || domFunc === "F" ? "P" : "J";
  }

  return {
    attitude,
    attitudePct,
    perceiving,
    perceivingPct,
    judging,
    judgingPct,
    jp,
    code: attitude + perceiving + judging + jp,
    dominant: domFunc + domAttitude,
    auxiliary: auxFunc + auxAttitude,
    tertiary: tertiaryFunc + tertiaryAttitude,
    inferior: inferiorFunc + inferiorAttitude,
    scores: { E: Ea, I: Ia, S: Sa, N: Na, T: Ta, F: Fa },
  };
}

export function computeTraits(answers) {
  const out = {};
  TRAIT_DIMS.forEach((t) => {
    out[t.key] = avg(answers, t.key);
  });
  return out;
}

export function typeTitle(jung) {
  const fam = TYPE_FAMILY[jung.perceiving + jung.judging];
  return {
    title: fam.name,
    desc: `You're ${fam.blurb} Your energy tends to go ${
      jung.attitude === "E"
        ? "outward — toward people, action, and the room you're in"
        : "inward — you like to think things through before you speak or act"
    }, and you keep things ${
      jung.jp === "J"
        ? "planned and decided rather than left open"
        : "open and easy-going rather than locked down early"
    }.`,
  };
}

export function archetypeText(jung, traits) {
  const topTraits = TRAIT_DIMS.slice()
    .sort((a, b) => traits[b.key] - traits[a.key])
    .slice(0, 2);
  const fam = TYPE_FAMILY[jung.perceiving + jung.judging];
  const names = { ST: "Builder", SF: "Anchor", NT: "Explorer", NF: "Helper" };
  const attitudeTag = jung.attitude === "E" ? "Friendly" : "Thoughtful";
  const name = `The ${attitudeTag} ${names[jung.perceiving + jung.judging]}`;
  const t1 = topTraits[0].label.toLowerCase();
  const t2 = topTraits[1].label.toLowerCase();
  const desc = `Your favourite way of thinking is ${FUNCTION_INFO[
    jung.dominant
  ].name.toLowerCase()}, backed up by ${FUNCTION_INFO[
    jung.auxiliary
  ].name.toLowerCase()} — ${fam.blurb} What stands out most in how you like to get help is your ${t1} and your ${t2}, and that shapes not just what helps you, but how it should be given.`;
  return { name, desc };
}

function joinReasons(arr) {
  if (arr.length === 1) return arr[0];
  return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
}

export function computeRecommendation(jung, traits) {
  const recs = [];
  const mateNote =
    traits.AU >= 3.6
      ? "Since you like doing things yourself, the no-names option is great — you don't even have to say who you are for that first chat."
      : "You're likely to open up pretty naturally here — a Mate is a relaxed place for a first, honest chat.";
  recs.push({
    badge: "Start here",
    name: "Mejoric Mate",
    primary: true,
    path: "/mate",
    text: `A trained, friendly listener, always ready to talk — no waiting around. ${mateNote}`,
  });

  const wantsMentor = jung.judging === "T" || traits.SG >= 3.6;
  if (wantsMentor) {
    const reasons = [];
    if (jung.judging === "T") {
      reasons.push("how you like to think things through with your head");
    }
    if (traits.SG >= 3.6) {
      reasons.push("how much you like having a clear plan");
    }
    const reasonText = reasons.length
      ? joinReasons(reasons)
      : "how you tend to solve problems";
    recs.push({
      badge: "Next step",
      name: "Professional Mentor",
      primary: false,
      path: "/mentors/professional/browse",
      text: `Because of ${reasonText}, you'll likely get more out of clear, step-by-step guidance — for school, goals, or the future — than an open-ended chat alone.`,
    });
  } else {
    const reasons = [];
    if (jung.judging === "F") {
      reasons.push("how much your heart matters when you decide things");
    }
    if (traits.RW >= 3.6) {
      reasons.push("how much you like a warm, ongoing friendship with a helper");
    }
    const reasonText = reasons.length
      ? joinReasons(reasons)
      : "how you tend to connect with people";
    recs.push({
      badge: "Next step",
      name: "Emotional Mentor",
      primary: false,
      path: "/mentors/emotional/browse",
      text: `Because of ${reasonText}, a Mentor who's warm and really gets you will likely feel better than someone who's just quick and to-the-point.`,
    });
  }
  return recs;
}

export function formatNote(traits) {
  if (traits.SE >= 3.6) {
    return "How you might like it: you'd probably enjoy group check-ins with other kids your age too, not just 1-on-1 — hearing how others handle the same stuff seems to genuinely help you.";
  }
  return "How you might like it: 1-on-1 is probably your best fit — you tend to open up more fully without other people listening in, even friendly ones.";
}

export function getCompassAxes(jung) {
  return [
    {
      a: "People Time",
      b: "Alone Time",
      pct: jung.attitude === "E" ? jung.attitudePct : 100 - jung.attitudePct,
    },
    {
      a: "Right Now",
      b: "What If",
      pct:
        jung.perceiving === "S" ? jung.perceivingPct : 100 - jung.perceivingPct,
    },
    {
      a: "Head",
      b: "Heart",
      pct: jung.judging === "T" ? jung.judgingPct : 100 - jung.judgingPct,
    },
    {
      a: "Plan It",
      b: "Go With It",
      pct: jung.jp === "J" ? 74 : 26,
    },
  ];
}

export function getStackRoles(jung) {
  return [
    {
      key: jung.dominant,
      role: "Your Favourite",
      desc: "The way of thinking you reach for first, almost without noticing — it's the one you trust most.",
    },
    {
      key: jung.auxiliary,
      role: "Your Helper",
      desc: "Your reliable back-up — it balances your favourite and kicks in to support it.",
    },
    {
      key: jung.tertiary,
      role: "Still Learning",
      desc: "You enjoy this one, but you're still getting good at it — it can feel a bit like play.",
    },
    {
      key: jung.inferior,
      role: "Growing Edge",
      desc: "The one you use the least. It tends to show up when things get stressful, and it's often where you grow the most.",
    },
  ];
}
