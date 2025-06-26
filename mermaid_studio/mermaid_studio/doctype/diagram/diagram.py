import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime
import json

class Diagram(Document):
    def validate(self):
        # Set default values if not provided
        if not self.version:
            self.version = 1
        
        if not self.status:
            self.status = "draft"
        
        if not self.diagram_type and self.diagram_code:
            self.detect_diagram_type()
        
        self.last_rendered = now_datetime()
    
    def detect_diagram_type(self):
        """Auto-detect diagram type from code"""
        code = self.diagram_code.strip().lower()
        
        if code.startswith("graph ") or code.startswith("flowchart "):
            self.diagram_type = "flowchart"
        elif code.startswith("sequencediagram"):
            self.diagram_type = "sequence"
        elif code.startswith("classdiagram"):
            self.diagram_type = "class"
        elif code.startswith("statediagram"):
            self.diagram_type = "state"
        elif code.startswith("gantt"):
            self.diagram_type = "gantt"
        elif code.startswith("pie"):
            self.diagram_type = "pie"
        else:
            self.diagram_type = "other"
    
    def on_update(self):
        """Create version history when diagram is updated"""
        if self.has_value_changed("diagram_code"):
            self.version = self.version + 1
            self.create_version_history()
    
    def create_version_history(self):
        """Create a new version record"""
        frappe.get_doc({
            "doctype": "Diagram Version",
            "diagram": self.name,
            "version_number": self.version,
            "diagram_code": self.diagram_code,
            "created_by": frappe.session.user,
            "created_on": now_datetime()
        }).insert(ignore_permissions=True)
    
    def generate_share_token(self):
        """Generate a unique token for sharing"""
        import uuid
        import hashlib
        
        unique_id = str(uuid.uuid4())
        token = hashlib.md5(f"{self.name}{unique_id}".encode()).hexdigest()
        
        return token
    
    def share_with_user(self, user_email, permission_level="read", expiry_days=None):
        """Share diagram with another user"""
        expires_on = None
        if expiry_days:
            expires_on = frappe.utils.add_days(now_datetime(), expiry_days)
        
        share_token = self.generate_share_token()
        
        frappe.get_doc({
            "doctype": "Diagram Share",
            "diagram": self.name,
            "shared_with": user_email,
            "permission_level": permission_level,
            "expires_on": expires_on,
            "share_token": share_token
        }).insert(ignore_permissions=True)
        
        return share_token
        
    @frappe.whitelist()
    def generate_preview(self):
        """Generate a preview of the diagram"""
        try:
            # Update last_rendered timestamp
            self.last_rendered = now_datetime()
            self.save()
            
            return {
                "success": True,
                "message": "Preview generated successfully",
                "diagram_code": self.diagram_code,
                "diagram_type": self.diagram_type
            }
        except Exception as e:
            frappe.log_error(f"Error generating diagram preview: {str(e)}", "Diagram Preview Error")
            return {
                "success": False,
                "message": f"Error generating preview: {str(e)}"
            } 