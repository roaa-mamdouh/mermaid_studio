import frappe
 
def has_app_permission():
    """Check if user has permission to access Mermaid Studio app"""
    # Allow all authenticated users to access the app
    # You can modify this to restrict access based on roles if needed
    return frappe.session.user != "Guest" 