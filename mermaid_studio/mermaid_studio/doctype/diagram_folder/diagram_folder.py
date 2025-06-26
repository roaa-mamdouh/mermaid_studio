import frappe
from frappe.model.document import Document

class DiagramFolder(Document):
    def validate(self):
        self.validate_parent_folder()
    
    def validate_parent_folder(self):
        """Ensure no circular references in folder structure"""
        if not self.parent_folder:
            return
        
        if self.parent_folder == self.name:
            frappe.throw("A folder cannot be its own parent")
        
        # Check for circular references
        parent = self.parent_folder
        visited = set([self.name])
        
        while parent:
            if parent in visited:
                frappe.throw("Circular reference detected in folder structure")
            
            visited.add(parent)
            parent_doc = frappe.get_doc("Diagram Folder", parent)
            parent = parent_doc.parent_folder
    
    def get_diagrams(self):
        """Get all diagrams in this folder"""
        return frappe.get_all(
            "Diagram",
            filters={"folder": self.name},
            fields=["name", "title", "diagram_type", "status", "is_public", "modified", "owner"]
        )
    
    def get_subfolders(self):
        """Get all subfolders of this folder"""
        return frappe.get_all(
            "Diagram Folder",
            filters={"parent_folder": self.name},
            fields=["name", "folder_name", "is_public", "owner"]
        )
    
    def move_diagrams_to_folder(self, target_folder):
        """Move all diagrams from this folder to another folder"""
        if not target_folder:
            frappe.throw("Target folder is required")
        
        frappe.db.sql("""
            UPDATE `tabDiagram`
            SET folder = %s
            WHERE folder = %s
        """, (target_folder, self.name))
        
        return True 