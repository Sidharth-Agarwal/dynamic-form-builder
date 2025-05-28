import React, { useState, useEffect } from 'react';

/**
 * Tab component for displaying a single tab
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Tab ID
 * @param {string} props.label - Tab label
 * @param {React.ReactNode} props.children - Tab content
 * @param {boolean} [props.disabled] - Whether the tab is disabled
 */
export const Tab = ({ children }) => {
  return <>{children}</>;
};

/**
 * Tabs component for organizing content into tabbed interface
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab components
 * @param {string} [props.defaultTab] - ID of the default active tab
 * @param {Function} [props.onChange] - Function to call when the active tab changes
 * @param {string} [props.className] - Additional CSS classes
 */
const Tabs = ({ 
  children, 
  defaultTab, 
  onChange,
  className = ''
}) => {
  // Get tabs from children
  const tabs = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === Tab
  );
  
  // Set default active tab
  const [activeTab, setActiveTab] = useState(
    defaultTab || (tabs.length > 0 ? tabs[0].props.id : null)
  );
  
  // Update active tab when defaultTab changes
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);
  
  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    
    if (onChange) {
      onChange(tabId);
    }
  };
  
  return (
    <div className={`form-builder-tabs ${className}`}>
      {/* Tab navigation */}
      <ul className="form-builder-tabs-list" role="tablist">
        {tabs.map((tab) => {
          const { id, label, disabled } = tab.props;
          const isActive = activeTab === id;
          
          return (
            <li 
              key={id}
              className={`form-builder-tab ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              role="presentation"
            >
              <button
                id={`tab-${id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => !disabled && handleTabClick(id)}
                disabled={disabled}
                className={`form-builder-tab-button ${isActive ? 'active' : ''}`}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
      
      {/* Tab content */}
      <div className="form-builder-tab-content">
        {tabs.map((tab) => {
          const { id, children } = tab.props;
          const isActive = activeTab === id;
          
          return (
            <div
              key={id}
              id={`tabpanel-${id}`}
              role="tabpanel"
              aria-labelledby={`tab-${id}`}
              tabIndex={0}
              hidden={!isActive}
              className={`form-builder-tab-panel ${isActive ? 'active' : ''}`}
            >
              {children}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;