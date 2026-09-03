// Cascos de telefonista: diadema y dos auriculares. Se eligio esto y no el auricular de
// telefono clasico porque este, girado 45 grados, se apelmaza en una mancha diagonal a
// tamano pequeno. Formas gruesas y separadas para que el dibujo aguante el favicon de 16px.
export function LogoCora({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M8 19v-3a8 8 0 0 1 16 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="4.5" y="16" width="6" height="10" rx="3" />
      <rect x="21.5" y="16" width="6" height="10" rx="3" />
    </svg>
  );
}
