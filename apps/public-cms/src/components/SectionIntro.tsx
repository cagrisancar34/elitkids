export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase text-[#d9783d]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-4xl font-semibold text-stone-950 md:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-lg leading-8 text-stone-600">{body}</p> : null}
    </div>
  );
}
