from django.core.management.base import BaseCommand
from accounts.models import User
from companies.models import Company
from applications.models import Application


class Command(BaseCommand):
    help = "Seed initial database with admin, sample student, and participating companies"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding TKRCET Job Mela 2026 data...")

        # Create Admin
        admin_email = "admin@tkrcet.ac.in"
        admin_user = User.objects.filter(email=admin_email).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password="admin@07",
                full_name="TKRCET Job Mela Admin",
                mobile="9949139414",
                college="TKR College of Engineering & Technology",
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created superuser/admin: {admin_email} / admin@07"
                )
            )
        else:
            self.stdout.write(f"Admin already exists: {admin_email}")

        # Create Sample Student
        student_email = "student@tkrcet.ac.in"
        student_user = User.objects.filter(email=student_email).first()
        if not student_user:
            student_user = User.objects.create_user(
                email=student_email,
                password="student123",
                full_name="Rahul Sharma",
                mobile="9876543210",
                qualification="B.Tech (CSE)",
                college="TKR College of Engineering & Technology",
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created demo student: {student_email} / student123"
                )
            )
        else:
            self.stdout.write(f"Student already exists: {student_email}")

        # Initial participating companies
        company_names = [
            "Tata Consultancy Services (TCS)",
            "Infosys",
            "HCLTech",
            "Wipro Technologies",
            "Cognizant Technology Solutions",
            "Accenture Solutions",
            "Capgemini India",
            "Tech Mahindra",
            "L&T Technology Services",
            "Cyient Technologies",
            "Genpact",
            "Persistent Systems",
            "DXC Technology",
            "Virtusa Consulting Services",
            "Hexaware Technologies",
            "Mphasis Limited",
            "Mindtree LTIMindtree",
            "Oracle Financial Services",
            "Zoho Corporation",
            "CGI Information Systems",
            "KPIT Technologies",
            "Birlasoft",
            "Sonata Software",
            "Zensar Technologies",
            "Sasken Technologies",
            "CitiusTech",
            "Tata Elxsi",
            "BOSCH Global Software",
            "Schneider Electric",
            "Siemens Technology India",
        ]

        created_count = 0
        existing_count = 0
        company_objects = []

        for name in company_names:
            company, created = Company.objects.get_or_create(name=name)
            company_objects.append(company)
            if created:
                created_count += 1
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Companies seeded: {created_count} new, {existing_count} already existed. Total: {Company.objects.count()}"
            )
        )

        # Seed sample application for demo student to TCS and Infosys if not applied
        if student_user and len(company_objects) >= 2:
            Application.objects.get_or_create(
                student=student_user, company=company_objects[0]
            )
            Application.objects.get_or_create(
                student=student_user, company=company_objects[1]
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created sample applications for {student_email}"
                )
            )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
