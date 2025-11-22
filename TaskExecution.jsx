import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Briefcase, CheckCircle2, Lock, CalendarOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useGame } from '../context/GameContext';
import { useToast } from '../hooks/useToast';
import { PACKAGES } from '../config/app-data';
import { formatCurrency, getDayName } from '../utils/formatters';
import PageLayout from '../components/layout/PageLayout';
import TaskList from '../components/features/tasks/TaskList';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const TaskExecution = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { isWeekend, tasksDoneToday, markTaskComplete } = useGame();
  const toast = useToast();

  // --- 1. Identify User's Tasks ---
  // Find the package the user currently owns
  const currentPkg = PACKAGES.find(p => p.id === user?.activePackageId);
  
  // Calculate specific task values
  // We split the dailyIncome roughly equally among the number of tasks strings
  const rawTasks = currentPkg ? currentPkg.tasks : [];
  const rewardPerTask = currentPkg ? (currentPkg.dailyIncome / rawTasks.length) : 0;
  const taskDuration = 75 / (rawTasks.length || 1); // Total 75s divided by tasks

  // Create Task Objects
  const tasks = rawTasks.map((name, index) => ({
    id: `task-${currentPkg?.id}-${index}`, // Unique ID
    name: name,
    duration: taskDuration, // distributed duration
    reward: rewardPerTask,
    completed: tasksDoneToday.includes(`task-${currentPkg?.id}-${index}`)
  }));

  // Stats
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const earnedToday = completedCount * rewardPerTask;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // --- Handlers ---
  const handleTaskComplete = (taskId, reward) => {
    // 1. Mark logic as done
    markTaskComplete(taskId);

    // 2. Add Money
    updateUser({
      balance: user.balance + reward,
      // Optional: Track 'today's earnings' in user object if needed
    });

    toast.success(`Task Verified! +₨ ${reward.toFixed(2)}`);
  };

  // --- VIEW: WEEKEND LOCK ---
  if (isWeekend) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
            className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-xl shadow-red-500/20"
          >
            <CalendarOff size={48} />
          </motion.div>
          
          <div>
            <h1 className="text-2xl font-heavy text-slate-800">Markets Closed</h1>
            <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">
              Trading protocols are paused on weekends ({getDayName()}). 
              <br/>Please return on Monday.
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-sm text-orange-800 font-bold max-w-sm">
            Tip: You can still invite friends or spin the Lucky Wheel!
          </div>

          <Button onClick={() => navigate('/')} variant="secondary" className="max-w-xs">
            Return Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  // --- VIEW: NO PACKAGE ---
  if (!currentPkg) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Lock size={48} />
          </div>
          <div>
            <h1 className="text-2xl font-heavy text-slate-800">Tasks Locked</h1>
            <p className="text-slate-500 font-medium mt-2">
              You must purchase an Investment Package to verify transactions and earn daily income.
            </p>
          </div>
          <Button onClick={() => navigate('/')} className="max-w-xs">
            Browse Packages
          </Button>
        </div>
      </PageLayout>
    );
  }

  // --- VIEW: MAIN EXECUTION ---
  return (
    <PageLayout>
      
      {/* Header Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-heavy text-slate-800">Daily Protocols</h1>
        <p className="text-sm font-medium text-slate-500">
          {currentPkg.name} Tier • {formatCurrency(currentPkg.dailyIncome)} Potential
        </p>
      </div>

      {/* Progress Card */}
      <Card className="mb-6 border-cyan-400 bg-gradient-to-r from-white to-cyan-50">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Earned Today</p>
            <h2 className="text-3xl font-heavy text-cyan-700">
              {formatCurrency(earnedToday)}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
            <p className="font-heavy text-slate-700">{completedCount} / {totalTasks}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </Card>

      {/* Warning Banner */}
      <div className="flex gap-2 items-start bg-yellow-50 p-3 rounded-xl border border-yellow-100 mb-6 text-yellow-800 text-xs font-bold">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        <p>Warning: Do not close or refresh the page while a task timer is running, or validation may fail.</p>
      </div>

      {/* The List Engine */}
      <TaskList 
        tasks={tasks} 
        onTaskComplete={handleTaskComplete} 
      />

    </PageLayout>
  );
};

export default TaskExecution;