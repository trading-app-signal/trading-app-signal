
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, ChevronLeft } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER') => {
    setSelectedRole(role);
    setPassword('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for effect
    setTimeout(() => {
      if (password === '123456') {
        onLogin({
          id: selectedRole === 'TEACHER' ? 'u_teacher' : 'u_student',
          name: selectedRole === 'TEACHER' ? 'Alex (Mentor)' : 'New Student',
          role: selectedRole!
        });
      } else {
        setError('Incorrect Access Code');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-700">
           <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-accent to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <ShieldCheck size={32} className="text-white" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">Orbit Signals</h1>
           <p className="text-gray-400 text-sm tracking-widest uppercase">Premium Access Terminal</p>
        </div>

        {/* Step 1: Role Selection */}
        {!selectedRole ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
             <p className="text-center text-gray-500 text-xs mb-6 font-medium">SELECT YOUR DESTINATION</p>
             
             <button 
               onClick={() => handleRoleSelect('TEACHER')}
               className="w-full group relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-transparent via-white/5 to-transparent hover:via-white/10 transition-all duration-300"
             >
               <div className="bg-[#121217] backdrop-blur-xl border border-white/10 p-6 rounded-[20px] flex items-center justify-between group-hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck size={24} />
                     </div>
                     <div className="text-left">
                        <h3 className="font-bold text-lg text-white">Mentor Access</h3>
                        <p className="text-xs text-gray-500">Publish signals & manage community</p>
                     </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
               </div>
             </button>

             <button 
               onClick={() => handleRoleSelect('STUDENT')}
               className="w-full group relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-transparent via-white/5 to-transparent hover:via-white/10 transition-all duration-300"
             >
               <div className="bg-[#121217] backdrop-blur-xl border border-white/10 p-6 rounded-[20px] flex items-center justify-between group-hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap size={24} />
                     </div>
                     <div className="text-left">
                        <h3 className="font-bold text-lg text-white">Student Access</h3>
                        <p className="text-xs text-gray-500">View signals & track performance</p>
                     </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
               </div>
             </button>
          </div>
        ) : (
          /* Step 2: Password Input */
          <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-right-10 duration-300">
             <button 
               onClick={() => setSelectedRole(null)}
               className="flex items-center gap-1 text-xs text-gray-500 hover:text-white mb-6 transition-colors"
             >
               <ChevronLeft size={14} /> Back
             </button>

             <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">
                  {selectedRole === 'TEACHER' ? 'Mentor Login' : 'Student Login'}
                </h2>
                <p className="text-xs text-gray-400">Enter your secure access code to continue.</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                   <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-accent focus:bg-white/10 transition-all font-mono tracking-widest text-center"
                     placeholder="••••••"
                     autoFocus
                     maxLength={6}
                   />
                </div>

                {error && (
                  <div className="text-brand-danger text-xs text-center font-medium animate-pulse">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading || password.length < 1}
                  className="w-full bg-brand-accent hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>Unlock Terminal <ArrowRight size={18} /></>
                  )}
                </button>
             </form>
          </div>
        )}

        <p className="text-center text-[10px] text-gray-600 mt-8">
          Secure Connection • v3.0.1
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
