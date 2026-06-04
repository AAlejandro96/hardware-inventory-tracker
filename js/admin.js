// ===== Admin Page (admin.html) =====
const { db, ref, onValue, push, set, remove, update, get } = window.FirebaseDB;
const { isAuthorized, getStatusBadge } = window.AppUtils;

let currentUser = null;
let allItems = [];

// Auth Gate
document.getElementById('authBtn').addEventListener('click', authenticate);
document.getElementById('aliasInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') authenticate();
});

function authenticate() {
    const alias = document.getElementById('aliasInput').value.trim();
    if (!alias) return;

    if (isAuthorized(alias)) {
        currentUser = alias;
        document.getElementById('authGate').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
        document.getElementById('userBadge').textContent = `👤 ${alias}`;
        initAdmin();
    } else {
        document.getElementById('authError').classList.remove('hidden');
    }
}

function initAdmin() {
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
        renderAdminTable();
        populateDataLists();
    });

    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', addItem);
    // Edit item form
    document.getElementById('editItemForm').addEventListener('submit', saveEdit);
}

function populateDataLists() {
    const categories = [...new Set(allItems.map(item => item.category))].sort();
    const locations = [...new Set(allItems.map(item => item.location))].sort();

    document.getElementById('categoryList').innerHTML =
        categories.map(c => `<option value="${c}">`).join('');
    document.getElementById('locationList').innerHTML =
        locations.map(l => `<option value="${l}">`).join('');
}

async function addItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    const category = document.getElementById('itemCategory').value.trim();
    const location = document.getElementById('itemLocation').value.trim();
    const quantity = parseInt(document.getElementById('itemQuantity').value);

    if (!name || !category || !location) return;

    const inventoryRef = ref(db, 'inventory');
    const newItemRef = push(inventoryRef);
    await set(newItemRef, { name, category, location, quantity });

    // Log the action
    await logAction('Added', name, quantity);

    // Reset form
    document.getElementById('addItemForm').reset();
    document.getElementById('itemQuantity').value = '1';
}

function renderAdminTable() {
    const tbody = document.getElementById('adminInventoryBody');

    if (allItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No items in inventory. Add one above!</td></tr>';
        return;
    }

    const sorted = [...allItems].sort((a, b) => a.name.localeCompare(b.name));

    tbody.innerHTML = sorted.map(item => `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${escapeHtml(item.category)}</td>
            <td>${escapeHtml(item.location)}</td>
            <td><strong>${item.quantity}</strong></td>
            <td class="action-btns">
                <button class="btn btn-small btn-primary" onclick="openEditModal('${item.id}')">Edit</button>
                <button class="btn btn-small btn-secondary" onclick="adjustQty('${item.id}', 1)">+1</button>
                <button class="btn btn-small btn-secondary" onclick="adjustQty('${item.id}', -1)">-1</button>
                <button class="btn btn-small btn-danger" onclick="deleteItem('${item.id}', '${escapeHtml(item.name)}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Adjust quantity
async function adjustQty(id, delta) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);
    const itemRef = ref(db, `inventory/${id}`);
    await update(itemRef, { quantity: newQty });

    const action = delta > 0 ? 'Restocked' : 'Reduced';
    await logAction(action, item.name, Math.abs(delta));
}

// Delete item
async function deleteItem(id, name) {
    if (!confirm(`Delete "${name}" from inventory?`)) return;

    const itemRef = ref(db, `inventory/${id}`);
    await remove(itemRef);
    await logAction('Deleted', name, 0);
}

// Edit Modal
function openEditModal(id) {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    document.getElementById('editItemId').value = id;
    document.getElementById('editName').value = item.name;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editLocation').value = item.location;
    document.getElementById('editQuantity').value = item.quantity;
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function saveEdit(e) {
    e.preventDefault();

    const id = document.getElementById('editItemId').value;
    const name = document.getElementById('editName').value.trim();
    const category = document.getElementById('editCategory').value.trim();
    const location = document.getElementById('editLocation').value.trim();
    const quantity = parseInt(document.getElementById('editQuantity').value);

    const itemRef = ref(db, `inventory/${id}`);
    await update(itemRef, { name, category, location, quantity });
    await logAction('Edited', name, quantity);

    closeEditModal();
}

// Log action to activity log
async function logAction(action, itemName, quantity) {
    const logRef = ref(db, 'activityLog');
    const newLog = push(logRef);
    await set(newLog, {
        timestamp: Date.now(),
        user: currentUser,
        action: action,
        item: itemName,
        quantity: quantity
    });
}

function exportToExcel() {
    if (allItems.length === 0) {
        alert('No inventory data to export.');
        return;
    }

    const sorted = [...allItems].sort((a, b) => a.name.localeCompare(b.name));

    const data = sorted.map(item => ({
        'Item Name': item.name,
        'Category': item.category,
        'Location': item.location,
        'Quantity': item.quantity,
        'Status': item.quantity === 0 ? 'Out of Stock' : item.quantity <= 5 ? 'Low Stock' : 'In Stock'
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 45 }, // Item Name
        { wch: 20 }, // Category
        { wch: 15 }, // Location
        { wch: 10 }, // Quantity
        { wch: 15 }  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Hardware_Hub_Inventory_${today}.xlsx`);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible for inline onclick handlers
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.adjustQty = adjustQty;
window.deleteItem = deleteItem;
