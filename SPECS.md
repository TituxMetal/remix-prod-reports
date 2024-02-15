# Database Schemas

## User

User is the main entity of the application. It has a unique identifier, a first name and last name,
a username that is unique and can be generated automatically with the first name and last name first
letters, a personal ID that is given by our company, a password, a role and a list of reports. A
user can ONLY be created by another user that has permission to do so.

- id - String - Auto-generated Unique Identifier
- firstName - String - User's First Name
- lastName - String - User's Last Name
- username - String - User's Username
- personalId - String - User's Personal ID

- createdAt - DateTime - Date User was created
- updatedAt - DateTime - Date User was updated

- password - Password - User's hashed password
- roleId - Role - User's role
- reports - Report[] - User's reports

## Role

Role is the entity that represents a user role. It has a unique identifier, a name, a description, a
display name. A role can ONLY be created by another user that has permission to do so.

- id - String - Auto-generated Unique Identifier
- name - String - Role's Name
- description - String - Role's Description
- displayName - String - Role's Display Name

- createdAt - DateTime - Date Role was created
- updatedAt - DateTime - Date Role was updated

## Workstation

Workstation is the entity that represents the physical location where the user is working. It has a
unique identifier, a name, a display name, a description, a type that specify whether the
workstation is fixed or mobile, a list of reports. A workstation can ONLY be created by another user
that has permission to do so.

- id - String - Auto-generated Unique Identifier
- name - String - Workstation's Name
- displayName - String - Workstation's Display Name
- description - String - Workstation's Description
- type - String - Workstation's Type

- createdAt - DateTime - Date Workstation was created
- updatedAt - DateTime - Date Workstation was updated

- reports - Report[] - Workstation's reports

## Report

Report is the entity that represents a downtime report. It has a unique identifier, a date, an hour,
a reason for downtime, a storage location, a duration in minutes and a description.

- id - String - Auto-generated Unique Identifier
- date - Date - Report's Date
- hour - Time - Report's Hour
- reasonForDowntime - String - Report's Reason for Downtime
- storageLocation - String - Report's Storage Location
- duration - String - Report's Duration in minutes
- description - String - Report's Description

- createdAt - DateTime - Date Report was created
- updatedAt - DateTime - Date Report was updated

- user - User - User that created the report
- workstation - Workstation - Workstation that the report was created for
- status - ReportStatus - Report's status

## Report Status

Report Status is the entity that represents the status of a report. It has a unique identifier, a
name, a display name and a description. By default, a report is in the "Pending" status. The Team
Leader can change the status of a report to "In Progress" or "Cancelled". The Depot Manager can
change the status of a report to "Approved", "Rejected" or "Completed". A report status can ONLY be
created by another user that has permission to do so.

- id - String - Auto-generated Unique Identifier
- name - String - Report Status's Name
- displayName - String - Report Status's Display Name
- description - String - Report Status's Description

- createdAt - DateTime - Date Report Status was created
- updatedAt - DateTime - Date Report Status was updated

# Use Cases

## Workers - Employé

### A Worker creates a report - Un employé crée un rapport

The primary use case of the application is to create a report. A report is created by a user that
has the Worker role. The report is for a specific workstation. To quickly identify a user, the
personal ID is used. The creation of a report MUST BE fast, for this reason, a multi step form is
used. The user is asked to fill in here personal ID, then choose a workstation and finally fill in
the rest of the fields. Some fields are optional, others are prefilled with default values, like the
date and the hour. The user has the choice of a list for the reason for downtime, an optionnal text
field for the storage location, an optionnal text field for the description and a number field for
the duration.

## Users logs in - Un utilisateur se connecte

The user can log in to the application. The user logs in with his personal ID and password. Users
with the role "Worker" can only login to his own account. Users with roles "Team Leader", "Depot
Manager" and "Big Boss" can login to the dashboard.

## Team Leaders - Chefs d'Équipes

### A Team Leader shows a list of reports - Un chef d'équipe affiche la liste des rapports

The Team Leader role is used to see a list of reports for the current day. The list of reports is
filtered by the status, the Team Leader can see all the reports, the reports that are pending, the
reports that are in progress, the reports that are approved, the reports that are completed, the
reports that are rejected. The Team Leader can also filter the reports by a specific user or a
specific workstation.

### A Team Leader changes the status of a report - Un chef d'équipe change le statut d'un rapport

The Team Leader role is used to change the status of a report. The Team Leader can change the status
of a report to "In Progress" or "Cancelled".

### A Team Manager changes some information of a report - Un chef d'équipe change les informations d'un rapport

The Team Leader role is used to change some information of a report. The Team Leader can change the
storage location, the description and the duration.

### A Team Manager shows a list of Workers - Un chef d'équipe affiche la liste des employés

The Team Leader role is used to see a list of Users that have the Worker role. The list of Users is
filtered by the role, the Team Leader can not see the Users that have other roles.

### A Team Manager creates a Worker - Un chef d'équipe crée un employé

The Team Leader role is used to create a User that ONLY has the Worker role.

## Depot Manager - Résponsable de Dépôt

### A Depot Manager shows a list of reports - Un résponsable de dépôt affiche la liste des rapports

The Depot Manager role is used to see a list of reports for the current day. The list of reports is
filtered by the status, the Depot Manager can see all the reports, the reports that are pending, the
reports that are in progress, the reports that are approved, the reports that are completed, the
reports that are rejected. The Depot Manager can also filter the reports by a specific user or a
specific workstation.

### A Depot Manager changes the status of a report - Un résponsable de dépôt change le statut d'un rapport

The Depot Manager role is used to change the status of a report. The Depot Manager can change the
status of a report to "In Progress", "Approved", "Rejected" or "Completed". The Depot Manager can
also change the status of a report to "Cancelled".

### A Depot Manager shows a list of users - Un résponsable de dépôt affiche la liste des utilisateurs

The Depot Manager role is used to see a list of Users. The list of Users is filtered by the role,
the Depot Manager can see all the Users, the Users that have the Worker role, the Users that have
the Team Leader role.

### A Depot Manager creates a user - Un résponsable de dépôt crée un utilisateur

The Depot Manager role is used to create a User. The Depot Manager can create a User that has the
Worker role or the Team Leader role.

### A Depot Manager creates a workstation - Un résponsable de dépôt crée un poste de travail

The Depot Manager role is used to create a Workstation.

## Big Boss - Directeur

### The Big Boss shows a list of reports - Le directeur affiche la liste des rapports

The Big Boss role is used to see a list of reports for the current day. The list of reports is
filtered by the status, the Big Boss can see all the reports, the reports that are pending, the
reports that are in progress, the reports that are approved, the reports that are completed, the
reports that are rejected. The Big Boss can also filter the reports by a specific user or a specific
workstation.

### The Big Boss changes the status of a report - Le directeur change le statut d'un rapport

The Big Boss role is used to change the status of a report. The Big Boss can change the status of a
report to "In Progress", "Approved", "Rejected" or "Completed". The Big Boss can also change the
status of a report to "Cancelled".

### The Big Boss shows a list of users - Le directeur affiche la liste des utilisateurs

The Big Boss role is used to see a list of Users. The list of Users is filtered by the role, the Big
Boss can see all the Users, the Users that have the Worker role, the Users that have the Team Leader
role, the Users that have the Depot Manager role.

### The Big Boss creates a user - Le directeur crée un utilisateur

The Big Boss role is used to create a User. The Big Boss can create a User that has the Worker role,
the Team Leader role or the Depot Manager role.

### The Big Boss creates a workstation - Le directeur crée un poste de travail

The Big Boss role is used to create a Workstation.
