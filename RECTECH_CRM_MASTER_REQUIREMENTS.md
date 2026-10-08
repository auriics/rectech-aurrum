Build and upgrade the current Rectech CRM into a professional, production-grade recruitment CRM specifically designed for recruiters, recruitment managers, admins, and hiring teams.

IMPORTANT:
Do not blindly redesign or remove existing functionality. First audit the entire current CRM, understand every existing module, workflow, API, Firebase/Firestore collection, role permission, notification, activity log, resume parser, pipeline, assignment, follow-up, notes, dashboard, invoice, website lead, and recruiter workflow. Then improve and extend it without breaking existing functionality.

Act as a Senior Recruitment CRM Product Architect + UI/UX Designer + Full-Stack Engineer + QA Engineer.

==================================================
1. COMPLETE CURRENT CRM AUDIT
==================================================

Before coding:

- Review every currently available CRM feature.
- Review every page, module, component, modal, table, form, API, Firebase/Firestore collection, background process, notification, activity log, and role permission.
- Identify incomplete, duplicated, disconnected, or broken functionality.
- Identify UX/UI problems.
- Identify missing recruiter workflow features.
- Identify missing notification relationships.
- Identify missing activity tracking.
- Identify performance issues.
- Identify responsive issues.
- Do not replace working functionality unnecessarily.

Create an internal feature map and use it as the implementation checklist.

==================================================
2. PROFESSIONAL RECRUITER CRM UI/UX
==================================================

Improve the complete CRM interface to look like a professional modern recruitment platform.

Focus on:

- Clean professional SaaS/recruitment CRM design.
- Excellent typography and font hierarchy.
- Highly readable text.
- Strong visibility for important information.
- Clear primary/secondary actions.
- Consistent spacing, margin, padding, card sizing and alignment.
- Better table readability.
- Better badges/status indicators.
- Better empty states.
- Better loading states/skeletons.
- Better hover/focus/active states.
- Better modals and drawers.
- Better filters/search.
- Better mobile/tablet/desktop layouts.
- Avoid excessive dark/slate/faded UI.
- Avoid tiny text.
- Do not allow important information to be hidden behind unnecessary ellipsis.
- Maintain consistent design across every CRM module.

Use a consistent design system for:

- Typography
- Font sizes
- Font weights
- Line heights
- Colors
- Border radius
- Shadows
- Buttons
- Inputs
- Cards
- Tables
- Status badges
- Icons
- Notifications
- Spacing

The UI must feel like a real professional recruitment CRM, not an admin template.

==================================================
3. CANDIDATE DETAILS – PIPELINE STAGE
==================================================

Currently Candidate Details has Pipeline Stage as a dropdown.

Change this.

After the candidate name/header section, create a horizontal recruitment pipeline stepper.

Example:

Applied → Screening → Shortlisted → Interview → Technical Interview → Client Review → Offer → Hired

Also support appropriate existing/custom stages from the current CRM.

Requirements:

- Horizontal on desktop.
- Clean responsive version on tablet/mobile.
- Current stage must be visually highlighted.
- Completed stages must be visually identifiable.
- Future stages must be clearly visible.
- Clicking a stage should update the candidate's pipeline stage.
- Save the change to Firestore/backend.
- Capture the change in Activity Logs.
- Trigger the appropriate notification.
- Show timestamp/user who changed it where appropriate.
- Do not lose existing custom pipeline stages.
- Do not break current filtering/reporting based on pipeline stage.

==================================================
4. REAL-TIME NOTIFICATION SYSTEM
==================================================

Build a complete relationship-aware real-time notification system.

Notifications must be generated for relevant CRM events.

Examples:

Candidate:
- Candidate created
- Resume added
- Resume parsed
- Resume parsing failed
- Candidate assigned
- Candidate reassigned
- Pipeline stage changed
- Candidate status changed
- Candidate updated
- Candidate shortlisted
- Candidate rejected
- Candidate moved to interview
- Candidate moved to offer
- Candidate hired

Recruiter:
- New candidate assigned
- New resume added
- New lead assigned
- Task assigned
- Follow-up assigned
- Note mentioning recruiter
- Candidate pipeline changed for their candidate
- SLA approaching
- SLA breached

Tasks/Follow-ups:
- New task assigned
- Task reassigned
- Task due soon
- Task overdue
- Follow-up created
- Follow-up assigned
- Follow-up due
- Follow-up overdue
- Follow-up completed

Notes:
- New note added
- Mention/tag another user
- Note added to a candidate they own/are assigned to

Website Leads:
- New website lead
- Resume uploaded
- Lead assigned
- Lead parsing completed
- Lead parsing failed
- Lead converted to candidate

Resume Processing:
- Resume uploaded
- Resume parsing started
- Resume parsing completed
- Resume parsing failed
- Duplicate detected
- Missing candidate details detected
- Reparse completed

==================================================
5. RELATION-WISE NOTIFICATION FLOW
==================================================

Notifications must respect relationships and permissions.

Example:

Recruiter A creates a follow-up for Recruiter B.

→ Recruiter B receives notification.

Recruiter A adds a note and mentions Recruiter B.

→ Recruiter B receives notification.

Admin assigns Candidate X to Recruiter A.

→ Recruiter A receives notification.

Recruiter A changes Candidate X from Screening → Interview.

→ Relevant assigned users/managers receive notification.

Recruiter A uploads a resume.

→ Admin receives a notification.

Do NOT send irrelevant notifications to every CRM user.

Determine recipients based on:

- Actor
- Assigned recruiter
- Candidate owner
- Team leader
- Admin
- Developer where technically relevant
- Mentioned users
- Related lead
- Related task/follow-up
- Relevant permission/role

The notification engine should be centralized so every module uses the same notification system.

==================================================
6. SOUND NOTIFICATIONS
==================================================

Every important real-time CRM notification should support sound.

Requirements:

- Notification appears instantly.
- Play a short professional notification sound.
- Do not play repeated sound for the same event.
- Respect browser autoplay restrictions.
- Provide notification sound enable/disable control.
- Store user preference.
- Visual notification must still work if sound is disabled.
- Avoid annoying continuous/repeated sounds.

Use a professional subtle notification sound, not an aggressive alert.

==================================================
7. RECRUITER ADDS NEW RESUME → ADMIN NOTIFICATION
==================================================

When any recruiter adds/uploads a new resume:

Admin must receive a real-time CRM notification.

Notification should contain structured information such as:

"New Resume Added"

Recruiter:
[Recruiter Name]

Candidate:
[Candidate Name]

Resume:
[Resume File Name]

Source:
[Upload Source]

Uploaded:
[Date + Time]

Status:
[Parsed / Processing / Failed]

Candidate ID:
[ID if available]

The notification should be clickable and open the relevant candidate/resume details.

Also capture this event in Activity Logs.

If multiple admins exist, follow the existing admin notification/permission model and avoid duplicate notifications.

==================================================
8. COMPLETE ACTIVITY LOG SYSTEM
==================================================

Every important CRM action must be captured.

Activity log should include:

- User
- User role
- Action
- Entity type
- Entity ID
- Candidate/lead name where applicable
- Previous value
- New value
- Timestamp
- Source/module
- Relevant metadata
- IP/device information only if already supported and appropriate

Examples:

"Darshan changed Candidate X pipeline from Screening to Interview."

"Recruiter A uploaded resume CV.pdf for Candidate X."

"Admin assigned Candidate X to Recruiter B."

"Recruiter B created follow-up for Candidate X."

"Recruiter B added a note to Candidate X."

"Admin changed candidate status."

"System completed Gemini resume parsing."

"System failed resume parsing and queued retry."

Activity logs must be:

- Real-time where appropriate.
- Searchable.
- Filterable.
- Chronologically accurate.
- Permission-aware.
- Never silently lost.

==================================================
9. SLA MANAGEMENT
==================================================

Add/upgrade real-time SLA tracking.

Support SLA tracking for relevant recruiter workflows such as:

- New lead response
- Candidate review
- Resume processing
- Candidate assignment
- Follow-up response
- Interview action
- Client response
- Other existing SLA workflows

Display:

- SLA status
- Time remaining
- Due time
- Warning state
- Breached state
- Completed state

Example:

🟢 SLA Healthy
🟡 SLA Due Soon
🔴 SLA Breached
✓ SLA Completed

Generate notifications when:

- SLA is approaching.
- SLA is due.
- SLA is breached.

SLA timers must update correctly in real time without excessive database reads.

==================================================
10. DASHBOARD
==================================================

Improve the recruiter dashboard with useful recruitment metrics.

Examples:

- Total Candidates
- New Candidates
- Candidates Assigned to Me
- Active Candidates
- Candidates by Pipeline Stage
- Interviews
- Offers
- Hires
- Pending Follow-ups
- Overdue Follow-ups
- SLA Due Soon
- SLA Breached
- New Website Leads
- Resume Processing Status
- Recent Activity
- Recent Notifications

Make the dashboard useful for daily recruiter work rather than just displaying numbers.

==================================================
11. FOLLOW-UPS / TASKS
==================================================

Create a strong recruiter task/follow-up workflow.

Each task/follow-up should support:

- Candidate
- Lead
- Assigned user
- Created by
- Priority
- Due date/time
- Reminder
- Status
- Notes
- Completion
- Activity history

Support:

- Create
- Edit
- Assign
- Reassign
- Complete
- Snooze
- Overdue
- Reminder

Every important action must generate the appropriate notification and activity log.

==================================================
12. NOTES
==================================================

Improve candidate/lead notes.

Support:

- Add note
- Edit note
- Delete according to permissions
- User attribution
- Timestamp
- Mentions
- Related candidate/lead
- Activity logging
- Notification when another user is mentioned

Example:

"@RecruiterName Please contact this candidate tomorrow."

→ RecruiterName receives notification.

==================================================
13. ASSIGNMENT SYSTEM
==================================================

Review all assignment functionality.

Assignments should work consistently for:

- Candidates
- Website leads
- Resumes
- Tasks
- Follow-ups

When assignment changes:

- Update Firestore/backend.
- Notify the new assignee.
- Capture previous assignee.
- Capture new assignee.
- Add activity log.
- Update relevant dashboard counts.
- Update pipeline ownership.

==================================================
14. RESUME MANAGEMENT
==================================================

Review the entire resume workflow.

Ensure:

- Upload
- Duplicate detection
- Skip duplicate
- Parsing
- Re-parsing
- Missing details detection
- Resume download
- Resume preview where supported
- Candidate creation
- Candidate assignment
- Uploaded By
- Parser Agent
- Processing status
- Retry handling
- Error handling
- Activity logging
- Notifications

Recruiters should be able to work with resumes efficiently without unnecessary restrictions.

==================================================
15. SEARCH / FILTER / DATA VISIBILITY
==================================================

Improve:

- Global search
- Candidate search
- Resume search
- Lead search
- Recruiter filtering
- Pipeline filtering
- Assignment filtering
- SLA filtering
- Date filtering
- Status filtering

Make search fast and useful.

Do not hide relevant recruiter data unnecessarily.

Maintain correct role-based permissions.

==================================================
16. REAL-TIME DATA
==================================================

Where real-time updates are required:

- Notifications
- Candidate assignment
- Pipeline changes
- Follow-ups
- Notes
- SLA state
- Resume processing
- Website leads
- Activity logs

Use efficient Firestore listeners/query patterns.

Do NOT create unnecessary listeners or unbounded queries.

Avoid:

- Duplicate listeners
- Memory leaks
- Excessive Firestore reads
- Re-render loops
- Duplicate notifications
- Duplicate activity logs

==================================================
17. LOADING / ERROR / EMPTY STATES
==================================================

Every data-loading screen must have a professional loading state.

Examples:

- Dashboard loading
- Candidate list loading
- Candidate detail loading
- Resume parsing
- Invoice loading
- Website lead loading
- Notifications loading
- Activity logs loading

Never show raw technical errors to normal users.

Frontend should show friendly messages.

Technical details should go to appropriate console/server logs.

==================================================
18. RESPONSIVE DESIGN
==================================================

Fully test:

- 1920px
- 1600px
- 1440px
- 1280px
- 1100px
- 1024px
- 768px
- 576px
- 480px
- 425px
- 375px
- 360px

Candidate pipeline must adapt properly on mobile.

Tables should not create unusable horizontal scrolling.

Cards, forms, modals, notifications, activity logs and candidate details must remain readable.

==================================================
19. SECURITY / PERMISSIONS
==================================================

Review every new and existing action.

Ensure users cannot perform actions outside their role permissions.

Do not expose:

- API keys
- Firebase Admin credentials
- server secrets
- internal error traces
- sensitive backend information

Validate permissions on the backend/server side, not only in the UI.

==================================================
20. PERFORMANCE
==================================================

The CRM must remain fast as candidate/resume/activity volume grows.

Optimize:

- Firestore queries
- Pagination
- List rendering
- Notification listeners
- Activity logs
- Dashboard calculations
- Resume processing
- Real-time subscriptions

Avoid loading thousands of records unnecessarily.

==================================================
21. QA / VERIFICATION
==================================================

Do not simply implement and say "completed."

Follow this workflow:

ANALYZE
→ IMPLEMENT
→ BUILD
→ TEST
→ FIND BUGS
→ FIX BUGS
→ RE-TEST
→ REGRESSION TEST
→ VERIFY

Test all existing CRM functionality after these changes.

Specifically verify:

- Candidate creation
- Candidate editing
- Candidate assignment
- Pipeline changes
- Resume upload
- Resume parsing
- Duplicate detection
- Follow-ups
- Tasks
- Notes
- Notifications
- Notification sounds
- SLA timers
- Activity logs
- Website leads
- Recruiter permissions
- Admin permissions
- Dashboard
- Search/filter
- Mobile responsiveness
- Firebase/Firestore operations
- Production build
- Production APIs

Also test multi-user scenarios:

Recruiter A → creates action
Recruiter B → receives correct notification
Admin → receives required admin notification
Unrelated Recruiter C → does NOT receive irrelevant notification

Verify that every notification and activity event is generated exactly once.

Finally provide a QA report containing:

- Features audited
- Features changed
- Bugs found
- Bugs fixed
- Remaining issues
- Notification flows tested
- SLA flows tested
- Activity logging tested
- Responsive testing completed
- Build status
- Production verification status

Do not mark the task complete until the actual CRM workflow has been tested end-to-end.
