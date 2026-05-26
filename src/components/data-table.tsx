import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  key: keyof T;
  label: string;
};

type CellValue = string | number | null | undefined;

type DataTableProps<T extends Record<string, CellValue>> = {
  columns: Column<T>[];
  emptyMessage?: string;
  rows: T[];
  rowKey?: (row: T, index: number) => string;
  rowClassName?: (row: T, index: number) => string;
};

function statusToVariant(status: string): "neutral" | "success" | "warning" | "danger" {
  if (
    status === "Aktif" ||
    status === "Odendi" ||
    status === "Odeme Tamamlandi" ||
    status === "Yayin icin hazir"
  ) {
    return "success";
  }

  if (
    status === "Takip" ||
    status === "Planlandi" ||
    status === "Yanit bekliyor" ||
    status === "Odeme Bekleniyor"
  ) {
    return "warning";
  }

  if (status === "Risk" || status === "Aksiyon gerekli" || status === "Odeme Yapilmadi") {
    return "danger";
  }

  return "neutral";
}

export function DataTable<T extends Record<string, CellValue>>({
  columns,
  emptyMessage = "Gosterilecek kayit yok.",
  rows,
  rowKey,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-slate-200/60 bg-white/40 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b-slate-200/60 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={String(column.key)} className="py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row, index) => (
                <TableRow
                  key={rowKey?.(row, index) ?? index}
                  className={cn(
                    "border-b-slate-100 transition-colors duration-200 hover:bg-white/60",
                    rowClassName?.(row, index)
                  )}
                >
                  {columns.map((column) => {
                    const value = row[column.key];
                    const isStatusColumn =
                      String(column.key).includes("status") || column.key === "status";

                    return (
                      <TableCell key={String(column.key)}>
                        {isStatusColumn ? (
                          <Badge variant={statusToVariant(String(value ?? ""))}>{String(value ?? "--")}</Badge>
                        ) : (
                          value ?? "--"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm font-medium text-slate-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
