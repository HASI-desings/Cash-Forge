import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trophy } from 'lucide-react';
import TaskItem from './TaskItem';
import confetti from 'canvas-confetti'; // We assume this utility exists or is available

const TaskList = ({ tasks, onTaskComplete }) => {
  // Track the status of all tasks locally
  // Structure: { [taskId]: 'idle' | 'running' | 'claimable' | 'completed' }
  const [taskStates, setTaskStates] = useState({});
  
  // Track which task is currently occupying the "Thread" (Single task rule)
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Initialize states when tasks load
  useEffect(() => {
    const initialStates = {};
    tasks.forEach(t => {
      // If the task was already done in backend (passed via props), set to completed
      initialStates[t.id] = t.completed ? 'completed' : 'idle';
    });
    setTaskStates(prev => ({ ...prev, ...initialStates }));
  }, [tasks]);

  // Check if all tasks are finished
  const allCompleted = tasks.every(t => taskStates[t.id] === 'completed');

  // Trigger Confetti on completion
  useEffect(() => {
    if (allCompleted && tasks.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FFFF', '#00CCCC', '#FFFFFF'] // Cyan Theme
      });
    }
  }, [allCompleted, tasks.length]);

  // --- Handlers ---

  const handleStart = (taskId, duration) => {
    if (activeTaskId) return; // Prevent multiple starts

    setActiveTaskId(taskId);
    setTaskStates(prev => ({ ...prev, [taskId]: 'running' }));

    // Automatically switch to 'claimable' after duration
    setTimeout(() => {
      setTaskStates(prev => ({ ...prev, [taskId]: 'claimable' }));
      // We keep activeTaskId set so user MUST claim before starting another
    }, duration * 1000);
  };

  const handleClaim = (taskId, reward) => {
    // 1. Update State
    setTaskStates(prev => ({ ...prev, [taskId]: 'completed' }));
    setActiveTaskId(null); // Free up the thread

    // 2. Notify Parent (User Context) to add money
    onTaskComplete(taskId, reward);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* --- Completion Banner --- */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-center text-white shadow-xl glow-shadow mb-6"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block mb-2"
            >
              <Trophy size={48} className="text-yellow-300 drop-shadow-md" />
            </motion.div>
            <h2 className="text-2xl font-heavy">All Tasks Completed!</h2>
            <p className="text-green-100 font-medium mt-1">
              Great work. Come back tomorrow for more.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- The List --- */}
      <div>
        {tasks.map((task, index) => {
          const status = taskStates[task.id] || 'idle';
          
          // Disable if: 
          // 1. Another task is running (activeTaskId exists AND it's not this one)
          // 2. This task is already done
          const isDisabled = (activeTaskId !== null && activeTaskId !== task.id) || status === 'completed';

          return (
            <TaskItem
              key={task.id}
              index={index}
              task={task}
              status={status}
              disabled={isDisabled}
              onStart={() => handleStart(task.id, task.duration)}
              onClaim={() => handleClaim(task.id, task.reward)}
            />
          );
        })}
      </div>

      {/* Empty State Safety */}
      {tasks.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <p>No tasks available. Upgrade your package!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;