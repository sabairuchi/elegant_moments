// Centralized Permission Definitions
export const PERMISSIONS = {
  // Users & Roles
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_SUSPEND: 'users.suspend',
  USERS_CHANGE_ROLE: 'users.change_role',

  // Enquiries & Consultations
  ENQUIRIES_VIEW: 'enquiries.view',
  ENQUIRIES_UPDATE: 'enquiries.update',
  CONSULTATIONS_VIEW: 'consultations.view',
  CONSULTATIONS_UPDATE: 'consultations.update',

  // Weddings & Planning
  WEDDINGS_VIEW: 'weddings.view',
  WEDDINGS_CREATE: 'weddings.create',
  WEDDINGS_UPDATE: 'weddings.update',
  WEDDINGS_DELETE: 'weddings.delete',

  // Vendors & Services
  SERVICES_VIEW: 'services.view',
  SERVICES_CREATE: 'services.create',
  SERVICES_UPDATE: 'services.update',
  SERVICES_DELETE: 'services.delete',
  
  // Venues
  VENUES_VIEW: 'venues.view',
  VENUES_CREATE: 'venues.create',
  VENUES_UPDATE: 'venues.update',
  VENUES_DELETE: 'venues.delete',

  // Proposals & Bookings
  PROPOSALS_VIEW: 'proposals.view',
  PROPOSALS_CREATE: 'proposals.create',
  PROPOSALS_UPDATE: 'proposals.update',
  PROPOSALS_DELETE: 'proposals.delete',
  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_UPDATE: 'bookings.update',
  BOOKINGS_CANCEL: 'bookings.cancel',

  // Documents & Media
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DELETE: 'documents.delete',

  // System & Logs
  NOTIFICATIONS_VIEW: 'notifications.view',
  ACTIVITY_LOGS_VIEW: 'activity_logs.view',
};

// Role to Permission Matrix
export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS), // Full access
  
  admin: [
    // Admin lacks USERS_CHANGE_ROLE and ACTIVITY_LOGS_VIEW
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.ENQUIRIES_VIEW,
    PERMISSIONS.ENQUIRIES_UPDATE,
    PERMISSIONS.CONSULTATIONS_VIEW,
    PERMISSIONS.CONSULTATIONS_UPDATE,
    PERMISSIONS.WEDDINGS_VIEW,
    PERMISSIONS.WEDDINGS_CREATE,
    PERMISSIONS.WEDDINGS_UPDATE,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_CREATE,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.SERVICES_DELETE,
    PERMISSIONS.VENUES_VIEW,
    PERMISSIONS.VENUES_CREATE,
    PERMISSIONS.VENUES_UPDATE,
    PERMISSIONS.VENUES_DELETE,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.PROPOSALS_CREATE,
    PERMISSIONS.PROPOSALS_UPDATE,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.BOOKINGS_UPDATE,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  
  planner: [
    PERMISSIONS.WEDDINGS_VIEW,
    PERMISSIONS.WEDDINGS_CREATE,
    PERMISSIONS.WEDDINGS_UPDATE,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.PROPOSALS_CREATE,
    PERMISSIONS.PROPOSALS_UPDATE,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.VENUES_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  
  vendor: [
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.SERVICES_UPDATE,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
  
  client: [
    PERMISSIONS.WEDDINGS_VIEW,
    PERMISSIONS.PROPOSALS_VIEW,
    PERMISSIONS.BOOKINGS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

/**
 * Returns a unique array of permissions for a given array of roles.
 */
export const getPermissionsForRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  const permissions = new Set();
  roles.forEach((role) => {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      rolePerms.forEach((perm) => permissions.add(perm));
    }
  });
  return Array.from(permissions);
};
