import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal } from 'lucide-react';
import Button from './Button';
import LoadingSpinner, { TableSkeleton } from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  sortable = true,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  onSort,
  sortConfig = { field: null, order: 'asc' },
  pagination = null,
  emptyState = null,
  className = '',
  rowClassName = '',
  stickyHeader = false
}) => {
  const [localSortConfig, setLocalSortConfig] = useState(sortConfig);

  // Handle sorting
  const handleSort = (field) => {
    if (!sortable) return;

    let newOrder = 'asc';
    if (localSortConfig.field === field && localSortConfig.order === 'asc') {
      newOrder = 'desc';
    }

    const newSortConfig = { field, order: newOrder };
    setLocalSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(field, newOrder);
    }
  };

  // Handle row selection
  const handleRowSelect = (item, isSelected) => {
    if (!selectable || !onSelectionChange) return;

    let newSelection;
    if (isSelected) {
      newSelection = selectedItems.filter(selected => selected.id !== item.id);
    } else {
      newSelection = [...selectedItems, item];
    }
    
    onSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (!selectable || !onSelectionChange) return;

    if (isSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  // Check if all items are selected
  const isAllSelected = selectable && data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectable && selectedItems.length > 0 && selectedItems.length < data.length;

  // Render sort icon
  const renderSortIcon = (field) => {
    if (!sortable) return null;

    if (localSortConfig.field === field) {
      return localSortConfig.order === 'asc' 
        ? <ChevronUp className="w-4 h-4" />
        : <ChevronDown className="w-4 h-4" />;
    }
    
    return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
  };

  // Render cell content
  const renderCell = (column, item, rowIndex) => {
    const value = column.accessor ? item[column.accessor] : '';

    if (column.render) {
      return column.render(value, item, rowIndex);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }

    return value || '-';
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-4">
          <TableSkeleton rows={5} columns={columns.length} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8">
          <EmptyState
            type="error"
            title="Failed to load data"
            description={error}
          />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-8">
          {emptyState || (
            <EmptyState
              type="no-data"
              title="No data available"
              description="There are no items to display."
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={column.key || column.accessor}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''}
                    ${column.headerClassName || ''}
                  `}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.header}</span>
                    {column.sortable !== false && renderSortIcon(column.accessor)}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              {columns.some(col => col.type === 'actions') && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => {
              const isSelected = selectable && selectedItems.some(selected => selected.id === item.id);
              
              return (
                <tr
                  key={item.id || rowIndex}
                  className={`
                    hover:bg-gray-50 transition-colors duration-150
                    ${isSelected ? 'bg-blue-50' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${typeof rowClassName === 'function' ? rowClassName(item, rowIndex) : rowClassName}
                  `}
                  onClick={() => onRowClick && onRowClick(item, rowIndex)}
                >
                  {/* Selection column */}
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(item, isSelected);
                        }}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                  )}

                  {/* Data columns */}
                  {columns.filter(col => col.type !== 'actions').map((column) => (
                    <td
                      key={column.key || column.accessor}
                      className={`
                        px-6 py-4 whitespace-nowrap text-sm
                        ${column.className || 'text-gray-900'}
                      `}
                    >
                      {renderCell(column, item, rowIndex)}
                    </td>
                  ))}

                  {/* Actions column */}
                  {columns.filter(col => col.type === 'actions').map((column) => (
                    <td
                      key={column.key || 'actions'}
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    >
                      {column.render ? column.render(null, item, rowIndex) : (
                        <Button
                          variant="ghost"
                          size="small"
                          icon={MoreHorizontal}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={pagination.onPrevPage}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={pagination.onNextPage}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{pagination.showingFrom}</span>
                  {' '}to{' '}
                  <span className="font-medium">{pagination.showingTo}</span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.totalItems}</span>
                  {' '}results
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={pagination.onPrevPage}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {pagination.pageNumbers && pagination.pageNumbers.map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={page === pagination.currentPage ? 'primary' : 'ghost'}
                          size="small"
                          onClick={() => pagination.onPageChange(page)}
                          className="min-w-[2rem]"
                        >
                          {page}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="small"
                  onClick={pagination.onNextPage}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Column helper functions
export const createColumn = ({
  header,
  accessor,
  render,
  sortable = true,
  width,
  className,
  headerClassName,
  type = 'text'
}) => ({
  header,
  accessor,
  render,
  sortable,
  width,
  className,
  headerClassName,
  type
});

export const createActionsColumn = (render) => ({
  type: 'actions',
  header: 'Actions',
  render,
  sortable: false,
  width: '100px'
});

// Preset column types
export const dateColumn = (header, accessor, options = {}) => createColumn({
  header,
  accessor,
  type: 'date',
  render: (value) => value ? new Date(value).toLocaleDateString() : '-',
  ...options
});

export const statusColumn = (header, accessor, StatusComponent, options = {}) => createColumn({
  header,
  accessor,
  render: (value) => <StatusComponent status={value} />,
  sortable: true,
  ...options
});

export const numberColumn = (header, accessor, options = {}) => createColumn({
  header,
  accessor,
  type: 'number',
  render: (value) => typeof value === 'number' ? value.toLocaleString() : '-',
  className: 'text-right',
  ...options
});

export const textColumn = (header, accessor, options = {}) => createColumn({
  header,
  accessor,
  type: 'text',
  ...options
});

export default DataTable;