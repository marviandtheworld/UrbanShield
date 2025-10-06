# Admin Web Interface Documentation

## Overview
The admin verification functionality is designed for a separate web interface, not the mobile app. This document outlines the admin capabilities and database functions available for the web interface.

## Admin User Type
- **User Type**: `admin`
- **Purpose**: System administrators who verify incidents and manage the platform
- **Access**: Web interface only (not available in mobile app)
- **Permissions**: Full system access including incident verification

## Database Functions for Web Interface

### 1. Mark Incident as Verified
```sql
SELECT mark_incident_verified('incident-uuid-here');
```
- **Purpose**: Mark an incident as verified by admin
- **Access**: Admin users only
- **Returns**: Boolean indicating success

### 2. Mark Incident as Unverified
```sql
SELECT mark_incident_unverified('incident-uuid-here');
```
- **Purpose**: Remove verification from an incident
- **Access**: Admin users only
- **Returns**: Boolean indicating success

### 3. Get All Incidents for Admin Review
```sql
SELECT * FROM get_incidents_with_user_info();
```
- **Purpose**: Retrieve all incidents with user information
- **Access**: All users (but admin web interface can filter as needed)
- **Returns**: Complete incident data with user details

## Admin Web Interface Features

### Incident Management
- View all incidents (verified and unverified)
- Filter by verification status
- Search and sort incidents
- Bulk verification actions
- Incident details with full user information

### User Management
- View all user profiles
- Manage user verification status
- Assign user types
- Handle user reports and issues

### Analytics Dashboard
- Incident statistics
- User activity metrics
- Verification rates
- Geographic distribution of incidents

### System Settings
- Configure platform settings
- Manage categories and severity levels
- Set up notification preferences
- Handle system maintenance

## Mobile App User Types
The mobile app only supports these user types:
- **Parent**: Can post incidents, view community updates
- **Resident**: Can post incidents immediately, edit own reports
- **Business**: Can post in verified area, access analytics
- **Government**: Can post announcements, access live streams
- **Tourist**: Can post incidents for moderation
- **Guest**: Limited access, can view and submit reports

## Database Schema Updates
The database includes the `admin` user type in the enum but the mobile app interface excludes it. This allows for:
- Admin users to be created in the database
- Web interface to use admin functions
- Mobile app to remain focused on community users

## Security Considerations
- Admin functions are protected by RLS policies
- Only users with `user_type = 'admin'` can verify incidents
- Admin users should be created manually through database
- Web interface should implement additional authentication layers



