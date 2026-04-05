type Props = {
  handleClick: () => void;
};

export function CloseButton({ handleClick }: Props) {
  return (
    <button
      onClick={handleClick}
      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
        <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
