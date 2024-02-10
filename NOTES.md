# Roles

- Administrateur - admin
- Big Boss (Directeur) - boss
- Résponsable de dépôt - store manager
- Chef d'équipes - team leader
- Employé - worker

# Fonctions - Tâches - Postes de travail - Workplaces

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

## Workplace

id - name - displayName - movingAround - createdAt - updatedAt

## Report

id - dateOfDay - hourOfDay - reason - location - duration - description - createdAt - updatedAt -
userId - workplaceId - status

## Report Status

By default, the report is in the "pending" status. The team leader can change the status to
"approved", "inProgress" or "cancelled". The store manager can change the status to "detailsNeeded",
"approved" or "completed"

id - name - displayName - description - createdAt - updatedAt

# Routes

- /about - what's the project about
- /login - login page

## Multi step form - Create a report

- /start - start page to collect essential information - ask for personalId
- /$personalId - ask for workplace in a select list
- /$personalId/$worplaceId/reports - show reports for the user in the selected workplace
- /$personalId/$worplaceId/reports/new - create new report

## User informations

- /users/$personalId - show user details
- /users/$personalId/reports - show reports for the user in the current day

## Team Leaders space - Team Leaders can show/create/edit workers

- /admin/workers - show all workers
- /admin/workers/new - create new worker
- /admin/workers/$personalId - show worker details
