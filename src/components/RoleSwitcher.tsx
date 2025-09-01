import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Wrench, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserType } from '@/types';

const RoleSwitcher = () => {
  const { user, availableRoles, switchRole, addRole } = useAuth();
  const navigate = useNavigate();

  if (!user || availableRoles.length <= 1) {
    return null;
  }

  const handleRoleSwitch = async (newRole: UserType) => {
    if (newRole === user.type) return;
    
    await switchRole(newRole);
    
    // Navigate to appropriate home page
    if (newRole === 'client') {
      navigate('/client/home');
    } else if (newRole === 'technician') {
      navigate('/technician/home');
    }
  };

  const handleAddRole = async (newRole: UserType) => {
    await addRole(newRole);
    
    // After adding role, switch to it
    setTimeout(() => {
      handleRoleSwitch(newRole);
    }, 500);
  };

  const getRoleIcon = (role: UserType) => {
    return role === 'client' ? <User className="w-4 h-4" /> : <Wrench className="w-4 h-4" />;
  };

  const getRoleLabel = (role: UserType) => {
    return role === 'client' ? 'Client' : 'Technician';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {getRoleIcon(user.type)}
          <span>Switch Role</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Available Roles
        </div>
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleSwitch(role)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {getRoleIcon(role)}
              <span>{getRoleLabel(role)}</span>
            </div>
            {role === user.type && (
              <Badge variant="secondary" className="text-xs">
                Current
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
        {!availableRoles.includes('client') && (
          <DropdownMenuItem
            onClick={() => handleAddRole('client')}
            className="flex items-center gap-2"
          >
            {getRoleIcon('client')}
            <span>Add Client Role</span>
          </DropdownMenuItem>
        )}
        {!availableRoles.includes('technician') && (
          <DropdownMenuItem
            onClick={() => handleAddRole('technician')}
            className="flex items-center gap-2"
          >
            {getRoleIcon('technician')}
            <span>Add Technician Role</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleSwitcher;