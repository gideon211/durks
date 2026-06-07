import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

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
}: DataTableProps) {
  return (
    <Card className="shadow-sm border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((column) => (
              <TableHead key={column.key} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                className="text-center text-muted-foreground py-12"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/40 transition-colors">
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
