import frappe
from frappe.desk.reportview import validate_filters as original_validate_filters

# Override the validate_filters function to handle both array and object filter formats
def validate_filters(data, filters):
    """
    Patched version of validate_filters that handles both array and object filter formats.
    """
    try:
        # Try the original function first
        return original_validate_filters(data, filters)
    except (IndexError, KeyError, TypeError) as e:
        # If we get an error, try to convert the filter format
        try:
            if isinstance(filters, list) and filters and isinstance(filters[0], dict):
                # Convert from object format to array format
                new_filters = []
                for filter_obj in filters:
                    for key, value in filter_obj.items():
                        if isinstance(value, list) and len(value) >= 2:
                            new_filters.append([key, value[0], value[1]])
                
                # Replace the filters with the new format
                data.filters = new_filters
                
                # Try again with the new format
                return original_validate_filters(data, new_filters)
            else:
                # Re-raise the original exception
                raise e
        except Exception:
            # If conversion fails, re-raise the original exception
            raise e

# Replace the original function with our patched version in frappe.desk.reportview
frappe.desk.reportview.validate_filters = validate_filters 