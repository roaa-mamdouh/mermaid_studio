app_name = "mermaid_studio"
app_title = "Mermaid Studio"
app_publisher = "Frappe"
app_description = "Mermaid Diagram Studio for Frappe"
app_email = "developers@frappe.io"
app_license = "MIT"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
add_to_apps_screen = [
	{
		"name": "mermaid_studio",
		"logo": "/assets/mermaid_studio/img/mermaid_logo.svg",
		"title": "Mermaid Studio",
		"route": "/app/mermaid-studio",
		#"has_permission": "mermaid_studio.api.permission.has_app_permission"
	}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
app_include_css = "/assets/mermaid_studio/css/mermaid_studio.css"
app_include_js = [
    "/assets/mermaid_studio/js/mermaid_studio_bundle.js"
]

# include js, css files in header of web template
web_include_css = [
    "/assets/mermaid_studio/css/mermaid_studio.css",
    "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
]
web_include_js = [
    "/assets/mermaid_studio/js/mermaid_studio_bundle.js"
]

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "mermaid_studio/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Diagram": "public/js/diagram_preview.js"
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "mermaid_studio/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "mermaid_studio.utils.jinja_methods",
# 	"filters": "mermaid_studio.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "mermaid_studio.install.before_install"
# after_install = "mermaid_studio.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "mermaid_studio.uninstall.before_uninstall"
# after_uninstall = "mermaid_studio.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "mermaid_studio.utils.before_app_install"
# after_app_install = "mermaid_studio.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "mermaid_studio.utils.before_app_uninstall"
# after_app_uninstall = "mermaid_studio.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "mermaid_studio.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"mermaid_studio.tasks.all"
# 	],
# 	"daily": [
# 		"mermaid_studio.tasks.daily"
# 	],
# 	"hourly": [
# 		"mermaid_studio.tasks.hourly"
# 	],
# 	"weekly": [
# 		"mermaid_studio.tasks.weekly"
# 	],
# 	"monthly": [
# 		"mermaid_studio.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "mermaid_studio.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "mermaid_studio.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "mermaid_studio.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["mermaid_studio.utils.before_request"]
# after_request = ["mermaid_studio.utils.after_request"]

# Job Events
# ----------
# before_job = ["mermaid_studio.utils.before_job"]
# after_job = ["mermaid_studio.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"mermaid_studio.auth.validate"
# ]

# Website Routes
website_route_rules = [
    {"from_route": "/mermaid-studio", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/editor", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/editor/*", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/view/*", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/templates", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/share/*", "to_route": "mermaid_studio"},
    {"from_route": "/mermaid-studio/*", "to_route": "mermaid_studio"}
]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Fixtures
fixtures = [
    {"dt": "Workspace", "filters": [["name", "in", ["Mermaid Studio"]]]},
    {"dt": "Page", "filters": [["name", "in", ["mermaid_studio"]]]},
]

