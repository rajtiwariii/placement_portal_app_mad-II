from flask import Blueprint, jsonify, send_file, request
from backend.models import StudentProfile, Application
import csv
import io

export_bp = Blueprint('export', __name__)

@export_bp.route('/csv/<int:student_id>', methods=['GET'])
def export_student_applications_csv(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    applications = Application.query.filter_by(student_id=student.id).all()

    # Create an in-memory CSV buffer
    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV Header
    writer.writerow([
        'Application ID',
        'Student Roll No',
        'Student Name',
        'Company Name',
        'Job Title',
        'Application Date',
        'Status'
    ])

    # Write Application Rows
    for app in applications:
        writer.writerow([
            app.id,
            student.roll_number,
            student.full_name,
            app.drive.company.company_name,
            app.drive.job_title,
            app.application_date.strftime("%Y-%m-%d %H:%M:%S"),
            app.status
        ])

    output.seek(0)

    # Return CSV file directly as download response
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'placement_applications_{student.roll_number}.csv'
    )