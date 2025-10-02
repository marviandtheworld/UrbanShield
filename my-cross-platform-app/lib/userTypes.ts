// User Type Configuration and Permissions
export type UserType = 'parent' | 'business' | 'government' | 'community_member' | 'admin';

export interface UserTypeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: {
    canCreateIncidents: boolean;
    canViewAllIncidents: boolean;
    canModerateIncidents: boolean;
    canAccessAnalytics: boolean;
    canManageUsers: boolean;
    canAccessLiveStream: boolean;
    canCreateAnnouncements: boolean;
    priorityLevel: number; // Higher number = higher priority
  };
  features: string[];
  dashboardTabs: string[];
}

export const USER_TYPE_CONFIGS: Record<UserType, UserTypeConfig> = {
  parent: {
    name: 'Parent',
    description: 'Concerned parent monitoring child safety',
    icon: 'people',
    color: '#3B82F6', // Blue
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: false,
      priorityLevel: 2,
    },
    features: [
      'Report safety incidents',
      'View school zone alerts',
      'Track child safety',
      'Receive notifications',
      'View community updates'
    ],
    dashboardTabs: ['Safety Alerts', 'School Zones', 'My Reports', 'Community']
  },
  
  business: {
    name: 'Business',
    description: 'Local business owner concerned about area safety',
    icon: 'business',
    color: '#10B981', // Green
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: true,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      priorityLevel: 3,
    },
    features: [
      'Report business-related incidents',
      'View area crime statistics',
      'Access business safety analytics',
      'Create community announcements',
      'Monitor business district safety'
    ],
    dashboardTabs: ['Business Safety', 'Area Statistics', 'My Reports', 'Announcements']
  },
  
  government: {
    name: 'Government',
    description: 'Government official managing public safety',
    icon: 'shield',
    color: '#8B5CF6', // Purple
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: true,
      canAccessAnalytics: true,
      canManageUsers: true,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      priorityLevel: 5,
    },
    features: [
      'Full incident management',
      'Access to all analytics',
      'Moderate community content',
      'Create official announcements',
      'Manage user accounts',
      'Access emergency protocols'
    ],
    dashboardTabs: ['Incident Management', 'Analytics', 'User Management', 'Emergency Center']
  },
  
  community_member: {
    name: 'Community Member',
    description: 'General community member reporting local issues',
    icon: 'person',
    color: '#6B7280', // Gray
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: false,
      priorityLevel: 1,
    },
    features: [
      'Report community incidents',
      'View local safety updates',
      'Participate in community discussions',
      'Receive area notifications'
    ],
    dashboardTabs: ['Community', 'My Reports', 'Safety Updates', 'Discussions']
  },
  
  admin: {
    name: 'Administrator',
    description: 'System administrator with full access',
    icon: 'settings',
    color: '#EF4444', // Red
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: true,
      canAccessAnalytics: true,
      canManageUsers: true,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      priorityLevel: 10,
    },
    features: [
      'Full system access',
      'Manage all users and content',
      'Access system analytics',
      'Configure system settings',
      'Emergency override capabilities'
    ],
    dashboardTabs: ['System Overview', 'User Management', 'Analytics', 'Settings']
  }
};

export const getUserTypeConfig = (userType: UserType): UserTypeConfig => {
  return USER_TYPE_CONFIGS[userType] || USER_TYPE_CONFIGS.community_member;
};

export const getUserTypeColor = (userType: UserType): string => {
  return getUserTypeConfig(userType).color;
};

export const getUserTypeIcon = (userType: UserType): string => {
  return getUserTypeConfig(userType).icon;
};

export const hasPermission = (userType: UserType, permission: keyof UserTypeConfig['permissions']): boolean => {
  return getUserTypeConfig(userType).permissions[permission];
};

