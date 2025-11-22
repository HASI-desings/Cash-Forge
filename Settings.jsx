import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Key, Camera, Save, ArrowLeft, Shield } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useToast } from '../hooks/useToast';
import { validatePassword, validateTransactionPin } from '../utils/validators';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // --- Profile Form Setup ---
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } 
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '', // Read-only
    }
  });

  // --- Security Form Setup ---
  const { 
    register: registerSecurity, 
    handleSubmit: handleSecuritySubmit, 
    reset: resetSecurity,
    formState: { errors: securityErrors, isSubmitting: isSecuritySubmitting } 
  } = useForm();

  // --- Handlers ---

  const onUpdateProfile = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({ name: data.name });
    toast.success("Profile updated successfully");
  };

  const onUpdateSecurity = async (data) => {
    // Validate New Password (if provided)
    if (data.newPassword) {
      const passCheck = validatePassword(data.newPassword);
      if (passCheck !== true) {
        toast.error(passCheck);
        return;
      }
    }

    // Validate New PIN (if provided)
    if (data.transactionPin) {
      const pinCheck = validateTransactionPin(data.transactionPin);
      if (pinCheck !== true) {
        toast.error(pinCheck);
        return;
      }
    }

    if (!data.newPassword && !data.transactionPin) {
      toast.info("No changes to save");
      return;
    }

    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, you'd verify 'currentPassword' here
    toast.success("Security settings updated");
    resetSecurity();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateUser({ avatar: url });
      toast.success("Avatar updated");
    }
  };

  return (
    <PageLayout>
      {/* --- Header --- */}
      <div className="relative text-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-2xl font-heavy text-slate-800">Settings</h1>
        <p className="text-sm font-medium text-slate-500">Manage your account</p>
      </div>

      {/* --- Tabs --- */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6 relative">
        {['profile', 'security'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2 text-sm font-heavy z-10 transition-colors capitalize ${isActive ? 'text-slate-800' : 'text-slate-400'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="w-full h-full rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="w-full h-full p-6 text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-400">Tap icon to change</p>
          </div>

          <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
            <Input 
              label="Full Name"
              icon={User}
              {...registerProfile("name", { required: "Name is required" })}
              error={profileErrors.name}
            />
            
            <Input 
              label="Email Address"
              value={user?.email} // Read Only
              disabled
              className="opacity-60 cursor-not-allowed"
            />

            <Button type="submit" isLoading={isProfileSubmitting} className="mt-4">
              <Save size={18} /> Save Changes
            </Button>
          </form>
        </motion.div>
      )}

      {/* --- SECURITY TAB --- */}
      {activeTab === 'security' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="bg-orange-50/50 border-orange-100">
             <div className="flex gap-2 items-start">
                <Shield className="text-orange-500 shrink-0" size={18} />
                <p className="text-xs text-orange-800 font-medium leading-relaxed">
                  For your security, withdrawals require a Transaction PIN. Keep your credentials safe.
                </p>
             </div>
          </Card>

          <form onSubmit={handleSecuritySubmit(onUpdateSecurity)} className="space-y-5">
            
            <div className="space-y-3">
              <h3 className="text-sm font-heavy text-slate-500 uppercase">Change Password</h3>
              <Input 
                label="New Password"
                type="password"
                icon={Lock}
                placeholder="********"
                {...registerSecurity("newPassword")}
                error={securityErrors.newPassword}
              />
            </div>

            <div className="h-px bg-slate-200 w-full" />

            <div className="space-y-3">
              <h3 className="text-sm font-heavy text-slate-500 uppercase">Transaction PIN</h3>
              <Input 
                label="Set 6-Digit PIN"
                type="password"
                maxLength={6}
                icon={Key}
                placeholder="000000"
                {...registerSecurity("transactionPin")}
                error={securityErrors.transactionPin}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={isSecuritySubmitting}>
              Update Security
            </Button>
          </form>
        </motion.div>
      )}

    </PageLayout>
  );
};

export default Settings;