import frappe
from frappe.model.document import Document

class DiagramVersion(Document):
    def validate(self):
        self.validate_version_number()
    
    def validate_version_number(self):
        """Ensure version number is valid"""
        if not self.version_number or self.version_number < 1:
            self.version_number = 1
    
    def get_diff(self, compare_version=None):
        """Get diff between this version and another version"""
        import difflib
        
        if not compare_version:
            # Get previous version
            versions = frappe.get_all(
                "Diagram Version",
                filters={
                    "diagram": self.diagram,
                    "version_number": ("!=", self.version_number)
                },
                fields=["name", "version_number", "diagram_code"],
                order_by="version_number desc"
            )
            
            if not versions:
                return None
            
            compare_version = versions[0]
        else:
            compare_version = frappe.get_doc("Diagram Version", compare_version)
        
        # Generate diff
        current_lines = self.diagram_code.splitlines()
        compare_lines = compare_version.diagram_code.splitlines()
        
        diff = difflib.unified_diff(
            compare_lines,
            current_lines,
            fromfile=f"v{compare_version.version_number}",
            tofile=f"v{self.version_number}",
            lineterm=""
        )
        
        return "\n".join(diff)
    
    def restore_version(self):
        """Restore this version as the current version"""
        diagram = frappe.get_doc("Diagram", self.diagram)
        
        # Only update if different
        if diagram.diagram_code != self.diagram_code:
            diagram.diagram_code = self.diagram_code
            diagram.save()
            
            return True
        
        return False 