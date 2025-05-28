import React from 'react';

/**
 * Component for paginating through submissions
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {number} [props.totalItems] - Total number of items
 * @param {number} [props.itemsPerPage] - Number of items per page
 */
const SubmissionPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems || 0);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, current, and neighbors
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if current page is near first or last
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    
    onPageChange(page);
  };
  
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="form-submissions-pagination">
      <div className="form-submissions-pagination-info">
        {totalItems > 0 ? (
          <>Showing {startItem} to {endItem} of {totalItems} submissions</>
        ) : (
          <>No submissions to display</>
        )}
      </div>
      
      <div className="form-submissions-pagination-controls">
        {/* Previous page button */}
        <button
          className="form-submissions-pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          &laquo;
        </button>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="form-submissions-pagination-ellipsis">...</span>
            ) : (
              <button
                className={`form-submissions-pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                disabled={currentPage === page}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        {/* Next page button */}
        <button
          className="form-submissions-pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default SubmissionPagination;