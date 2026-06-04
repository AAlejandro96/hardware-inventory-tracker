// ===== Checkout Page (checkout.html) =====
const { db, ref, onValue, push, set, update, get } = window.FirebaseDB;
const { isAuthorized } = window.AppUtils;

let currentUser = null;
let allItems = [];
let cart = {};

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
        document.getElementById('checkoutContent').classList.remove('hidden');
        document.getElementById('userBadge').textContent = `👤 ${alias}`;
        initCheckout();
    } else {
        document.getElementById('authError').classList.remove('hidden');
    }
}

function initCheckout() {
    const inventoryRef = ref(db, 'inventory');
    onValue(inventoryRef, (snapshot) => {
        const data = snapshot.val();
        allItems = [];
        if (data) {
            Object.keys(data).forEach(key => {
                allItems.push({ id: key, ...data[key] });
            });
        }
        allItems.sort((a, b) => a.name.localeCompare(b.name));
        renderItemList();
    });

    document.getElementById('itemSearch').addEventListener('input', renderItemList);
    document.getElementById('checkoutBtn').addEventListener('click', processCheckout);
}

function renderItemList() {
    const search = document.getElementById('itemSearch').value.toLowerCase();
    const container = document.getElementById('itemList');

    const filtered = allItems.filter(item =>
        item.quantity > 0 && (
            item.name.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search) ||
            item.location.toLowerCase().includes(search)
        )
    );

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-cart">No items available.</p>';
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="item-row">
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">${escapeHtml(item.category)} • ${escapeHtml(item.location)} • Qty: ${item.quantity}</div>
            </div>
            <div class="item-actions">
                <input type="number" class="qty-input" id="qty-${item.id}" min="1" max="${item.quantity}" value="1">
                <button class="btn btn-small btn-primary" onclick="addToCart('${item.id}')">+ Add</button>
            </div>
        </div>
    `).join('');
}

function addToCart(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const qtyInput = document.getElementById(`qty-${itemId}`);
    const qty = parseInt(qtyInput.value) || 1;
    const maxQty = item.quantity;

    // Check if adding would exceed available
    const currentInCart = cart[itemId] ? cart[itemId].qty : 0;
    const totalRequested = currentInCart + qty;

    if (totalRequested > maxQty) {
        alert(`Only ${maxQty} available. You already have ${currentInCart} in your cart.`);
        return;
    }

    if (cart[itemId]) {
        cart[itemId].qty += qty;
    } else {
        cart[itemId] = { name: item.name, qty: qty, maxQty: maxQty };
    }

    renderCart();
}

function removeFromCart(itemId) {
    delete cart[itemId];
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const items = Object.keys(cart);

    if (items.length === 0) {
        container.innerHTML = '<p class="empty-cart">No items selected yet.</p>';
        checkoutBtn.classList.add('hidden');
        return;
    }

    container.innerHTML = items.map(id => `
        <div class="cart-item">
            <span>${escapeHtml(cart[id].name)}</span>
            <span class="cart-qty">×${cart[id].qty}</span>
            <button class="btn btn-small btn-danger" onclick="removeFromCart('${id}')">Remove</button>
        </div>
    `).join('');

    checkoutBtn.classList.remove('hidden');
}

async function processCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        // Update inventory quantities and log each item
        for (const [itemId, cartItem] of Object.entries(cart)) {
            // Get current quantity (real-time)
            const itemRef = ref(db, `inventory/${itemId}`);
            const snapshot = await get(itemRef);
            const current = snapshot.val();

            if (current) {
                const newQty = Math.max(0, current.quantity - cartItem.qty);
                await update(itemRef, { quantity: newQty });
            }

            // Log the checkout
            const logRef = ref(db, 'activityLog');
            const newLog = push(logRef);
            await set(newLog, {
                timestamp: Date.now(),
                user: currentUser,
                action: 'Took',
                item: cartItem.name,
                quantity: cartItem.qty
            });
        }

        // Show success
        document.querySelector('.checkout-section').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        cart = {};
    } catch (error) {
        alert('Error processing checkout. Please try again.');
        console.error(error);
    }

    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Confirm Checkout';
}

function resetCheckout() {
    document.querySelector('.checkout-section').classList.remove('hidden');
    document.getElementById('successMessage').classList.add('hidden');
    renderCart();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.resetCheckout = resetCheckout;
