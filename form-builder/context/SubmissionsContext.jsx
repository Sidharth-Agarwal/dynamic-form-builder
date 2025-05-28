import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  getFormSubmissions, 
  countSubmissions 
} from '../services/submission';
import { DEFAULT_PAGINATION, DEFAULT_FILTERS } from '../constants';

// Initial state for submissions
const initialState = {
  submissions: [],
  totalSubmissions: 0,
  isLoading: false,
  error: null,
  pagination: {
    ...DEFAULT_PAGINATION,
    currentPage: 1,
    totalPages: 1
  },
  filters: { ...DEFAULT_FILTERS },
  sort: {
    field: 'submittedAt',
    direction: 'desc'
  },
  selectedSubmission: null
};

// Action types for the reducer
const ACTION_TYPES = {
  FETCH_SUBMISSIONS_START: 'FETCH_SUBMISSIONS_START',
  FETCH_SUBMISSIONS_SUCCESS: 'FETCH_SUBMISSIONS_SUCCESS',
  FETCH_SUBMISSIONS_ERROR: 'FETCH_SUBMISSIONS_ERROR',
  SET_TOTAL_SUBMISSIONS: 'SET_TOTAL_SUBMISSIONS',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_SORT: 'SET_SORT',
  SELECT_SUBMISSION: 'SELECT_SUBMISSION',
  RESET_SUBMISSIONS: 'RESET_SUBMISSIONS'
};

// Reducer function for submissions state
const submissionsReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_SUBMISSIONS_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case ACTION_TYPES.FETCH_SUBMISSIONS_SUCCESS:
      return {
        ...state,
        submissions: action.payload,
        isLoading: false,
        error: null
      };
      
    case ACTION_TYPES.FETCH_SUBMISSIONS_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
      
    case ACTION_TYPES.SET_TOTAL_SUBMISSIONS:
      return {
        ...state,
        totalSubmissions: action.payload,
        pagination: {
          ...state.pagination,
          totalPages: Math.ceil(action.payload / state.pagination.itemsPerPage)
        }
      };
      
    case ACTION_TYPES.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };
      
    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        // Reset to first page when filters change
        pagination: {
          ...state.pagination,
          currentPage: 1
        }
      };
      
    case ACTION_TYPES.SET_SORT:
      return {
        ...state,
        sort: action.payload
      };
      
    case ACTION_TYPES.SELECT_SUBMISSION:
      return {
        ...state,
        selectedSubmission: action.payload
      };
      
    case ACTION_TYPES.RESET_SUBMISSIONS:
      return {
        ...initialState
      };
      
    default:
      return state;
  }
};

// Create the Submissions context
const SubmissionsContext = createContext(null);

/**
 * Submissions Provider component
 * Manages state for submissions data and filtering
 * @param {Object} props - Component props
 * @param {string} props.formId - ID of the form
 * @param {React.ReactNode} props.children - Child components
 */
export const SubmissionsProvider = ({ formId, children }) => {
  const [state, dispatch] = useReducer(submissionsReducer, initialState);

  // Action creators
  const setLoading = useCallback(() => {
    dispatch({ type: ACTION_TYPES.FETCH_SUBMISSIONS_START });
  }, []);

  const setSubmissions = useCallback((submissions) => {
    dispatch({ 
      type: ACTION_TYPES.FETCH_SUBMISSIONS_SUCCESS, 
      payload: submissions 
    });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ 
      type: ACTION_TYPES.FETCH_SUBMISSIONS_ERROR, 
      payload: error 
    });
  }, []);

  const setTotalSubmissions = useCallback((total) => {
    dispatch({ 
      type: ACTION_TYPES.SET_TOTAL_SUBMISSIONS, 
      payload: total 
    });
  }, []);

  const setPagination = useCallback((pagination) => {
    dispatch({ 
      type: ACTION_TYPES.SET_PAGINATION, 
      payload: pagination 
    });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ 
      type: ACTION_TYPES.SET_FILTERS, 
      payload: filters 
    });
  }, []);

  const setSort = useCallback((sort) => {
    dispatch({ 
      type: ACTION_TYPES.SET_SORT, 
      payload: sort 
    });
  }, []);

  const selectSubmission = useCallback((submission) => {
    dispatch({ 
      type: ACTION_TYPES.SELECT_SUBMISSION, 
      payload: submission 
    });
  }, []);

  const resetSubmissions = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_SUBMISSIONS });
  }, []);

  // Function to fetch submissions
  const fetchSubmissions = useCallback(async () => {
    if (!formId) return;
    
    setLoading();
    
    try {
      // Prepare options for the query
      const options = {
        page: state.pagination.currentPage,
        limit: state.pagination.itemsPerPage,
        sortBy: state.sort.field,
        sortDirection: state.sort.direction,
        filters: []
      };
      
      // Add date range filters if set
      if (state.filters.dateRange.startDate) {
        options.filters.push({
          field: 'submittedAt',
          operator: '>=',
          value: state.filters.dateRange.startDate
        });
      }
      
      if (state.filters.dateRange.endDate) {
        options.filters.push({
          field: 'submittedAt',
          operator: '<=',
          value: state.filters.dateRange.endDate
        });
      }
      
      // Add field filters if any
      Object.entries(state.filters.fieldFilters).forEach(([fieldId, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          options.filters.push({
            field: `data.${fieldId}`,
            operator: '==',
            value
          });
        }
      });
      
      // Fetch submissions
      const submissions = await getFormSubmissions(formId, options);
      setSubmissions(submissions);
      
      // Count total submissions (for pagination)
      const total = await countSubmissions(formId);
      setTotalSubmissions(total);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error.message);
    }
  }, [
    formId, 
    state.pagination.currentPage, 
    state.pagination.itemsPerPage,
    state.sort.field,
    state.sort.direction,
    state.filters,
    setLoading,
    setSubmissions,
    setError,
    setTotalSubmissions
  ]);

  // Fetch submissions when dependencies change
  useEffect(() => {
    fetchSubmissions();
  }, [
    fetchSubmissions,
    state.pagination.currentPage,
    state.sort,
    state.filters
  ]);

  // Change page
  const goToPage = useCallback((page) => {
    setPagination({ currentPage: page });
  }, [setPagination]);

  // Context value
  const value = {
    ...state,
    fetchSubmissions,
    goToPage,
    setFilters,
    setSort,
    selectSubmission,
    resetSubmissions
  };

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
};

/**
 * Custom hook to use Submissions context
 * @returns {Object} Submissions state and actions
 */
export const useSubmissions = () => {
  const context = useContext(SubmissionsContext);
  
  if (context === null) {
    throw new Error('useSubmissions must be used within a SubmissionsProvider');
  }
  
  return context;
};