import './index.css';
import './themes/default.css';
import './themes/dark.css';
import './components/builder.css';
import './components/renderer.css';
import './components/submissions.css';
import './components/common.css';
import './layout/grid.css';
import './layout/spacing.css';
import './layout/responsive.css';

// Export theme constants for programmatic access
export const THEMES = {
  DEFAULT: 'default',
  DARK: 'dark'
};

/**
 * Apply a theme to the form builder
 * @param {string} theme - Theme name ('default' or 'dark')
 * @param {HTMLElement} element - DOM element to apply theme to (defaults to document body)
 */
export const applyTheme = (theme = THEMES.DEFAULT, element = document.body) => {
  // Remove any existing theme classes
  element.classList.remove('form-builder-theme-default', 'form-builder-theme-dark');
  
  // Add the specified theme class
  element.classList.add(`form-builder-theme-${theme}`);
};

/**
 * Get a CSS variable value from the current theme
 * @param {string} variableName - CSS variable name (without the -- prefix)
 * @returns {string} - CSS variable value
 */
export const getThemeVariable = (variableName) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--form-builder-${variableName}`);
};

// Export style utilities for use in JavaScript
export const SPACING = {
  XS: 'form-builder-m-1',
  SM: 'form-builder-m-2',
  MD: 'form-builder-m-3',
  LG: 'form-builder-m-4',
  XL: 'form-builder-m-5'
};

export const GRID = {
  CONTAINER: 'form-builder-container',
  FLUID_CONTAINER: 'form-builder-container-fluid',
  ROW: 'form-builder-grid',
  COL: {
    DEFAULT: 'form-builder-col',
    1: 'form-builder-col-1',
    2: 'form-builder-col-2',
    3: 'form-builder-col-3',
    4: 'form-builder-col-4',
    5: 'form-builder-col-5',
    6: 'form-builder-col-6',
    7: 'form-builder-col-7',
    8: 'form-builder-col-8',
    9: 'form-builder-col-9',
    10: 'form-builder-col-10',
    11: 'form-builder-col-11',
    12: 'form-builder-col-12'
  }
};

export const FLEX = {
  DISPLAY: 'form-builder-d-flex',
  DIRECTION: {
    ROW: 'form-builder-flex-row',
    COLUMN: 'form-builder-flex-column'
  },
  JUSTIFY: {
    START: 'form-builder-justify-start',
    END: 'form-builder-justify-end',
    CENTER: 'form-builder-justify-center',
    BETWEEN: 'form-builder-justify-between',
    AROUND: 'form-builder-justify-around'
  },
  ALIGN: {
    START: 'form-builder-align-start',
    END: 'form-builder-align-end',
    CENTER: 'form-builder-align-center',
    STRETCH: 'form-builder-align-stretch'
  }
};

/**
 * Combine multiple class names with conditional logic
 * @param {Object} classMap - Object mapping class names to boolean conditions
 * @returns {string} - Combined class names
 */
export const classNames = (classMap) => {
  return Object.entries(classMap)
    .filter(([_, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(' ');
};