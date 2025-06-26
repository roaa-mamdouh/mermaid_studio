import frappe
import json
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def get_active_users(diagram_name):
    """Get list of active users for a diagram"""
    # In a production environment, this would be implemented with WebSockets
    # For now, we'll simulate active users with a placeholder
    active_users = frappe.cache().hget("mermaid_active_users", diagram_name) or []
    
    # Add current user if not already in the list
    current_user = {
        "user": frappe.session.user,
        "full_name": frappe.db.get_value("User", frappe.session.user, "full_name"),
        "last_active": now_datetime().isoformat()
    }
    
    user_exists = False
    for user in active_users:
        if user.get("user") == frappe.session.user:
            user_exists = True
            user["last_active"] = current_user["last_active"]
            break
    
    if not user_exists:
        active_users.append(current_user)
    
    # Update cache
    frappe.cache().hset("mermaid_active_users", diagram_name, active_users)
    
    return active_users

@frappe.whitelist()
def update_cursor_position(diagram_name, position):
    """Update cursor position for real-time collaboration"""
    # In a production environment, this would be implemented with WebSockets
    # For now, we'll simulate cursor positions with a placeholder
    cursor_positions = frappe.cache().hget("mermaid_cursors", diagram_name) or {}
    
    # Update cursor position for current user
    cursor_positions[frappe.session.user] = {
        "position": position,
        "timestamp": now_datetime().isoformat(),
        "user": frappe.session.user,
        "full_name": frappe.db.get_value("User", frappe.session.user, "full_name")
    }
    
    # Update cache
    frappe.cache().hset("mermaid_cursors", diagram_name, cursor_positions)
    
    return cursor_positions

@frappe.whitelist()
def get_cursor_positions(diagram_name):
    """Get cursor positions for all active users"""
    # In a production environment, this would be implemented with WebSockets
    # For now, we'll simulate cursor positions with a placeholder
    cursor_positions = frappe.cache().hget("mermaid_cursors", diagram_name) or {}
    
    # Filter out stale cursor positions (older than 1 minute)
    current_time = now_datetime()
    active_cursors = {}
    
    for user, cursor_data in cursor_positions.items():
        timestamp = frappe.utils.get_datetime(cursor_data.get("timestamp"))
        time_diff = (current_time - timestamp).total_seconds()
        
        if time_diff < 60:  # Less than 1 minute
            active_cursors[user] = cursor_data
    
    return active_cursors

@frappe.whitelist()
def add_comment(diagram_name, text, position=None):
    """Add a comment to a diagram"""
    # Check permissions
    diagram = frappe.get_doc("Diagram", diagram_name)
    if not diagram.is_public and diagram.owner != frappe.session.user:
        # Check if diagram is shared with the user
        share = frappe.db.exists("Diagram Share", {
            "diagram": diagram_name,
            "shared_with": frappe.session.user
        })
        
        if not share:
            frappe.throw(_("You don't have permission to comment on this diagram"))
    
    # Create comment
    comment = frappe.new_doc("Comment")
    comment.comment_type = "Comment"
    comment.reference_doctype = "Diagram"
    comment.reference_name = diagram_name
    comment.content = text
    
    if position:
        # Store position as JSON in comment
        position_data = json.loads(position) if isinstance(position, str) else position
        comment.content += f"\n\n<!-- POSITION: {json.dumps(position_data)} -->"
    
    comment.insert(ignore_permissions=True)
    
    return comment

@frappe.whitelist()
def get_comments(diagram_name):
    """Get all comments for a diagram"""
    comments = frappe.get_all(
        "Comment",
        filters={
            "reference_doctype": "Diagram",
            "reference_name": diagram_name
        },
        fields=["name", "owner", "creation", "content"],
        order_by="creation desc"
    )
    
    # Parse position data from comments
    for comment in comments:
        position_match = frappe.utils.find_pattern(comment.content, r'<!-- POSITION: (.*?) -->')
        if position_match:
            try:
                position_data = json.loads(position_match.group(1))
                comment.position = position_data
                # Remove position data from content
                comment.content = comment.content.replace(position_match.group(0), "").strip()
            except:
                comment.position = None
        else:
            comment.position = None
    
    return comments

@frappe.whitelist()
def delete_comment(comment_name):
    """Delete a comment"""
    comment = frappe.get_doc("Comment", comment_name)
    
    # Check permissions
    if comment.owner != frappe.session.user:
        frappe.throw(_("You don't have permission to delete this comment"))
    
    frappe.delete_doc("Comment", comment_name)
    
    return {"success": True}

@frappe.whitelist()
def start_editing_session(diagram_name):
    """Start an editing session for a diagram"""
    # In a production environment, this would be implemented with WebSockets
    # For now, we'll simulate editing sessions with a placeholder
    editing_sessions = frappe.cache().hget("mermaid_editing_sessions", diagram_name) or {}
    
    # Check if someone else is already editing
    for user, session in editing_sessions.items():
        if user != frappe.session.user:
            timestamp = frappe.utils.get_datetime(session.get("timestamp"))
            time_diff = (now_datetime() - timestamp).total_seconds()
            
            if time_diff < 300:  # Less than 5 minutes
                return {
                    "success": False,
                    "message": f"{session.get('full_name')} is currently editing this diagram"
                }
    
    # Start editing session for current user
    editing_sessions[frappe.session.user] = {
        "timestamp": now_datetime().isoformat(),
        "user": frappe.session.user,
        "full_name": frappe.db.get_value("User", frappe.session.user, "full_name")
    }
    
    # Update cache
    frappe.cache().hset("mermaid_editing_sessions", diagram_name, editing_sessions)
    
    return {
        "success": True,
        "message": "Editing session started"
    }

@frappe.whitelist()
def end_editing_session(diagram_name):
    """End an editing session for a diagram"""
    # In a production environment, this would be implemented with WebSockets
    # For now, we'll simulate editing sessions with a placeholder
    editing_sessions = frappe.cache().hget("mermaid_editing_sessions", diagram_name) or {}
    
    # Remove current user from editing sessions
    if frappe.session.user in editing_sessions:
        del editing_sessions[frappe.session.user]
    
    # Update cache
    frappe.cache().hset("mermaid_editing_sessions", diagram_name, editing_sessions)
    
    return {
        "success": True,
        "message": "Editing session ended"
    } 