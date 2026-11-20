"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  header: React.ReactNode
  accessorKey?: keyof T | string
  cell?: (item: T, index: number) => React.ReactNode
  className?: string
  headerClassName?: string
  align?: "left" | "center" | "right"
}

export interface DataTablePagination {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  loadingRows?: number
  emptyState?:
    | {
        title?: string
        description?: string
        action?: {
          label: string
          onClick?: () => void
          href?: string
        }
      }
    | React.ReactNode
  onRowClick?: (item: T) => void
  pagination?: DataTablePagination
  className?: string
  containerClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  pagination,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const getAlignmentClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center"
      case "right":
        return "text-right"
      default:
        return "text-left"
    }
  }

  const renderCellContent = (
    item: T,
    column: DataTableColumn<T>,
    index: number
  ) => {
    if (column.cell) {
      return column.cell(item, index)
    }

    if (column.accessorKey) {
      const val = (item as Record<string, unknown>)[
        column.accessorKey as string
      ]
      if (val === undefined || val === null) return "-"
      if (typeof val === "boolean") return val ? "Yes" : "No"
      return String(val)
    }

    return null
  }

  return (
    <div className={cn("space-y-4", containerClassName)}>
      <div
        className={cn(
          "rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs",
          className
        )}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-border/70">
                {columns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3.5 px-4",
                      getAlignmentClass(col.align),
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading &&
                Array.from({ length: loadingRows }).map((_, rowIdx) => (
                  <TableRow
                    key={`skeleton-row-${rowIdx}`}
                    className="border-b border-border/50"
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={`skeleton-cell-${colIdx}`}
                        className={cn("p-4", col.className)}
                      >
                        <Skeleton className="h-5 w-full max-w-[140px] rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!isLoading && data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center p-8"
                  >
                    {emptyState && React.isValidElement(emptyState) ? (
                      emptyState
                    ) : (
                      <EmptyState
                        icon={Inbox}
                        title={
                          (emptyState as { title?: string })?.title ||
                          "No records found"
                        }
                        description={
                          (emptyState as { description?: string })?.description ||
                          "There are no items matching this criteria."
                        }
                        action={(emptyState as { action?: { label: string; onClick?: () => void; href?: string } })?.action}
                        className="border-none bg-transparent p-4"
                      />
                    )}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                data.length > 0 &&
                data.map((item, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-muted/30",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={cn(
                          "px-4 py-3.5 text-sm align-middle",
                          getAlignmentClass(col.align),
                          col.className
                        )}
                      >
                        {renderCellContent(item, col, rowIdx)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
          <div>
            {pagination.totalItems !== undefined && (
              <span>
                Total <span className="font-medium text-foreground">{pagination.totalItems}</span> records
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page <span className="font-semibold text-foreground">{pagination.currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span>
            </span>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage <= 1}
                className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.totalPages, pagination.currentPage + 1)
                  )
                }
                disabled={pagination.currentPage >= pagination.totalPages}
                className="h-8 w-8 p-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
