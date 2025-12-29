# IAM Branch - Feature Documentation

> **Branch:** `iam`  
> **Base Branch:** `main`  
> **Last Updated:** December 23, 2025  
> **Total Changes:** 2,504 additions, 2,872 deletions across 34 files

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Major Features](#major-features)
3. [Authentication Enhancements](#authentication-enhancements)
4. [IAM Module Improvements](#iam-module-improvements)
5. [UI/UX Components](#uiux-components)
6. [Bug Fixes](#bug-fixes)
7. [Code Cleanup](#code-cleanup)
8. [Technical Details](#technical-details)
9. [Testing Guide](#testing-guide)
10. [Migration Guide](#migration-guide)

---

## 🎯 Overview

This branch introduces comprehensive authentication and authorization improvements for the Krutrim Cloud platform, focusing on:

- **Dual User Type Authentication** - Root User vs IAM User login flows
- **IAM User Password Reset** - Forced password reset on first login
- **Simplified Sign-Up** - Streamlined registration process
- **Enhanced IAM Module** - Improved policies, roles, and user management
- **UI/UX Improvements** - Better tooltips, multi-select fixes, responsive design

### Key Statistics

```
Files Changed:    34 files
Additions:        2,504 lines
Deletions:        2,872 lines
Net Change:       -368 lines (cleaner codebase)
Commits:          20 commits ahead of main
```

---

## 🚀 Major Features

### 1. New Sign-In Flow with User Type Selection

**Component:** `components/auth/new-user-signin.tsx` (388 lines)

A completely redesigned sign-in experience featuring:

#### Features:
- ✅ **User Type Toggle** - Switch between Root User and IAM User
- ✅ **Conditional Fields** - Organisation ID shown only for IAM users
- ✅ **Info Tooltips** - Contextual help for both user types
- ✅ **Modern Layout** - 40-60 split (image left, form right)
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Brand Integration** - Krutrim Cloud imagery

#### User Types:

**Root User**
- For users who created the organisation
- Direct login without Organisation ID
- Full administrative access
- Tooltip: "Choose this if you have created the organisation"

**IAM User**
- For users invited to the organisation
- Requires Organisation ID for login
- Restricted access based on permissions
- Tooltip: "Choose this if you were invited to the organisation"
- Additional tooltip for Org ID: "This identifies which organization you are signing into. Enter the Org ID shared with you when you were invited."

#### Technical Implementation:

```typescript
// User type state management
const [userType, setUserType] = useState<'root' | 'iam'>('root');

// Conditional Organisation ID field
{userType === 'iam' && (
  <Input
    id='organisationId'
    placeholder='Enter your organisation ID'
  />
)}
```

#### Key Commits:
- `7c65fa4` - feat: add info icons to login form tabs and Organisation ID field
- `c7980c7` - Add user type toggle (Root User / IAM User) to signin form
- `b3287c0` - Add Organisation ID field for IAM users
- `09346be` - Create new simplified sign-in screen with 40-60 layout

---

### 2. IAM User Reset Password Flow

**Component:** `components/auth/reset-password-iam.tsx` (329 lines)  
**Route:** `/auth/reset-password-iam`

Complete password reset workflow for first-time IAM user authentication.

#### Features:
- ✅ **Password Strength Validation** - Real-time strength indicator
- ✅ **Requirements Checklist** - Visual checklist for password criteria
- ✅ **Confirm Password** - Matching validation
- ✅ **Password Visibility Toggle** - Eye icon to show/hide password
- ✅ **Session Management** - Secure temporary session handling
- ✅ **Auto-Redirect** - Automatic navigation to dashboard after reset

#### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

#### Visual Feedback:

```typescript
// Real-time password strength indicator
const [passwordStrength, setPasswordStrength] = useState(0);

// Requirements checklist with visual checks
✓ At least 8 characters
✓ One uppercase letter
✓ One lowercase letter
✓ One number
✓ One special character
```

#### User Flow:
1. IAM user logs in with credentials
2. System detects first-time login
3. Redirected to reset password page
4. Creates new secure password
5. Confirms password
6. Automatically redirected to dashboard

#### Key Commit:
- `2d7047c` - feat: Add IAM user reset password flow and update UI components

---

### 3. Simplified Sign-Up Flow

**Component:** `components/auth/multi-step-signup.tsx` (73 changes)  
**Component:** `components/auth/sign-up-form.tsx` (33 changes)

Streamlined registration process by removing unnecessary steps.

#### Changes:

**Removed Steps:**
- ❌ **Account Type Selection** - Auto-determined based on context
- ❌ **Address Information** - Moved to profile settings

**Added Fields:**
- ✅ **Organisation Name** - Captured during initial registration

#### Benefits:
- ⚡ **Faster Registration** - 2 fewer steps = higher conversion
- 🎯 **Focused Data Collection** - Only essential information upfront
- 📊 **Better UX** - Reduced friction in onboarding
- 🔄 **Flexible Profile** - Address added later when needed

#### Old Flow:
```
1. Basic Info
2. Account Type Selection ❌
3. Address Information ❌
4. Identity Verification
5. Payment Setup
```

#### New Flow:
```
1. Basic Info + Organisation Name
2. Identity Verification
3. Payment Setup
```

#### Key Commits:
- `40c9eb0` - Simplify signup flow: Remove Account Type and Address steps
- `2ad8b3b` - Add organisation name field to signup form

---

## 🔐 Authentication Enhancements

### Enhanced Sign-In Experience

#### Layout Redesign:
- **40-60 Split Layout** - Image (40%) left, Form (60%) right
- **Brand Imagery** - Professional Krutrim Cloud visual
- **Responsive** - Mobile, tablet, and desktop optimized
- **Left-Aligned Content** - Better readability and modern feel

#### Visual Assets:
- `public/register-krutrim-cloud.png` - Brand image for auth pages
- Gradient background for image section (green-50 to green-100)
- Modern card-based form design

#### Form Improvements:
- Clear label hierarchy
- Inline validation messages
- Password visibility toggle
- "Forgot password?" link prominently displayed
- "Sign Up" and "Support" links in footer

#### Key Commits:
- `f40a540` - Swap layout: Move image to left (40%) and form to right (60%)
- `54362d6` - Update image to cover with right alignment
- `3aaa29c` - Update image to use cover mode with center alignment
- `ebeec3e` - Change form content alignment from center to left
- `f9b4a89` - Update footer links styling and alignment
- `662c1ee` - Update signin page with 'New Sign In' button and register image

---

## 👥 IAM Module Improvements

### 1. Policies Management

**Files Modified:**
- `app/iam/policies/page.tsx` (24 changes)
- `components/modals/edit-policy-modal.tsx` (422 changes)

#### Features Added:
- ✅ **Edit Action** on policies list page
- ✅ **Improved Policy Editor** with better UI
- ✅ **JSON Validation** for policy documents
- ✅ **Multi-Select Improvements** for permissions
- ✅ **Quick Edit** functionality from list view

#### Key Commit:
- `25cf11a` - feat(iam): add edit action to policies list page

---

### 2. Roles Management

**Files Modified:**
- `app/iam/roles/[roleId]/page.tsx` (58 changes)
- `app/iam/roles/page.tsx` (18 changes)

#### Features Added:
- ✅ **Role Types Support** - Different role categories
- ✅ **Enhanced Role Detail Pages** - More information displayed
- ✅ **Improved Role Listing** - Better filters and search

#### Key Commit:
- `9698d7d` - added role types in roles

---

### 3. Groups & Users

**Files Modified:**
- `components/modals/create-group-modal.tsx` (7 changes)
- `components/modals/invite-user-modal.tsx` (76 changes)
- `app/iam/users/page.tsx` (4 changes)

#### Improvements:
- Better group creation flow
- Enhanced user invitation process
- Improved user listing with filters
- Empty state illustrations

---

## 🎨 UI/UX Components

### 1. Enhanced Switch Component

**Component:** `components/ui/switch.tsx` (135 changes)

Complete redesign to support radio-style toggles.

#### Features:
- ✅ **Radio-Style Toggle** - For user type selection
- ✅ **Custom Styling** - Branded colors and animations
- ✅ **Accessibility** - Proper ARIA labels and keyboard navigation
- ✅ **Smooth Animations** - Hover states and transitions
- ✅ **Flexible API** - Reusable for other toggle scenarios

#### Usage Example:
```typescript
<Switch 
  name="userType" 
  size="medium"
  value={userType}
  onValueChange={(value) => setUserType(value as 'root' | 'iam')}
>
  <Switch.Control label="Root User" value="root" />
  <Switch.Control label="IAM User" value="iam" />
</Switch>
```

---

### 2. Searchable Select Component

**Component:** `components/ui/searchable-select.tsx` (90 changes)

Fixed multiple critical bugs and improved functionality.

#### Bugs Fixed:
- ✅ **Checkboxes Display** - Now visible for multi-select
- ✅ **Search Filtering** - Properly filters options
- ✅ **Dropdown Behavior** - Stays open during multiple selections
- ✅ **Selection State** - Correctly manages selected items
- ✅ **Clear Functionality** - Works properly

#### Key Commits:
- `97183b1` - fix(iam): fix SearchableMultiSelect to show checkboxes and fix search filtering
- `7f4110a` - fix(iam): keep multi-select dropdown open when selecting items
- `4026ff5` - fix(iam): fix multi-select dropdown staying open on item selection

---

### 3. Data Table Component

**Component:** `components/ui/shadcn-data-table.tsx` (23 changes)

#### Improvements:
- Better sorting functionality
- Improved filter behavior
- Enhanced selection state management
- Better empty state handling

---

### 4. Navigation Updates

**Component:** `components/navigation/top-header.tsx` (30 changes)

#### Changes:
- Improved user profile dropdown
- Better menu organization
- Enhanced mobile navigation
- Updated styling and alignment

---

## 🐛 Bug Fixes

### Multi-Select Dropdown Issues

**Problem:** Multi-select dropdowns were closing after each selection, making it difficult to select multiple items.

**Solution:** Updated the component to keep dropdown open during selection and added proper state management.

**Files Fixed:**
- `components/ui/searchable-select.tsx`
- `components/modals/edit-policy-modal.tsx`

**Impact:** Better UX for attaching multiple policies, roles, or permissions.

---

### Checkbox Visibility Issues

**Problem:** Checkboxes weren't displaying in multi-select dropdowns.

**Solution:** Fixed CSS and component structure to properly render checkboxes.

**Result:** Users can now see visual feedback for selected items.

---

### Search Filtering Issues

**Problem:** Search functionality wasn't filtering options correctly.

**Solution:** Fixed the filter logic to properly match search terms.

**Impact:** Users can now quickly find options in large lists.

---

## 🧹 Code Cleanup

### Removed Unused Components

**Load Balancer Listener Components:**
- ❌ `components/load-balancing/balancer/create/components/listener-view-edit-modal.tsx` (648 lines)
- ❌ `components/load-balancing/balancer/create/components/listeners-table.tsx` (137 lines)

**Reason:** Moved to separate feature branch for better organization.

---

### Removed Documentation

**Files Removed:**
- ❌ `docs/FORM_DATA_PERSISTENCE.md` (292 lines)
- ❌ `docs/LISTENER_DATA_FLOW.md` (275 lines)

**Reason:** Documentation for listener features moved with the code.

---

### Simplified Load Balancer Forms

**Files Modified:**
- `app/load-balancing/balancer/create/components/alb-create-form.tsx` (419 deletions)
- `app/load-balancing/balancer/create/components/nlb-create-form.tsx` (419 deletions)

**Result:** Cleaner forms without listener-specific code.

---

## 🔧 Technical Details

### New Routes

#### `/auth/new-signin`
- Modern sign-in page with user type selection
- Dual user authentication flow
- Organisation ID field for IAM users

#### `/auth/reset-password-iam`
- Password reset page for IAM users
- Password strength validation
- Requirements checklist

### New Components

1. **NewUserSignIn** (`components/auth/new-user-signin.tsx`)
   - 388 lines
   - User type toggle functionality
   - Form validation and error handling
   - Responsive layout

2. **ResetPasswordIAM** (`components/auth/reset-password-iam.tsx`)
   - 329 lines
   - Password strength validation
   - Real-time requirements checking
   - Session management

### Updated Components

1. **Switch** (`components/ui/switch.tsx`)
   - 135 line changes
   - Radio-style toggle support
   - Custom styling options

2. **SearchableSelect** (`components/ui/searchable-select.tsx`)
   - 90 line changes
   - Bug fixes for multi-select
   - Improved search functionality

3. **EditPolicyModal** (`components/modals/edit-policy-modal.tsx`)
   - 422 line changes
   - Better policy editor
   - Enhanced multi-select

### New Assets

- `public/register-krutrim-cloud.png` (18KB) - Brand image for auth pages
- `public/empty-state-group.svg` (119 lines) - Empty state illustration

### Data Updates

- `lib/iam-data.ts` - 6 new entries
- `lib/data.ts` - 46 changes

### Dependencies

**Package Updates:**
- `package.json` - 4 changes
- `package-lock.json` - 1,232 changes

### Configuration

- `postcss.config.mjs` - Reverted to .mjs format (8 lines)

---

## 🧪 Testing Guide

### Authentication Testing

#### Root User Login Flow
1. Navigate to `/auth/new-signin`
2. Verify "Root User" tab is selected by default
3. Hover over info icon to see tooltip
4. Enter email: `root@example.com`
5. Enter password: `Password123!`
6. Click "Sign In"
7. Verify redirect to dashboard
8. ✅ No password reset required

#### IAM User Login Flow
1. Navigate to `/auth/new-signin`
2. Click "IAM User" tab
3. Hover over info icon to see tooltip
4. Verify Organisation ID field appears
5. Hover over Org ID info icon to see tooltip
6. Enter Organisation ID: `ORG-12345`
7. Enter email: `iam.user@example.com`
8. Enter password: `TempPass123!`
9. Click "Sign In"
10. Verify redirect to `/auth/reset-password-iam`
11. ✅ Password reset flow initiated

#### Password Reset Flow
1. On reset password page
2. Enter new password: `NewSecure123!`
3. Watch requirements checklist update
4. Verify all requirements are met (green checks)
5. Enter confirm password: `NewSecure123!`
6. Click "Reset Password"
7. Verify redirect to dashboard
8. ✅ Successfully authenticated

### Sign-Up Testing

#### Simplified Registration
1. Navigate to `/auth/signup`
2. Fill in basic information
3. Enter organisation name
4. Verify NO account type selection step
5. Verify NO address information step
6. Complete identity verification
7. Complete payment setup
8. ✅ Account created successfully

### IAM Module Testing

#### Multi-Select Testing
1. Navigate to policies page
2. Click "Edit" on any policy
3. Open permissions multi-select
4. Type search term
5. Verify filtered results
6. Select multiple items
7. Verify dropdown stays open
8. Verify checkboxes are visible
9. ✅ All selections saved

#### Policy Edit Testing
1. Navigate to `/iam/policies`
2. Click edit icon on any policy
3. Verify modal opens
4. Modify policy details
5. Test JSON editor
6. Save changes
7. ✅ Changes persisted

#### Role Types Testing
1. Navigate to `/iam/roles`
2. Verify role types display correctly
3. Click on role to view details
4. Verify role type information
5. ✅ Role types working

### UI/UX Testing

#### Responsive Design
1. Test on mobile (375px width)
2. Test on tablet (768px width)
3. Test on desktop (1920px width)
4. Verify layout adapts properly
5. ✅ Responsive across all breakpoints

#### Info Tooltips
1. Hover over Root User info icon
2. Verify tooltip: "Choose this if you have created the organisation"
3. Hover over IAM User info icon
4. Verify tooltip: "Choose this if you were invited to the organisation"
5. Hover over Org ID info icon
6. Verify long tooltip displays correctly
7. ✅ All tooltips working

#### Tab Switching
1. Click Root User tab
2. Verify Org ID field hidden
3. Verify info icon appears
4. Click IAM User tab
5. Verify Org ID field appears
6. Verify info icon appears
7. Verify tab text remains centered
8. ✅ Tab switching smooth

---

## 📝 Migration Guide

### For Developers

#### New Environment Variables
None required - all changes use existing configuration.

#### Database Changes
None - prototype mode uses mock data.

#### API Changes
None - frontend-only changes.

### For Users

#### Root Users (Organization Creators)
- **No action required** - Login flow remains the same
- Use "Root User" tab on new sign-in page
- Direct access to dashboard after login

#### IAM Users (Invited Users)
- **Action required on first login:**
  1. Use "IAM User" tab on sign-in page
  2. Enter Organisation ID (provided in invitation)
  3. Complete password reset flow
  4. New password must meet security requirements

#### New Users (Registration)
- **Faster registration:**
  - No account type selection needed
  - No address information required upfront
  - Add address later in profile settings

### Deployment Steps

1. **Merge to main branch**
   ```bash
   git checkout main
   git merge iam
   ```

2. **Build and test**
   ```bash
   npm install
   npm run build
   npm run dev
   ```

3. **Verify routes**
   - `/auth/new-signin` - New sign-in page
   - `/auth/reset-password-iam` - Password reset page

4. **Deploy to Vercel**
   - Automatic deployment on push to main
   - Verify production build succeeds

---

## 📊 Impact Analysis

### User Experience
- ✅ **Faster Onboarding** - 2 fewer steps in registration
- ✅ **Clearer Authentication** - Separate flows for Root/IAM users
- ✅ **Better Guidance** - Tooltips explain user types and fields
- ✅ **Improved Security** - Forced password reset for IAM users
- ✅ **Mobile-Friendly** - Responsive design for all devices

### Developer Experience
- ✅ **Cleaner Codebase** - 368 net line reduction
- ✅ **Better Components** - Reusable Switch and SearchableSelect
- ✅ **Fixed Bugs** - Multi-select and search filtering working
- ✅ **Better Organization** - Listener features separated

### Business Impact
- 🚀 **Higher Conversion** - Simplified sign-up reduces drop-off
- 🔐 **Better Security** - Strong password requirements for IAM users
- 💡 **Reduced Support** - Tooltips reduce confusion
- 📈 **Better Analytics** - Clear user type identification
- 🎯 **Feature Complete** - IAM module fully functional

---

## 🎯 Future Enhancements

### Short Term
- [ ] Add social login (Google, GitHub) for IAM users
- [ ] Email verification for new registrations
- [ ] Two-factor authentication (2FA) option
- [ ] Password recovery via email
- [ ] Remember me functionality

### Medium Term
- [ ] SSO integration for enterprise customers
- [ ] LDAP/Active Directory integration
- [ ] Session management dashboard
- [ ] Login activity logs
- [ ] Device management

### Long Term
- [ ] Biometric authentication
- [ ] Hardware token support
- [ ] Advanced threat detection
- [ ] Automated security audits
- [ ] Compliance reporting

---

## 📚 Related Documentation

### Internal Documentation
- IAM Module Overview
- Authentication Flow Diagrams
- Password Security Guidelines
- User Management Best Practices

### External Resources
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🤝 Contributors

- **Branch Created By:** Development Team
- **Primary Contributors:** Frontend Team
- **Reviewers:** Security Team, UX Team
- **Testers:** QA Team

---

## 📞 Support

For questions or issues related to this branch:
- Create an issue in the repository
- Contact the development team
- Review the testing guide above
- Check related documentation

---

## ✅ Checklist for Merge

- [x] All tests passing
- [x] Code reviewed by team
- [x] Documentation updated
- [x] No linter errors
- [x] Responsive design verified
- [x] Security review completed
- [x] Performance tested
- [x] Accessibility checked
- [ ] Product owner approval
- [ ] Ready for production

---

**Last Updated:** December 23, 2025  
**Branch Status:** Ready for Review  
**Next Steps:** Merge to main after approval

