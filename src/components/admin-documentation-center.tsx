"use client";

import { BookOpenText, CircleHelp } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminPageDocumentation, getAdminDocumentation } from "@/lib/page-documentation";
import { cn } from "@/lib/utils";

type AdminDocumentationCenterProps = {
  currentPath: string;
};

export function AdminDocumentationCenter({
  currentPath,
}: AdminDocumentationCenterProps) {
  const [open, setOpen] = useState(false);
  const routePageKey = useMemo(() => getAdminDocumentation(currentPath).pageKey, [currentPath]);
  const [selectedPageKey, setSelectedPageKey] = useState<string | null>(null);
  const currentItem = getAdminDocumentation(selectedPageKey ?? routePageKey);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        setSelectedPageKey(null);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          title="Dokumantasyon merkezi"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/68 text-muted-foreground shadow-[0_8px_18px_rgba(18,43,84,0.05)] transition-colors hover:text-foreground"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="h-[min(90vh,860px)] w-[min(96vw,1400px)] overflow-hidden border border-white/75 p-0 shadow-[0_36px_120px_rgba(18,30,54,0.28)]">
        <div className="grid h-full min-h-0 md:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-border/60 bg-[linear-gradient(180deg,#eef5ff_0%,#f7faff_58%,#eef3fb_100%)] px-5 py-5">
            <DialogHeader className="px-1 text-left">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#0f63ea,#0a4db2)] text-white shadow-[0_16px_30px_rgba(15,99,234,0.22)]">
                <BookOpenText className="h-5 w-5" />
              </div>
              <DialogTitle className="pt-4 font-display text-[1.65rem] tracking-[-0.05em] text-foreground">
                Dokumantasyon merkezi
              </DialogTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Admin sayfalarinin amaci, alanlari ve tipik is akislarini tek merkezde gor.
              </p>
            </DialogHeader>

            <div className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {adminPageDocumentation.map((item) => {
                const active = item.pageKey === selectedPageKey;
                const current = item.pageKey === currentPath;

                return (
                  <button
                    key={item.pageKey}
                    type="button"
                    onClick={() => setSelectedPageKey(item.pageKey)}
                    className={cn(
                      "w-full rounded-[1.15rem] border px-4 py-3 text-left transition",
                      active
                        ? "border-primary/18 bg-primary/8 shadow-[0_16px_28px_rgba(15,99,234,0.08)]"
                        : "border-white/70 bg-white/72 hover:border-primary/16 hover:bg-white",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{item.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {item.pageKey}
                        </div>
                      </div>
                      {current ? (
                        <div className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                          Bu sayfa
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#fcfdff_0%,#f4f8ff_100%)] px-6 py-6 md:px-8">
            <div className="rounded-[2rem] border border-white/80 bg-white/80 px-6 py-6 shadow-[0_18px_46px_rgba(18,43,84,0.08)] backdrop-blur-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Admin dokumantasyonu
                </div>
                <h2 className="mt-3 font-display text-[2.2rem] font-semibold tracking-[-0.06em] text-foreground">
                  {currentItem.title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                  {currentItem.purpose}
                </p>
              </div>
                <div className="rounded-full border border-border/60 bg-secondary/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                  {currentItem.pageKey}
                </div>
              </div>

              <section className="mt-6 grid gap-6 xl:grid-cols-2">
                <DocumentationBlock title="Bu sayfada hangi islemler yapilir?" items={currentItem.actions} />
                <DocumentationBlock title="Alanlar ne anlama gelir?" items={currentItem.areas} />
              </section>

              <section className="mt-6 rounded-[1.8rem] border border-border/60 bg-white p-5 md:p-6">
                <div className="font-display text-[1.45rem] font-semibold tracking-[-0.04em] text-foreground">
                  Tipik is akisi
                </div>
                <div className="mt-5 grid gap-4">
                  {currentItem.workflow.map((step, index) => (
                    <div
                      key={`${step.title}-${index}`}
                      className="rounded-[1.35rem] border border-border/60 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{step.title}</div>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {currentItem.notes.length ? (
                <section className="mt-6 rounded-[1.8rem] border border-border/60 bg-[linear-gradient(180deg,#0f1729_0%,#16253f_100%)] p-5 text-white md:p-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/54">
                    Notlar
                  </div>
                  <div className="mt-4 grid gap-3">
                    {currentItem.notes.map((note) => (
                      <div
                        key={note}
                        className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/82"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentationBlock({
  title,
  items,
}: {
  title: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="rounded-[1.8rem] border border-border/60 bg-white p-5 md:p-6">
      <div className="font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-foreground">
        {title}
      </div>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.3rem] border border-border/60 bg-[linear-gradient(180deg,#ffffff_0%,#f7faff_100%)] px-4 py-4"
          >
            <div className="font-medium text-foreground">{item.title}</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
