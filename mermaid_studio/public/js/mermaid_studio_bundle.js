// Mermaid Studio Bundle - Consolidated JavaScript for Mermaid Studio

frappe.provide('mermaid_studio');

// Main initialization function
mermaid_studio.init = function() {
    console.log('Initializing Mermaid Studio bundle');
    
    // Initialize components when Frappe is ready
    $(document).on('startup', function() {
        console.log('Frappe startup detected, initializing Mermaid Studio components');
        
        // Register routes
        mermaid_studio.setupRoutes();
        
        // Fix filter format issues immediately
        mermaid_studio.fixFilterFormats();
        
        // Add to desktop menu with delay to ensure UI is loaded
        setTimeout(function() {
            mermaid_studio.addToMenu();
        }, 2000);
    });
};

// Fix filter format issues in the UI
mermaid_studio.fixFilterFormats = function() {
    // Directly patch the frappe.desk.reportview.get_count method
    if (frappe.desk && frappe.desk.reportview && frappe.desk.reportview.get_count) {
        console.log('Patching frappe.desk.reportview.get_count');
        
        // Store the original method
        var originalGetCount = frappe.desk.reportview.get_count;
        
        // Override the method
        frappe.desk.reportview.get_count = function(args) {
            if (args && args.filters && typeof args.filters === 'string') {
                try {
                    // Parse the filter string
                    var filters = JSON.parse(args.filters);
                    
                    // Convert from object format to array format if needed
                    if (Array.isArray(filters) && filters.length > 0 && typeof filters[0] === 'object' && !Array.isArray(filters[0])) {
                        console.log('Converting filter format from object to array');
                        var newFilters = [];
                        filters.forEach(function(filter) {
                            var key = Object.keys(filter)[0];
                            if (filter[key] && Array.isArray(filter[key]) && filter[key].length >= 2) {
                                newFilters.push([key, filter[key][0], filter[key][1]]);
                            }
                        });
                        args.filters = JSON.stringify(newFilters);
                    }
                } catch (e) {
                    console.error('Error parsing filters:', e);
                }
            }
            
            // Call the original method
            return originalGetCount(args);
        };
    } else {
        console.log('frappe.desk.reportview.get_count not available yet, will try again later');
        setTimeout(mermaid_studio.fixFilterFormats, 1000);
    }
    
    // Also fix any existing shortcut widgets
    $('.shortcut-widget').each(function() {
        var widget = $(this).data('widget');
        if (widget && widget.stats_filter) {
            try {
                var filters = JSON.parse(widget.stats_filter);
                if (Array.isArray(filters) && filters.length > 0 && typeof filters[0] === 'object' && !Array.isArray(filters[0])) {
                    // Convert from object format to array format
                    var newFilters = [];
                    filters.forEach(function(filter) {
                        var key = Object.keys(filter)[0];
                        if (filter[key] && Array.isArray(filter[key]) && filter[key].length >= 2) {
                            newFilters.push([key, filter[key][0], filter[key][1]]);
                        }
                    });
                    widget.stats_filter = JSON.stringify(newFilters);
                    $(this).data('widget', widget);
                }
            } catch (e) {
                console.error('Error fixing widget filters:', e);
            }
        }
    });
    
    // Override frappe.utils.get_filter_from_json_string
    if (frappe.utils && frappe.utils.get_filter_from_json_string) {
        var originalFilterFromJson = frappe.utils.get_filter_from_json_string;
        
        frappe.utils.get_filter_from_json_string = function(filter_json) {
            try {
                var filters = JSON.parse(filter_json);
                
                // Convert from object format to array format if needed
                if (Array.isArray(filters) && filters.length > 0 && typeof filters[0] === 'object' && !Array.isArray(filters[0])) {
                    console.log('Converting filter format from object to array in get_filter_from_json_string');
                    var newFilters = [];
                    filters.forEach(function(filter) {
                        var key = Object.keys(filter)[0];
                        if (filter[key] && Array.isArray(filter[key]) && filter[key].length >= 2) {
                            newFilters.push([key, filter[key][0], filter[key][1]]);
                        }
                    });
                    return newFilters;
                }
            } catch (e) {
                console.error('Error in get_filter_from_json_string:', e);
            }
            
            // Call the original method
            return originalFilterFromJson(filter_json);
        };
    }
};

// Setup routes for Mermaid Studio
mermaid_studio.setupRoutes = function() {
    console.log('Setting up Mermaid Studio routes');
    
    // Use route_hooks if available
    if (frappe.route_hooks) {
        // Main app route
        frappe.route_hooks["mermaid-studio"] = function() {
            console.log('Mermaid Studio route triggered');
            frappe.set_route('list', 'Diagram');
        };
        
        // Editor route
        frappe.route_hooks["mermaid-studio/editor"] = function() {
            console.log('Mermaid Studio editor route triggered');
            if (frappe.get_route()[1]) {
                mermaid_studio.loadEditor(frappe.get_route()[1]);
            } else {
                mermaid_studio.loadNewEditor();
            }
        };
    } else {
        console.log('frappe.route_hooks not available yet, will try again later');
        setTimeout(mermaid_studio.setupRoutes, 1000);
    }
    
    // Listen for route changes
    $(document).on("route_change", function() {
        var route = frappe.get_route();
        console.log('Route changed:', route);
        
        if (route[0] === 'mermaid-studio') {
            console.log('Mermaid Studio route detected');
            
            // Check if we need to load a specific diagram
            if (route[1]) {
                mermaid_studio.loadDiagram(route[1]);
            } else {
                mermaid_studio.loadDashboard();
            }
        }
    });
};

// Add Mermaid Studio to the menu
mermaid_studio.addToMenu = function() {
    console.log('Adding Mermaid Studio to menu');
    
    // Check if desktop is available
    if (frappe.desktop && frappe.desktop.Workspace) {
        console.log('Desktop workspace found');
        
        // Add to the sidebar
        mermaid_studio.addToSidebar();
        
        // Add to app menu
        mermaid_studio.addToAppMenu();
    } else {
        console.log('Desktop workspace not available yet, will try again later');
        setTimeout(mermaid_studio.addToMenu, 1000);
    }
};

// Add Mermaid Studio to the sidebar
mermaid_studio.addToSidebar = function() {
    console.log('Adding Mermaid Studio to sidebar');
    
    // Check if the app is in the desktop sidebar
    var sidebarItems = $('.standard-sidebar-item');
    var found = false;
    
    sidebarItems.each(function() {
        var route = $(this).data('route');
        if (route === 'mermaid-studio') {
            found = true;
            console.log('Mermaid Studio found in sidebar!');
            return false; // Break the loop
        }
    });
    
    if (!found) {
        console.log('Mermaid Studio not found in sidebar, adding it...');
        // Add Mermaid Studio to the sidebar manually if needed
    }
};

// Add Mermaid Studio to the app menu
mermaid_studio.addToAppMenu = function() {
    console.log('Adding Mermaid Studio to app menu');
    
    // Check if already in the app menu
    var appMenu = $('.app-list');
    var found = false;
    
    appMenu.find('a').each(function() {
        var href = $(this).attr('href');
        if (href && href.indexOf('mermaid-studio') !== -1) {
            found = true;
            console.log('Mermaid Studio found in app menu!');
            return false; // Break the loop
        }
    });
    
    if (!found) {
        console.log('Mermaid Studio not found in app menu, will be added via workspace configuration');
    }
};

// Load Diagram Dashboard
mermaid_studio.loadDashboard = function() {
    console.log('Loading Mermaid Studio Dashboard');
    frappe.set_route('list', 'Diagram');
};

// Load a specific diagram
mermaid_studio.loadDiagram = function(diagramName) {
    console.log('Loading diagram:', diagramName);
    frappe.set_route('Form', 'Diagram', diagramName);
};

// Load diagram editor
mermaid_studio.loadEditor = function(diagramName) {
    console.log('Loading editor for diagram:', diagramName);
    frappe.set_route('Form', 'Diagram', diagramName);
};

// Load new diagram editor
mermaid_studio.loadNewEditor = function() {
    console.log('Loading new diagram editor');
    frappe.new_doc('Diagram');
};

// Initialize the bundle
mermaid_studio.init(); 