/**
 * Reveals `text` word-by-word, left-to-right, on mount. Each word fades and
 * slides in via the CSS `word-in` keyframe with a staggered animation-delay.
 * Pure CSS — no timers — and reduced-motion safe (see index.css).
 */
function Typewriter({ text, className = "", caret = true, stagger = 0.12 }) {
  const words = text.split(" ");
  const lastDelay = (words.length - 1) * stagger + 0.5; // word duration is 0.5s

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="anim-word"
          style={{ animationDelay: `${i * stagger}s` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
      {caret && (
        <span
          aria-hidden="true"
          className="anim-caret ml-1 font-light text-emerald-600 dark:text-emerald-400"
          style={{ animationDelay: `${lastDelay}s` }}
        >
          |
        </span>
      )}
    </span>
  );
}

export default Typewriter;
