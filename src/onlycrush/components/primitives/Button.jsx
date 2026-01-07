export default function Button({
  as: As = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center select-none transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'px-6 py-3 rounded-[14px] font-semibold text-white bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-[0_6px_20px_rgba(139,92,246,0.25)]',
    pill:
      'px-5 py-2 rounded-full font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    ghost:
      'px-4 py-2 rounded-full font-semibold text-white/80 hover:text-white hover:bg-white/10',
  };

  return <As className={`${base} ${variants[variant] || ''} ${className}`} {...props} />;
}


