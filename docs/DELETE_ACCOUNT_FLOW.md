# Delete Account Flow Implementation

## Overview
Comprehensive delete account functionality implemented in the Profile Completion Dashboard (`/dashboard/profile-completion`) following the provided flowchart requirements.

## Implementation Location
- **Page**: `/dashboard/profile-completion`
- **Component**: `components/auth/profile-completion-dashboard.tsx`
- **Delete Account Link**: Located at the bottom of the profile completion form

## User Scenarios

### **Scenario 1: New Users (Individual Account) - Negative Credits**
- **Account Type**: `'individual'`
- **Credit Balance**: `-₹500` (negative)
- **Flow**:
  1. Click "Delete Account" link at bottom of form
  2. Modal opens showing:
     - Current credit balance: `-₹500` (in red with warning icon)
     - Warning: "Outstanding Dues Must Be Cleared"
     - Message: "Kindly clear your existing dues of INR 500 before proceeding with account deletion"
     - **"Pay Dues" button** (primary action)
     - "Cancel" button
  3. Click "Pay Dues" → Opens **Add Credits Modal**
  4. After payment, shows success toast
  5. User can retry deletion (in real implementation, would check updated balance)

### **Scenario 2: Existing Users (Organization Account) - Positive Credits**
- **Account Type**: `'organization'`
- **Credit Balance**: `₹1,250` (positive)
- **Multi-Step Flow**:

#### **Step 1: Initial Credit Warning**
- Shows current balance: `₹1,250` (in green)
- Yellow warning box: "Credit Balance Will Be Lost"
- Message: "Any existing credits in your account (₹1,250) will be lost upon deletion as per our policy. Do you wish to continue?"
- Buttons: Cancel | Continue

#### **Step 2: Active Resources Review**
- Lists all active resources with icons:
  - 🖥️ **2 Virtual Machines**
    - vm-prod-01
    - vm-dev-02
  - 💾 **3 Block Storage Volumes**
    - 150GB total
  - 📷 **1 Snapshot**
    - snapshot-backup-20231110
  - 🌐 **1 VPC with Subnets**
    - vpc-main (2 subnets)
- **Data Loss Warning Box (Red)**:
  > "We recommend you to delete all running instances and associated storage blocks to avoid loss of data. Once you opt for account deletion, all running instances will be lost and you will be unable to recover any data from within your Krutrim Cloud account."
- Buttons: Back | Continue

#### **Step 3: Final Confirmation**
- Large warning icon (centered)
- Critical warning message:
  > "All existing credits in your account will be lost and services including storage and computation will be terminated within the next 48 hours. Are you sure you want to go ahead with permanent deletion?"
- Support contact box (blue): Link to `support@olakrutrim.com`
- **Type "DELETE" to confirm** (input field, monospaced font)
- Delete Account button disabled until exact text "DELETE" is typed
- Buttons: Back | Delete Account (disabled until confirmation)

#### **Step 4: Success & Grace Period**
- Green success box with checkmark icon
- Success message: "Deletion Initiated Successfully"
- **Toast notification**: "Deletion Initiation Email Sent - We have sent a confirmation email to your registered email address."
- **48-Hour Grace Period Information Box (Blue)**:
  > "We retain your data for 48 hours after the deletion request. If you wish to recover your account, kindly email support@olakrutrim.com with your registered email-id within the first 48 hours. Post this, no recovery is possible."
- Note: "If no reactivation is requested within 48 hours, a final deletion confirmation email will be sent."
- Buttons: **Cancel Deletion** | Close

#### **Cancel Deletion Feature**
- Available in success step (Step 4)
- When clicked:
  - Shows loading state (1 second)
  - Displays toast: "Account Deletion Cancelled - Your account deletion request has been cancelled successfully."
  - Closes the modal
  - Resets all deletion state

## Technical Implementation

### New Imports Added
```typescript
import { AlertTriangle, Server, HardDrive, Camera, Network } from 'lucide-react';
import { AddCreditsModal } from '@/components/modals/add-credits-modal';
```

### State Management
```typescript
// Multi-step delete account flow state
const [deleteStep, setDeleteStep] = useState<'initial' | 'resources' | 'confirm' | 'success'>('initial');
const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
const [isDeletionInitiated, setIsDeletionInitiated] = useState(false);

// Mock credit balance - negative for individual, positive for organization
const isNewUser = userData.accountType === 'individual';
const userCredits = isNewUser ? -500 : 1250;
const hasNegativeCredits = userCredits < 0;
```

### Handler Functions

#### Credit Check & Pay Dues
- `handleDeleteAccountClick()` - Opens modal, resets state to initial step
- `handlePayDues()` - Opens Add Credits modal
- `handleCreditsUpdated(newCredits)` - Shows success toast after payment

#### Multi-Step Navigation
- `handleContinueFromInitial()` - Validates credits, moves to resources step
- `handleContinueFromResources()` - Moves to confirm step
- `handleFinalDelete()` - Validates "DELETE" text, initiates deletion, moves to success step
- `handleCancelDeletion()` - Cancels deletion request, shows toast, closes modal
- `handleCloseDeleteModal()` - Closes modal and resets all state

### Mock Active Resources Data
```typescript
const activeResources = [
  { type: 'Virtual Machines', icon: Server, items: ['vm-prod-01', 'vm-dev-02'], count: 2 },
  { type: 'Block Storage Volumes', icon: HardDrive, items: ['150GB total'], count: 3 },
  { type: 'Snapshots', icon: Camera, items: ['snapshot-backup-20231110'], count: 1 },
  { type: 'VPC with Subnets', icon: Network, items: ['vpc-main (2 subnets)'], count: 1 },
];
```

## Key Features

### ✅ Credit Balance Check
- Displays current balance with color coding:
  - Red for negative (with alert icon)
  - Green for positive
- Blocks deletion for users with outstanding dues
- Shows exact amount of dues (₹500)
- "Pay Dues" button integrates with existing `AddCreditsModal`

### ✅ Multi-Step Modal Flow
- 4 distinct conditional steps rendered based on `deleteStep` state
- Each step has its own UI and actions
- Back navigation between steps (except from initial step)
- Progressive disclosure of warnings
- Larger modal width (max-w-2xl) to accommodate content
- Scrollable content for longer warnings (max-h-[90vh])

### ✅ Active Resources Display
- Mock data showing realistic resource types
- Icons for each resource type (Lucide React icons)
- Detailed resource names in monospaced font
- Count badges for each resource category
- Professional card layout with borders and dividers

### ✅ Email Notifications
- Toast notifications simulate email sending:
  - "Deletion Initiation Email Sent" - When deletion is confirmed
  - "Account Deletion Cancelled" - When user cancels within grace period

### ✅ 48-Hour Grace Period
- Clearly explained in blue information box
- "Cancel Deletion" button available in success step
- Contact information for account recovery
- Timeline clearly stated (48 hours)
- Mentions final confirmation email after grace period

### ✅ Safety Mechanisms
- Type "DELETE" confirmation required (case-sensitive)
- Button disabled until exact match
- Multiple warning screens before final action
- Data loss warnings at each critical step
- Back button navigation to reconsider
- Large warning icons for visual emphasis

## Testing Instructions

### Test Scenario 1: Negative Credits (Individual User)

**Setup:**
The userData passed to ProfileCompletionDashboard should have:
```typescript
userData = { ...userData, accountType: 'individual' }
```

**Test Steps:**
1. Go to `http://localhost:3002/dashboard/profile-completion`
2. Scroll to the bottom of the form
3. Click "Delete Account" link (red underlined text)
4. **Verify Step 1 - Credit Check:**
   - Modal opens with title "Delete Account" (red, with warning icon)
   - Credit balance shows **-₹500** in red
   - Red warning icon appears next to balance
   - Red warning box: "Outstanding Dues Must Be Cleared"
   - Message: "Kindly clear your existing dues of INR 500 before proceeding"
   - Two buttons: "Cancel" (outline) and "Pay Dues" (primary)
5. Click "Pay Dues"
6. **Verify Add Credits Modal:**
   - Add Credits modal opens
   - Can enter custom amount
   - Shows order summary with GST calculation
7. Enter amount (e.g., 1000) and click "Purchase Credits"
8. **Verify Payment Success:**
   - Loading state (2 seconds)
   - Toast appears: "Payment Successful - Your dues have been cleared..."
   - Credits updated in header (if using useUserCredits hook)
   - Add Credits modal closes
9. **Try Deletion Again:**
   - In real implementation, would now allow deletion
   - For prototype, still shows negative balance (would need to re-test with organization account)

### Test Scenario 2: Positive Credits (Organization User)

**Setup:**
The userData passed to ProfileCompletionDashboard should have:
```typescript
userData = { ...userData, accountType: 'organization' }
```

**Test Steps:**
1. Go to `http://localhost:3002/dashboard/profile-completion`
2. Scroll to the bottom of the form
3. Click "Delete Account" link

4. **Verify Step 1 - Credit Warning:**
   - Modal opens (wider - max-w-2xl)
   - Title: "Delete Account" with warning icon (red)
   - Credit balance shows **₹1,250** in green
   - Yellow warning box: "Credit Balance Will Be Lost"
   - Message about losing ₹1,250 in credits
   - Buttons: "Cancel" | "Continue" (red)

5. Click "Continue"

6. **Verify Step 2 - Active Resources:**
   - Title changes to "Active Resources" (red)
   - Description: "Review your active resources before proceeding"
   - Resource list displays:
     - Server icon + "2 Virtual Machines" + vm-prod-01, vm-dev-02
     - HardDrive icon + "3 Block Storage Volumes" + 150GB total
     - Camera icon + "1 Snapshot" + snapshot-backup-20231110
     - Network icon + "1 VPC with Subnets" + vpc-main (2 subnets)
   - Red warning box: "Data Loss Warning" with detailed message
   - Buttons: "Back" | "Continue" (red)

7. Click "Continue"

8. **Verify Step 3 - Final Confirmation:**
   - Large warning icon centered (red circle background)
   - Red warning box with 48-hour termination message
   - Blue support contact box with email link
   - Label: "Type DELETE to confirm:"
   - Input field (monospaced font)
   - Placeholder: "Type DELETE here"
   - Buttons: "Back" | "Delete Account" (disabled, red)

9. Type "DELET" (incomplete)
   - Verify "Delete Account" button remains disabled

10. Type "DELETE" (complete)
    - Verify "Delete Account" button becomes enabled
    - Button styling shows it's clickable

11. Click "Delete Account"
    - Loading state (1.5 seconds)

12. **Verify Step 4 - Success:**
    - Toast notification: "Deletion Initiation Email Sent..."
    - Title changes to "Account Deletion Initiated" (green)
    - Green success box with checkmark icon
    - Message: "Deletion Initiated Successfully"
    - Sub-message about confirmation email
    - Blue information box: "48-Hour Grace Period"
    - Detailed grace period explanation with email link
    - Note about final deletion email
    - Buttons: "Cancel Deletion" | "Close"

13. Click "Cancel Deletion"
    - Loading state (1 second)
    - Toast notification: "Account Deletion Cancelled..."
    - Modal closes
    - Returns to profile completion page

14. **Test Navigation:**
    - Click "Delete Account" again
    - From Step 1, click "Continue"
    - From Step 2, click "Back" → Returns to Step 1
    - From Step 1, click "Continue" again
    - From Step 2, click "Continue"
    - From Step 3, click "Back" → Returns to Step 2
    - Navigate forward to Step 3 again
    - Type "DELETE" and confirm
    - From Step 4, click "Close" → Modal closes

## Design System Compliance

### ✅ shadcn/ui Components
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- `Button` with proper variants (outline, destructive)
- `Input` with proper styling
- `Label` for form fields

### ✅ Color System
- **Red variants** (`red-50`, `red-200`, `red-600`, `red-700`, `red-900`):
  - Warnings, errors, destructive actions
  - Delete Account button
  - Alert icons and messages
- **Green variants** (`green-50`, `green-100`, `green-600`, `green-700`, `green-900`):
  - Success states
  - Positive credit balance
  - Checkmark icon
- **Yellow variants** (`yellow-50`, `yellow-200`, `yellow-600`, `yellow-700`, `yellow-900`):
  - Caution messages
  - Credit loss warning
- **Blue variants** (`blue-50`, `blue-200`, `blue-600`, `blue-700`, `blue-900`):
  - Informational content
  - Grace period information
  - Support contact
- **Gray variants** (`gray-50`, `gray-600`, `gray-700`, `gray-900`):
  - Neutral content
  - Resource details
  - Backgrounds

### ✅ Typography
- Consistent font sizes: `text-sm`, `text-2xl`, `text-xs`
- Font weights: `font-medium`, `font-bold`
- Monospaced font for: confirmation input, resource names
- Proper line height: `leading-relaxed`

### ✅ Spacing & Layout
- Consistent padding: `p-3`, `p-4`, `p-6`
- Consistent gaps: `gap-3`, `space-y-3`, `space-y-6`
- Proper card spacing with rounded corners: `rounded-lg`
- Borders: `border`, `border-2` with color variants
- Flex and grid layouts for responsive design

### ✅ Icons (Lucide React)
- `AlertTriangle` - Warnings throughout
- `Server` - Virtual Machines
- `HardDrive` - Block Storage
- `Camera` - Snapshots
- `Network` - VPC/Networking
- SVG checkmark for success state

### ✅ Responsive Design
- Modal width: `max-w-2xl` (wider for content)
- Modal height: `max-h-[90vh]` with `overflow-y-auto`
- Flexible button layouts: `flex-1` for equal width
- Mobile-friendly touch targets

### ✅ Accessibility
- Proper ARIA labels via Dialog components
- Semantic HTML structure
- Keyboard navigation support
- Clear focus states
- Disabled states with visual feedback (`opacity-50`, `cursor-not-allowed`)
- Screen reader friendly text

## Flowchart Compliance

| Flowchart Requirement | Implementation Status | Notes |
|----------------------|----------------------|-------|
| Credit check on deletion request | ✅ Implemented | Checks `userCredits < 0` |
| Block deletion if credits < 0 | ✅ Implemented | Shows "Pay Dues" flow |
| Show "Pay Dues" for negative credits | ✅ Implemented | Opens AddCreditsModal |
| Credit loss warning for credits ≥ 0 | ✅ Implemented | Yellow warning box in Step 1 |
| User credits reset to 0 | ⚠️ Simulated | Mock only - would need API |
| Show active resources list | ✅ Implemented | Step 2 with 4 resource types |
| Data loss warning | ✅ Implemented | Red warning box in Step 2 |
| Deletion initiation email | ✅ Simulated | Toast notification |
| 48-hour grace period | ✅ Implemented | Explained in Step 4 |
| Cancel deletion within 48 hours | ✅ Implemented | "Cancel Deletion" button |
| Account restoration email | ✅ Simulated | Toast notification |
| Deletion confirmation email | ℹ️ Mentioned | Noted in Step 4 UI text |

## Files Modified

### Main Implementation File
- **`components/auth/profile-completion-dashboard.tsx`**
  - Added imports for new icons and AddCreditsModal
  - Added state management for multi-step flow
  - Replaced simple `handleDeleteAccount` with comprehensive handlers
  - Replaced simple delete modal with complete 4-step modal
  - Added AddCreditsModal integration

### No Files Created
- All functionality added to existing component

## Dependencies

### Existing Dependencies Used
- `lucide-react` - Icons (Server, HardDrive, Camera, Network, AlertTriangle)
- `@/components/modals/add-credits-modal` - Payment modal
- `@/components/ui/*` - shadcn/ui components
- `@/hooks/use-toast` - Toast notifications

### No New Dependencies Added
- Uses only existing packages and components

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support
- CSS Custom Properties support
- Tested on Chrome, Safari, Firefox, Edge

## Future Enhancements (Real Implementation)

1. **API Integration**:
   ```typescript
   // Check real credit balance
   const { data: userBalance } = await fetch('/api/user/balance');
   
   // Fetch real resources
   const { data: resources } = await fetch('/api/user/resources');
   
   // Initiate deletion
   await fetch('/api/user/delete', { method: 'POST' });
   
   // Cancel deletion
   await fetch('/api/user/cancel-deletion', { method: 'POST' });
   ```

2. **Dynamic Credit Update**:
   - After payment via AddCreditsModal, refetch user balance
   - Re-evaluate deletion eligibility
   - Allow immediate retry if balance becomes positive

3. **Real Resource Fetching**:
   - Query actual VMs, volumes, snapshots, VPCs
   - Show real resource IDs and names
   - Calculate total resource count
   - Show resource costs if applicable

4. **Email Service Integration**:
   - Send real deletion initiation email
   - Send cancellation confirmation email
   - Track email delivery status
   - Include deletion token in email for security

5. **Account State Management**:
   - Track deletion status in database (pending, cancelled, completed)
   - Implement countdown timer (48 hours)
   - Schedule automatic deletion job after grace period
   - Block login attempts during grace period (optional)
   - Show banner on login if deletion is pending

6. **Grace Period Countdown**:
   - Display remaining time in UI
   - Send reminder emails at 24h and 6h marks
   - Auto-cancel if user logs in during grace period (optional)

7. **Audit Logging**:
   - Log all deletion-related events
   - Track who initiated, when, from which IP
   - Log cancellation events
   - Compliance and security requirements

## Notes

- **Account Type Detection**: Uses `userData.accountType` prop
  - `'individual'` → Shows negative credits (-₹500) scenario
  - `'organization'` → Shows positive credits (₹1,250) scenario
- **Modal Size**: Larger than standard (max-w-2xl) to fit content
- **Scrolling**: Enabled for longer content (max-h-[90vh])
- **Case-Sensitive**: "DELETE" confirmation must be exact (uppercase)
- **Prototype Mode**: All actions are simulated with mock data

---

**Implementation Date**: November 10, 2025  
**Status**: ✅ Complete (Prototype)  
**Mode**: Design Mode - Mock Data Only  
**Component**: ProfileCompletionDashboard  
**Page URL**: `/dashboard/profile-completion`

