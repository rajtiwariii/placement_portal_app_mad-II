from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models import StudentProfile, PlacementDrive, Application

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile/<int:student_id>', methods=['GET'])
def get_student_profile(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    return jsonify({
        "student_id": student.id,
        "full_name": student.full_name or '',
        "roll_number": student.roll_number or '',
        "branch": student.branch or '',
        "cgpa": student.cgpa or 0.0,
        "resume_path": student.resume_path or '',
        "resume_url": student.resume_path or ''
    }), 200

@student_bp.route('/profile/update/<int:student_id>', methods=['POST'])
def update_profile(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    data = request.get_json() or {}

    if 'full_name' in data: 
        student.full_name = data['full_name']
    if 'roll_number' in data and data['roll_number']: 
        student.roll_number = data['roll_number']
    if 'branch' in data: 
        student.branch = data['branch']
    if 'cgpa' in data: 
        student.cgpa = float(data['cgpa'])
    
    # Check both potential key names from payload
    resume_val = data.get('resume_path') or data.get('resume_url') or data.get('resume')
    if resume_val is not None:
        student.resume_path = resume_val

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully!",
        "profile": {
            "student_id": student.id,
            "full_name": student.full_name,
            "roll_number": student.roll_number,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "resume_path": student.resume_path or '',
            "resume_url": student.resume_path or ''
        }
    }), 200

@student_bp.route('/drives/<int:student_id>', methods=['GET'])
def get_eligible_drives(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    drives = PlacementDrive.query.filter_by(status='Approved').filter(
        PlacementDrive.min_cgpa <= student.cgpa
    ).all()
    
    result = []
    for d in drives:
        if d.eligible_branch == 'All' or d.eligible_branch == student.branch:
            deadline_str = d.deadline.strftime("%Y-%m-%d") if hasattr(d.deadline, 'strftime') else str(d.deadline)
            result.append({
                "id": d.id,
                "company_name": d.company.company_name if d.company else "N/A",
                "job_title": d.job_title,
                "job_description": d.job_description,
                "min_cgpa": d.min_cgpa,
                "eligible_branch": d.eligible_branch,
                "deadline": deadline_str
            })
    return jsonify(result), 200

@student_bp.route('/apply', methods=['POST'])
def apply_drive():
    data = request.get_json() or {}
    student_id = data.get('student_id')
    drive_id = data.get('drive_id')

    if not student_id or not drive_id:
        return jsonify({"message": "Invalid request payload"}), 400

    existing = Application.query.filter_by(student_id=student_id, drive_id=drive_id).first()
    if existing:
        return jsonify({"message": "You have already applied for this placement drive!"}), 400

    new_application = Application(
        student_id=student_id,
        drive_id=drive_id,
        status='Applied'
    )
    db.session.add(new_application)
    db.session.commit()

    return jsonify({"message": "Application submitted successfully!"}), 201

@student_bp.route('/applications/<int:student_id>', methods=['GET'])
def get_applications(student_id):
    apps = Application.query.filter_by(student_id=student_id).all()
    result = []
    for a in apps:
        date_str = a.application_date.strftime("%Y-%m-%d") if hasattr(a.application_date, 'strftime') else str(a.application_date or 'N/A')
        
        result.append({
            "id": a.id,
            "company_name": a.drive.company.company_name if (a.drive and a.drive.company) else "N/A",
            "job_title": a.drive.job_title if a.drive else "N/A",
            "applied_date": date_str,
            "status": a.status
        })
    return jsonify(result), 200