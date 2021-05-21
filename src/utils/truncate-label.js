const NARROW_CHARS = ['i', 'l', 'j', ',', '.', ';', '!', '1'];
const DEFAULT_APPROX_CHAR_WIDTH = 10;
const APPROX_NARROW_CHAR_RATIO = 0.5;

const guessCharWidth = (char, { approxCharWidth }) =>
  NARROW_CHARS.includes(char)
    ? approxCharWidth * APPROX_NARROW_CHAR_RATIO
    : approxCharWidth;

const getTruncatedText = (chars, maxWidth, { approxCharWidth }) => {
  const { text } = chars.reduce(
    ({ totalWidth, text }, char) => {
      const charWidth = guessCharWidth(char, { approxCharWidth });
      const newWidth = totalWidth + charWidth;

      return {
        totalWidth: newWidth,
        text: newWidth > maxWidth ? text : text + char,
      };
    },
    { totalWidth: 0, text: '' }
  );

  return text;
};

const truncateLabel = (
  text,
  maxWidth,
  { approxCharWidth = DEFAULT_APPROX_CHAR_WIDTH } = {}
) => {
  const chars = text.split('');
  const guessedTextWidth = chars.reduce(
    (totalWidth, char) =>
      totalWidth + guessCharWidth(char, { approxCharWidth }),
    0
  );

  return guessedTextWidth > maxWidth
    ? `${getTruncatedText(chars, maxWidth, { approxCharWidth })}...`
    : text;
};

export default truncateLabel;
