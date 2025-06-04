import React from 'react';
import { FileText, Eye, Edit, Copy, Trash2, Calendar } from 'lucide-react';
import Button from '../Common/Button';

const FormsList = ({ 
  forms, 
  onSelectForm, 
  onEditForm, 
  onDuplicateForm, 
  onDeleteForm,
  className = '' 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (forms.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-500 mb-2">No forms yet</h3>
        <p className="text-gray-400">Create your first form using the Form Builder</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Saved Forms ({forms.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {forms.map((form) => (
          <div key={form.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500 gap-4">
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {form.fields?.length || 0} fields
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(form.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="small"
                  icon={Eye}
                  onClick={() => onSelectForm(form)}
                  className="text-blue-600 hover:text-blue-700"
                  title="View Form"
                />
                <Button
                  variant="ghost"
                  size="small"
                  icon={Edit}
                  onClick={() => onEditForm(form)}
                  className="text-gray-600 hover:text-gray-700"
                  title="Edit Form"
                />
                <Button
                  variant="ghost"
                  size="small"
                  icon={Copy}
                  onClick={() => onDuplicateForm(form.id)}
                  className="text-gray-600 hover:text-gray-700"
                  title="Duplicate Form"
                />
                <Button
                  variant="ghost"
                  size="small"
                  icon={Trash2}
                  onClick={() => onDeleteForm(form.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Form"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormsList;