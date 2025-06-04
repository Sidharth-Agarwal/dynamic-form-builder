import { 
  Type, 
  Mail, 
  FileText, 
  List, 
  CheckCircle, 
  Circle,
  Hash,
  Calendar,
  Upload,
  Star,
  Phone
} from 'lucide-react';

export const FIELD_TYPES = {
  // Original 4 field types
  TEXT: {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    category: 'basic',
    description: 'Single line text input',
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      maxLength: null,
      minLength: null
    },
    validationRules: ['required', 'minLength', 'maxLength', 'pattern']
  },

  EMAIL: {
    type: 'email',
    label: 'Email Input',
    icon: Mail,
    category: 'basic',
    description: 'Email address with validation',
    defaultProps: {
      label: 'Email Field',
      placeholder: 'Enter email...',
      required: false
    },
    validationRules: ['required', 'email']
  },

  TEXTAREA: {
    type: 'textarea',
    label: 'Textarea',
    icon: FileText,
    category: 'basic',
    description: 'Multi-line text input',
    defaultProps: {
      label: 'Textarea Field',
      placeholder: 'Enter text...',
      required: false,
      rows: 4,
      maxLength: null,
      minLength: null
    },
    validationRules: ['required', 'minLength', 'maxLength']
  },

  SELECT: {
    type: 'select',
    label: 'Select Dropdown',
    icon: List,
    category: 'choice',
    description: 'Dropdown selection list',
    defaultProps: {
      label: 'Select Field',
      placeholder: 'Choose an option...',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    },
    validationRules: ['required']
  },

  // New field types for Phase 2
  RADIO: {
    type: 'radio',
    label: 'Radio Buttons',
    icon: Circle,
    category: 'choice',
    description: 'Single choice selection',
    defaultProps: {
      label: 'Radio Field',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      layout: 'vertical' // vertical or horizontal
    },
    validationRules: ['required']
  },

  CHECKBOX: {
    type: 'checkbox',
    label: 'Checkboxes',
    icon: CheckCircle,
    category: 'choice',
    description: 'Multiple choice selection',
    defaultProps: {
      label: 'Checkbox Field',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
      layout: 'vertical',
      minSelections: null,
      maxSelections: null
    },
    validationRules: ['required', 'minSelections', 'maxSelections']
  },

  NUMBER: {
    type: 'number',
    label: 'Number Input',
    icon: Hash,
    category: 'basic',
    description: 'Numeric input with validation',
    defaultProps: {
      label: 'Number Field',
      placeholder: 'Enter number...',
      required: false,
      min: null,
      max: null,
      step: 1,
      allowDecimals: true
    },
    validationRules: ['required', 'min', 'max', 'integer']
  },

  DATE: {
    type: 'date',
    label: 'Date Picker',
    icon: Calendar,
    category: 'basic',
    description: 'Date selection with calendar',
    defaultProps: {
      label: 'Date Field',
      placeholder: 'Select date...',
      required: false,
      minDate: null,
      maxDate: null,
      dateFormat: 'dd/MM/yyyy'
    },
    validationRules: ['required', 'minDate', 'maxDate', 'futureOnly', 'pastOnly']
  },

  FILE: {
    type: 'file',
    label: 'File Upload',
    icon: Upload,
    category: 'advanced',
    description: 'File upload with restrictions',
    defaultProps: {
      label: 'File Upload',
      required: false,
      acceptedTypes: ['image/*', '.pdf', '.doc', '.docx'],
      maxFileSize: 5, // MB
      maxFiles: 1,
      allowMultiple: false
    },
    validationRules: ['required', 'fileType', 'fileSize', 'fileCount']
  },

  RATING: {
    type: 'rating',
    label: 'Rating Scale',
    icon: Star,
    category: 'advanced',
    description: 'Star rating or scale',
    defaultProps: {
      label: 'Rating Field',
      required: false,
      maxRating: 5,
      allowHalf: false,
      showLabels: true,
      labels: {
        1: 'Poor',
        2: 'Fair', 
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      }
    },
    validationRules: ['required', 'minRating']
  }
};

// Field categories for organization
export const FIELD_CATEGORIES = {
  basic: {
    label: 'Basic Fields',
    description: 'Simple input fields',
    fields: ['TEXT', 'EMAIL', 'TEXTAREA', 'NUMBER', 'DATE']
  },
  choice: {
    label: 'Choice Fields', 
    description: 'Selection and choice fields',
    fields: ['SELECT', 'RADIO', 'CHECKBOX']
  },
  advanced: {
    label: 'Advanced Fields',
    description: 'Complex interactive fields',
    fields: ['FILE', 'RATING']
  }
};

// Helper functions
export const getFieldTypeConfig = (type) => {
  return Object.values(FIELD_TYPES).find(config => config.type === type);
};

export const getFieldsByCategory = (category) => {
  const categoryConfig = FIELD_CATEGORIES[category];
  if (!categoryConfig) return [];
  
  return categoryConfig.fields.map(fieldKey => FIELD_TYPES[fieldKey]);
};

export const getAllFieldTypes = () => {
  return Object.values(FIELD_TYPES);
};

export const getFieldValidationRules = (fieldType) => {
  const config = getFieldTypeConfig(fieldType);
  return config?.validationRules || [];
};

export const isChoiceField = (fieldType) => {
  const choiceTypes = ['select', 'radio', 'checkbox'];
  return choiceTypes.includes(fieldType);
};

export const hasOptions = (fieldType) => {
  return isChoiceField(fieldType);
};

export const getDefaultFieldValue = (field) => {
  switch (field.type) {
    case 'checkbox':
      return [];
    case 'number':
      return null;
    case 'date':
      return null;
    case 'file':
      return null;
    case 'rating':
      return 0;
    default:
      return '';
  }
};