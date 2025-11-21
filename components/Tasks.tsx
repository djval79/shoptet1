
import React, { useState } from 'react';
import { BusinessProfile, Task } from '../types';
import { Icons } from '../constants';
import { generateSmartTasks } from '../services/geminiService';

interface TasksProps {
  business: BusinessProfile;
  tasks: Task[];
  onUpdateTasks: (tasks: Task[]) => void;
}

const Tasks: React.FC<TasksProps> = ({ business, tasks, onUpdateTasks }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlanDay = async () => {
      setIsGenerating(true);
      try {
          // In a real app, we would pass actual customers here.
          // For now, we assume the service handles fetching or uses mock context.
          // To make this better, we should pass customers to Tasks component too, 
          // but for now let's stick to the scope of updating task state.
          // We'll pass an empty array or mock for now as the service signature requires customers.
          const result = await generateSmartTasks([], business); 
          const newTasks: Task[] = result.tasks.map((t: any, i: number) => ({
              id: `task_gen_${Date.now()}_${i}`,
              title: t.title,
              description: t.description,
              priority: t.priority || 'medium',
              status: 'todo',
              customerId: t.customerId,
              dueDate: Date.now() + 86400000, // Due tomorrow
              aiGenerated: true
          }));
          
          onUpdateTasks([...newTasks, ...tasks]);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const moveTask = (id: string, newStatus: Task['status']) => {
      onUpdateTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id: string) => {
      onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (p: string) => {
      switch(p) {
          case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
          case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          default: return 'bg-green-500/20 text-green-400 border-green-500/30';
      }
  };

  const renderTaskCard = (task: Task) => (
      <div key={task.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 transition-all group">
          <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
              </span>
              <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
          </div>
          <h4 className="text-white font-medium text-sm mb-1">{task.title}</h4>
          {task.description && <p className="text-slate-400 text-xs mb-3">{task.description}</p>}
          
          <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
              <div className="flex items-center">
                  {task.aiGenerated && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded mr-2" title="AI Generated">✨ AI</span>}
                  {task.customerName && <span className="text-[10px] text-blue-400">@{task.customerName}</span>}
              </div>
              
              <div className="flex space-x-1">
                   {task.status !== 'todo' && (
                       <button onClick={() => moveTask(task.id, task.status === 'done' ? 'in_progress' : 'todo')} className="text-slate-400 hover:text-white text-xs px-1">←</button>
                   )}
                   {task.status !== 'done' && (
                       <button onClick={() => moveTask(task.id, task.status === 'todo' ? 'in_progress' : 'done')} className="text-slate-400 hover:text-green-400 text-xs px-1">→</button>
                   )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Tasks & To-Dos</h2>
          <p className="text-slate-400">Manage your daily sales activities and follow-ups.</p>
        </div>
        <button 
            onClick={handlePlanDay}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-purple-900/20 flex items-center disabled:opacity-50"
        >
            {isGenerating ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing Chats...
                </>
            ) : (
                <>
                    <span className="mr-2">✨</span> AI Plan My Day
                </>
            )}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {/* To Do */}
          <div className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-800 h-full">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">To Do</h3>
                  <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'todo').length}</span>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                  {tasks.filter(t => t.status === 'todo').map(t => renderTaskCard(t))}
              </div>
          </div>

          {/* In Progress */}
          <div className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-800 h-full">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-blue-400 uppercase text-xs tracking-wider">In Progress</h3>
                  <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                  {tasks.filter(t => t.status === 'in_progress').map(t => renderTaskCard(t))}
              </div>
          </div>

          {/* Done */}
          <div className="flex flex-col bg-slate-900/30 rounded-xl border border-slate-800 h-full">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-green-400 uppercase text-xs tracking-wider">Completed</h3>
                  <span className="bg-slate-800 text-slate-500 text-xs px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === 'done').length}</span>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                   {tasks.filter(t => t.status === 'done').map(t => renderTaskCard(t))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Tasks;
