# Copyright (c) 2023, Frappe and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class DiagramShare(Document):
    def validate(self):
        # Validate that the diagram exists
        if not frappe.db.exists("Diagram", self.diagram):
            frappe.throw(frappe._("Diagram {0} does not exist").format(self.diagram))
        
        # Validate that the share token is unique
        if frappe.db.exists("Diagram Share", {"share_token": self.share_token, "name": ["!=", self.name]}):
            frappe.throw(frappe._("Share token already exists"))
        
        # Validate expiry date
        if self.expires_on and frappe.utils.getdate(self.expires_on) < frappe.utils.getdate():
            frappe.throw(frappe._("Expiry date cannot be in the past"))
    
    def after_insert(self):
        # Log the sharing activity
        frappe.log_error(
            message=f"Diagram {self.diagram} shared with {self.shared_with} by {frappe.session.user}",
            title="Diagram Shared"
        )
    
    def on_trash(self):
        # Log the deletion of share
        frappe.log_error(
            message=f"Share of diagram {self.diagram} with {self.shared_with} deleted by {frappe.session.user}",
            title="Diagram Share Deleted"
        )
    
    def validate_expiry(self):
        """Ensure expiry date is in the future"""
        if self.expires_on and frappe.utils.getdate(self.expires_on) < frappe.utils.getdate(now_datetime()):
            frappe.throw("Expiry date must be in the future")
    
    def validate_share_token(self):
        """Ensure share token is unique"""
        if not self.share_token:
            self.generate_share_token()
        else:
            existing = frappe.db.exists("Diagram Share", {"share_token": self.share_token, "name": ["!=", self.name]})
            if existing:
                self.generate_share_token()
    
    def generate_share_token(self):
        """Generate a unique token for sharing"""
        import uuid
        import hashlib
        
        unique_id = str(uuid.uuid4())
        self.share_token = hashlib.md5(f"{self.diagram}{unique_id}".encode()).hexdigest()
    
    def is_expired(self):
        """Check if share has expired"""
        if not self.expires_on:
            return False
        
        return frappe.utils.getdate(self.expires_on) < frappe.utils.getdate(now_datetime())
    
    def get_access_level(self):
        """Get access level for this share"""
        if self.is_expired():
            return None
        
        return self.permission_level 