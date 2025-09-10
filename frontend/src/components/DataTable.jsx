import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners, setActivatorNodeRef } = useSortable({ id: row.id });

  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-primary/5"
    >
      {row.getVisibleCells().map((cell) => {
        const isDragHandle = cell.column.id === "drag";
        return (
          <TableCell key={cell.id}>
            {isDragHandle ? (
              <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className={`inline-flex items-center justify-center w-full h-full ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ) : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export function DataTable({
  columns,
  data,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  searchKey,
  searchKeys = [],
  searchAccessor,
  searchOptions = [],
  manualPagination = false,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [tableData, setTableData] = useState(data);

  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const filteredData = useMemo(() => {
    if (manualPagination) return tableData;
    if (!globalFilter) return tableData;

    const needle = globalFilter.toLowerCase();

    const getValueByPath = (obj, path) => {
      if (!obj || !path) return undefined;
      return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    };

    return tableData.filter((row) => {
      if (typeof searchAccessor === 'function') {
        const text = searchAccessor(row);
        return (text ?? '').toString().toLowerCase().includes(needle);
      }

      const keysToSearch = Array.isArray(searchKeys) && searchKeys.length > 0
        ? searchKeys
        : (searchKey ? [searchKey] : []);

      if (keysToSearch.length === 0) return true;

      return keysToSearch.some((keyPath) => {
        const value = getValueByPath(row, keyPath);
        if (value === undefined || value === null) return false;
        return value.toString().toLowerCase().includes(needle);
      });
    });
  }, [tableData, globalFilter, searchKey, manualPagination]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection },
    getRowId: (row) => (row._id ?? row.id ?? "").toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const dataIds = useMemo(
    () => filteredData.map((item) => (item._id ?? item.id ?? "").toString()),
    [filteredData]
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = dataIds.indexOf(active.id);
      const newIndex = dataIds.indexOf(over.id);
      setTableData((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  const selectedRows = Object.keys(rowSelection).length;

  const filteredOptions = useMemo(() => {
    return searchOptions.filter((option) =>
      option.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [searchOptions, globalFilter]);

  return (
    <Card className="p-6 backdrop-blur-md">
      {/* Search + bulk actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Input
            placeholder="Search..."
            value={manualPagination ? (searchValue ?? "") : globalFilter}
            onChange={(e) => {
              if (manualPagination) {
                onSearchChange && onSearchChange(e.target.value);
              } else {
                setGlobalFilter(e.target.value);
              }
            }}
            list="autocomplete-options"
          />
          <datalist id="autocomplete-options">
            {[...new Set(filteredOptions)].map((option, index) => (
              <option key={option + index} value={option} />
            ))}
          </datalist>
        </div>

        {selectedRows > 0 && (
          <Button
            variant="destructive"
            onClick={() => alert(`Deleting ${selectedRows} selected rows!`)}
          >
            Delete Selected ({selectedRows})
          </Button>
        )}
      </div>

      {/* Table */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="max-h-[60vh] @[767px]:max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.columnDef.header}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        {manualPagination ? (
          <>
            <div>
              Page {page} of {Math.max(1, Math.ceil((total || 0) / (pageSize || 1)))}
            </div>
            <div className="flex gap-2 items-center">
              <Button className="cursor-pointer" onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
                Prev
              </Button>
              <Select
                value={(pageSize || defaultPageSize).toString()}
                onValueChange={(value) => onPageSizeChange && onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue>{pageSize}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={page >= Math.max(1, Math.ceil((total || 0) / (pageSize || 1)))}
                 className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex gap-2 items-center">
              <Button className="cursor-pointer" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Prev
              </Button>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue>{table.getState().pagination.pageSize}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="cursor-pointer" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
