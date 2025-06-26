// Copyright (c) 2023, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Diagram', {
    refresh: function(frm) {
        console.log('Diagram DocType JS loaded');
        
        // Add preview button
        frm.add_custom_button(__('Preview Diagram'), function() {
            console.log('Preview button clicked');
            
            // Show preview section if it doesn't exist
            if (!$('#diagram-preview-section').length) {
                var $previewSection = $(`
                    <div id="diagram-preview-section" class="form-section" style="margin-top: 20px;">
                        <div class="section-head">Diagram Preview</div>
                        <div class="section-body">
                            <div id="diagram-preview-container" style="padding: 15px; border: 1px solid #d1d8dd; border-radius: 4px; background-color: #f9f9f9;"></div>
                        </div>
                    </div>
                `);
                
                // Add preview section after the diagram code field
                $('.frappe-control[data-fieldname="diagram_code"]').closest('.form-section').after($previewSection);
                console.log('Preview section added');
            }
            
            // Get diagram code
            var diagramCode = frm.doc.diagram_code;
            if (!diagramCode) {
                frappe.msgprint(__('Please enter diagram code first.'));
                return;
            }
            
            // Load Mermaid.js if not already loaded
            if (!window.mermaid) {
                console.log('Loading Mermaid.js');
                $.getScript('https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js', function() {
                    console.log('Mermaid.js loaded');
                    renderDiagram(diagramCode);
                }).fail(function(error) {
                    console.error('Failed to load Mermaid.js:', error);
                    frappe.msgprint(__('Failed to load Mermaid library. Please check your internet connection.'));
                });
            } else {
                console.log('Mermaid.js already loaded');
                renderDiagram(diagramCode);
            }
        }).addClass('btn-primary');
        
        // Function to render the diagram
        function renderDiagram(diagramCode) {
            // Initialize Mermaid
            if (window.mermaid) {
                try {
                    window.mermaid.initialize({
                        startOnLoad: false,
                        theme: 'default',
                        securityLevel: 'loose',
                        logLevel: 'error',
                        flowchart: {
                            useMaxWidth: false
                        }
                    });
                    
                    console.log('Mermaid initialized');
                    
                    // Clear previous preview
                    var $container = $('#diagram-preview-container');
                    $container.empty();
                    
                    // Add a unique ID for the diagram
                    var diagramId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
                    $container.html('<div class="mermaid" id="' + diagramId + '">' + diagramCode + '</div>');
                    
                    try {
                        // Render the diagram
                        console.log('Rendering diagram');
                        window.mermaid.mermaidAPI.render(diagramId, diagramCode, function(svgCode) {
                            console.log('Diagram rendered');
                            $container.html(svgCode);
                        });
                    } catch (e) {
                        console.error('Error rendering diagram:', e);
                        $container.html('<div class="alert alert-danger">' + 
                            '<h4>' + __('Error rendering diagram') + '</h4>' +
                            '<pre>' + e.message + '</pre>' +
                            '</div>');
                    }
                } catch (e) {
                    console.error('Error initializing Mermaid:', e);
                    frappe.msgprint(__('Error initializing Mermaid library.'));
                }
            } else {
                console.error('Mermaid library not loaded');
                frappe.msgprint(__('Mermaid library not loaded. Please try again.'));
            }
        }
    }
}); 