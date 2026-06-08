import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getRegionLabel, getStatusLabel, type Program } from "@/lib/content";
import { toPublicSitePath } from "@/lib/routes";

export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={toPublicSitePath(`/programlar/${program.slug}`)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
          <Image
            src={program.image}
            alt={program.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded-md bg-white/92 px-3 py-2 text-xs font-semibold text-[#214d3f] shadow-sm">
            {getStatusLabel(program.status)}
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <p className="text-sm font-semibold text-[#d9783d]">{program.categoryLabel}</p>
            <h3 className="mt-2 text-2xl font-semibold text-stone-950">{program.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
              {program.summary}
            </p>
          </div>
          <div className="grid gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-2">
              <MapPin size={16} aria-hidden="true" />
              {program.location} · {getRegionLabel(program.region)}
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} aria-hidden="true" />
              {program.audience}
            </span>
            <span className="flex items-center gap-2">
              <CalendarDays size={16} aria-hidden="true" />
              {program.dates[0]?.label}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-sm font-medium text-stone-700">{program.priceLabel}</span>
            <ArrowRight
              className="text-[#214d3f] transition group-hover:translate-x-1"
              size={20}
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
