// Pagination state
let currentIndex = 0;
const itemsPerPage = 2;
let cart = [];
const initialVisibleCount = 5; // Number of products to show initially
let currentVisibleCount = initialVisibleCount;

// Function to calculate price based on size
function calculatePrice(basePrice, size) {
    return (basePrice / 1000) * size + packingCharges; // Price per gram, multiplied by size in grams
}

// Quantity update functions
function increaseQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decreaseQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
    }
}

// Function to update price based on size
function updatePrice(productId, basePrice) {
    const size = document.getElementById(`packet-${productId}`).value;
    const priceElement = document.getElementById(`price-${productId}`);
    const newPrice = calculatePrice(basePrice, size);
    priceElement.innerText = `₹${newPrice.toFixed(2)}`;
}

// Function to add product to cart
function addToCart(productId) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).value);
    const size = document.getElementById(`packet-${productId}`).value;
    const price = parseFloat(document.getElementById(`price-${productId}`).innerText.replace("₹", ""));
    
    const existingItemIndex = cart.findIndex(item => item.productId === productId && item.size === size);
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ productId, size, quantity, price });
    }
    
    // Update cart count display
    document.getElementById("cart-count").innerText = cart.reduce((total, item) => total + item.quantity, 0);
    
	showCartNotification(); // Show notification to encourage user to check the cart
	showAddToCartPopup(productId);
	
}

function showAddToCartPopup(productId) {
    const productCard = document.getElementById(`product-${productId}`);
    const packetSelector = productCard.querySelector(".packet-selector");
    const quantity = document.getElementById(`quantity-${productId}`).value;

    let popup = productCard.querySelector(".add-cart-popup");
    if (!popup) {
        popup = document.createElement("div");
        popup.className = "add-cart-popup";
        packetSelector.appendChild(popup);
    }

    // Ensure message text is short
    popup.textContent = `Added ${quantity} item(s)!`;

    popup.classList.add("show");

    // Automatically remove the class after animation
    setTimeout(() => {
        popup.classList.remove("show");
    }, 2000); // Match animation duration
}


// Function to display cart items
function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalCostElement = document.getElementById("total-cost");
    const totalPayableElement = document.getElementById("total-payable");
    const placeOrderContainer = document.getElementById("place-order-container"); // Get the place order container

    cartItemsContainer.innerHTML = "";
    let totalCost = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const itemTotalPrice = item.price * item.quantity;
        totalCost += itemTotalPrice;
        
        // Determine the size label based on item size
        const sizeLabel = item.size === '1000' ? '1 kg' : `${item.size} g`; // Adjust the size label here

        const cartItemHTML = `
            <div class="col-12 cart-item d-flex align-items-center">
                <div class="product-image">
                    <img src="${product.img}" alt="${product.name}">
                </div>
                <div class="product-details d-flex flex-column flex-grow-1">
                    <div class="product-info d-flex justify-content-between align-items-center">
                        <div class="product-name-price">
                            <h5 class="product-name">${product.name} (${sizeLabel})</h5>
                            <p class="product-price">Price: ₹${item.price.toFixed(2)}</p>
                        </div>
                        <p class="product-total">Total: ₹${itemTotalPrice.toFixed(2)}</p>
                    </div>
                    <div class="quantity-controls d-flex align-items-center">
                        <button class="quantity-btn" onclick="decreaseCartQuantity(${item.productId}, '${item.size}')">-</button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn" onclick="increaseCartQuantity(${item.productId}, '${item.size}')">+</button>
                        <span class="remove-item" onclick="removeFromCart(${item.productId}, '${item.size}')">
                            <i class="fas fa-trash"></i> Remove
                        </span>
                    </div>
                </div>
            </div>
        `;

        cartItemsContainer.innerHTML += cartItemHTML;
    });

    // Update cost summary only if there are items in the cart
    if (totalCost > 0) {
        totalCostElement.innerText = `மொத்த விலை: ₹${totalCost.toFixed(2)}`;

        // Show the Place Order button
        placeOrderContainer.style.display = 'block';
    } else {
        // Clear the cost summary if the cart is empty and encourage the user to add items
        totalCostElement.innerText = "";
        totalCostElement.innerText = "தயவுசெய்து தேவையான பொருட்களைச் சேர்க்கவும்!";

        // Hide the Place Order button
        placeOrderContainer.style.display = 'none';
    }
}



function toggleCartModal(show) {
    const modal = document.getElementById("cart-modal");
    modal.style.display = show ? "block" : "none";
    if (show) {
        renderCart(); // Render cart items when opening the modal
    }
}

// Close modal when clicking outside content
window.addEventListener("click", (event) => {
    const modal = document.getElementById("cart-modal");
    if (event.target === modal) {
        toggleCartModal(false);
    }
});

document.getElementById("view-cart").addEventListener("click", () => {
    toggleCartModal(true);
});


// Function to increase quantity in the cart
function increaseCartQuantity(productId, size) {
    const cartItem = cart.find(item => item.productId === productId && item.size === size);
    if (cartItem) {
        cartItem.quantity += 1;
        renderCart();
        updateCartCount();
    }
}

// Function to decrease quantity in the cart
function decreaseCartQuantity(productId, size) {
    const cartItem = cart.find(item => item.productId === productId && item.size === size);
    if (cartItem && cartItem.quantity > 1) {
        cartItem.quantity -= 1;
        renderCart();
        updateCartCount();
    }
}

// Function to remove product from cart
function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.productId === productId && item.size === size));
    renderCart();
    updateCartCount();
}

// Function to update the cart count display
function updateCartCount() {
    document.getElementById("cart-count").innerText = cart.reduce((total, item) => total + item.quantity, 0);
}





// Function to place order via WhatsApp with table format
function placeOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
	
	let message = "வணக்கம், நான் தங்களிடம் ஆர்டர் செய்ய விரும்புகிறேன்:\n";
	message += "";
	message += "பொருள்\tஅளவு\tஎண்\tவிலை\tமொத்தம்\n";
	message += "--------------------------------------------------\n";


    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const itemTotalPrice = item.price * item.quantity; // Total price for the item
		
		// Determine the size label based on item size
        const sizeLabel = item.size === '1000' ? '1 kg' : `${item.size} g`; // Adjust the size label here

        message += `${product.name}\t${sizeLabel}\t${item.quantity} qty\t₹${item.price.toFixed(2)}\t₹${itemTotalPrice.toFixed(2)}\n`;
    });

    const totalCost = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    message += "--------------------------------------------------\n";
    message += `மொத்த விலை:\t₹${totalCost.toFixed(2)}\n`;
	
	const whatsappNumber = '9047812407'; // Replace with your WhatsApp number
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Open the WhatsApp link
    window.open(whatsappLink, '_blank');
}


// JavaScript for handling menu popup
const menuIcon = document.getElementById('menu-icon');
const menuPopup = document.getElementById('menu-popup');

// Function to show the popup menu
function showPopup() {
    const rect = menuIcon.getBoundingClientRect(); // Get the position of the menu icon
    menuPopup.style.top = `${rect.bottom + window.scrollY}px`; // Position below the menu icon
    menuPopup.style.right = `10px`; // Align it to the right
    menuPopup.style.display = 'block'; // Show the menu
}

// Show popup menu when the menu icon is clicked
menuIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    if (menuPopup.style.display === 'block') {
        menuPopup.style.display = 'none'; // Hide if already visible
    } else {
        showPopup(); // Show the popup and set its position
    }
});

// Hide popup menu when clicking outside the menu
document.addEventListener('click', (e) => {
    if (!menuPopup.contains(e.target) && e.target !== menuIcon) {
        menuPopup.style.display = 'none'; // Hide the menu if clicked outside
    }
});

// Hide the menu when a link is clicked and smooth scroll
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', () => {
        menuPopup.style.display = 'none'; // Hide the menu on link click
    });
});

// Hide the menu when scrolling
window.addEventListener('scroll', () => {
    menuPopup.style.display = 'none'; // Hide the menu on scroll
});

// JavaScript to handle the scroll progress and button functionality
const scrollButton = document.getElementById("scroll-to-top");

document.addEventListener("scroll", () => {
    const scrollTop = window.scrollY; // Current scroll position
    const scrollHeight = document.body.scrollHeight - window.innerHeight; // Total scrollable height
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    // Ensure a minimum visual representation for low scroll percentages
    const minPercent = Math.max(scrollPercent, 5); // Set minimum percent to 5%

    // Update the circle's progress
    scrollButton.style.background = `conic-gradient(#4caf50 ${minPercent}%, #fff ${minPercent}%)`;

    // Show the button after scrolling down 100px
    if (scrollTop > 100) {
        scrollButton.classList.add("visible");
    } else {
        scrollButton.classList.remove("visible");
    }
});

// Scroll to the top when the button is clicked
scrollButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Hide the button after scrolling to the top
    setTimeout(() => {
        scrollButton.classList.remove("visible");
    }, 600); // Matches the duration of smooth scrolling
});


// Function to increase quantity
function increaseQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    let currentQuantity = parseInt(quantityInput.value, 10);
    quantityInput.value = currentQuantity + 1;

    // Animate the Add to Cart button
    const orderButton = document.querySelector(`#order-btn-${productId}`);
    orderButton.classList.add('zoom-in');
    
    // Remove the animation class after the animation ends
    orderButton.addEventListener('animationend', () => {
        orderButton.classList.remove('zoom-in');
    }, { once: true }); // Using { once: true } to ensure the listener is removed after it runs
}

// Function to decrease quantity
function decreaseQuantity(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    let currentQuantity = parseInt(quantityInput.value, 10);
    
    if (currentQuantity > 1) {
        quantityInput.value = currentQuantity - 1;

        // Animate the Add to Cart button
        const orderButton = document.querySelector(`#order-btn-${productId}`);
        orderButton.classList.add('zoom-out');
        
        // Remove the animation class after the animation ends
        orderButton.addEventListener('animationend', () => {
            orderButton.classList.remove('zoom-out');
        }, { once: true }); // Using { once: true } to ensure the listener is removed after it runs
    }
}

// Update the Add to Cart button to include the unique ID for each product
function renderProducts() {
    const productList = document.getElementById("product-list");

    // Clear existing content
    productList.innerHTML = "";

    // Group products by category
    const groupedProducts = products.reduce((groups, product) => {
        if (!groups[product.category]) {
            groups[product.category] = [];
        }
        groups[product.category].push(product);
        return groups;
    }, {});

    // Render each category
    Object.keys(groupedProducts).forEach(category => {
        const categoryContainer = document.createElement("div");
        categoryContainer.className = "category-container";
        categoryContainer.innerHTML = `
            <h3 class="category-title">${category}</h3>
            <div class="product-carousel-container">
                <div class="product-carousel">
                    <button class="scroll-button left" id="scroll-left-${category}" onclick="scrollCarousel('${category}', -1)">&#10094;</button>
                    <div class="product-carousel-inner" id="carousel-${category}">
                        ${groupedProducts[category].map(product => `
                            <div class="product-card" id="product-${product.id}">
                                <img src="${product.img}" alt="${product.name}">
                                <h5 class="product-tamil">${product.name}</h5>
                                <div class="packet-selector">
                                    <label for="packet-${product.id}" class="packet-label">Select Size:</label>
                                    <select id="packet-${product.id}" class="packet-dropdown" onchange="updatePrice(${product.id}, ${product.basePrice})">
                                        <option value="250" selected>250g</option>
                                        <option value="500">500g</option>
                                        <option value="1000">1kg</option>
                                    </select>
                                </div>
                                <p class="product-price" id="price-${product.id}">₹${calculatePrice(product.basePrice, 250).toFixed(2)}</p>
                                <div class="quantity-selector">
                                    <button class="btn btn-outline-secondary btn-sm" onclick="decreaseQuantity(${product.id})">-</button>
                                    <input type="text" id="quantity-${product.id}" value="1" readonly>
                                    <button class="btn btn-outline-secondary btn-sm" onclick="increaseQuantity(${product.id})">+</button>
                                </div>
                                <button class="order-btn" id="order-btn-${product.id}" onclick="addToCart(${product.id})">Add to Cart</button>
                                <div class="notification" id="notification-${product.id}" style="display: none;">Added to cart!</div>
                                <!-- Share icon -->
                                <div class="share-icon" onclick="toggleShareIcons(event, ${product.id})">
                                    <i class="fas fa-share-alt"></i> <!-- Font Awesome Share Icon -->
                                </div>
                                <!-- Social Media Icons -->
                                <div class="social-share-icons" id="social-share-${product.id}" style="display: none;">
                                    <a href="#" onclick="shareProduct('${product.name}', '${product.img}', ${product.id}, 'whatsapp')" title="Share on WhatsApp">
                                        <i class="fab fa-whatsapp"></i>
                                    </a>
                                    <a href="#" onclick="shareProduct('${product.name}', '${product.img}', ${product.id}, 'instagram')" title="Share on Instagram">
                                        <i class="fab fa-instagram"></i>
                                    </a>
                                    <a href="#" onclick="shareProduct('${product.name}', '${product.img}', ${product.id}, 'facebook')" title="Share on Facebook">
                                        <i class="fab fa-facebook"></i>
                                    </a>
                                    <a href="#" onclick="shareProduct('${product.name}', '${product.img}', ${product.id}, 'telegram')" title="Share on Telegram">
                                        <i class="fab fa-telegram"></i>
                                    </a>
                                    <a href="#" onclick="shareProduct('${product.name}', '${product.img}', ${product.id}, 'gmail')" title="Share via Email">
                                        <i class="fas fa-envelope"></i>
                                    </a>
                                    <a href="#" onclick="copyLink('${location.href}')">
                                        <i class="fas fa-link"></i>
                                    </a>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <button class="scroll-button right" id="scroll-right-${category}" onclick="scrollCarousel('${category}', 1)">&#10095;</button>
                </div>
            </div>
        `;

        productList.appendChild(categoryContainer);

        // Start auto-scrolling the carousel
        startAutoScroll(category);
    });
}



// Function to scroll carousel
function scrollCarousel(category, direction) {
    const carousel = document.getElementById(`carousel-${category}`);
    const scrollAmount = carousel.clientWidth / 2; // Scroll half the width of the carousel

    carousel.scrollBy({
        left: scrollAmount * direction, // Determine direction of scroll
        behavior: 'smooth' // Smooth scrolling effect
    });

    // Check if the end of the carousel is reached and scroll back to start
    if (direction === 1 && carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth) {
        setTimeout(() => {
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        }, 100); // Delay for smoother transition
    } else if (direction === -1 && carousel.scrollLeft <= 0) {
        setTimeout(() => {
            carousel.scrollTo({ left: carousel.scrollWidth - carousel.clientWidth, behavior: 'smooth' });
        }, 100); // Delay for smoother transition
    }
}

// Function to start auto-scrolling when a specific position is reached
function startAutoScroll(category) {
    const carousel = document.getElementById(`carousel-${category}`);
    const totalScrollWidth = carousel.scrollWidth - carousel.clientWidth;
    let autoScrollEnabled = false; // Flag to control auto-scrolling

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const { isIntersecting, intersectionRatio } = entry;

                // Trigger auto-scrolling when 70% of the category is visible
                if (isIntersecting && intersectionRatio >= 0.7 && !autoScrollEnabled) {
                    autoScrollEnabled = true; // Prevents multiple triggers
                    autoScroll(category, totalScrollWidth);
                } else if (!isIntersecting) {
                    autoScrollEnabled = false; // Reset the flag when out of view
                }
            });
        },
        {
            threshold: [0.7], // Trigger when 70% is visible
        }
    );

    observer.observe(carousel);
}

// Auto-scroll functionality with fast scrolling
function autoScroll(category, totalScrollWidth) {
    const carousel = document.getElementById(`carousel-${category}`);
    const scrollStep = carousel.clientWidth; // Scroll the entire width of the carousel in one step
    let currentScroll = 0;

    const scrollInterval = setInterval(() => {
        if (currentScroll < totalScrollWidth) {
            scrollCarousel(category, 1); // Scroll right
            currentScroll += scrollStep; // Increment the current scroll
        } else {
            clearInterval(scrollInterval); // Stop the interval
            setTimeout(() => {
                carousel.scrollTo({ left: 0, behavior: 'smooth' }); // Return to start
                zoomAndFadeScrollButtons(); // Trigger zoom and fade effect
            }, 50); // Delay before returning to start
        }
    }, 300); // Adjust the interval time as needed for faster scrolling (0.5 seconds)
}

// Function to zoom and fade scroll buttons
function zoomAndFadeScrollButtons() {
    const leftButton = document.querySelector('.scroll-button.left');
    const rightButton = document.querySelector('.scroll-button.right');

    // Add zoom and fade classes to both buttons
    leftButton.classList.add('zoom-fade');
    rightButton.classList.add('zoom-fade');

    // Remove the zoom effect after the animation ends
    setTimeout(() => {
        leftButton.classList.remove('zoom-fade');
        rightButton.classList.remove('zoom-fade');
    }, 3000); // Match this to the duration of your animation
}


// Call the function to display products when the page loads
document.addEventListener("DOMContentLoaded", renderProducts);



// Smooth scroll for product carousel
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
        card.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
    });
});


// Function to show cart notification below the cart icon
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-arrow"></div>
        <div class="notification-content">
            <strong class="small-text">பொருள் சேர்க்கப்பட்டது!</strong><span class="small-text">ஆர்டர் செய்ய உங்கள் கூடியைச் சரிபார்க்கவும்.</span>.
        </div>
    `;

    const cartIcon = document.getElementById('view-cart');
    cartIcon.insertAdjacentElement('afterend', notification); // Place notification below the cart icon

    // Automatically remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500); // Delay for fade-out effect
    }, 3000);
}


function shareProduct(productName, productImage, productId, platform) {
    // Update this with your actual product link logic
    const productLink = `https://tamizhmann.github.io/organic/`;
    
    // Prepare the share message with product details and image link
	const shareMessage = `*தமிழ் மண்*
	
தங்களை அன்புடன் வரவேற்கிறோம்.
		
நாங்கள் ஆரோக்கியத்தை மேம்படுத்தும் இயற்கை சிறுதானியங்கல் மற்றும் சுவையான நாட்டுசர்க்கரை பயன்படுத்தி செய்யப்பட்ட பாரம்பரிய இயற்கை தின்பண்டங்களை வழங்குகிறோம்.
		
"உங்கள் ஆர்டரை பெற்ற பிறகு புதியதாக தயாரிக்கப்படும் என்பதால், சிறந்த தரத்திற்காக 2 நாட்கள் நேரம் வேண்டுமெனத் தெரிவித்துக் கொள்கிறோம்."
		
*_Check out this amazing product: ${productName}_*

*Click here!* ${productLink} \n`;

    // Initialize the sharing URL
    let urlToShare = '';

    // Switch case for platform-specific sharing
    switch (platform) {
        case 'whatsapp':
            // Use the WhatsApp API link with the share message
            urlToShare = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
            break;
			
        case 'gmail':
            urlToShare = `mailto:?subject=Amazing Product&body=${encodeURIComponent(shareMessage)}`;
            break;
        case 'facebook':
            urlToShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`;
            break;
        case 'telegram':
            urlToShare = `https://t.me/share/url?url=${encodeURIComponent(productLink)}&text=${encodeURIComponent(productName)}`;
            break;
        case 'instagram':
            alert('Instagram sharing is not direct. Please copy the link to share: ' + productLink);
            return; // Prevent opening a link for Instagram, as it does not support direct URL sharing.
    }

    // Open the appropriate share link in a new tab
    window.open(urlToShare, '_blank');
}


function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied to clipboard!");
    });
}


function toggleShareIcons(event, productId) {
    event.stopPropagation(); // Prevent event bubbling
    const shareIcons = document.getElementById(`social-share-${productId}`);

    // First, hide all other share icons
    const allShareIcons = document.querySelectorAll('.social-share-icons');
    allShareIcons.forEach(icon => {
        if (icon !== shareIcons) {
            icon.style.display = 'none'; // Hide other icons
        }
    });

    // Toggle the display of the share icons
    if (shareIcons.style.display === "none" || shareIcons.style.display === "") {
        shareIcons.style.display = "block"; // Show the share icons

        // Automatically hide share icons after 5 seconds
        const timeout = setTimeout(() => {
            if (!shareIcons.matches(':hover') && !document.getElementById(`product-${productId}`).matches(':hover')) {
                shareIcons.style.display = "none"; // Hide the share icons after 5 seconds if not hovered
            }
        }, 5000);

        // Clear timeout if mouse enters the share icons
        shareIcons.addEventListener('mouseenter', () => {
            clearTimeout(timeout); // Keep icons visible
        });
        shareIcons.addEventListener('mouseleave', () => {
            // Start timer to hide if not hovered after 5 seconds
            timeout = setTimeout(() => {
                if (!shareIcons.matches(':hover') && !document.getElementById(`product-${productId}`).matches(':hover')) {
                    shareIcons.style.display = "none"; // Hide the share icons after 5 seconds if not hovered
                }
            }, 1000);
        });
    } else {
        shareIcons.style.display = "none"; // Hide the share icons if already visible
    }
}

// Hide share icons if clicked outside
document.addEventListener("click", function(event) {
    const shareIconElements = document.querySelectorAll('.social-share-icons');
    shareIconElements.forEach(icon => {
        icon.style.display = 'none'; // Hide all icons
    });
});

// Show the share icons if mouse is over the icons or product card
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        const shareIcons = card.querySelector('.social-share-icons');
        if (shareIcons.style.display === "block") {
            shareIcons.style.display = "block"; // Keep it visible
        }
    });

    card.addEventListener('mouseleave', () => {
        const shareIcons = card.querySelector('.social-share-icons');
        if (!shareIcons.matches(':hover')) {
            shareIcons.style.display = "none"; // Hide if not hovered
        }
    });
});



