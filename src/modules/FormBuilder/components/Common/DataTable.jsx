// Example DataTable component with proper key props
import React from 'react';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false,
  error = null,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  onSort,
  sortConfig = {},
  pagination = {},
  emptyState,
  stickyHeader = false,
  className = '',
  rowClassName
}) => {
  
  const renderTableHeader = () => (
    <thead className={`bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
      <tr>
        {/* Selection column header */}
        {selectable && (
          <th 
            key="selection-header" // ✅ Add unique key
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
          >
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={selectedItems.length === data.length && data.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectionChange?.(data.map(item => item.id));
                } else {
                  onSelectionChange?.([]);
                }
              }}
            />
          </th>
        )}
        
        {/* Column headers */}
        {columns.map((column, index) => (
          <th
            key={column.accessor || column.header || `column-${index}`} // ✅ Add unique key
            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
            style={{ width: column.width }}
          >
            {column.sortable ? (
              <button
                onClick={() => onSort?.(column.accessor, sortConfig.order === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-1 hover:text-gray-700"
              >
                <span>{column.header}</span>
                {sortConfig.field === column.accessor && (
                  <span className="text-blue-500">
                    {sortConfig.order === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ) : (
              column.header
            )}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderTableBody = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((item, rowIndex) => (
        <tr
          key={item.id || `row-${rowIndex}`} // ✅ Add unique key
          className={`hover:bg-gray-50 cursor-pointer ${rowClassName?.(item) || ''}`}
          onClick={() => onRowClick?.(item)}
        >
          {/* Selection column */}
          {selectable && (
            <td 
              key={`selection-${item.id || rowIndex}`} // ✅ Add unique key
              className="px-6 py-4 whitespace-nowrap w-12"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={selectedItems.includes(item.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  const newSelection = e.target.checked
                    ? [...selectedItems, item.id]
                    : selectedItems.filter(id => id !== item.id);
                  onSelectionChange?.(newSelection);
                }}
              />
            </td>
          )}
          
          {/* Data columns */}
          {columns.map((column, colIndex) => (
            <td
              key={`${item.id || rowIndex}-${column.accessor || colIndex}`} // ✅ Add unique key
              className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
            >
              {column.render 
                ? column.render(item[column.accessor], item, rowIndex)
                : item[column.accessor]
              }
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td 
          colSpan={columns.length + (selectable ? 1 : 0)} 
          className="px-6 py-12 text-center"
        >
          {emptyState || (
            <div className="text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </td>
      </tr>
    </tbody>
  );

  const renderLoadingState = () => (
    <tbody>
      <tr>
        <td 
          colSpan={columns.length + (selectable ? 1 : 0)} 
          className="px-6 py-12 text-center"
        >
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        </td>
      </tr>
    </tbody>
  );

  const renderErrorState = () => (
    <tbody>
      <tr>
        <td 
          colSpan={columns.length + (selectable ? 1 : 0)} 
          className="px-6 py-12 text-center"
        >
          <div className="text-red-500">
            <p>Error: {error}</p>
          </div>
        </td>
      </tr>
    </tbody>
  );

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            {renderTableHeader()}
            
            {loading && renderLoadingState()}
            {error && !loading && renderErrorState()}
            {!loading && !error && data.length === 0 && renderEmptyState()}
            {!loading && !error && data.length > 0 && renderTableBody()}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing {pagination.showingFrom} to {pagination.showingTo} of {pagination.totalItems} results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={pagination.onPrevPage}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {pagination.pageNumbers?.map((pageNum, index) => (
                <button
                  key={typeof pageNum === 'number' ? `page-${pageNum}` : `ellipsis-${index}`} // ✅ Add unique key
                  onClick={() => typeof pageNum === 'number' && pagination.onPageChange?.(pageNum)}
                  disabled={typeof pageNum !== 'number'}
                  className={`px-3 py-1 text-sm border rounded ${
                    pageNum === pagination.currentPage
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'hover:bg-gray-50'
                  } ${typeof pageNum !== 'number' ? 'cursor-default' : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={pagination.onNextPage}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for creating columns
export const createColumn = ({
  header,
  accessor,
  render,
  sortable = true,
  width,
  className
}) => ({
  header,
  accessor,
  render,
  sortable,
  width,
  className
});

export const createActionsColumn = (renderActions) => ({
  header: 'Actions',
  accessor: 'actions',
  render: renderActions,
  sortable: false,
  width: '120px',
  className: 'text-right'
});

export const dateColumn = (accessor, header = 'Date') => ({
  header,
  accessor,
  render: (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString();
  },
  sortable: true
});

export const statusColumn = (accessor, header = 'Status') => ({
  header,
  accessor,
  render: (value) => (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      value === 'active' ? 'bg-green-100 text-green-800' :
      value === 'inactive' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {value}
    </span>
  ),
  sortable: true
});

export default DataTable;