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

# Design - Style

Some simple ideas for the design of the different parts of the application, which I want to use as a
basis for inspiration.

[Dashboard - Workers List](https://tailwindui.com/components/application-ui/lists/grid-lists#component-08e8555b844010db1f30cbafc8be6222)

[Dashboard - Reports List](https://tailwindui.com/components/application-ui/lists/feeds#component-81e5ec57a92ddcadaa913e7bb68336fe)

[Form Layouts](https://tailwindui.com/components/application-ui/forms/form-layouts#component-dcf2bee8aa4fbef0d4623df5b9718da8)

[Form - Input Groups](https://tailwindui.com/components/application-ui/forms/input-groups#component-7a5297f99a5ed22df80939dd1986de5f)

[Form - Textarea](https://tailwindui.com/components/application-ui/forms/textareas#component-4dfa34096e750fe0cc9a5086286bc441)

[Form - Radio Groups](https://tailwindui.com/components/application-ui/forms/radio-groups#component-f77fa2476964716cd375c934954229ae)

[Form - Select Menu](https://tailwindui.com/components/application-ui/forms/select-menus#component-c549ac2695455cb78d529c3a00293fe0)

[Navbar](https://tailwindui.com/components/application-ui/navigation/navbars#component-d833265bea66e95da3b499411d4d49b3)

[Breadcrumb](https://tailwindui.com/components/application-ui/navigation/breadcrumbs#component-7dc6ffff20237868ddf0e7d21cf17cf1)

[Multi Step Form Breadcrumb](https://tailwindui.com/components/application-ui/navigation/steps#component-ef491b1515ff05e8cc7429f37bc0fae5)
