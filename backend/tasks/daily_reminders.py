from celery import shared_task
from backend.models import StudentProfile, PlacementDrive, Application

@shared_task
def send_daily_reminders():
    # Finds students with zero applications
    all_students = StudentProfile.query.all()
    pending_reminders = []

    for student in all_students:
        applied_count = Application.query.filter_by(student_id=student.id).count()
        if applied_count == 0:
            pending_reminders.append(student.user.email)

    # In actual deployment, integrated with Webhooks / Google Chat / Mailtrap
    print(f"[DAILY REMINDER LOG] Sent reminder to {len(pending_reminders)} students without applications.")
    return f"Reminders processed for {len(pending_reminders)} students."