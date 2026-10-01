from celery import shared_task
from backend.models import CompanyProfile, PlacementDrive, Application

@shared_task
def send_monthly_activity_report():
    companies = CompanyProfile.query.filter_by(approval_status='Approved').all()
    
    summary = []
    for company in companies:
        drives_count = len(company.drives)
        total_apps = sum(len(d.applications) for d in company.drives)
        summary.append({
            "company": company.company_name,
            "drives": drives_count,
            "total_applications": total_apps
        })

    print(f"[MONTHLY REPORT LOG] Summary report compiled: {summary}")
    return "Monthly report task executed successfully."