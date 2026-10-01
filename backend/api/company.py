from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.database import db
from backend.models import CompanyProfile, PlacementDrive, Application

company_bp = Blueprint('company', __name__)

@company_bp.route('/drive/create', methods=['POST'])
def create_drive():
    data = request.get_json() or {}
    company_id = data.get('company_id')
    
    company = CompanyProfile.query.get_or_404(company_id)
    if company.approval_status != 'Approved':
        return jsonify({"message": "Only admin-approved companies can create drives"}), 403

    deadline = datetime.strptime(data.get('deadline'), "%Y-%m-%d")

    drive = PlacementDrive(
        company_id=company_id,
        job_title=data.get('job_title'),
        job_description=data.get('job_description'),
        min_cgpa=float(data.get('min_cgpa', 0.0)),
        eligible_branch=data.get('eligible_branch', 'All'),
        deadline=deadline,
        status='Pending'
    )
    db.session.add(drive)
    db.session.commit()

    return jsonify({"message": "Drive created successfully! Awaiting Admin approval."}), 201


@company_bp.route('/drives/<int:company_id>', methods=['GET'])
def get_company_drives(company_id):
    drives = PlacementDrive.query.filter_by(company_id=company_id).all()
    result = []
    for d in drives:
        deadline_str = d.deadline.strftime("%Y-%m-%d") if hasattr(d.deadline, 'strftime') else str(d.deadline)
        result.append({
            "id": d.id,
            "job_title": d.job_title,
            "job_description": d.job_description,
            "min_cgpa": d.min_cgpa,
            "eligible_branch": d.eligible_branch,
            "deadline": deadline_str,
            "status": d.status,
            "applicant_count": len(d.applications)
        })
    return jsonify(result), 200


@company_bp.route('/applications/<int:drive_id>', methods=['GET'])
def get_drive_applications(drive_id):
    applications = Application.query.filter_by(drive_id=drive_id).all()
    result = []
    for app in applications:
        student = app.student
        
        # Extracts application_date cleanly
        app_date = getattr(app, 'application_date', None)
        date_str = app_date.strftime("%Y-%m-%d") if hasattr(app_date, 'strftime') else str(app_date or 'N/A')

        # Safely extract student resume from resume_path (column name in models.py)
        student_resume = getattr(student, 'resume_path', '') or getattr(student, 'resume_url', '') if student else ''

        result.append({
            "application_id": app.id,
            "student_id": student.id if student else None,
            "student_name": getattr(student, 'full_name', 'N/A'),
            "roll_number": getattr(student, 'roll_number', 'N/A'),
            "branch": getattr(student, 'branch', 'N/A'),
            "cgpa": getattr(student, 'cgpa', 'N/A'),
            "resume_path": student_resume,
            "resume_url": student_resume,  # Provides compatibility with both field names
            "application_date": date_str,
            "status": app.status
        })
    return jsonify(result), 200


@company_bp.route('/application/status/<int:app_id>', methods=['POST'])
def update_application_status(app_id):
    app = Application.query.get_or_404(app_id)
    data = request.get_json() or {}
    new_status = data.get('status')
    
    app.status = new_status
    db.session.commit()
    return jsonify({"message": f"Application status updated to {new_status}"}), 200