import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=True)
def get_diagrams(filters=None, fields=None, order_by=None):
    """Get diagrams based on filters"""
    if not fields:
        fields = ["name", "title", "diagram_type", "modified", "owner"]
    
    # Ensure user has permission
    if filters and isinstance(filters, dict) and filters.get("is_template") != 1:
        # For non-templates, only show user's own diagrams unless they're an Admin
        if frappe.session.user != "Administrator":
            filters["owner"] = frappe.session.user
    
    # For templates, only show public ones unless user is Admin
    if filters and isinstance(filters, dict) and filters.get("is_template") == 1:
        if frappe.session.user != "Administrator":
            filters["is_public"] = 1
    
    try:
        diagrams = frappe.get_list(
            "Diagram",
            filters=filters,
            fields=fields,
            order_by=order_by or "modified desc"
        )
        return diagrams
    except frappe.PermissionError:
        # Return empty list if no permission
        return []
    except Exception as e:
        frappe.log_error(f"Error getting diagrams: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error fetching diagrams"))

@frappe.whitelist(allow_guest=True)
def get_diagram(name):
    """Get a specific diagram by name"""
    try:
        # Check if user has permission to access this diagram
        diagram = frappe.get_doc("Diagram", name)
        
        # Check permissions
        if not (diagram.owner == frappe.session.user or 
                diagram.is_public or 
                frappe.session.user == "Administrator"):
            frappe.throw(_("You don't have permission to access this diagram"))
        
        return diagram
    except Exception as e:
        frappe.log_error(f"Error getting diagram {name}: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error fetching diagram"))

@frappe.whitelist(allow_guest=True)
def create_diagram(title, diagram_type, diagram_code, is_public=0, is_template=0, description=None, folder=None):
    """Create a new diagram"""
    try:
        diagram = frappe.new_doc("Diagram")
        diagram.title = title
        diagram.diagram_type = diagram_type
        diagram.diagram_code = diagram_code
        diagram.is_public = is_public
        diagram.is_template = is_template
        
        if description:
            diagram.description = description
        
        if folder:
            diagram.folder = folder
        
        diagram.owner = frappe.session.user
        diagram.created_by = frappe.session.user
        
        diagram.insert()
        
        return diagram
    except Exception as e:
        frappe.log_error(f"Error creating diagram: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error creating diagram"))

@frappe.whitelist(allow_guest=True)
def update_diagram(name, title=None, diagram_type=None, diagram_code=None, is_public=None, is_template=None, description=None, folder=None):
    """Update an existing diagram"""
    try:
        diagram = frappe.get_doc("Diagram", name)
        
        # Check permissions
        if not (diagram.owner == frappe.session.user or frappe.session.user == "Administrator"):
            frappe.throw(_("You don't have permission to update this diagram"))
        
        if title is not None:
            diagram.title = title
        
        if diagram_type is not None:
            diagram.diagram_type = diagram_type
        
        if diagram_code is not None:
            diagram.diagram_code = diagram_code
        
        if is_public is not None:
            diagram.is_public = is_public
        
        if is_template is not None:
            diagram.is_template = is_template
        
        if description is not None:
            diagram.description = description
        
        if folder is not None:
            diagram.folder = folder
        
        diagram.save()
        
        return diagram
    except Exception as e:
        frappe.log_error(f"Error updating diagram {name}: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error updating diagram"))

@frappe.whitelist(allow_guest=True)
def delete_diagram(name):
    """Delete a diagram"""
    try:
        diagram = frappe.get_doc("Diagram", name)
        
        # Check permissions
        if not (diagram.owner == frappe.session.user or frappe.session.user == "Administrator"):
            frappe.throw(_("You don't have permission to delete this diagram"))
        
        frappe.delete_doc("Diagram", name)
        
        return {"success": True}
    except Exception as e:
        frappe.log_error(f"Error deleting diagram {name}: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error deleting diagram"))

@frappe.whitelist(allow_guest=True)
def share_diagram(diagram, email, permission_level="read", expiry_days=None):
    """Share a diagram with another user"""
    try:
        diagram_doc = frappe.get_doc("Diagram", diagram)
        
        # Check permissions
        if not (diagram_doc.owner == frappe.session.user or frappe.session.user == "Administrator"):
            frappe.throw(_("You don't have permission to share this diagram"))
        
        # Generate share token
        import uuid
        import hashlib
        
        unique_id = str(uuid.uuid4())
        token = hashlib.md5(f"{diagram}{unique_id}".encode()).hexdigest()
        
        # Calculate expiry date if provided
        expires_on = None
        if expiry_days:
            expires_on = frappe.utils.add_days(now_datetime(), expiry_days)
        
        # Create share record
        share = frappe.get_doc({
            "doctype": "Diagram Share",
            "diagram": diagram,
            "shared_with": email,
            "permission_level": permission_level,
            "expires_on": expires_on,
            "share_token": token
        })
        
        share.insert(ignore_permissions=True)
        
        # Send email notification
        send_share_notification(diagram_doc, email, token)
        
        return {"success": True, "token": token}
    except Exception as e:
        frappe.log_error(f"Error sharing diagram {diagram}: {str(e)}", "Diagram API Error")
        frappe.throw(_("Error sharing diagram"))

def send_share_notification(diagram, email, token):
    """Send email notification for shared diagram"""
    try:
        subject = f"Diagram shared with you: {diagram.title}"
        
        # Create view URL
        view_url = f"{frappe.utils.get_url()}/mermaid-studio/view/{diagram.name}?token={token}"
        
        message = f"""
        <p>Hello,</p>
        <p>{frappe.session.user} has shared a Mermaid diagram with you: <strong>{diagram.title}</strong></p>
        <p>Click the link below to view the diagram:</p>
        <p><a href="{view_url}" style="padding: 8px 16px; background-color: #6366F1; color: white; text-decoration: none; border-radius: 4px;">View Diagram</a></p>
        <p>Or copy this link: {view_url}</p>
        <p>Thank you,<br>Mermaid Studio</p>
        """
        
        frappe.sendmail(
            recipients=[email],
            subject=subject,
            message=message
        )
    except Exception as e:
        frappe.log_error(f"Error sending share notification: {str(e)}", "Diagram API Error")
        # Don't throw here, just log the error
