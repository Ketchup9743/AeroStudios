fetch('version.json')
    .then(response => response.json())
    .then(data => {
        let badge = document.getElementById('version-container');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'version-container';
            badge.style.position = 'fixed';
            badge.style.bottom = '20px';
            badge.style.left = '20px';
            badge.style.fontSize = '0.85rem';
            badge.style.color = '#666666';
            badge.style.fontWeight = '500';
            document.body.appendChild(badge);
        }
        badge.textContent = 'v' + data.version;
    })
    .catch(error => {
        console.error('Could not load version:', error);
    });
