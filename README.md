# Placement Portal - MAD 2 Project

A comprehensive web application designed to streamline campus recruitment processes. Built as part of the IIT Madras Modern Web Application Development (MAD 2) course using **Flask**, **Vue.js**, **SQLite**, and **Celery**.

---

## 🚀 Features

### 1. **Student Module**
* **Profile Management:** Update personal details, academic metrics (CGPA, Branch, Roll Number), and resume URL/path.
* **Placement Drives:** View eligible placement drives filtered by CGPA and branch criteria.
* **Application Tracking:** Track application status for applied drives in real-time.

### 2. **Company / HR Module**
* **Drive Creation:** Submit new job drives with job descriptions, minimum CGPA requirements, and deadline dates.
* **Applicant Review:** View applied students, inspect their profiles, and review uploaded resumes.
* **Status Updates:** Manage student application statuses (Shortlisted, Selected, Rejected).

### 3. **Admin Module**
* Approve or reject newly registered companies and placement drives.
* Monitor global placement statistics and system activity.

### 4. **Background Tasks (Celery & Redis)**
* **CSV Export:** Asynchronously export drive details and applicant lists to CSV files.
* **Daily Reminders:** Automated reminders sent to students with pending applications.
* **Monthly Activity Reports:** Summary performance and engagement metrics generated periodically.

---

## 🛠️ Tech Stack

* **Backend:** Python (Flask), Flask-SQLAlchemy, Flask-Security
* **Frontend:** Vue.js 3, Bootstrap 5, HTML5, JavaScript (ES6+)
* **Database:** SQLite
* **Task Queue / Async Jobs:** Celery, Redis
* **Deployment Server:** Gunicorn

---

## 📁 Project Structure

```text
PLACEMENT PORTAL APP/
│
├── backend/
│   ├── api/
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── company.py
│   │   ├── export.py
│   │   └── student.py
│   ├── tasks/
│   │   ├── celery_worker.py
│   │   ├── csv_export.py
│   │   ├── daily_reminders.py
│   │   └── monthly_reports.py
│   ├── database.py
│   ├── models.py
│   └── security.py
│
├── frontend/
│   ├── components/
│   │   ├── AdminDashboard.js
│   │   ├── CompanyDashboard.js
│   │   ├── Login.js
│   │   ├── Navbar.js
│   │   ├── Profile.js
│   │   ├── RegisterCompany.js
│   │   ├── RegisterStudent.js
│   │   ├── Statistics.js
│   │   └── StudentDashboard.js
│   ├── app.js
│   ├── index.html
│   └── router.js
│
├── instance/
│   └── database.db
│
├── app.py
├── config.py
├── Procfile
├── README.md
└── requirements.txt