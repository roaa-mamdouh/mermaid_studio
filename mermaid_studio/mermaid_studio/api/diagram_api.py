import frappe
import json
import base64
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def get_diagrams(folder=None, is_template=0, search_text=None, limit=20, start=0):
    """Get diagrams with filters"""
    filters = {}
    
    if folder:
        filters["folder"] = folder
    
    filters["is_template"] = is_template
    
    # Add owner filter for non-public diagrams
    if not int(is_template):
        filters["owner"] = frappe.session.user
    
    # Search in title, description, or diagram_code
    if search_text:
        diagrams = frappe.get_list(
            "Diagram",
            filters=filters,
            or_filters=[
                {"title": ["like", f"%{search_text}%"]},
                {"description": ["like", f"%{search_text}%"]},
                {"diagram_code": ["like", f"%{search_text}%"]}
            ],
            fields=["name", "title", "diagram_type", "status", "is_public", 
                   "modified", "owner", "version", "thumbnail"],
            limit=limit,
            start=start,
            order_by="modified desc"
        )
    else:
        diagrams = frappe.get_list(
            "Diagram",
            filters=filters,
            fields=["name", "title", "diagram_type", "status", "is_public", 
                   "modified", "owner", "version", "thumbnail"],
            limit=limit,
            start=start,
            order_by="modified desc"
        )
    
    return diagrams

@frappe.whitelist()
def get_diagram(name):
    """Get a single diagram by name"""
    diagram = frappe.get_doc("Diagram", name)
    
    # Check permissions
    if not diagram.is_public and diagram.owner != frappe.session.user:
        # Check if diagram is shared with the user
        share = frappe.db.exists("Diagram Share", {
            "diagram": name,
            "shared_with": frappe.session.user
        })
        
        if not share:
            frappe.throw(_("You don't have permission to access this diagram"))
    
    return diagram

@frappe.whitelist()
def create_diagram(title, diagram_code, diagram_type=None, description=None, 
                  folder=None, is_public=0, is_template=0, tags=None, 
                  render_settings=None, thumbnail=None):
    """Create a new diagram"""
    diagram = frappe.new_doc("Diagram")
    diagram.title = title
    diagram.diagram_code = diagram_code
    diagram.diagram_type = diagram_type
    diagram.description = description
    diagram.folder = folder
    diagram.is_public = is_public
    diagram.is_template = is_template
    diagram.owner = frappe.session.user
    diagram.created_by = frappe.session.user
    
    if render_settings:
        diagram.render_settings = render_settings
    
    if thumbnail:
        diagram.thumbnail = thumbnail
    
    # Add tags if provided
    if tags:
        tags_list = json.loads(tags) if isinstance(tags, str) else tags
        for tag in tags_list:
            diagram.append("tags", {"tag": tag})
    
    diagram.insert()
    
    return diagram

@frappe.whitelist()
def update_diagram(name, title=None, diagram_code=None, diagram_type=None, 
                  description=None, folder=None, is_public=None, 
                  is_template=None, status=None, tags=None, 
                  render_settings=None, thumbnail=None):
    """Update an existing diagram"""
    diagram = frappe.get_doc("Diagram", name)
    
    # Check permissions
    if diagram.owner != frappe.session.user:
        # Check if diagram is shared with the user with write permissions
        share = frappe.db.get_value("Diagram Share", {
            "diagram": name,
            "shared_with": frappe.session.user,
            "permission_level": ["in", ["write", "admin"]]
        })
        
        if not share:
            frappe.throw(_("You don't have permission to edit this diagram"))
    
    # Update fields if provided
    if title is not None:
        diagram.title = title
    
    if diagram_code is not None:
        diagram.diagram_code = diagram_code
    
    if diagram_type is not None:
        diagram.diagram_type = diagram_type
    
    if description is not None:
        diagram.description = description
    
    if folder is not None:
        diagram.folder = folder
    
    if is_public is not None:
        diagram.is_public = is_public
    
    if is_template is not None:
        diagram.is_template = is_template
    
    if status is not None:
        diagram.status = status
    
    if render_settings is not None:
        diagram.render_settings = render_settings
    
    if thumbnail is not None:
        diagram.thumbnail = thumbnail
    
    # Update tags if provided
    if tags is not None:
        # Remove existing tags
        diagram.tags = []
        
        # Add new tags
        tags_list = json.loads(tags) if isinstance(tags, str) else tags
        for tag in tags_list:
            diagram.append("tags", {"tag": tag})
    
    diagram.save()
    
    return diagram

@frappe.whitelist()
def delete_diagram(name):
    """Delete a diagram"""
    diagram = frappe.get_doc("Diagram", name)
    
    # Check permissions
    if diagram.owner != frappe.session.user:
        frappe.throw(_("You don't have permission to delete this diagram"))
    
    frappe.delete_doc("Diagram", name)
    
    return {"success": True}

@frappe.whitelist()
def get_diagram_versions(diagram_name):
    """Get all versions of a diagram"""
    # Check permissions
    diagram = frappe.get_doc("Diagram", diagram_name)
    if diagram.owner != frappe.session.user and not diagram.is_public:
        # Check if diagram is shared with the user
        share = frappe.db.exists("Diagram Share", {
            "diagram": diagram_name,
            "shared_with": frappe.session.user
        })
        
        if not share:
            frappe.throw(_("You don't have permission to access this diagram"))
    
    versions = frappe.get_all(
        "Diagram Version",
        filters={"diagram": diagram_name},
        fields=["name", "version_number", "created_by", "created_on", "change_notes"],
        order_by="version_number desc"
    )
    
    return versions

@frappe.whitelist()
def get_version_diff(version1, version2=None):
    """Get diff between two versions"""
    v1 = frappe.get_doc("Diagram Version", version1)
    
    if version2:
        v2 = frappe.get_doc("Diagram Version", version2)
        return v1.get_diff(v2.name)
    else:
        return v1.get_diff()

@frappe.whitelist()
def restore_version(version_name):
    """Restore a specific version"""
    version = frappe.get_doc("Diagram Version", version_name)
    
    # Check permissions
    diagram = frappe.get_doc("Diagram", version.diagram)
    if diagram.owner != frappe.session.user:
        # Check if diagram is shared with the user with write permissions
        share = frappe.db.get_value("Diagram Share", {
            "diagram": version.diagram,
            "shared_with": frappe.session.user,
            "permission_level": ["in", ["write", "admin"]]
        })
        
        if not share:
            frappe.throw(_("You don't have permission to restore this version"))
    
    result = version.restore_version()
    
    return {"success": result}

@frappe.whitelist()
def share_diagram(diagram_name, user_email, permission_level="read", expiry_days=None):
    """Share a diagram with another user"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # Check permissions
    if diagram.owner != frappe.session.user:
        # Check if diagram is shared with the user with admin permissions
        share = frappe.db.get_value("Diagram Share", {
            "diagram": diagram_name,
            "shared_with": frappe.session.user,
            "permission_level": "admin"
        })
        
        if not share:
            frappe.throw(_("You don't have permission to share this diagram"))
    
    # Share the diagram
    share_token = diagram.share_with_user(user_email, permission_level, expiry_days)
    
    return {
        "success": True,
        "share_token": share_token
    }

@frappe.whitelist()
def export_diagram_svg(diagram_name):
    """Export diagram as SVG"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # This would typically call a server-side mermaid renderer
    # For now, we'll return the diagram code for client-side rendering
    return {
        "diagram_code": diagram.diagram_code,
        "diagram_type": diagram.diagram_type,
        "title": diagram.title
    }

@frappe.whitelist()
def get_public_diagram(share_token):
    """Get a diagram using a public share token"""
    share = frappe.db.get_value("Diagram Share", 
                               {"share_token": share_token}, 
                               ["diagram", "permission_level", "expires_on"],
                               as_dict=True)
    
    if not share:
        frappe.throw(_("Invalid share token"))
    
    # Check if share has expired
    if share.expires_on and frappe.utils.getdate(share.expires_on) < frappe.utils.getdate(now_datetime()):
        frappe.throw(_("This share link has expired"))
    
    diagram = frappe.get_doc("Diagram", share.diagram)
    
    # Add permission info to the response
    diagram.permission_level = share.permission_level
    
    return diagram 