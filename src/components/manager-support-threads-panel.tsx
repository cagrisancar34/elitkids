"use client";

import { useActionState, useMemo, useState } from "react";

import {
  replyManagerSupportThreadAction,
  type CommunicationActionState,
  updateManagerSupportThreadStatusAction,
} from "@/app/(app)/manager/communication/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { useListPagination } from "@/components/use-list-pagination";
import type { SupportThread, SupportThreadMessage, SupportThreadStatusKey } from "@/lib/types";

const initialState: CommunicationActionState = {
  error: null,
  success: null,
  manualWebWhatsAppHref: null,
};

export function ManagerSupportThreadsPanel({
  threads,
  initialStatusFilter = "all",
  focusThreadId = null,
}: {
  threads: SupportThread[];
  initialStatusFilter?: "all" | SupportThreadStatusKey;
  focusThreadId?: string | null;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | SupportThreadStatusKey>(initialStatusFilter);
  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) => statusFilter === "all" || thread.statusKey === statusFilter),
    [statusFilter, threads],
  );
  const focusedThreadIndex = focusThreadId
    ? filteredThreads.findIndex((thread) => thread.id === focusThreadId)
    : -1;
  const paginatedThreads = useListPagination({
    items: filteredThreads,
    pageSize: 6,
    resetKey: `${statusFilter}:${focusThreadId ?? ""}`,
    resetPage: focusedThreadIndex >= 0 ? Math.floor(focusedThreadIndex / 6) + 1 : 1,
  });

  if (!threads.length) {
    return <div className="text-sm font-medium text-slate-500 py-4 text-center">Açık destek talebi bulunmuyor.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[
          ["all", "Tum threadler"],
          ["open", "Ekip yaniti bekliyor"],
          ["waiting_parent", "Veli yaniti bekleniyor"],
          ["resolved", "Cozuldu"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value as "all" | SupportThreadStatusKey)}
            className={
              statusFilter === value
                ? "rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white"
                : "rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500"
            }
          >
            {label}
          </button>
        ))}
      </div>
      {paginatedThreads.pageItems.map((thread) => (
        <div
          key={thread.id ?? `${thread.subject}-${thread.updatedAt}`}
          id={thread.id ? `support-thread-${thread.id}` : undefined}
          className={
            focusThreadId && thread.id === focusThreadId
              ? "bg-sky-50 border border-sky-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5"
              : "bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 shadow-sm flex flex-col transition-transform hover:-translate-y-0.5"
          }
        >
          <div className="font-bold text-[14px] text-slate-800">{thread.subject}</div>
          <div className="mt-2 text-sm text-slate-500">
            {thread.parentName ?? "Veli"} · {thread.latestMessagePreview ?? "Mesaj detayi yok"}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <ThreadMetaBadge label={`Acilis ${thread.openedAtLabel ?? "--"}`} tone="slate" />
            <ThreadMetaBadge label={thread.responseAgeLabel ?? "Sure yok"} tone="slate" />
            <ThreadMetaBadge label={thread.slaStatusLabel ?? "SLA yok"} tone={thread.slaTone ?? "amber"} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{thread.updatedAt}</div>
            <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-amber-600 border border-amber-100">
              {thread.status}
            </div>
          </div>
          {thread.id ? (
            <div className="mt-3">
              <ManagerSupportThreadDialog thread={thread} />
            </div>
          ) : null}
        </div>
      ))}
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
      {!filteredThreads.length ? (
        <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          Bu filtrede gosterilecek destek threadi bulunmuyor.
        </div>
      ) : null}
    </div>
  );
}

function ManagerSupportThreadDialog({ thread }: { thread: SupportThread }) {
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
          Talebi yonet
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{thread.subject}</DialogTitle>
          <DialogDescription>
            {thread.parentName ?? "Veli"} · {thread.status} · {thread.updatedAt}
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
        {thread.id ? (
          <div className="mt-4 grid gap-4">
            <ManagerSupportStatusForm threadId={thread.id} />
            <ManagerSupportReplyForm threadId={thread.id} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ThreadMetaBadge({
  label,
  tone,
}: {
  label: string;
  tone: "slate" | "amber" | "rose" | "emerald";
}) {
  const toneClass =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "emerald"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : tone === "amber"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-white text-slate-600";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClass}`}>
      {label}
    </span>
  );
}

function ManagerSupportStatusForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(updateManagerSupportThreadStatusAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="threadId" value={threadId} />
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Durum guncelle
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="open" variant="outline">
          Yanit bekliyor
        </Button>
        <Button type="submit" name="status" value="waiting_parent" variant="outline">
          Veli yaniti bekleniyor
        </Button>
        <Button type="submit" name="status" value="resolved">
          Cozuldu
        </Button>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
    </form>
  );
}

function ManagerSupportReplyForm({ threadId }: { threadId: string }) {
  const [state, formAction] = useActionState(replyManagerSupportThreadAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="threadId" value={threadId} />
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Veliye yanit yaz
      </div>
      <Textarea
        name="body"
        placeholder="Veliyi yonlendirecek kisa ve net yaniti yaz..."
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
