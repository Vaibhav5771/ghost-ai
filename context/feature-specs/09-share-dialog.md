Add a 'Share' button to the editor navbar that opens the share dialog.

Owners can:

- invite collobrators by email
- view current collaborators
- remove collabrators
- copy the project link with temporary 'Copied!' feedback

Collabrators can:

- view the collabrator list only
- not invite, remove, or manage access

## Clerk User Data

Collabrators are stored by email in the database.

Use Clerk Backend API to enrich collabrator email with:

- display name 
- avatar image

if a Clerk user is not founf for an email, dallback to showing the email only.

## Implementation

Add the required API logic for:

- lsiting colloborators 
- inviting colloborators
- removing colloborators

Enforce ownership server-side for invite and remove actions.

do not add a local user table.

## Check when Done

- share dialog opens from the workspace
- owners can invite and remove colloborators 
- colloborators see read-only access 
- colloborators names/avatars load from the Clerk when available 
- 'npm run build' passes


