from __future__ import unicode_literals

routes = [
    # Main route for Mermaid Studio
    {"from_route": "/mermaid-studio", "to_route": "mermaid-studio"},
    
    # Route for diagram editor
    {"from_route": "/mermaid-studio/editor", "to_route": "diagram"},
    {"from_route": "/mermaid-studio/editor/:name", "to_route": "diagram/:name"},
    
    # Route for templates
    {"from_route": "/mermaid-studio/templates", "to_route": "diagram", 
     "defaults": {"is_template": "1"}},
] 