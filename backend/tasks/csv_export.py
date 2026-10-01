import csv
import os
from celery import shared_task
from backend.models import PlacementDrive, Application

@shared_task
def export_drive_details_csv(drive_id):
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return "Drive not found"

    filename = f"exports/drive_{drive_id}_details.csv"
    os.makedirs("exports", exist_ok=True)

    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Application ID", "Student Name", "Roll Number", "Branch", "CGPA", "Status"])
        
        for app in drive.applications:
            student = app.student
            writer.writerow([
                app.id,
                student.full_name if student else 'N/A',
                student.roll_number if student else 'N/A',
                student.branch if student else 'N/A',
                student.cgpa if student else 'N/A',
                app.status
            ])

    return f"CSV successfully generated at {filename}"