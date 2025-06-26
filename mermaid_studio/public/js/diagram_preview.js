console.log('Diagram Preview JS loaded');

// Mermaid Diagram Preview Functionality
frappe.provide('mermaid_studio.preview');

mermaid_studio.preview = {
    // Initialize the preview functionality
    init: function() {
        console.log('Initializing Mermaid diagram preview');
        
        // Load Mermaid.js if not already loaded
        if (!window.mermaid) {
            console.log('Loading Mermaid.js for preview');
            // Use a specific version known to work without the 'move' property error
            $.getScript('https://cdn.jsdelivr.net/npm/mermaid@9.3.0/dist/mermaid.min.js', function() {
                console.log('Mermaid.js loaded successfully for preview');
                mermaid_studio.preview.setupMermaid();
                mermaid_studio.preview.addPreviewButton();
            }).fail(function(jqxhr, settings, exception) {
                console.error('Failed to load Mermaid.js:', exception);
                frappe.msgprint(__('Failed to load Mermaid library. Please check your internet connection.'));
            });
        } else {
            console.log('Mermaid.js already loaded');
            mermaid_studio.preview.setupMermaid();
            mermaid_studio.preview.addPreviewButton();
        }
    },
    
    // Set up Mermaid library with safe configuration
    setupMermaid: function() {
        if (window.mermaid) {
            try {
                // Use a simpler configuration to avoid errors
                window.mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    logLevel: 'error',
                    flowchart: {
                        useMaxWidth: false
                    }
                });
                console.log('Mermaid library initialized for preview');
            } catch (e) {
                console.error('Error initializing Mermaid for preview:', e);
            }
        }
    },
    
    // Add preview button to the Diagram form
    addPreviewButton: function() {
        // Check if we're on a Diagram form
        if (cur_frm && cur_frm.doctype === 'Diagram') {
            console.log('Adding preview button to Diagram form');
            
            // Add custom button if it doesn't exist
            if (!cur_frm.custom_buttons['Preview Diagram']) {
                cur_frm.add_custom_button(__('Preview Diagram'), function() {
                    mermaid_studio.preview.showPreview();
                });
                console.log('Preview button added');
            } else {
                console.log('Preview button already exists');
            }
            
            // Add preview section if it doesn't exist
            if (!$('#diagram-preview-section').length) {
                var $previewSection = $(`
                    <div id="diagram-preview-section" class="form-section" style="margin-top: 20px; display: none;">
                        <div class="section-head">Diagram Preview</div>
                        <div class="section-body">
                            <div id="diagram-preview-container" style="padding: 15px; border: 1px solid #d1d8dd; border-radius: 4px; background-color: #f9f9f9;"></div>
                        </div>
                    </div>
                `);
                
                // Add preview section after the diagram code field
                $('.frappe-control[data-fieldname="diagram_code"]').closest('.form-section').after($previewSection);
                console.log('Preview section added');
            } else {
                console.log('Preview section already exists');
            }
        } else {
            console.log('Not on a Diagram form, cur_frm:', cur_frm ? cur_frm.doctype : 'undefined');
        }
    },
    
    // Show diagram preview
    showPreview: function() {
        if (!cur_frm || cur_frm.doctype !== 'Diagram') {
            return;
        }
        
        var diagramCode = cur_frm.doc.diagram_code;
        if (!diagramCode) {
            frappe.msgprint(__('Please enter diagram code first.'));
            return;
        }
        
        // Show the preview section
        $('#diagram-preview-section').show();
        
        // Clear previous preview
        var $container = $('#diagram-preview-container');
        $container.empty();
        
        // Add a unique ID for the diagram
        var diagramId = 'mermaid-diagram-' + frappe.utils.get_random(6);
        $container.html('<div class="mermaid" id="' + diagramId + '">' + diagramCode + '</div>');
        
        try {
            // Render the diagram using a safer approach
            console.log('Rendering diagram with Mermaid');
            
            // Use mermaid.render instead of mermaid.run for better compatibility
            window.mermaid.mermaidAPI.render(diagramId, diagramCode, function(svgCode) {
                $container.html(svgCode);
            }, $container[0]);
        } catch (e) {
            console.error('Exception rendering diagram:', e);
            $container.html('<div class="alert alert-danger">' + 
                '<h4>' + __('Error rendering diagram') + '</h4>' +
                '<pre>' + e.message + '</pre>' +
                '</div>');
        }
    }
};

// Initialize the preview functionality when a Diagram form is loaded
frappe.ui.form.on('Diagram', {
    refresh: function(frm) {
        console.log('Diagram form refreshed');
        mermaid_studio.preview.init();
    },
    
    after_save: function(frm) {
        console.log('Diagram saved');
        mermaid_studio.preview.init();
    },
    
    onload: function(frm) {
        console.log('Diagram form loaded');
        mermaid_studio.preview.init();
    }
});

// Immediate initialization if we're already on a Diagram form
$(document).ready(function() {
    console.log('Document ready, checking for Diagram form');
    if (cur_frm && cur_frm.doctype === 'Diagram') {
        console.log('Already on Diagram form, initializing');
        mermaid_studio.preview.init();
    }
}); 