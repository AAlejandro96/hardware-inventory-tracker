// ===== Inventory Page (index.html) =====
const { db, ref, onValue } = window.FirebaseDB;
const { getStatusBadge } = window.AppUtils;

let allItems = [];

// Listen for real-time inventory changes
const inventoryRef = ref(db, 'inventory');
onValue(inventoryRef, (snapshot) => {
    const data = snapshot.val();
    allItems = [];

    if (data) {
        Object.keys(data).forEach(key => {
            allItems.push({ id: key, ...data[key] });
        });
    }

    updateStats();
    populateFilters();
    renderTable();
});

function updateStats() {
    document.getElementById('totalItems').textContent = allItems.length;
    document.getElementById('totalQuantity').textContent = allItems.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('lowStock').textContent = allItems.filter(item => item.quantity <= 5).length;
}

function populateFilters() {
    const categories = [...new Set(allItems.map(item => item.category))].sort();
    const locations = [...new Set(allItems.map(item => item.location))].sort();

    const categoryFilter = document.getElementById('categoryFilter');
    const locationFilter = document.getElementById('locationFilter');

    // Preserve current selections
    const currentCat = categoryFilter.value;
    const currentLoc = locationFilter.value;

    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
    locationFilter.innerHTML = '<option value="">All Locations</option>' +
        locations.map(l => `<option value="${l}">${l}</option>`).join('');

    categoryFilter.value = currentCat;
    locationFilter.value = currentLoc;
}

function renderTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const location = document.getElementById('locationFilter').value;

    let filtered = allItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.location.toLowerCase().includes(search);
        const matchesCategory = !category || item.category === category;
        const matchesLocation = !location || item.location === location;
        return matchesSearch && matchesCategory && matchesLocation;
    });

    // Sort alphabetically by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    const tbody = document.getElementById('inventoryBody');

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No items found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(item => `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td><strong>${item.quantity}</strong></td>
            <td>${getStatusBadge(item.quantity)}</td>
        </tr>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners for filters
document.getElementById('searchInput').addEventListener('input', renderTable);
document.getElementById('categoryFilter').addEventListener('change', renderTable);
document.getElementById('locationFilter').addEventListener('change', renderTable);
