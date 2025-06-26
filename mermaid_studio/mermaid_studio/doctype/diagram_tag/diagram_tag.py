import frappe
from frappe.model.document import Document

class DiagramTag(Document):
    def validate(self):
        self.tag = self.tag.strip().lower()
    
    @staticmethod
    def get_popular_tags(limit=10):
        """Get most popular tags"""
        return frappe.db.sql("""
            SELECT tag, COUNT(*) as count
            FROM `tabDiagram Tag`
            GROUP BY tag
            ORDER BY count DESC
            LIMIT %s
        """, (limit,), as_dict=True) 