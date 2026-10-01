from flask import Blueprint, request, jsonify
from flask_security.utils import verify_password, hash_password
import uuid
from backend.database import db
from backend.security import user_datastore
from backend.models import User, StudentProfile, CompanyProfile

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register/student', methods=['POST'])
def register_student():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    roll_number = data.get('roll_number')
    branch = data.get('branch')
    cgpa = float(data.get('cgpa', 0.0))

    if user_datastore.find_user(email=email):
        return jsonify({"message": "User with this email already exists"}), 400

    user = user_datastore.create_user(
        email=email,
        password=hash_password(password),
        roles=['student'],
        fs_uniquifier=str(uuid.uuid4())
    )
    
    student = StudentProfile(
        user=user,
        full_name=full_name,
        roll_number=roll_number,
        branch=branch,
        cgpa=cgpa
    )
    db.session.add(student)
    db.session.commit()

    return jsonify({"message": "Student registered successfully!"}), 201


@auth_bp.route('/register/company', methods=['POST'])
def register_company():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    company_name = data.get('company_name')
    hr_contact = data.get('hr_contact')
    website = data.get('website')

    if user_datastore.find_user(email=email):
        return jsonify({"message": "User with this email already exists"}), 400

    user = user_datastore.create_user(
        email=email,
        password=hash_password(password),
        roles=['company'],
        fs_uniquifier=str(uuid.uuid4())
    )
    
    company = CompanyProfile(
        user=user,
        company_name=company_name,
        hr_contact=hr_contact,
        website=website,
        approval_status='Pending'
    )
    db.session.add(company)
    db.session.commit()

    return jsonify({"message": "Company registered successfully! Awaiting Admin approval."}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    user = user_datastore.find_user(email=email)
    
    # SAHI ORDER: verify_password(plain_password, hashed_password_from_db)
    if not user or not verify_password(password, user.password):
        return jsonify({"message": "Invalid email or password"}), 401

    if not user.active:
        return jsonify({"message": "Account has been deactivated/blacklisted by Admin"}), 403

    role_names = [role.name for role in user.roles]
    role = role_names[0] if role_names else 'student'

    profile_data = {}
    if role == 'company' and user.company_profile:
        profile_data = {
            "company_id": user.company_profile.id,
            "company_name": user.company_profile.company_name,
            "approval_status": user.company_profile.approval_status
        }
    elif role == 'student' and user.student_profile:
        profile_data = {
            "student_id": user.student_profile.id,
            "full_name": user.student_profile.full_name,
            "roll_number": user.student_profile.roll_number,
            "branch": user.student_profile.branch,
            "cgpa": user.student_profile.cgpa
        }

    return jsonify({
        "message": "Login successful",
        "auth_token": user.get_auth_token(),
        "user_id": user.id,
        "email": user.email,
        "role": role,
        "profile": profile_data
    }), 200