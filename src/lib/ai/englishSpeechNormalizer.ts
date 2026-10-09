/**
 * English Speech Normalizer for TTS
 * Pre-processes English text before synthesis to ensure natural TTS output.
 */

const STAGE_DIRECTION_RE = /\([^)]*\)|\[[^\]]*\]/g;
const MARKDOWN_RE = /[*#`_~]/g;

const NUMBER_WORDS: Record<string, string> = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
  '10': 'ten',
};

const FRACTION_WORDS: Record<string, string> = {
  '1/2': 'one half', '1/3': 'one third', '1/4': 'one quarter',
  '2/3': 'two thirds', '3/4': 'three quarters', '1/5': 'one fifth',
  '1/8': 'one eighth', '1/10': 'one tenth',
};

export function normalizeEnglishSpeech(text: string): string {
  let result = text;
  // Remove stage directions and markdown
  result = result.replace(STAGE_DIRECTION_RE, '');
  result = result.replace(MARKDOWN_RE, '');
  // Replace fractions
  for (const [frac, word] of Object.entries(FRACTION_WORDS)) {
    result = result.replace(new RegExp(frac.replace('/', '\\/'), 'g'), word);
  }
  // Replace standalone single/double digit numbers
  result = result.replace(/\b(\d{1,2})\b/g, (match) => NUMBER_WORDS[match] || match);
  // Clean up extra whitespace
  result = result.replace(/\s+/g, ' ').trim();
  // Ensure ending punctuation
  if (result && !/[.!?]$/.test(result)) result += '.';
  return result;
}
