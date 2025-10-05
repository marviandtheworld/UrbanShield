// User Type Configuration and Permissions
// Mobile app user types (admin excluded - they use web interface)
export type UserType = 'parent' | 'resident' | 'business' | 'government' | 'tourist' | 'guest';

// All user types including admin (for database)
export type AllUserType = 'parent' | 'resident' | 'business' | 'government' | 'tourist' | 'guest' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type PostingPrivilege = 'moderated' | 'immediate' | 'restricted' | 'admin';

export interface UserTypeConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  verificationRequired: boolean;
  postingPrivilege: PostingPrivilege;
  permissions: {
    canCreateIncidents: boolean;
    canViewAllIncidents: boolean;
    canModerateIncidents: boolean;
    canAccessAnalytics: boolean;
    canManageUsers: boolean;
    canAccessLiveStream: boolean;
    canCreateAnnouncements: boolean;
    canEditOwnReports: boolean;
    canMarkResolved: boolean;
    canVoteFlag: boolean;
    canAttachExternalDocs: boolean;
    priorityLevel: number; // Higher number = higher priority
  };
  features: string[];
  dashboardTabs: string[];
  verificationRequirements: string[];
}

export const USER_TYPE_CONFIGS: Record<UserType, UserTypeConfig> = {
  parent: {
    name: 'Parent',
    description: 'Concerned parent monitoring child safety',
    icon: 'people',
    color: '#3B82F6', // Blue
    verificationRequired: true,
    postingPrivilege: 'moderated',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: false,
      canEditOwnReports: false,
      canMarkResolved: false,
      canVoteFlag: false,
      canAttachExternalDocs: false,
      priorityLevel: 2,
    },
    features: [
      'Report safety incidents',
      'View school zone alerts',
      'Track child safety',
      'Receive notifications',
      'View community updates'
    ],
    dashboardTabs: ['Safety Alerts', 'School Zones', 'My Reports', 'Community'],
    verificationRequirements: [
      'Location verification required',
      'Neighbors verification needed'
    ]
  },

  resident: {
    name: 'Verified Resident',
    description: 'Local resident with verified address',
    icon: 'home',
    color: '#10B981', // Green
    verificationRequired: true,
    postingPrivilege: 'immediate',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: false,
      canEditOwnReports: true,
      canMarkResolved: true,
      canVoteFlag: true,
      canAttachExternalDocs: false,
      priorityLevel: 3,
    },
    features: [
      'Posts go live immediately',
      'Edit own reports',
      'Mark incidents resolved',
      'Vote and flag posts',
      'Priority in community'
    ],
    dashboardTabs: ['Community', 'My Reports', 'Resolved Issues', 'Voting'],
    verificationRequirements: [
      'Local address verification',
      'Neighbors verification'
    ]
  },
  
  business: {
    name: 'Business Owner',
    description: 'Local business owner with verified permits',
    icon: 'business',
    color: '#F59E0B', // Orange
    verificationRequired: true,
    postingPrivilege: 'restricted',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: true,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      canEditOwnReports: true,
      canMarkResolved: false,
      canVoteFlag: true,
      canAttachExternalDocs: false,
      priorityLevel: 4,
    },
    features: [
      'Post hazards in verified area only',
      'Posts may be prioritized',
      'Cannot post outside verified zone',
      'Access business analytics',
      'Create area announcements'
    ],
    dashboardTabs: ['Business Safety', 'Area Statistics', 'My Reports', 'Announcements'],
    verificationRequirements: [
      'DTI permit required',
      'BIR permit required',
      'Business license verification'
    ]
  },
  
  government: {
    name: 'Government Official',
    description: 'Verified government official with official credentials',
    icon: 'shield',
    color: '#8B5CF6', // Purple
    verificationRequired: true,
    postingPrivilege: 'immediate',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: true,
      canAccessAnalytics: true,
      canManageUsers: true,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      canEditOwnReports: true,
      canMarkResolved: true,
      canVoteFlag: true,
      canAttachExternalDocs: true,
      priorityLevel: 5,
    },
    features: [
      'Posts go live immediately',
      'Can attach external documents',
      'Posts may be prioritized',
      'Full incident management',
      'Access to all analytics',
      'Create official announcements'
    ],
    dashboardTabs: ['Incident Management', 'Analytics', 'Official Updates', 'Emergency Center'],
    verificationRequirements: [
      'Official ID verification (barangay captain/secretary)',
      'OR .gov.ph email domain',
      'Manual approval via admin dashboard'
    ]
  },

  tourist: {
    name: 'Tourist',
    description: 'Visitor to the area',
    icon: 'airplane',
    color: '#06B6D4', // Cyan
    verificationRequired: false,
    postingPrivilege: 'moderated',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: true,
      canCreateAnnouncements: false,
      canEditOwnReports: false,
      canMarkResolved: false,
      canVoteFlag: false,
      canAttachExternalDocs: false,
      priorityLevel: 1,
    },
    features: [
      'Report incidents for moderation',
      'View local safety information',
      'Access tourist safety tips',
      'Receive area notifications'
    ],
    dashboardTabs: ['Safety Info', 'My Reports', 'Tourist Tips', 'Area Alerts'],
    verificationRequirements: [
      'Email verification only'
    ]
  },

  guest: {
    name: 'Guest',
    description: 'Anonymous visitor with limited access',
    icon: 'person-outline',
    color: '#6B7280', // Gray
    verificationRequired: false,
    postingPrivilege: 'moderated',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: false,
      canAccessAnalytics: false,
      canManageUsers: false,
      canAccessLiveStream: false,
      canCreateAnnouncements: false,
      canEditOwnReports: false,
      canMarkResolved: false,
      canVoteFlag: false,
      canAttachExternalDocs: false,
      priorityLevel: 0,
    },
    features: [
      'View map only',
      'Submit posts for moderation',
      'Cannot comment or vote',
      'Limited access to features'
    ],
    dashboardTabs: ['Map View', 'Submit Report'],
    verificationRequirements: [
      'No verification required'
    ]
  },

  // Admin user type (for database/web interface only)
  admin: {
    name: 'System Administrator',
    description: 'System administrator with full verification and management capabilities',
    icon: 'shield',
    color: '#DC2626', // Red
    verificationRequired: true,
    postingPrivilege: 'admin',
    permissions: {
      canCreateIncidents: true,
      canViewAllIncidents: true,
      canModerateIncidents: true,
      canAccessAnalytics: true,
      canManageUsers: true,
      canAccessLiveStream: true,
      canCreateAnnouncements: true,
      canEditOwnReports: true,
      canMarkResolved: true,
      canVoteFlag: true,
      canAttachExternalDocs: true,
      priorityLevel: 10, // Highest priority
    },
    features: [
      'Verify all incidents',
      'Full system management',
      'User management',
      'Analytics access',
      'Content moderation'
    ],
    dashboardTabs: ['Incident Management', 'User Management', 'Analytics', 'System Settings'],
    verificationRequirements: [
      'Manual admin approval required',
      'System administrator credentials'
    ]
  },
  
};

export const getUserTypeConfig = (userType: UserType): UserTypeConfig => {
  return USER_TYPE_CONFIGS[userType] || USER_TYPE_CONFIGS.guest;
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

export const getPostingPrivilege = (userType: UserType): PostingPrivilege => {
  return getUserTypeConfig(userType).postingPrivilege;
};

export const requiresVerification = (userType: UserType): boolean => {
  return getUserTypeConfig(userType).verificationRequired;
};

export const getVerificationRequirements = (userType: UserType): string[] => {
  return getUserTypeConfig(userType).verificationRequirements;
};

export const canPostImmediately = (userType: UserType): boolean => {
  return getPostingPrivilege(userType) === 'immediate';
};

export const canPostWithModeration = (userType: UserType): boolean => {
  return getPostingPrivilege(userType) === 'moderated';
};

export const canPostInRestrictedArea = (userType: UserType): boolean => {
  return getPostingPrivilege(userType) === 'restricted';
};

