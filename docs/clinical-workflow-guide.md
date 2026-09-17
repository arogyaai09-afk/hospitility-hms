# HMS Clinical Workflow and Role Design Guide

## 1. Purpose

This document defines the operational flow for patient admission, nursing assignment, room allocation, discharge handling, and staff role management in the Hospital Management System (HMS). It is meant to help the team design a consistent front-end experience and keep the backend workflow easy to manage.

## 2. Core operating model

The current system already follows a practical multi-role clinical flow:

- Patient management
- Doctor management
- Staff management
- Department management
- Admission management
- Bed and room allocation
- Discharge handling
- Billing and invoice support

The architecture is organized around roles and tenant boundaries, which suits the hospital workflow well.

## 3. Recommended user roles

The system currently supports a role-based model with roles such as:

- admin
- tenant
- doctor
- staff
- patient

### Recommended interpretation of staff roles

To make front-end management easier, staff should be treated as a shared directory with role-based subcategories rather than creating a separate module for every profession.

Recommended staff subroles:

- doctor
- nurse
- receptionist
- ward-admin
- lab-tech
- billing-staff
- support-staff

This allows the system to keep a simple structure while still supporting operational tasks across departments.

## 4. Nurse registration decision

### Recommendation

A Nurse should not be created as a separate fully independent module in the first phase unless the hospital requires nursing-specific features such as:

- nurse rosters
- duty shifts
- nursing treatment notes
- nurse-specific dashboards
- patient assignment tracking by nurse

### Practical design

Use the existing staff directory for nurses:

- User account created as usual
- Staff profile created with role = nurse
- Department linked to the nurse
- Ward or unit assigned if applicable
- Shift and status stored in staff metadata

This is more consistent with the current system and easier to manage from the UI.

### Why this is better for the current project

- matches the existing `staff` design
- avoids duplication with doctor-specific models
- simpler forms and front-end pages
- easier tenant-level user management
- scalable later if nursing-specific modules are introduced

## 5. Patient admission flow

### Standard workflow

1. Patient registration
   - create patient record
   - capture demographics and contact details
   - assign patient code / ID

2. Doctor consultation
   - patient is reviewed by a doctor
   - doctor decides if inpatient admission is necessary

3. Admission intake
   - staff creates an admission record
   - select department, doctor, and patient
   - capture reason for admission
   - record emergency or planned admission type

4. Bed availability check
   - staff checks available beds by ward or department
   - filter by room type, ward, or bed type

5. Bed allotment
   - chosen bed is assigned to the patient
   - bed status changes to occupied
   - admission is linked to the allocated bed

6. Patient care phase
   - patient stays in ward or room
   - nurses and doctors update care details
   - assignment remains active until discharge

7. Discharge
   - doctor or admin marks the patient discharged
   - bed is released automatically
   - room becomes available for the next patient

## 6. Room and bed allocation flow

### Recommended process

- Each room belongs to a ward or department
- Each room has multiple beds
- Each bed has a status:
  - available
  - occupied
  - maintenance
- Admission records link to a specific bed

### Example

- Ward: General Ward
- Room: G-101
- Bed: G-101-B1
- Patient assigned to bed when admitted
- Bed status becomes occupied
- After discharge, the bed is released

## 7. Manual staff workflow supported by current system

The current project already supports manual staff-driven operations:

- staff can create medical admissions
- staff can list available beds
- staff can assign a bed by bed number
- staff can discharge a patient
- bed is changed from occupied to available when discharge is processed

This is a valid operational model, but it is still a manual workflow rather than a full automatic room-assignment engine.

## 8. Front-end workflow recommendation

### Recommended pages

- Patient list
- Patient detail
- Appointment / OPD consultation
- Admission form
- Available Beds dashboard
- Room and bed management
- Ward occupancy summary
- Nurse and staff directory
- Discharge page

### Recommended dashboards

- Bed occupancy overview
- Department-wise bed usage
- Available beds per ward
- Occupied beds by department
- Admissions today / this week
- Discharge summary

## 9. Best long-term design

For maintainability, the project should keep the following structure:

- Patient module: patient lifecycle
- Doctor module: specialist profile and consultation flow
- Staff module: all non-doctor operational users including nurses
- Department module: department grouping
- Admission module: admission lifecycle
- Bed module: bed status and allocation
- Discharge module: release workflow
- Analytics module: BI and dashboard reporting

This keeps the system organized without splitting foundational operational flows across too many modules.

## 10. Final recommendation

The best system design for this project is:

- Keep doctors as a dedicated module
- Keep nurses under the staff model for the first version
- Use manual bed assignment through a controlled UI flow
- Add automated allocation later only when the business requires it
- Keep a central bed dashboard to simplify operations

This approach is consistent with the current codebase and makes front-end work more manageable.
