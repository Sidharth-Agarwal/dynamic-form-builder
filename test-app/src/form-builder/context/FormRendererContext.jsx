import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import { validateFormData } from '../services/form';

// Initial state for the form renderer
const initialState = {
  formData: {},
  errors: {},
  isSubmitting: false,
  isSubmitted: false,
  currentStep: 0,
  totalSteps: 1
};

// Action types for the reducer
const ACTION_TYPES = {
  SET_FORM_DATA: 'SET_FORM_DATA',
  UPDATE_FIELD_VALUE: 'UPDATE_FIELD_VALUE',
  SET_ERRORS: 'SET_ERRORS',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_SUBMITTED: 'SET_SUBMITTED',
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  RESET_FORM: 'RESET_FORM'
};

// Reducer function for form renderer state
const formRendererReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_FORM_DATA:
      return {
        ...state,
        formData: action.payload
      };
      
    case ACTION_TYPES.UPDATE_FIELD_VALUE:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.fieldId]: action.payload.value
        }
      };
      
    case ACTION_TYPES.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      };
      
    case ACTION_TYPES.SET_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.payload
      };
      
    case ACTION_TYPES.SET_SUBMITTED:
      return {
        ...state,
        isSubmitted: action.payload
      };
      
    case ACTION_TYPES.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
      };
      
    case ACTION_TYPES.PREV_STEP:
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0)
      };
      
    case ACTION_TYPES.GO_TO_STEP:
      return {
        ...state,
        currentStep: Math.min(
          Math.max(action.payload, 0),
          state.totalSteps - 1
        )
      };
      
    case ACTION_TYPES.RESET_FORM:
      return {
        ...initialState,
        totalSteps: state.totalSteps
      };
      
    default:
      return state;
  }
};

// Create the FormRenderer context
const FormRendererContext = createContext(null);

/**
 * FormRenderer Provider component
 * Manages state for form rendering and submission
 * @param {Object} props - Component props
 * @param {Object} props.form - Form data
 * @param {Function} props.onSubmit - Form submission handler
 * @param {React.ReactNode} props.children - Child components
 */
export const FormRendererProvider = ({ form, onSubmit, children }) => {
  const [state, dispatch] = useReducer(
    formRendererReducer, 
    {
      ...initialState,
      totalSteps: form.pages ? form.pages.length : 1
    }
  );
  
  const [submitSuccessData, setSubmitSuccessData] = useState(null);

  // Action creators
  const setFormData = useCallback((data) => {
    dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: data });
  }, []);

  const updateFieldValue = useCallback((fieldId, value) => {
    dispatch({ 
      type: ACTION_TYPES.UPDATE_FIELD_VALUE, 
      payload: { fieldId, value } 
    });
  }, []);

  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTION_TYPES.SET_ERRORS, payload: errors });
  }, []);

  const setSubmitting = useCallback((isSubmitting) => {
    dispatch({ type: ACTION_TYPES.SET_SUBMITTING, payload: isSubmitting });
  }, []);

  const setSubmitted = useCallback((isSubmitted) => {
    dispatch({ type: ACTION_TYPES.SET_SUBMITTED, payload: isSubmitted });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: ACTION_TYPES.NEXT_STEP });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: ACTION_TYPES.PREV_STEP });
  }, []);

  const goToStep = useCallback((step) => {
    dispatch({ type: ACTION_TYPES.GO_TO_STEP, payload: step });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_FORM });
    setSubmitSuccessData(null);
  }, []);

  // Validate form data
  const validateForm = useCallback((data = null) => {
    const dataToValidate = data || state.formData;
    const validationResult = validateFormData(dataToValidate, form.fields);
    
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [form.fields, state.formData, setErrors]);

  // Submit form
  const submitForm = useCallback(async () => {
    // Validate form
    const isValid = validateForm();
    
    if (!isValid) {
      return false;
    }
    
    // Update state
    setSubmitting(true);
    
    try {
      // Call onSubmit handler provided by parent
      const result = await onSubmit(state.formData);
      
      // Update state with result
      setSubmitting(false);
      setSubmitted(true);
      setSubmitSuccessData(result);
      
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Update state with error
      setSubmitting(false);
      setErrors({ 
        _form: ['An error occurred while submitting the form. Please try again.'] 
      });
      
      return false;
    }
  }, [validateForm, onSubmit, state.formData, setSubmitting, setSubmitted, setErrors]);

  // Context value
  const value = {
    ...state,
    form,
    submitSuccessData,
    setFormData,
    updateFieldValue,
    setErrors,
    validateForm,
    submitForm,
    nextStep,
    prevStep,
    goToStep,
    resetForm
  };

  return (
    <FormRendererContext.Provider value={value}>
      {children}
    </FormRendererContext.Provider>
  );
};

/**
 * Custom hook to use FormRenderer context
 * @returns {Object} FormRenderer state and actions
 */
export const useFormRenderer = () => {
  const context = useContext(FormRendererContext);
  
  if (context === null) {
    throw new Error('useFormRenderer must be used within a FormRendererProvider');
  }
  
  return context;
};