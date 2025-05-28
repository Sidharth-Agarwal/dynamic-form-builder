import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DEFAULT_NEW_FORM,
  FORM_STATUS,
  createNewField
} from '../constants';

// Initial state for the form builder
const initialState = {
  form: { ...DEFAULT_NEW_FORM },
  selectedFieldId: null,
  isEditingForm: false,
  isSaving: false,
  previewMode: false,
  errors: {},
  undoStack: [],
  redoStack: []
};

// Action types for the reducer
const ACTION_TYPES = {
  SET_FORM: 'SET_FORM',
  UPDATE_FORM: 'UPDATE_FORM',
  UPDATE_FORM_SETTINGS: 'UPDATE_FORM_SETTINGS',
  ADD_FIELD: 'ADD_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  REMOVE_FIELD: 'REMOVE_FIELD',
  REORDER_FIELDS: 'REORDER_FIELDS',
  SELECT_FIELD: 'SELECT_FIELD',
  TOGGLE_PREVIEW: 'TOGGLE_PREVIEW',
  SET_SAVING: 'SET_SAVING',
  SET_ERRORS: 'SET_ERRORS',
  RESET_FORM: 'RESET_FORM',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Reducer function for form builder state
const formBuilderReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_FORM:
      return {
        ...state,
        form: action.payload,
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
      
    case ACTION_TYPES.UPDATE_FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...action.payload
        },
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
      
    case ACTION_TYPES.UPDATE_FORM_SETTINGS:
      return {
        ...state,
        form: {
          ...state.form,
          settings: {
            ...state.form.settings,
            ...action.payload
          }
        },
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
      
    case ACTION_TYPES.ADD_FIELD: {
      const newField = {
        ...action.payload,
        id: action.payload.id || `field_${uuidv4()}`
      };
      
      return {
        ...state,
        form: {
          ...state.form,
          fields: [...state.form.fields, newField]
        },
        selectedFieldId: newField.id,
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
    }
      
    case ACTION_TYPES.UPDATE_FIELD: {
      const updatedFields = state.form.fields.map(field => 
        field.id === action.payload.id ? { ...field, ...action.payload.data } : field
      );
      
      return {
        ...state,
        form: {
          ...state.form,
          fields: updatedFields
        },
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
    }
      
    case ACTION_TYPES.REMOVE_FIELD: {
      const filteredFields = state.form.fields.filter(field => 
        field.id !== action.payload
      );
      
      return {
        ...state,
        form: {
          ...state.form,
          fields: filteredFields
        },
        selectedFieldId: 
          state.selectedFieldId === action.payload 
            ? null 
            : state.selectedFieldId,
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
    }
      
    case ACTION_TYPES.REORDER_FIELDS:
      return {
        ...state,
        form: {
          ...state.form,
          fields: action.payload
        },
        undoStack: [...state.undoStack, state.form],
        redoStack: []
      };
      
    case ACTION_TYPES.SELECT_FIELD:
      return {
        ...state,
        selectedFieldId: action.payload
      };
      
    case ACTION_TYPES.TOGGLE_PREVIEW:
      return {
        ...state,
        previewMode: action.payload !== undefined ? action.payload : !state.previewMode,
        selectedFieldId: null
      };
      
    case ACTION_TYPES.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload
      };
      
    case ACTION_TYPES.SET_ERRORS:
      return {
        ...state,
        errors: action.payload
      };
      
    case ACTION_TYPES.RESET_FORM:
      return {
        ...initialState,
        form: { ...DEFAULT_NEW_FORM }
      };
      
    case ACTION_TYPES.UNDO: {
      if (state.undoStack.length === 0) return state;
      
      const previousForm = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      
      return {
        ...state,
        form: previousForm,
        undoStack: newUndoStack,
        redoStack: [state.form, ...state.redoStack]
      };
    }
      
    case ACTION_TYPES.REDO: {
      if (state.redoStack.length === 0) return state;
      
      const nextForm = state.redoStack[0];
      const newRedoStack = state.redoStack.slice(1);
      
      return {
        ...state,
        form: nextForm,
        undoStack: [...state.undoStack, state.form],
        redoStack: newRedoStack
      };
    }
      
    default:
      return state;
  }
};

// Create the FormBuilder context
const FormBuilderContext = createContext(null);

/**
 * FormBuilder Provider component
 * Manages state for form building functionality
 * @param {Object} props - Component props
 * @param {Object} [props.initialForm] - Optional initial form data
 * @param {React.ReactNode} props.children - Child components
 */
export const FormBuilderProvider = ({ initialForm = null, children }) => {
  const [state, dispatch] = useReducer(
    formBuilderReducer, 
    {
      ...initialState,
      form: initialForm || { ...DEFAULT_NEW_FORM }
    }
  );

  // Action creators
  const setForm = useCallback((form) => {
    dispatch({ type: ACTION_TYPES.SET_FORM, payload: form });
  }, []);

  const updateForm = useCallback((data) => {
    dispatch({ type: ACTION_TYPES.UPDATE_FORM, payload: data });
  }, []);

  const updateFormSettings = useCallback((settings) => {
    dispatch({ type: ACTION_TYPES.UPDATE_FORM_SETTINGS, payload: settings });
  }, []);

  const addField = useCallback((fieldType, options = {}) => {
    const newField = createNewField(fieldType, options.label, options);
    dispatch({ type: ACTION_TYPES.ADD_FIELD, payload: newField });
    return newField.id;
  }, []);

  const updateField = useCallback((fieldId, data) => {
    dispatch({ 
      type: ACTION_TYPES.UPDATE_FIELD, 
      payload: { id: fieldId, data } 
    });
  }, []);

  const removeField = useCallback((fieldId) => {
    dispatch({ type: ACTION_TYPES.REMOVE_FIELD, payload: fieldId });
  }, []);

  const reorderFields = useCallback((fields) => {
    dispatch({ type: ACTION_TYPES.REORDER_FIELDS, payload: fields });
  }, []);

  const selectField = useCallback((fieldId) => {
    dispatch({ type: ACTION_TYPES.SELECT_FIELD, payload: fieldId });
  }, []);

  const togglePreview = useCallback((value) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_PREVIEW, payload: value });
  }, []);

  const setSaving = useCallback((isSaving) => {
    dispatch({ type: ACTION_TYPES.SET_SAVING, payload: isSaving });
  }, []);

  const setErrors = useCallback((errors) => {
    dispatch({ type: ACTION_TYPES.SET_ERRORS, payload: errors });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_FORM });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: ACTION_TYPES.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ACTION_TYPES.REDO });
  }, []);

  // Publish/unpublish form
  const publishForm = useCallback(() => {
    updateForm({
      status: FORM_STATUS.PUBLISHED,
      publishedAt: new Date().toISOString()
    });
  }, [updateForm]);

  const unpublishForm = useCallback(() => {
    updateForm({ status: FORM_STATUS.DRAFT });
  }, [updateForm]);

  // Get currently selected field
  const getSelectedField = useCallback(() => {
    if (!state.selectedFieldId) return null;
    return state.form.fields.find(field => field.id === state.selectedFieldId) || null;
  }, [state.selectedFieldId, state.form.fields]);

  // Context value
  const value = {
    ...state,
    getSelectedField,
    setForm,
    updateForm,
    updateFormSettings,
    addField,
    updateField,
    removeField,
    reorderFields,
    selectField,
    togglePreview,
    setSaving,
    setErrors,
    resetForm,
    undo,
    redo,
    publishForm,
    unpublishForm
  };

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};

/**
 * Custom hook to use FormBuilder context
 * @returns {Object} FormBuilder state and actions
 */
export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  
  if (context === null) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  
  return context;
};