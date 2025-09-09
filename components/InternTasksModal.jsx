import React, { useState } from 'react';
import { X, Calendar, User, Flag, Trash2, Edit, Save, ArrowLeft } from 'lucide-react';

export default function InternTasksModal({ open, onClose, intern, onTaskUpdated, onTaskDeleted, companyId }) {
  if (!open || !intern) return null;

  const pendingTasks = intern.tasks?.filter(task => task.status === 'pending') || [];

  const [editingTask, setEditingTask] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const startEdit = (task) => {
    setEditingTask(task);
    setEditValues({
      title: task.title || task.taskName || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'Medium',
      messageToIntern: task.messageToIntern || ''
    });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditValues({});
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    setBusy(true);
    try {
      const resp = await fetch('/api/AssignedTasks/updateTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          internId: intern.internId,
          taskId: editingTask.id,
          collection: 'pending_tasks',
          updates: {
            title: editValues.title,
            description: editValues.description,
            dueDate: editValues.dueDate,
            priority: editValues.priority,
            messageToIntern: editValues.messageToIntern
          }
        })
      });

      if (!resp.ok) throw new Error('Failed to update task');
      await resp.json();
      cancelEdit();
      onTaskUpdated && onTaskUpdated();
    } catch (error) {
      console.error('Update task failed', error);
      // keep edit open for retry
    } finally {
      setBusy(false);
    }
  };

  // open confirmation popup instead of native confirm()
  const handleDeleteRequest = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setBusy(true);
    try {
      const resp = await fetch('/api/AssignedTasks/deleteTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, internId: intern.internId, taskId: taskToDelete.id, collection: 'pending_tasks' })
      });
      if (!resp.ok) throw new Error('Failed to delete task');
      await resp.json();
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      onTaskDeleted && onTaskDeleted();
    } catch (error) {
      console.error('Delete task failed', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
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
            onClick={() => { cancelEdit(); onClose(); }}
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{task.title || task.taskName}</h3>
                      <div className="text-xs text-gray-500">#{task.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(task)} className="text-blue-600 hover:text-blue-800 p-2 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRequest(task)} className="text-red-600 hover:text-red-800 p-2 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingTask && editingTask.id === task.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <input value={editValues.title} onChange={(e) => setEditValues(v => ({ ...v, title: e.target.value }))} className="w-full border rounded px-3 py-2" />
                        <textarea value={editValues.description} onChange={(e) => setEditValues(v => ({ ...v, description: e.target.value }))} className="w-full border rounded px-3 py-2" rows={3} />
                        <div className="flex gap-2">
                          <input type="date" value={editValues.dueDate ? editValues.dueDate.split('T')[0] : ''} onChange={(e) => setEditValues(v => ({ ...v, dueDate: e.target.value }))} className="border rounded px-3 py-2" />
                          <select value={editValues.priority} onChange={(e) => setEditValues(v => ({ ...v, priority: e.target.value }))} className="border rounded px-3 py-2">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Urgent</option>
                          </select>
                        </div>
                        <input value={editValues.messageToIntern} onChange={(e) => setEditValues(v => ({ ...v, messageToIntern: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Message to intern" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEdit} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                        <button onClick={handleUpdate} disabled={busy} className="px-3 py-2 bg-green-600 text-white rounded">{busy ? 'Saving...' : 'Save'}</button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
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
      {/* Delete confirmation popup */}
      {showDeleteConfirm && taskToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="bg-black/40 absolute inset-0"></div>
          <div className="bg-white rounded-lg shadow-xl z-70 p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete task</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete the task "{taskToDelete.title || taskToDelete.taskName}"?</p>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDelete} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} disabled={busy} className="px-3 py-2 bg-red-600 text-white rounded">{busy ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
