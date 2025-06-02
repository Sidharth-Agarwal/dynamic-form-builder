// components/Common/Table.jsx - Reusable Table Component
import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import Button from './Button';
import { TABLE_CONSTANTS } from '../../utils/constants';

const Table = ({
  columns = [],
  data = [],
  sorting = null,
  onSortChange = null,
  pagination = null,
  onPageChange = null,
  selection = null,
  onSelectionChange = null,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  striped = true,
  hover = true,
  compact = false,
  stickyHeader = false
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Handle column sorting
  const handleSort = (columnKey) => {
    if (!onSortChange || !columns.find(col => col.key === columnKey)?.sortable) return;

    const newDirection = 
      sorting?.key === columnKey && sorting?.direction === 'asc' ? 'desc' : 'asc';
    
    onSortChange({ key: columnKey, direction: newDirection });
  };

  // Handle row selection
  const handleRowSelect = (rowIndex, checked) => {
    if (!onSelectionChange) return;

    const selectedRows = selection?.selectedRows || [];
    const newSelection = checked
      ? [...selectedRows, rowIndex]
      : selectedRows.filter(index => index !== rowIndex);

    onSelectionChange({
      selectedRows: newSelection,
      isAllSelected: newSelection.length === data.length,
      isPartiallySelected: newSelection.length > 0 && newSelection.length < data.length
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (!onSelectionChange) return;

    const newSelection = checked ? data.map((_, index) => index) : [];
    onSelectionChange({
      selectedRows: newSelection,
      isAllSelected: checked,
      isPartiallySelected: false
    });
  };

  // Render sort icon
  const renderSortIcon = (column) => {
    if (!column.sortable) return null;

    const isActive = sorting?.key === column.key;
    const direction = sorting?.direction;

    if (isActive) {
      return direction === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      );
    }

    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
  };

  // Render cell content
  const renderCell = (column, row, rowIndex) => {
    if (column.render) {
      return column.render(row[column.key], row, rowIndex);
    }

    const value = row[column.key];
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>
        {value ? 'Yes' : 'No'}
      </span>;
    }

    if (Array.isArray(value)) {
      return <span className="text-gray-600">
        {value.length > 0 ? `${value.length} items` : 'None'}
      </span>;
    }

    return String(value);
  };

  // Pagination component
  const renderPagination = () => {
    if (!pagination) return null;

    const {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      hasNextPage,
      hasPrevPage,
      startIndex,
      endIndex
    } = pagination;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startIndex} to {endIndex} of {totalItems} results
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="small"
            disabled={!hasPrevPage}
            onClick={() => onPageChange?.(1)}
            icon={ChevronsLeft}
            title="First page"
          />
          
          <Button
            variant="ghost"
            size="small"
            disabled={!hasPrevPage}
            onClick={() => onPageChange?.(currentPage - 1)}
            icon={ChevronLeft}
            title="Previous page"
          />

          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="ghost"
            size="small"
            disabled={!hasNextPage}
            onClick={() => onPageChange?.(currentPage + 1)}
            icon={ChevronRight}
            title="Next page"
          />
          
          <Button
            variant="ghost"
            size="small"
            disabled={!hasNextPage}
            onClick={() => onPageChange?.(totalPages)}
            icon={ChevronsRight}
            title="Last page"
          />
        </div>
      </div>
    );
  };

  // Loading overlay
  const renderLoadingOverlay = () => {
    if (!loading) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="relative">
        {renderLoadingOverlay()}
        
        <div className={`overflow-x-auto ${stickyHeader ? 'max-h-96 overflow-y-auto' : ''}`}>
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-20' : ''}`}>
              <tr>
                {/* Selection column */}
                {selection && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selection.isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = selection.isPartiallySelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}

                {/* Data columns */}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                      ${column.width ? `w-${column.width}` : ''}
                    `}
                    style={column.minWidth ? { minWidth: column.minWidth } : {}}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {renderSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (selection ? 1 : 0)} 
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`
                      ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                      ${hover ? 'hover:bg-gray-50' : ''}
                      ${selection?.selectedRows?.includes(rowIndex) ? 'bg-blue-50' : ''}
                      ${compact ? 'text-sm' : ''}
                      transition-colors duration-150
                    `}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Selection column */}
                    {selection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selection.selectedRows?.includes(rowIndex) || false}
                          onChange={(e) => handleRowSelect(rowIndex, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}

                    {/* Data columns */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`
                          px-4 py-3 text-sm text-gray-900
                          ${compact ? 'py-2' : 'py-3'}
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {renderCell(column, row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

// Table column helper
export const createColumn = ({
  key,
  label,
  sortable = false,
  render = null,
  width = null,
  minWidth = null,
  align = 'left'
}) => ({
  key,
  label,
  sortable,
  render,
  width,
  minWidth,
  align
});

// Selection helper
export const createSelection = (selectedRows = [], onSelectionChange = null) => ({
  selectedRows,
  isAllSelected: false,
  isPartiallySelected: false,
  onSelectionChange
});

export default Table;