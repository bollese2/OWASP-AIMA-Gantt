import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Plus, Trash2, Edit2, Check, X, User } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  teamMembers: string[];
  onUpdateTeamMembers: (members: string[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, teamMembers, onUpdateTeamMembers }) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMember, setEditingMember] = useState<{ index: number, name: string } | null>(null);

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
             
             // Only show card if they have tasks in these categories? Or always show?
             // Show always so we can see who has nothing.
             return (
               <div key={member} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                 <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
                    <span>{member}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{inProgress.length + blocked.length + completed.length} Active Tasks</span>
                 </div>
                 
                 <div className="p-4 flex flex-col gap-4 flex-1">
                    {/* Blocked */}
                    {blocked.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider">Blocked ({blocked.length})</h4>
                         {blocked.map(t => (
                           <div key={t.id} className="bg-red-50 border-l-4 border-red-500 p-2 text-xs rounded shadow-sm">
                             <div className="font-medium text-slate-800">{t.name}</div>
                             <div className="text-gray-500 mt-1">Due: {t.end.toLocaleDateString()}</div>
                           </div>
                         ))}
                      </div>
                    )}

                    {/* In Progress */}
                    {inProgress.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider">In Progress ({inProgress.length})</h4>
                         {inProgress.map(t => (
                           <div key={t.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-xs rounded shadow-sm">
                             <div className="font-medium text-slate-800">{t.name}</div>
                             <div className="text-gray-500 mt-1">Due: {t.end.toLocaleDateString()}</div>
                           </div>
                         ))}
                      </div>
                    )}

                    {/* Completed */}
                    {completed.length > 0 && (
                      <div className="flex flex-col gap-2">
                         <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed ({completed.length})</h4>
                         {completed.map(t => (
                           <div key={t.id} className="bg-green-50 border-l-4 border-green-500 p-2 text-xs rounded shadow-sm opacity-75">
                             <div className="font-medium text-slate-800 line-through">{t.name}</div>
                             <div className="text-gray-500 mt-1">Done: {t.end.toLocaleDateString()}</div>
                           </div>
                         ))}
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