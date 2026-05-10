export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className="
        w-full
        px-4 py-3
        mb-3
        rounded-xl

        bg-black/40
        border border-white/10

        text-white
        !placeholder-white/60   /* 🔥 FORCE OVERRIDE */

        focus:outline-none
        focus:border-cyan-400
        focus:ring-2
        focus:ring-cyan-500/20

        transition

        autofill:bg-black/40
        autofill:text-white
      "
    />
  );
}
