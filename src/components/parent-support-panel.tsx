"use client";

import { useActionState, useMemo, useState } from "react";

import {
  replySupportThreadAction,
  type SupportActionState,
} from "@/app/(app)/parent/support/actions";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useListPagination } from "@/components/use-list-pagination";
import type { SupportThread, SupportThreadMessage } from "@/lib/types";

type ThreadFilter = "all" | "open" | "closed";
type ThreadSort = "latest" | "subject-asc";
const initialState: SupportActionState = { error: null, success: null };

function threadKey(status: string) {
  const lower = status.toLocaleLowerCase("tr-TR");
  return lower.includes("cozuldu") ? "closed" : "open";
}

export function ParentSupportPanel({ threads }: { threads: SupportThread[] }) {
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ThreadSort>("latest");

  const counts = useMemo(
    () => ({
      all: threads.length,
      open: threads.filter((thread) => threadKey(thread.status) === "open").length,
      closed: threads.filter((thread) => threadKey(thread.status) === "closed").length,
    }),
    [threads],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) => (filter === "all" ? true : threadKey(thread.status) === filter))
      .filter((thread) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${thread.subject} ${thread.status} ${thread.updatedAt} ${thread.latestMessagePreview ?? ""}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "subject-asc") {
          return left.subject.localeCompare(right.subject, "tr");
        }

        return right.updatedAt.localeCompare(left.updatedAt, "tr");
      });
  }, [filter, normalizedSearch, sort, threads]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "latest";
  const paginatedThreads = useListPagination({
    items: filteredThreads,
    pageSize: 6,
    resetKey: `${filter}:${search}:${sort}`,
  });

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tum talepler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.all}</div>
        </div>
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Acik talepler</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.open}</div>
        </div>
        <div className="page-surface rounded-[1.7rem] px-5 py-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cozulmus</div>
          <div className="mt-4 font-display text-4xl font-semibold tracking-[-0.05em] text-foreground">{counts.closed}</div>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="page-toolbar flex flex-wrap gap-2 rounded-[1.7rem] px-3 py-3">
          {[
            ["all", "Tum talepler", counts.all],
            ["open", "Acik", counts.open],
            ["closed", "Cozuldu", counts.closed],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as ThreadFilter)}
              className={
                filter === key
                  ? "rounded-full bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[0_10px_22px_rgba(44,47,49,0.08)]"
                  : "rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-white/60 hover:text-foreground"
              }
            >
              {label} · {count}
            </button>
          ))}
        </div>

        <div className="page-toolbar grid gap-3 rounded-[1.8rem] p-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Talep ara: konu veya durum"
            aria-label="Destek talebi ara"
            className="bg-white/80"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as ThreadSort)}
            aria-label="Destek talebi siralama"
          >
            <option value="latest">Son guncellenene gore</option>
            <option value="subject-asc">Konuya gore A-Z</option>
          </Select>
        </div>

        {hasCustomView ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter("all");
                setSearch("");
                setSort("latest");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3">
          {filteredThreads.length ? (
            paginatedThreads.pageItems.map((thread) => (
              <article key={thread.id ?? `${thread.subject}-${thread.updatedAt}`} className="page-surface rounded-[1.55rem] px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-[1.25rem] font-semibold tracking-[-0.03em] text-foreground">
                      {thread.subject}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {thread.status} · {thread.updatedAt}
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                    {thread.messageCount ?? 0} mesaj
                  </div>
                </div>
                <div className="mt-4 text-sm leading-6 text-muted-foreground">
                  {thread.latestMessagePreview ?? "Bu talep icin henuz mesaj detayi gorunmuyor."}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SupportThreadDialog thread={thread} />
                </div>
              </article>
            ))
          ) : (
            <div className="page-empty-state rounded-[1.25rem] p-4 text-sm leading-6 text-muted-foreground">
              Bu filtre ve arama sonucunda gosterilecek destek talebi yok.
            </div>
          )}
        </div>
        {filteredThreads.length ? (
          <PaginationControls
            itemLabel="talep"
            onPageChange={paginatedThreads.setPage}
            page={paginatedThreads.page}
            pageCount={paginatedThreads.pageCount}
            pageSize={paginatedThreads.pageSize}
            totalItems={paginatedThreads.totalItems}
          />
        ) : null}
      </section>
    </div>
  );
}

function SupportThreadDialog({ thread }: { thread: SupportThread }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportThreadMessage[]>(thread.messages ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen || !thread.id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/support-threads/${thread.id}`, { method: "GET", cache: "no-store" });
      const body = (await response.json().catch(() => null)) as { thread?: SupportThread; error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Destek detaylari yuklenemedi.");
      }

      setMessages(body?.thread?.messages ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Destek detaylari yuklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          Talebi ac
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{thread.subject}</DialogTitle>
          <DialogDescription>
            Durum: {thread.status} · Son guncelleme: {thread.updatedAt}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Mesaj gecmisi yukleniyor...</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.authorType === "parent"
                    ? "rounded-[1.1rem] border border-sky-200 bg-sky-50 px-4 py-3"
                    : "rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3"
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-foreground">{message.authorLabel}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {message.createdAt}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{message.body}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">Bu talepte henuz mesaj gecmisi yok.</div>
          )}
        </div>
        {thread.id ? <SupportReplyForm threadId={thread.id} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function SupportReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(replySupportThreadAction, initialState);

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="threadId" value={threadId} />
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Talebe yanit ekle
      </div>
      <Textarea
        name="body"
        placeholder="Destek ekibine ek bilgi, dekont veya talep guncellemesi yaz..."
        className="min-h-24 bg-white"
      />
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" className="w-full">
        Yaniti gonder
      </Button>
    </form>
  );
}
