from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models import User, CompanyProfile, PlacementDrive, StudentProfile, Application

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    total_students = StudentProfile.query.count()
    total_companies = CompanyProfile.query.count()
    total_drives = PlacementDrive.query.count()
    
    return jsonify({
        "total_students": total_students,
        "total_companies": total_companies,
        "total_drives": total_drives
    }), 200

@admin_bp.route('/companies', methods=['GET'])
def get_companies():
    companies = CompanyProfile.query.all()
    result = []
    for c in companies:
        result.append({
            "id": c.id,
            "user_id": c.user_id,
            "company_name": c.company_name,
            "hr_contact": c.hr_contact,
            "website": c.website,
            "approval_status": c.approval_status,
            "is_active": c.user.active if c.user else False
        })
    return jsonify(result), 200

@admin_bp.route('/company/approve/<int:company_id>', methods=['POST'])
def approve_company(company_id):
    company = CompanyProfile.query.get_or_404(company_id)
    data = request.get_json() or {}
    status = data.get('status', 'Approved') # Approved / Rejected
    
    company.approval_status = status
    db.session.commit()
    return jsonify({"message": f"Company status updated to {status}"}), 200

@admin_bp.route('/drives', methods=['GET'])
def get_drives():
    drives = PlacementDrive.query.all()
    result = []
    for d in drives:
        # Safe Deadline formatting (handles both string and datetime/date objects)
        deadline_str = d.deadline.strftime("%Y-%m-%d") if hasattr(d.deadline, 'strftime') else str(d.deadline)
        
        result.append({
            "id": d.id,
            "company_name": d.company.company_name if d.company else "N/A",
            "job_title": d.job_title,
            "job_description": d.job_description,
            "min_cgpa": d.min_cgpa,
            "eligible_branch": d.eligible_branch,
            "deadline": deadline_str,
            "status": d.status
        })
    return jsonify(result), 200

@admin_bp.route('/drive/approve/<int:drive_id>', methods=['POST'])
def approve_drive(drive_id):
    drive = PlacementDrive.query.get_or_404(drive_id)
    data = request.get_json() or {}
    status = data.get('status', 'Approved') # Approved / Rejected
    
    drive.status = status
    db.session.commit()
    return jsonify({"message": f"Drive status updated to {status}"}), 200

@admin_bp.route('/toggle-blacklist/<int:user_id>', methods=['POST'])
def toggle_blacklist(user_id):
    user = User.query.get_or_404(user_id)
    user.active = not user.active
    db.session.commit()
    return jsonify({
        "message": f"User status changed. Active: {user.active}",
        "active": user.active
    }), 200