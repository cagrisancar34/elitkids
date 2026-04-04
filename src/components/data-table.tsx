import { Badge } from "@/components/ui/badge";
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

type DataTableProps<T extends Record<string, string>> = {
  columns: Column<T>[];
  rows: T[];
};

function statusToVariant(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "Aktif" || status === "Odendi" || status === "Yayin icin hazir") {
    return "success";
  }

  if (status === "Takip" || status === "Planlandi" || status === "Yanit bekliyor") {
    return "warning";
  }

  if (status === "Risk" || status === "Aksiyon gerekli") {
    return "danger";
  }

  return "neutral";
}

export function DataTable<T extends Record<string, string>>({
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/90 shadow-[0_18px_40px_rgba(18,43,84,0.08)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => {
                  const value = row[column.key];
                  const isStatusColumn =
                    String(column.key).includes("status") || column.key === "status";

                  return (
                    <TableCell key={String(column.key)}>
                      {isStatusColumn ? (
                        <Badge variant={statusToVariant(value)}>{value}</Badge>
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
