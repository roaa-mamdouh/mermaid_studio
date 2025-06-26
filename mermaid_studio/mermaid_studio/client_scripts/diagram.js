// Client script for Diagram DocType
frappe.ui.form.on('Diagram', {
    refresh: function(frm) {
        console.log('Client script: Diagram form refreshed');
        
        // Add preview button
        frm.add_custom_button(__('Preview Diagram'), function() {
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
            }
            
            // Get diagram code
            var diagramCode = frm.doc.diagram_code;
            if (!diagramCode) {
                frappe.msgprint(__('Please enter diagram code first.'));
                return;
            }
            
            // Load Mermaid.js if not already loaded
            if (!window.mermaid) {
                $.getScript('https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js', function() {
                    renderDiagram(diagramCode);
                });
            } else {
                renderDiagram(diagramCode);
            }
        });
        
        // Function to render the diagram
        function renderDiagram(diagramCode) {
            // Initialize Mermaid
            if (window.mermaid) {
                window.mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    logLevel: 'error',
                    flowchart: {
                        useMaxWidth: false
                    }
                });
                
                // Clear previous preview
                var $container = $('#diagram-preview-container');
                $container.empty();
                
                // Add a unique ID for the diagram
                var diagramId = 'mermaid-diagram-' + Math.random().toString(36).substr(2, 9);
                $container.html('<div class="mermaid" id="' + diagramId + '">' + diagramCode + '</div>');
                
                try {
                    // Render the diagram
                    window.mermaid.mermaidAPI.render(diagramId, diagramCode, function(svgCode) {
                        $container.html(svgCode);
                    });
                } catch (e) {
                    console.error('Error rendering diagram:', e);
                    $container.html('<div class="alert alert-danger">' + 
                        '<h4>' + __('Error rendering diagram') + '</h4>' +
                        '<pre>' + e.message + '</pre>' +
                        '</div>');
                }
            }
        }
    }
}); 