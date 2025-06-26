frappe.pages['mermaid-studio'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Mermaid Studio',
        single_column: true
    });
    
    // Add page content
    $(frappe.render_template('mermaid_studio', {})).appendTo(page.body);
    
    // Initialize Mermaid
    if (window.mermaid) {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'cardinal'
            }
        });
    } else {
        // Load Mermaid library if not available
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js', function() {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'cardinal'
                }
            });
            
            // Initialize diagrams
            mermaid.init(undefined, $('.mermaid'));
        });
    }
    
    // Add actions
    page.add_action_icon('refresh', function() {
        frappe.show_alert('Refreshing diagrams...');
        mermaid.init(undefined, $('.mermaid'));
    }, 'Refresh Diagrams');
    
    page.add_action_icon('add', function() {
        frappe.new_doc('Diagram');
    }, 'Create New Diagram');
    
    // Add menu
    page.add_menu_item('View All Diagrams', function() {
        frappe.set_route('List', 'Diagram');
    });
    
    page.add_menu_item('Diagram Templates', function() {
        frappe.set_route('List', 'Diagram', {
            'is_template': 1
        });
    });
    
    // Load recent diagrams
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: 'Diagram',
            fields: ['name', 'title', 'diagram_type', 'modified', 'owner'],
            limit: 5,
            order_by: 'modified desc'
        },
        callback: function(response) {
            if (response.message) {
                var recentDiagrams = response.message;
                var html = '';
                
                if (recentDiagrams.length === 0) {
                    html = '<div class="text-muted">No diagrams found</div>';
                } else {
                    html = '<div class="list-group">';
                    recentDiagrams.forEach(function(diagram) {
                        html += `
                            <a href="/app/diagram/${diagram.name}" class="list-group-item list-group-item-action mermaid-list-item">
                                <div class="d-flex w-100 justify-content-between">
                                    <h5 class="mb-1">${diagram.title || 'Untitled'}</h5>
                                    <small>${frappe.datetime.prettyDate(diagram.modified)}</small>
                                </div>
                                <p class="mb-1">
                                    <span class="mermaid-badge mermaid-badge-${diagram.diagram_type || 'other'}">${diagram.diagram_type || 'other'}</span>
                                </p>
                                <small>Created by: ${diagram.owner}</small>
                            </a>
                        `;
                    });
                    html += '</div>';
                }
                
                $('#recentDiagrams').html(html);
            }
        }
    });
}; 