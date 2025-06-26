import frappe
import json
import os
import tempfile
import subprocess
from frappe import _
from frappe.utils import get_site_path, get_files_path
from frappe.utils.file_manager import save_file

@frappe.whitelist()
def export_as_svg(diagram_name):
    """Export diagram as SVG"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # For now, we'll return the diagram code for client-side rendering
    # In a production environment, you would use a server-side renderer
    return {
        "diagram_code": diagram.diagram_code,
        "diagram_type": diagram.diagram_type,
        "title": diagram.title
    }

@frappe.whitelist()
def export_as_png(diagram_name, width=800, height=600, scale=2):
    """Export diagram as PNG using puppeteer"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # In a production environment, this would use puppeteer or another
    # headless browser to render the SVG and convert to PNG
    # For now, we'll just return a placeholder message
    return {
        "message": "PNG export would be implemented with server-side rendering",
        "diagram_code": diagram.diagram_code
    }

@frappe.whitelist()
def export_as_pdf(diagram_name):
    """Export diagram as PDF"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # Similar to PNG export, this would use a headless browser
    # For now, we'll just return a placeholder message
    return {
        "message": "PDF export would be implemented with server-side rendering",
        "diagram_code": diagram.diagram_code
    }

@frappe.whitelist()
def export_as_mmd(diagram_name):
    """Export diagram as .mmd file (Mermaid Markdown)"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix='.mmd', delete=False) as temp_file:
        temp_file.write(diagram.diagram_code.encode('utf-8'))
        temp_file_path = temp_file.name
    
    # Save the file to Frappe's file manager
    file_name = f"{diagram.title.replace(' ', '_')}.mmd"
    file_url = save_file(
        file_name,
        open(temp_file_path, 'rb').read(),
        "Diagram",
        diagram_name,
        is_private=1
    ).file_url
    
    # Clean up the temporary file
    os.unlink(temp_file_path)
    
    return {
        "file_url": file_url,
        "file_name": file_name
    }

@frappe.whitelist()
def export_as_json(diagram_name):
    """Export diagram as JSON"""
    diagram = frappe.get_doc("Diagram", diagram_name)
    
    # Create a JSON representation
    diagram_json = {
        "title": diagram.title,
        "description": diagram.description,
        "diagram_code": diagram.diagram_code,
        "diagram_type": diagram.diagram_type,
        "version": diagram.version,
        "created_by": diagram.created_by,
        "created_at": str(diagram.creation),
        "tags": [tag.tag for tag in diagram.tags]
    }
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as temp_file:
        temp_file.write(json.dumps(diagram_json, indent=2).encode('utf-8'))
        temp_file_path = temp_file.name
    
    # Save the file to Frappe's file manager
    file_name = f"{diagram.title.replace(' ', '_')}.json"
    file_url = save_file(
        file_name,
        open(temp_file_path, 'rb').read(),
        "Diagram",
        diagram_name,
        is_private=1
    ).file_url
    
    # Clean up the temporary file
    os.unlink(temp_file_path)
    
    return {
        "file_url": file_url,
        "file_name": file_name
    }

@frappe.whitelist()
def import_from_mmd(file_url, title=None, folder=None, is_public=0):
    """Import diagram from .mmd file"""
    file_path = get_site_path() + file_url
    
    try:
        with open(file_path, 'r') as file:
            diagram_code = file.read()
        
        if not title:
            # Use filename as title
            title = os.path.basename(file_url).split('.')[0].replace('_', ' ')
        
        # Create new diagram
        diagram = frappe.new_doc("Diagram")
        diagram.title = title
        diagram.diagram_code = diagram_code
        diagram.folder = folder
        diagram.is_public = is_public
        diagram.owner = frappe.session.user
        diagram.created_by = frappe.session.user
        
        # Auto-detect diagram type
        if diagram_code.strip().lower().startswith("graph ") or diagram_code.strip().lower().startswith("flowchart "):
            diagram.diagram_type = "flowchart"
        elif diagram_code.strip().lower().startswith("sequencediagram"):
            diagram.diagram_type = "sequence"
        elif diagram_code.strip().lower().startswith("classdiagram"):
            diagram.diagram_type = "class"
        elif diagram_code.strip().lower().startswith("statediagram"):
            diagram.diagram_type = "state"
        elif diagram_code.strip().lower().startswith("gantt"):
            diagram.diagram_type = "gantt"
        elif diagram_code.strip().lower().startswith("pie"):
            diagram.diagram_type = "pie"
        else:
            diagram.diagram_type = "other"
        
        diagram.insert()
        
        return diagram
        
    except Exception as e:
        frappe.log_error(f"Error importing MMD file: {str(e)}")
        frappe.throw(_("Error importing diagram file"))

@frappe.whitelist()
def import_from_json(file_url):
    """Import diagram from JSON file"""
    file_path = get_site_path() + file_url
    
    try:
        with open(file_path, 'r') as file:
            diagram_data = json.load(file)
        
        # Create new diagram
        diagram = frappe.new_doc("Diagram")
        diagram.title = diagram_data.get("title")
        diagram.description = diagram_data.get("description")
        diagram.diagram_code = diagram_data.get("diagram_code")
        diagram.diagram_type = diagram_data.get("diagram_type")
        diagram.owner = frappe.session.user
        diagram.created_by = frappe.session.user
        
        # Add tags if available
        if "tags" in diagram_data and diagram_data["tags"]:
            for tag in diagram_data["tags"]:
                diagram.append("tags", {"tag": tag})
        
        diagram.insert()
        
        return diagram
        
    except Exception as e:
        frappe.log_error(f"Error importing JSON file: {str(e)}")
        frappe.throw(_("Error importing diagram file")) 