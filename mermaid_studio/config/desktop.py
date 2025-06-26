from frappe import _

def get_data():
	return [
		{
			"module_name": "Mermaid Studio",
			"color": "#764ba2",
			"icon": "octicon octicon-project-diagram",
			"type": "module",
			"label": _("Mermaid Studio"),
            "onboard_present": 1,
            "shortcuts": [
                {
                    "label": _("All Diagrams"),
                    "url": "/app/diagram",
                    "type": "DocType",
                    "doc_view": "List",
                    "color": "grey"
                },
                {
                    "label": _("New Diagram"),
                    "url": "/app/diagram/new-diagram",
                    "type": "DocType",
                    "doc_view": "New",
                    "color": "blue"
                },
                {
                    "label": _("My Diagrams"),
                    "url": "/app/diagram",
                    "type": "DocType",
                    "doc_view": "List",
                    "color": "green",
                    "filters": [["owner", "=", "user"]]
                }
            ]
		}
	] 