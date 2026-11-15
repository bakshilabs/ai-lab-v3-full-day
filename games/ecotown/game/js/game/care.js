// Things a child might type that the game must not answer as if they were about the town: a sign that they may need
// help, personal details, or a request for something unsuitable. Florence never repeats the words back. She gives a
// fixed reply and, where it fits, points to a trusted adult. Nothing typed leaves the device. Pure: tests/redteam.test.mjs.
const HELP = /\b(hurt(ing|s)? (my ?self|me)|hit(s|ting)? me|kill(ing)? my ?self|want to die|wanna die|end my life|suicid\w*|self[- ]?harm\w*|cut(ting)? my ?self|abus\w+|touch(es|ed|ing)? me|bull(y|ied|ies|ying)\w*|scared of (my|him|her|them)|not safe|unsafe at home|nobody (likes|loves|cares)|no one (likes|loves|cares)|hate my ?self|run(ning)? away from home|being hurt|hurts me)\b/i;
const PERSONAL = /\b(my (full |real )?name is|my (home )?address|my (phone|mobile)( number)?|my number is|my email|my password|i live (at|on|in) \d|i go to \w+ (school|primary|academy)|my school is)\b|\b0\d{9,10}\b|\b\d{5}\s?\d{6}\b|[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const UNSAFE = /\b(bomb\w*|weapon\w*|guns?|knife|knives|stab\w*|shoot\w*|kill\w*|murder\w*|poison\w*|drugs?|vape\w*|alcohol|drunk|sex\w*|porn\w*|naked|nude\w*|swear ?words?|f+u+c+k+\w*|sh[i1]t+\w*|bitch\w*|bastard\w*|wank\w*|c[u*]nt\w*|n[i1]gg\w*|retard\w*|slut\w*|whore\w*)\b/i;

// 'help' | 'personal' | 'unsafe' | null. A sign of needing help comes first, whatever else the text says.
export function careFor(text) {
  const t = String(text || '');
  if (HELP.test(t)) return 'help';
  if (PERSONAL.test(t)) return 'personal';
  if (UNSAFE.test(t)) return 'unsafe';
  return null;
}
export const CARE = {
  help: {
    j: 'That sounds important, and I am only a helper in a game, so I can’t help with it. Please tell a grown-up you trust, like your club leader, a teacher or someone at home. You can also call Childline free on 0800 1111.',
    s: 'That sounds important, and I am only a game character, so I can’t help with it. Please talk to an adult you trust: your club leader, a teacher or someone at home. Childline is free on 0800 1111.' },
  personal: {
    j: 'Please don’t tell me your name, where you live, your school or a phone number. I don’t need them. What you type stays on this device, but it is a good habit to keep those things private.',
    s: 'Please don’t give me your name, address, school or phone number: I don’t need them. What you type stays on this device, but keeping personal details out of chat boxes is a good habit.' },
  unsafe: {
    j: 'I can’t help with that. If something is worrying you, talk to a grown-up you trust. I can answer questions about our town.',
    s: 'I can’t help with that. If something is worrying you, talk to an adult you trust. I can answer questions about the town.' },
};
