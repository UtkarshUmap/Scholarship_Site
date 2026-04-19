  # Scholarship Management Website - Complete Feature Overview

  ================================================================================
  1. AUTHENTICATION & LOGIN SYSTEM
  ================================================================================

  Admin Login
  - Separate admin portal with username/password
  - Dashboard access with full control over all features

  Student Login/Registration
  - Self-registration with email and password
  - After registration, can complete profile with:
    * Roll Number (this will be  unique to each student so can be exploited to distinguish them if needed)
    * Name, Phone
    * Program (BTech, MTech, MSc, PhD)
    * Branch, Batch
  - Profile must be completed before applying for scholarships

  Academics Login
  - Separate portal for academics department staff
  - Can respond to document requests from admin
  (basically student need some docs from academics the admin will request academics to give particlar docs to paricular students then student will do their and will collect these docs and acad will mark the request as done or report the issue back if there is any)

  ================================================================================
  2. STUDENT WORKFLOW
  ================================================================================

  Profile Management
  - Students can view and edit their profile
  - roll number entered once
  - Program, branch, batch are saved and persisted

  Browse & Apply for Scholarships
  - View available internal scholarships (managed by admin) { these scholarships are added by the admin and are given by the college}
  - View external scholarships (from external providers) { these are external scholarshps provided by outer orgs , student can request to add these scholarhsips to portal to admin and admin approves }
  - Dynamic Forms: When applying, forms generate based on scholarship requirements:
    * File upload fields (for documents like income certificate, marksheet, etc.)
    * Text input fields
    * Number input fields
  - Student uploads required documents during application
  - Application is submitted with status "applied"

  Track Applications
  - View all submitted applications on dashboard
  - See application status: applied, pending,  accepted, rejected
  - Document upload progress shown (e.g., "3/4 Documents")

  Application Detail View
  - Click on any application to see full details
  - Document Window: Each document shows a preview pane (click to open full document)
  - Message Thread: If admin sends remarks on a document:
    * Admin message appears prominently at top
    * Student can see full message history below
    * Student can reply/explain
  - For documents needing changes:
    * Can upload new file
    * Can write explanation to admin
  - Can see general comments from admin on application

  Request External Scholarships
  - Students can request addition of external scholarships not in system
  - Fill form: scholarship name, provider, amount, required documents , official link
  - Admin reviews and approves/rejects

  ================================================================================
  3. ADMIN WORKFLOW
  ================================================================================

  Dashboard
  ---  design some good dashboard according to you

  Scholarship Management
  - Create Scholarship: Add new scholarships with:
    * Name, Provider, Amount
    * Eligibility criteria
    * Deadline
    * Financial years
    * Dynamic Documents: Define required documents with:
      - Document name
      - Type: file, text, or number
      - Required or optional
      - Description/placeholder
    * Activate/deactivate
  - Edit/Delete existing scholarships

  {also the frequently used docs should be there in dropdown to add them quickly in the scholarship requirements}

  Student Management
  - View all imported students
  - Search by roll number, name, branch, program
  - See student details and their applications
  - Import students via CSV upload { this is basically they also want to see the old data on website that theyve stored on the excel sheet before they will import it though the csv also they should be able to export the data on the site}


  Application Processing
  - View all applications with filtering:
    By different stuffs
  - Application Detail Modal:
    * View student information
    * View scholarship details
    * Document Verification Section:
      - Each document shows preview pane (click to view uploaded file)
      - Status badges: pending, verified, rejected, needs_changes
      - See admin remarks and student replies in message thread
      - Actions: Verify, Reject, Needs Changes (with remarks)
    * Send Messages: Send general comments to student
    * Bulk Actions: Update status of multiple applications

  External Scholarship Requests
  - View requests from students for external scholarships
  - Approve or reject requests
  - If approved, scholarship gets added to system

  Document Requests (to Academics)
  - Admin can request specific documents from academics department
  - For specific students
  - Academics can respond with documents or mark complete

  Settings
  - Configure financial years
  - Manage system settings
  - limit of number of scholarship a student can apply

  ================================================================================
  4. ACADEMICS WORKFLOW
  ================================================================================

  Login
  - Separate academics login portal

  Document Requests
  - View document requests from admin
  - See which student documents are needed
  - provide documents
  - Mark requests as complete

  ================================================================================
  5. PUBLIC FEATURES
  ================================================================================

  Public Scholarship List
  - Anyone can view available scholarships (without login)
  - See scholarship details, eligibility, required documents
  - External link to apply if the scholarship is external


  ================================================================================
  6. KEY SYSTEM FEATURES
  ================================================================================

  Document Management
  - File uploads for scholarship applications
  - Documents stored with metadata (type, size, original name)
  - Document status tracking: pending → verified/rejected/needs_changes
  - Message thread on each document between admin and student

  Dynamic Forms
  - Scholarship defines required documents with types (file/text/number)
  - Application form generates accordingly
  - Fields required/optional based on scholarship config

  Data Import
  - Admin can import student data via CSV
  - Batch import of multiple students at once


  Financial Year Management
  - Track applications by financial year
  - Filter by financial year in admin views

  ================================================================================
  7. USER ENTITIES SUMMARY
  ================================================================================

  1. ADMIN - Full system access, manages everything
  2. STUDENT - Self-register, apply, track applications, respond to admin messages
  3. ACADEMICS - Respond to document requests from admin
  4. PUBLIC - View scholarship list (read-only)

  ================================================================================
  8. DATA MODELS
  ================================================================================
  make efficient database that will be able to store all the requred things properly and efficiently like the documents of particular stdent for a particular scholarship
