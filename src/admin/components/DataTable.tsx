"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  renderHeader?: () => ReactNode;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <div className="rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40 bg-muted/30">
            {columns.map((column) => (
              <TableHead key={column.key} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground h-11">
                {column.renderHeader ? column.renderHeader() : column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground py-16 text-sm"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={index}
                className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-200"
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-3 text-sm">
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
