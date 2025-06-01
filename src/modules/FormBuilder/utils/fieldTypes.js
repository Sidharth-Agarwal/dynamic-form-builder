// utils/fieldTypes.js
import { Type, Mail, FileText, List } from 'lucide-react';

export const FIELD_TYPES = {
  TEXT: {
    type: 'text',
    label: 'Text Input',
    icon: Type,
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false
    }
  },
  EMAIL: {
    type: 'email',
    label: 'Email Input',
    icon: Mail,
    defaultProps: {
      label: 'Email Field',
      placeholder: 'Enter email...',
      required: false
    }
  },
  TEXTAREA: {
    type: 'textarea',
    label: 'Textarea',
    icon: FileText,
    defaultProps: {
      label: 'Textarea Field',
      placeholder: 'Enter text...',
      required: false,
      rows: 4
    }
  },
  SELECT: {
    type: 'select',
    label: 'Select Dropdown',
    icon: List,
    defaultProps: {
      label: 'Select Field',
      placeholder: 'Choose an option...',
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  }
};

export const getFieldTypeConfig = (type) => {
  return Object.values(FIELD_TYPES).find(config => config.type === type);
};