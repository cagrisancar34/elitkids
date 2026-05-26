"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useListPagination } from "@/components/use-list-pagination";
import type { AdminUserRow } from "@/lib/types";

type UserFilter = "all" | "admin" | "manager" | "coach" | "parent";
type UserSort = "name-asc" | "name-desc" | "role";

const roleLabels: Record<UserFilter, string> = {
  all: "Tum roller",
  admin: "Admin",
  manager: "Yonetici",
  coach: "Koc",
  parent: "Veli",
};

function normalizeRole(role: string) {
  const key = role.toLowerCase();

  if (key === "admin") {
    return "Admin";
  }

  if (key === "manager") {
    return "Yonetici";
  }

  if (key === "coach") {
    return "Koc";
  }

  if (key === "parent") {
    return "Veli";
  }

  return role;
}

export function AdminUsersPanel({ users }: { users: AdminUserRow[] }) {
  const [filter, setFilter] = useState<UserFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserSort>("role");

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((user) => user.role.toLowerCase() === "admin").length,
      manager: users.filter((user) => user.role.toLowerCase() === "manager").length,
      coach: users.filter((user) => user.role.toLowerCase() === "coach").length,
      parent: users.filter((user) => user.role.toLowerCase() === "parent").length,
    }),
    [users],
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (filter === "all") {
          return true;
        }

        return user.role.toLowerCase() === filter;
      })
      .filter((user) => {
        if (!normalizedSearch) {
          return true;
        }

        const haystack = `${user.name} ${user.email} ${user.scope} ${user.role}`.toLocaleLowerCase("tr-TR");
        return haystack.includes(normalizedSearch);
      })
      .sort((left, right) => {
        if (sort === "name-asc") {
          return left.name.localeCompare(right.name, "tr");
        }

        if (sort === "name-desc") {
          return right.name.localeCompare(left.name, "tr");
        }

        const roleRank = { admin: 0, manager: 1, coach: 2, parent: 3 } as const;
        const leftRank = roleRank[left.role.toLowerCase() as keyof typeof roleRank] ?? 4;
        const rightRank = roleRank[right.role.toLowerCase() as keyof typeof roleRank] ?? 4;

        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return left.name.localeCompare(right.name, "tr");
      })
      .map((user) => ({
        ...user,
        role: normalizeRole(user.role),
      }));
  }, [filter, normalizedSearch, sort, users]);

  const hasCustomView = filter !== "all" || search.length > 0 || sort !== "role";
  const paginatedUsers = useListPagination({
    items: filteredUsers,
    pageSize: 10,
    resetKey: `${filter}:${search}:${sort}`,
  });

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {(Object.keys(roleLabels) as UserFilter[]).map((key) => (
          <div
            key={key}
            className="surface-panel rounded-[1.35rem] border border-white/40 px-4 py-4"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {roleLabels[key]}
            </div>
            <div className="mt-3 font-display text-3xl text-foreground">{counts[key]}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(roleLabels) as UserFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-full border border-primary bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[0_12px_24px_rgba(11,76,194,0.18)]"
                  : "rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
              }
            >
              {roleLabels[key]} · {counts[key]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Kullanici ara: ad, e-posta, kapsam veya rol"
            aria-label="Kullanici ara"
          />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as UserSort)}
            aria-label="Kullanici siralama"
          >
            <option value="role">Role gore sirala</option>
            <option value="name-asc">Ada gore A-Z</option>
            <option value="name-desc">Ada gore Z-A</option>
          </Select>
        </div>

        <div className="surface-muted flex items-center justify-between gap-3 rounded-[1.15rem] px-4 py-3 text-sm text-muted-foreground">
          <span>{roleLabels[filter]} gorunumu</span>
          <span>
            {filteredUsers.length} kayit · sayfa {paginatedUsers.page}/{paginatedUsers.pageCount}
          </span>
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
                setSort("role");
              }}
            >
              Filtreleri temizle
            </Button>
          </div>
        ) : null}

        <DataTable
          columns={[
            { key: "name", label: "Kullanici" },
            { key: "email", label: "E-posta" },
            { key: "role", label: "Rol" },
            { key: "scope", label: "Kapsam" },
            { key: "status", label: "Durum" },
          ]}
          rows={paginatedUsers.pageItems}
        />
        {filteredUsers.length ? (
          <PaginationControls
            itemLabel="kullanici"
            onPageChange={paginatedUsers.setPage}
            page={paginatedUsers.page}
            pageCount={paginatedUsers.pageCount}
            pageSize={paginatedUsers.pageSize}
            totalItems={paginatedUsers.totalItems}
          />
        ) : null}
      </section>
    </div>
  );
}
