// ===== Activity Log Page (log.html) =====
const { db, ref, onValue, query, orderByChild, limitToLast } = window.FirebaseDB;
const { formatTimestamp } = window.AppUtils;

// Listen for real-time log updates (last 200 entries)
const logRef = ref(db, 'activityLog');
onValue(logRef, (snapshot) => {
    const data = snapshot.val();
    let logs = [];

    if (data) {
        Object.keys(data).forEach(key => {
            logs.push({ id: key, ...data[key] });
        });
    }

    // Sort by most recent first
    logs.sort((a, b) => b.timestamp - a.timestamp);

    renderLog(logs);
});

function renderLog(logs) {
    const search = document.getElementById('logSearch').value.toLowerCase();
    const tbody = document.getElementById('logBody');

    let filtered = logs;
    if (search) {
        filtered = logs.filter(log =>
            log.user.toLowerCase().includes(search) ||
            log.item.toLowerCase().includes(search) ||
            log.action.toLowerCase().includes(search)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No activity logged yet.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(log => `
        <tr>
            <td>${formatTimestamp(log.timestamp)}</td>
            <td><strong>${escapeHtml(log.user)}</strong></td>
            <td>${getActionBadge(log.action)}</td>
            <td>${escapeHtml(log.item)}</td>
            <td>${log.quantity}</td>
        </tr>
    `).join('');

    // Store logs for filtering
    window._currentLogs = logs;
}

function getActionBadge(action) {
    const colors = {
        'Added': 'status-ok',
        'Took': 'status-low',
        'Deleted': 'status-out',
        'Edited': 'status-ok',
        'Restocked': 'status-ok',
        'Reduced': 'status-low'
    };
    const cls = colors[action] || 'status-ok';
    return `<span class="status-badge ${cls}">${action}</span>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search filter
document.getElementById('logSearch').addEventListener('input', () => {
    if (window._currentLogs) {
        renderLog(window._currentLogs);
    }
});
