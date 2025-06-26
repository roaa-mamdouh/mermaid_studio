import frappe

def get_context(context):
    context.title = "Mermaid Studio"
    context.description = "Visual Diagram Editor"
    
    # No need to fetch diagrams here as the Vue app will handle that
    return context 