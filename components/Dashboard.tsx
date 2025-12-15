import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Plus, Trash2, Edit2, Check, X, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  teamMembers: string[];
  onUpdateTeamMembers: (members: string[]) => void;
  onUpdateTask: (task: Task) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, teamMembers, onUpdateTeamMembers, onUpdateTask }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState<{ index: number, name: string } | null>(null);

  // Local state for dashboard description expansion to avoid affecting Gantt view state if desired, 
  // or we can use the task property directly. Using task property allows persistence across views.
  // Using task property directly.

  const handleAddMember = () => {
    if (newMemberName.trim() && !teamMembers.includes(newMemberName.trim())) {
      onUpdateTeamMembers([...teamMembers, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleDeleteMember = (index: number) => {
    const newMembers = [...teamMembers];
    newMembers.splice(index, 1);
    onUpdateTeamMembers(newMembers);
  };

  const startEditMember = (index: number) => {
    setEditingMember({ index, name: teamMembers[index] });
  };

  const saveEditMember = () => {
    if (editingMember && editingMember.name.trim()) {
      const newMembers = [...teamMembers];
      newMembers[editingMember.index] = editingMember.name.trim();
      onUpdateTeamMembers(newMembers);
      setEditingMember(null);
    }
  };

  const cancelEditMember = () => {
    setEditingMember(null);
  };

  const getTasksForMember = (member: string, status: TaskStatus) => {
    return tasks.filter(t => t.assignee === member && t.status === status && t.type !== 'summary' && t.isActive);
  };

  const toggleDescription = (task: Task) => {
      onUpdateTask({ ...task, isDescriptionExpanded: !task.isDescriptionExpanded });
  };

  const updateDescription = (task: Task, desc: string) => {
      onUpdateTask({ ...task, description: desc });
  };

  const renderTaskCard = (t: Task, borderColor: string, bgColor: string) => (
      <div key={t.id} className={`border-l-4 ${borderColor} ${bgColor} p-2 rounded shadow-sm flex flex-col gap-2`}>
        <div className="flex justify-between items-start">
            <div className="font-medium text-slate-800 text-xs">{t.name}</div>
            <button 
                onClick={() => toggleDescription(t)} 
                className="text-gray-400 hover:text-blue-600 p-0.5"
                title="Toggle Description"
            >
                <FileText size={12} />
            </button>
        </div>
        
        {t.isDescriptionExpanded && (
            <div className="mt-1">
                <textarea 
                    value={t.description || ''}
                    onChange={(e) => updateDescription(t, e.target.value)}
                    placeholder="Add description..."
                    className="w-full text-xs p-1 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white/50"
                    rows={3}
                />
            </div>
        )}
        
        <div className="text-gray-500 text-[10px] mt-1 flex justify-between items-center">
            <span>Due: {t.end.toLocaleDateString()}</span>
            {t.description && !t.isDescriptionExpanded && (
                <span className="text-gray-400 italic max-w-[80px] truncate">{t.description}</span>
            )}
        </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <User size={24} className="text-blue-600" /> Team Dashboard
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Team Management */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-fit">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Members</h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Add new member..."
              className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            />
            <button
              onClick={handleAddMember}
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>

          <ul className="space-y-2">
            {teamMembers.map((member, index) => (
              <li key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group">
                {editingMember?.index === index ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      className="flex-1 text-sm border border-blue-300 rounded px-2 py-1 outline-none"
                      autoFocus
                    />
                    <button onClick={saveEditMember} className="text-green-600 hover:text-green-700"><Check size={16} /></button>
                    <button onClick={cancelEditMember} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700">{member}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditMember(index)} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteMember(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Task Status Boards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teamMembers.map(member => {
             const inProgress = getTasksForMember(member, 'In Progress');
             const blocked = getTasksForMember(member, 'Blocked');
             const completed = getTasksForMember(member, 'Completed');
             
             return (
               <div key={member} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-fit">
                 <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                    <span>{member}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{inProgress.length + blocked.length + completed.length} Active Tasks</span>
                 </div>
                 
                 <div className="p-4 flex flex-col gap-4 flex-1">
                    {/* Blocked */}
                    {blocked.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">Blocked ({blocked.length})</h4>
                         {blocked.map(t => renderTaskCard(t, 'border-red-500', 'bg-red-50'))}
                      </div>
                    )}

                    {/* In Progress */}
                    {inProgress.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider">In Progress ({inProgress.length})</h4>
                         {inProgress.map(t => renderTaskCard(t, 'border-yellow-400', 'bg-yellow-50'))}
                      </div>
                    )}

                    {/* Completed */}
                    {completed.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed ({completed.length})</h4>
                         {completed.map(t => renderTaskCard(t, 'border-green-500', 'bg-green-50'))}
                      </div>
                    )}

                    {inProgress.length === 0 && blocked.length === 0 && completed.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-xs italic py-4">
                            No active tasks
                        </div>
                    )}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;