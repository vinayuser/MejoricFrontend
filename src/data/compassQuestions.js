/** Mejoric Compass — question bank & static copy */

export const PAGE_SIZE = 6;

export const QUESTIONS = [
  // Where your energy goes
  { dim: "E", text: "Being with lots of people, even ones I don't know well, makes me feel happy and full of energy.", part: "A" },
  { dim: "E", text: "I like to think out loud and talk about my ideas while I'm still figuring them out.", part: "A" },
  { dim: "E", text: "I jump into new games or groups quickly, without needing to watch first.", part: "A" },
  { dim: "I", text: "After a busy day at school or a party, I need quiet time alone to feel okay again.", part: "A" },
  { dim: "I", text: "I like to think about something quietly in my head before I say it out loud.", part: "A" },
  { dim: "I", text: "In a group, I usually listen for a while before I feel ready to talk.", part: "A" },

  // How you notice things
  { dim: "S", text: "I trust things I can see and touch more than just a guess, even a strong guess.", part: "A" },
  { dim: "S", text: "I like it when instructions tell me exactly what to do, step by step.", part: "A" },
  { dim: "S", text: "I notice small details around me that other people don't seem to notice.", part: "A" },
  { dim: "S", text: "I'd rather use a way of doing something that I know works than try something totally new.", part: "A" },
  { dim: "N", text: "I like imagining what something could turn into, more than thinking about how it is right now.", part: "A" },
  { dim: "N", text: "I often notice how different ideas connect, even ones that seem far apart.", part: "A" },
  { dim: "N", text: "Doing the same thing over and over makes me want to find a new, better way.", part: "A" },
  { dim: "N", text: "I trust a strong feeling about how something will turn out, even before I'm sure.", part: "A" },

  // How you decide
  { dim: "T", text: "When I have a hard choice to make, I think about what makes the most sense more than how people will feel.", part: "A" },
  { dim: "T", text: "I'd rather tell a friend something true, even if it's a bit hard to hear, than a comfy little fib.", part: "A" },
  { dim: "T", text: "I judge an idea by whether it actually makes sense, not by who said it.", part: "A" },
  { dim: "T", text: "I stay pretty calm and clear-headed even when people around me get upset.", part: "A" },
  { dim: "F", text: "When I have a hard choice to make, how it makes people feel matters to me as much as what makes sense.", part: "A" },
  { dim: "F", text: "It's hard for me to feel okay when I can tell someone near me is upset.", part: "A" },
  { dim: "F", text: "I think about who an idea helps or hurts, not just whether it works.", part: "A" },
  { dim: "F", text: "Keeping things friendly and calm matters to me, even if I keep an opinion to myself.", part: "A" },

  // Talking about feelings
  { dim: "EO", text: "It's pretty easy for me to say how I'm feeling, even the tricky feelings.", part: "B" },
  { dim: "EO", text: "I'd rather talk about a problem with someone than keep it all inside.", part: "B" },
  { dim: "EO", text: "I don't mind telling someone I'm having a hard time, even if I don't know them super well.", part: "B" },
  { dim: "EO", text: "Once I trust someone, I open up to them pretty quickly.", part: "B" },

  // Bouncing back
  { dim: "SR", text: "When something goes wrong, I feel better again in a day or two, not weeks.", part: "B" },
  { dim: "SR", text: "I can usually keep going even when things feel hard.", part: "B" },
  { dim: "SR", text: "Tough moments don't upset me as much as they seem to upset other people.", part: "B" },
  { dim: "SR", text: "I calm back down pretty quickly after a stressful moment.", part: "B" },

  // Liking a plan
  { dim: "SG", text: "I feel calmer once I have a plan, even a small one.", part: "B" },
  { dim: "SG", text: "I like help that comes with clear next steps, not just a chat.", part: "B" },
  { dim: "SG", text: "I like to check in on how I'm doing with my goals.", part: "B" },
  { dim: "SG", text: "Advice that's vague and doesn't tell me what to actually do frustrates me.", part: "B" },

  // Doing it yourself
  { dim: "AU", text: "I usually try to solve a problem myself before I ask for help.", part: "B" },
  { dim: "AU", text: "Asking for help doesn't come easily to me, even when I probably should.", part: "B" },
  { dim: "AU", text: "I like having a lot of freedom in how I get help, not just one fixed way.", part: "B" },
  { dim: "AU", text: "I sometimes act like something isn't bothering me as much as it really is.", part: "B" },

  // Warmth with people
  { dim: "RW", text: "I like a helper who feels warm and caring, not just someone who knows the answer.", part: "B" },
  { dim: "RW", text: "I notice quickly when someone near me is sad or upset, even if they don't say it.", part: "B" },
  { dim: "RW", text: "I'd rather talk to the same person every time than a different person each time.", part: "B" },
  { dim: "RW", text: "Feeling truly listened to matters to me more than getting a fast answer.", part: "B" },

  // Trying new things
  { dim: "CR", text: "I don't mind trying something new if there's a good chance it will help.", part: "B" },
  { dim: "CR", text: "Not knowing exactly how something will turn out doesn't stop me from trying.", part: "B" },
  { dim: "CR", text: "I get bored doing the same thing and like finding a new way.", part: "B" },
  { dim: "CR", text: "I'd rather try something, even if it's not perfect, than wait until I feel totally ready.", part: "B" },

  // Friend-group energy
  { dim: "SE", text: "I'd get more out of talking with a small group of friends than talking alone with just one person.", part: "B" },
  { dim: "SE", text: "Talking in front of a small group doesn't make me nervous.", part: "B" },
  { dim: "SE", text: "It's easier for me to open up when there's more than one other person around.", part: "B" },
  { dim: "SE", text: "I like hearing how other kids my age deal with things like exams or friend trouble.", part: "B" },

  // Sticking with it
  { dim: "CF", text: "Once I decide to do something, like meeting every week, I usually stick with it.", part: "B" },
  { dim: "CF", text: "I follow through on things I say I'll try, even small ones.", part: "B" },
  { dim: "CF", text: "I keep track of the things I've promised to do.", part: "B" },
  { dim: "CF", text: "People can count on me to show up when I say I will.", part: "B" },
];

export const TOTAL_PAGES = Math.ceil(QUESTIONS.length / PAGE_SIZE);

export const SECTION_LABELS = [
  "Where Your Energy Goes",
  "Where Your Energy Goes",
  "How You Notice Things",
  "How You Notice Things",
  "How You Decide",
  "How You Decide",
  "Talking About Feelings",
  "Bouncing Back",
  "Liking a Plan",
  "Doing It Yourself",
  "Trying New Things",
  "Sticking With It",
];

export const TRAIT_DIMS = [
  { key: "EO", label: "Talking About Feelings" },
  { key: "SR", label: "Bouncing Back" },
  { key: "SG", label: "Liking a Plan" },
  { key: "AU", label: "Doing It Yourself" },
  { key: "RW", label: "Warmth With People" },
  { key: "CR", label: "Trying New Things" },
  { key: "SE", label: "Group Energy" },
  { key: "CF", label: "Sticking With It" },
];

export const FUNCTION_INFO = {
  Se: { name: "The Doer", blurb: "Notices what's happening right now and jumps into action fast." },
  Si: { name: "The Rememberer", blurb: "Compares new things to what's worked before, and likes what's steady and familiar." },
  Ne: { name: "The Idea-Spotter", blurb: "Notices lots of new ideas and possibilities, and gets excited about what could be." },
  Ni: { name: "The Deep Thinker", blurb: "Follows one big idea all the way down until it clicks into place." },
  Te: { name: "The Organiser", blurb: "Likes clear goals and gets things done in a tidy, step-by-step way." },
  Ti: { name: "The Puzzle-Solver", blurb: "Loves figuring out exactly how things work and why." },
  Fe: { name: "The Peacemaker", blurb: "Notices the mood in the room and helps everyone feel okay." },
  Fi: { name: "The Value-Keeper", blurb: "Has a strong inner sense of what's fair and right, and sticks to it." },
};

export const TYPE_FAMILY = {
  ST: { name: "The Practical Doer", blurb: "practical and steady — you'd rather have one thing that really works than ten ideas that might." },
  SF: { name: "The Caring Helper", blurb: "dependable and caring about what's real for you and for the people around you." },
  NT: { name: "The Big Thinker", blurb: "curious about how things work and where they're heading." },
  NF: { name: "The Kind Dreamer", blurb: "led by kindness and meaning — you want what you do to matter to someone." },
};
