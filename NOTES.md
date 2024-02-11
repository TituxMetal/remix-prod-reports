# Roles

- Administrateur - admin
- Big Boss (Directeur) - boss
- Résponsable de dépôt - store manager
- Chef d'équipes - team leader
- Employé - worker

# Fonctions - Tâches - Postes de travail - Workstations

- Préparateur de commandes (classique) - classic order picker
- Préparateur de commandes (E-Commmerce) - e-commerce order picker
- Emballeur de commandes - order packer
- Cariste approvisionneur - supply forklift operator
- Cariste expéditions - shipping forklift operator
- Cariste stockeur - storage forklift operator

# Schemas

## User

id - firstName - lastName - username - personalId - createdAt - updatedAt - hashedPassword - role -
reports

## Workstation

id - name - displayName - movingAround - createdAt - updatedAt

## Report

id - dateOfDay - hourOfDay - reason - location - duration - description - createdAt - updatedAt -
userId - workstationId - status

## Report Status

By default, the report is in the "pending" status. The team leader can change the status to
"approved", "inProgress" or "cancelled". The store manager can change the status to "detailsNeeded",
"approved" or "completed"

id - name - displayName - description - createdAt - updatedAt

# Routes

- / - home page that redirects to /start
- /about - what's the project about
- /login - login page

## Multi step form - Create a report

- /start - step1 - start page to collect essential information - ask for personalId
- /:personalId - step2 - ask for workstation in a select list
- /reports/:personalId/:workStationId/new - step3 - create new report
- /reports/:personalId/:workStationId/:reportId - step4 - show the last submited report for the user

## User informations

- /users/:personalId - show user details
- /users/:personalId/reports - show reports for the user in the current day

## Dashboard

Workers

- /dashboard/workers - show all workers
- /dashboard/workers/new - create new worker
- /dashboard/workers/:personalId - edit worker details

Workers Reports

- /dashboard/workers/:personalId/reports - show reports for the worker in the current day
- /dashboard/workers/:personalId/reports/:reportId - edit report details

Workstations

- /dashboard/workstations - show all workstations
- /dashboard/workstations/new - create new workstation

Workstations Workers

- /dashboard/worstations/:workstationId/workers - show workers for a workstation

Workstations Reports

- /dashboard/worstations/:workstationId/reports - show reports for a workstation
