import React from 'react';
import { X, Calendar, User, Flag } from 'lucide-react';

export default function InternTasksModal({ open, onClose, intern }) {
  if (!open || !intern) return null;

  const pendingTasks = intern.tasks?.filter(task => task.status === 'pending') || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Tasks for {intern.internName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{intern.internEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Tasks</h3>
              <p className="text-gray-500">
                {intern.internName} has no pending tasks at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={task.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <Flag className="w-4 h-4 mr-2" />
                      <span>Priority: {task.priority || 'Normal'}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      <span>Assigned by: {task.assignedBy || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  {task.messageToIntern && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Message: </span>
                        {task.messageToIntern}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

                 {/* Footer */}
         <div className="px-6 py-4 border-t border-gray-200">
         </div>
      </div>
    </div>
  );
}
