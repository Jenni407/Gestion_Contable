import React from 'react';
import { KeyRound, Edit3, UserCheck, UserX, Plus, Search, FileText, UserPlus, X, CheckSquare,  } from 'lucide-react';

// Iconos de acciones reutilizables 
export const PlusIcon = ({ size = 18 }) => <Plus size={size} color="currentColor" />;
export const KeyIcon = ({ size = 16, color = '#FACC15' }) => <KeyRound size={size} color={color} />;
export const EditIcon = ({ size = 16, color = '#A855F7' }) => <Edit3 size={size} color={color} />;
export const UserCheckIcon = ({ size = 16, color = '#4ADE80' }) => <UserCheck size={size} color={color} />;
export const UserXIcon = ({ size = 16, color = '#F87171' }) => <UserX size={size} color={color} />;
export const SearchIcon = ({ size = 18, color = "#94a3b8" }) => <Search size={size} color={color} />;
export const FileTextIcon = ({ size = 16, color = "currentColor" }) => <FileText size={size} color={color} />;
//iconos para formularios 
export const UserPlusIcon = ({ size = 20, color = "#1E3A8A" }) => <UserPlus size={size} color={color} />;
export const CloseIcon = ({ size = 20, color = "#64748B" }) => <X size={size} color={color} />;
export const CheckSquareIcon = ({ size = 16, color = "currentColor" }) => <CheckSquare size={size} color={color} />;

export const EyeOpenIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export const EyeClosedIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);
