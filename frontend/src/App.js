import React, { useState, useEffect, useRef } from "react";
import Tesseract from 'tesseract.js';
import html2canvas from "html2canvas";
import productsData from "./data/productsData";
import categoriesData from "./data/categoriesData";

// Helper Functions
const normalizeImage = (src) => {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/images/${src}`;
};

const normalizeVideo = (src) => {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/videos/${src}`;
};

// --- Sub-components (Moved outside of App to prevent re-creation loops) ---

const SocialIcons = ({ ownerNumber, ownerInstagram }) => (
  <div className="social-icons-container">
    <a href={`https://wa.me/${ownerNumber}`} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" aria-label="WhatsApp">
      <i className="fa fa-whatsapp"></i>
    </a>
    <a href={`https://www.instagram.com/${ownerInstagram}`} target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
      <i className="fa fa-instagram"></i>
    </a>
  </div>
);

const Navbar = ({ cartCount, onCategorySelect, categories, onCartClick, disabled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  const handleCategoryClick = (category) => {
    if (disabled) return;
    onCategorySelect(category);
    setIsMenuOpen(false);
  }

  const handleCartClick = () => {
    if (disabled) return;
    onCartClick();
    setIsMenuOpen(false);
  }

  const navButtonClasses = "px-4 py-2 rounded-md text-white font-semibold whitespace-nowrap hover:bg-pink-600/50 transition-colors";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="bg-black/30 backdrop-blur-md shadow-lg sticky top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center ${disabledClasses}`}>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Ajith Pyro Parks</h1>
          </div>
          <button onClick={handleCartClick} className={`relative bg-gradient-to-r from-pink-600 to-red-500 text-white font-semibold px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform btn-shine ${disabledClasses}`}>
            <i className="fa fa-shopping-cart mr-2"></i> Cart ({cartCount})
          </button>
        </div>

        <div className="relative group px-10">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm"
          >
            <i className="fa fa-chevron-left"></i>
          </button>

          <div 
            ref={scrollRef}
            className="flex items-center overflow-x-auto no-scrollbar space-x-2 py-2 scroll-smooth"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            <button onClick={() => handleCategoryClick("all")} className={`${navButtonClasses} ${disabledClasses}`}>All Products</button>
            {categories.map((category) => (
              <button key={category} onClick={() => handleCategoryClick(category)} className={`${navButtonClasses} ${disabledClasses}`}>
                {category}
              </button>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

const ProductCard = ({ product, onProductClick, onAddToCart }) => {
  const discountPercent = product.discounted_price ? Math.round(((product.price - product.discounted_price) / product.price) * 100) : 0;
  const imageSrc = normalizeImage(product.image_url || product.image) || "https://mania3d-assets.web.app/crackers-placeholder.jpg";

  return (
    <div className="glass-card rounded-xl overflow-hidden group">
      <div className="relative overflow-hidden cursor-pointer bg-white/5 h-56 flex items-center justify-center p-2" onClick={() => onProductClick(product)}>
        <img 
          src={imageSrc} 
          alt={product.name} 
          className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500" 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/400x400/1a1a2e/pink?text=Fireworks";
          }} 
        />
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {discountPercent}% OFF
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{product.name}</h3>
        {product.nameTamil && <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">{product.nameTamil}</p>}
        <p className="text-pink-400 text-xs sm:text-sm mb-3">{product.category || product.category_name}</p>
        <div className="flex items-baseline justify-start space-x-2 mb-4">
          {product.discounted_price ? (
            <>
              <span className="text-2xl font-bold text-yellow-400">₹{product.discounted_price}</span>
              <span className="text-md text-gray-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-yellow-400">₹{product.price}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-600/40 transition-all duration-300 btn-shine"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const OrderSummary = ({ orderId, customerInfo, cartItems, totalAmount }) => {
  const downloadBill = () => {
    const billContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎆 Ajith Pyro Parks- OFFICIAL BILL 🎆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order ID: ${orderId}
Date: ${new Date().toLocaleDateString("en-IN")}
Time: ${new Date().toLocaleTimeString("en-IN")}

CUSTOMER DETAILS:
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PURCHASED ITEMS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${cartItems
    .map(
      (item, index) => `${index + 1}. ${item.name}
  Category: ${item.category || item.category_name}
  Unit Price: ₹${item.discounted_price || item.price}
  Quantity: ${item.quantity}
  Subtotal: ₹${(item.discounted_price || item.price) * item.quantity}
`
    )
    .join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BILL SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Items: ${cartItems.reduce((sum, item) => sum + item.quantity, 0)}
Final Amount: ₹${totalAmount}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for shopping with Ajith Pyro Parks Shop!
Celebrate responsibly and safely! 🎇
`;

    const billDiv = document.createElement("div");
    billDiv.style.position = "fixed";
    billDiv.style.left = "-9999px";
    billDiv.style.width = "600px";
    billDiv.style.padding = "20px";
    billDiv.style.fontFamily = "monospace";
    billDiv.style.whiteSpace = "pre-wrap";
    billDiv.style.background = "#fff";
    billDiv.style.color = "#000";
    billDiv.style.border = "2px solid #000";
    billDiv.style.borderRadius = "10px";
    billDiv.style.lineHeight = "1.5";
    billDiv.innerText = billContent;

    document.body.appendChild(billDiv);

    html2canvas(billDiv).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Paid-Bill-${orderId}.png`;
      link.click();
      document.body.removeChild(billDiv);
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-6 rounded-xl mb-8">
        <h1 className="text-4xl font-bold mb-2">🎉 Order Confirmed! 🎉</h1>
        <p className="text-lg">Thank you for your purchase! Your celebration is on its way.</p>
      </div>
      <div className="glass-card rounded-xl p-8 mb-8 text-left">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gradient">Order Summary</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-6 border-b border-white/10 pb-6">
          <div>
            <h3 className="font-semibold text-xl mb-2 text-pink-300">Order Details:</h3>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</p>
          </div>
          <div>
            <h3 className="font-semibold text-xl mb-2 text-pink-300">Customer Details:</h3>
            <p><strong>Name:</strong> {customerInfo.name}</p>
            <p><strong>Phone:</strong> {customerInfo.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-xl mb-4 text-pink-300">Purchased Items:</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
              <div className="flex items-center space-x-4">
                <img 
                  src={normalizeImage(item.image_url || item.image)} 
                  alt={item.name} 
                  className="w-14 h-14 object-cover rounded-md" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/100x100/1a1a2e/pink?text=Item";
                  }}
                />
                <div><p className="font-semibold">{item.name}</p><p className="text-sm text-gray-400">₹{item.discounted_price || item.price} × {item.quantity}</p></div>
              </div>
              <p className="font-semibold">₹{(item.discounted_price || item.price) * item.quantity}</p>
            </div>
          ))}
          <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center font-bold text-2xl">
            <span>Final Amount:</span>
            <span className="text-yellow-400">₹{totalAmount}</span>
          </div>
        </div>
      </div>
      <button onClick={downloadBill} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform btn-shine">📄 Download Bill</button>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900/50 border-t border-white/10 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gradient">Ajith Pyro Parks</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-6">Your one-stop shop for premium crackers and fireworks. Celebrate every occasion with a bang! Always handle with care and follow safety guidelines.</p>
        <p className="text-gray-500">&copy; 2026 Ajith Pyro Parks Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

const CheckoutPage = ({ cartItems, onBack, ownerWhatsApp, ownerInstagram }) => {
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "", flatNumber: "", street: "", city: "", pincode: "" });
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderId, setOrderId] = useState("");
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.totalPrice || (item.discounted_price || item.price) * item.quantity), 0);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleContinueToPayment = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.city || !customerInfo.email) {
      alert("Please fill in all required fields: Name, Email, Phone, and City.");
      return;
    }

    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const orderResponse = await fetch("http://localhost:5000/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const orderData = await orderResponse.json();

      if (!orderData.id) {
        alert("Failed to initialize payment. Please try again.");
        return;
      }

      setOrderId(orderData.id);

      const options = {
        key: "rzp_test_SolShoqHxoeOBl",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Ajith Pyro Parks",
        description: "Fireworks Purchase",
        order_id: orderData.id,
        handler: async function (response) {
          const verifyResponse = await fetch("http://localhost:5000/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyResponse.json();

          if (verifyData.status === "success") {
            await fetch("http://localhost:5000/send-order-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clientName: customerInfo.name,
                clientEmail: customerInfo.email,
                orderId: orderData.id,
                totalAmount,
                customerInfo,
                cartItems
              }),
            });
            setShowOrderSummary(true);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: "#E11D48",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong. Please check your connection.");
    }
  };

  if (showOrderSummary) {
    return <OrderSummary orderId={orderId} customerInfo={customerInfo} cartItems={cartItems} totalAmount={totalAmount} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-6 bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white/20 transition-colors">← Back to Cart</button>
      <h1 className="text-4xl font-bold mb-8 text-center text-gradient">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 glass-card rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Customer Information</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name *" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="custom-input" required />
            <input type="email" placeholder="Email *" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} className="custom-input" required />
            <input type="tel" placeholder="Phone Number *" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="custom-input" required />
            <input type="text" placeholder="Flat/House Number" value={customerInfo.flatNumber} onChange={(e) => setCustomerInfo({ ...customerInfo, flatNumber: e.target.value })} className="custom-input" />
            <input type="text" placeholder="Street Address" value={customerInfo.street} onChange={(e) => setCustomerInfo({ ...customerInfo, street: e.target.value })} className="custom-input" />
            <input type="text" placeholder="City *" value={customerInfo.city} onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })} className="custom-input" required />
            <input type="number" placeholder="Pincode" value={customerInfo.pincode} onChange={(e) => setCustomerInfo({ ...customerInfo, pincode: e.target.value })} className="custom-input" />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl p-8 sticky top-28">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-gray-300">
                  <span>{item.name} <span className="text-xs">x{item.quantity}</span></span>
                  <span className="font-medium">₹{item.totalPrice || (item.discounted_price || item.price) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-yellow-400 text-2xl">₹{totalAmount}</span>
            </div>
            <button onClick={handleContinueToPayment} className="w-full mt-8 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform btn-shine">Pay Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = ({ product, onBack, onAddToCart, onCheckout }) => {
  const [quantity, setQuantity] = useState(1);
  const currentPrice = product.discounted_price || product.price;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    alert(`${quantity} ${product.name}(s) added to cart!`);
  };

  const imageSrc = normalizeImage(product.image_url || product.image);
  const videoSrc = normalizeVideo(product.video_url || product.video);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-8 bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white/20 transition-colors">← Back to Products</button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 glass-card p-8 rounded-xl items-center">
        <div className="bg-white/5 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
          {videoSrc ? (
            <video controls className="w-full rounded-lg shadow-lg" poster={imageSrc}>
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={imageSrc} 
              alt={product.name} 
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/600x400/1a1a2e/pink?text=Fireworks";
              }} 
            />
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-1 text-gradient">{product.name}</h1>
          {product.nameTamil && <p className="text-2xl text-gray-400 font-semibold mb-4">{product.nameTamil}</p>}
          <p className="text-pink-300 mb-4">{product.category}</p>
          <p className="text-gray-300 mb-6 leading-relaxed">{product.description || "Premium quality crackers for a dazzling celebration."}</p>
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              {product.discounted_price ? (
                <>
                  <span className="text-4xl font-bold text-yellow-400">₹{product.discounted_price}</span>
                  <span className="text-2xl text-gray-400 line-through">₹{product.price}</span>
                </>
              ) : (
                <span className="text-4xl font-bold text-yellow-400">₹{product.price}</span>
              )}
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-lg">Quantity:</span>
              <div className="flex items-center bg-slate-800 rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-xl rounded-full hover:bg-slate-700 transition">-</button>
                <span className="font-semibold text-lg w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 text-xl rounded-full hover:bg-slate-700 transition">+</button>
              </div>
            </div>
            <p className="text-xl font-semibold mb-4">Total: <span className="text-yellow-400">₹{totalPrice}</span></p>
          </div>
          <div className="space-y-4">
            <button onClick={handleAddToCart} className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform btn-shine">Add to Cart</button>
            <button onClick={() => onCheckout([{...product, quantity, totalPrice}])} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-full font-semibold text-lg hover:scale-105 transition-transform btn-shine">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ cart, onUpdateQuantity, onRemoveFromCart, onBack, onCheckout }) => {
  const totalAmount = cart.reduce((sum, item) => sum + (item.discounted_price || item.price) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient">Your Cart is Empty</h2>
          <p className="text-gray-300 mb-6">Looks like you haven't added any sparks yet!</p>
          <button onClick={onBack} className="bg-gradient-to-r from-pink-600 to-red-500 text-white px-8 py-3 rounded-full hover:scale-105 transition-transform font-semibold btn-shine">Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={onBack} className="mb-6 bg-white/10 text-white px-5 py-2 rounded-full hover:bg-white/20 transition-colors">← Back to Products</button>
      <h1 className="text-4xl font-bold mb-8 text-center text-gradient">Shopping Cart</h1>
      <div className="glass-card rounded-xl shadow-lg p-6">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between border-b border-white/10 py-4 last:border-b-0">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <img 
                src={normalizeImage(item.image_url || item.image)} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-lg" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/100x100/1a1a2e/pink?text=Item";
                }} 
              />
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {item.nameTamil && <p className="text-xs text-gray-400">{item.nameTamil}</p>}
                <p className="text-sm text-pink-300">{item.category}</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  {item.discounted_price ? (
                    <>
                      <span className="text-yellow-400 font-semibold">₹{item.discounted_price}</span>
                      <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
                    </>
                  ) : (
                    <span className="text-yellow-400 font-semibold">₹{item.price}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-slate-800 rounded-full">
                <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1 rounded-full hover:bg-slate-700 transition">-</button>
                <span className="font-semibold w-10 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 rounded-full hover:bg-slate-700 transition">+</button>
              </div>
              <p className="font-semibold text-lg w-24 text-right">₹{(item.discounted_price || item.price) * item.quantity}</p>
              <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500 hover:text-red-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-semibold">Total Amount:</span>
            <span className="text-3xl font-bold text-yellow-400">₹{totalAmount}</span>
          </div>
          <button onClick={() => onCheckout(cart)} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-full text-lg font-semibold hover:scale-105 transition-transform btn-shine">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const ownerWhatsApp = "919047512640";
  const ownerInstagram = "abdularavin";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const prods = productsData.products || [];
        const normalizedProducts = prods.map(p => ({
          ...p,
          category: p.category || p.category_name || "General",
        }));
        setCategories(categoriesData || []);
        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedProduct(null);
    setShowCart(false);
    setShowCheckout(false);
    const trimmed = category.trim().toLowerCase();
    if (trimmed === "all" || trimmed === "all products") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category.trim().toLowerCase() === trimmed));
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (id, q) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: q } : item));
  const handleRemoveFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  const handleCheckout = (items) => {
    setCheckoutItems(items);
    setShowCheckout(true);
    setShowCart(false);
    setSelectedProduct(null);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen text-2xl font-semibold text-gradient">Loading the Celebration...</div>;

  return (
    <>
      <style>{`
        body {
          background-color: #0a0a1a;
          background-image:
            radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
            radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
            radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px),
            radial-gradient(rgba(255,255,255,.4), rgba(255,255,255,.1) 2px, transparent 30px);
          background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
          background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
          animation: bg-sparkle 15s linear infinite;
        }
        @keyframes bg-sparkle {
          0% { background-position: 0 0, 40px 60px, 130px 270px, 70px 100px; }
          100% { background-position: -550px -550px, -350px -350px, -250px -250px, -150px -150px; }
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(45deg, #e0245a, #f76d49); border-radius: 5px; }
        .text-glow { animation: glow 2.5s ease-in-out infinite; }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 10px #ff6347, 0 0 20px #ff6347; }
          50% { text-shadow: 0 0 20px #ff4500, 0 0 40px #ff4500; }
        }
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: all 0.7s;
        }
        .btn-shine:hover::before { left: 100%; }
        .glass-card {
          background: rgba(26, 26, 46, 0.6); backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;
        }
        .glass-card:hover { transform: translateY(-8px); box-shadow: 0 0 25px rgba(224, 36, 90, 0.4); }
        .text-gradient {
          background-image: linear-gradient(to right, #f472b6, #ef4444, #f59e0b);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .custom-input {
          width: 100%; padding: 0.75rem; border-radius: 0.5rem; background: #1f2937; border: 1px solid #374151; color: white;
        }
        .custom-input:focus { border-color: #ec4899; outline: none; }
        .social-icons-container { 
          position: fixed; right: 25px; bottom: 25px; display: flex; flex-direction: column; gap: 15px; z-index: 1000; 
        }
        .social-icon {
          display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%;
          color: white; font-size: 30px; transition: all 0.4s; box-shadow: 0 6px 15px rgba(0,0,0,0.4);
        }
        .social-icon.whatsapp { background: #25D366; }
        .social-icon.instagram { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
        .social-icon:hover { transform: scale(1.15) translateY(-5px); box-shadow: 0 10px 25px currentColor; }
        
        @media (max-width: 768px) {
          .social-icons-container { right: 15px; bottom: 15px; gap: 10px; }
          .social-icon { width: 48px; height: 48px; font-size: 24px; }
          .text-glow { font-size: 2.5rem !important; line-height: 1.2; }
          .glass-card { padding: 1rem !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen">
        <SocialIcons ownerNumber={ownerWhatsApp} ownerInstagram={ownerInstagram} />
        <Navbar 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          onCategorySelect={handleCategorySelect} 
          categories={categories} 
          onCartClick={() => { setShowCart(true); setSelectedProduct(null); setShowCheckout(false); }}
          disabled={showCheckout}
        />
        
        {showCheckout ? (
          <CheckoutPage cartItems={checkoutItems} onBack={() => { setShowCheckout(false); setShowCart(true); }} ownerWhatsApp={ownerWhatsApp} ownerInstagram={ownerInstagram} />
        ) : selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onCheckout={handleCheckout} />
        ) : showCart ? (
          <CartPage cart={cart} onUpdateQuantity={handleUpdateQuantity} onRemoveFromCart={handleRemoveFromCart} onBack={() => setShowCart(false)} onCheckout={handleCheckout} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 text-glow px-2">Celebrate with Ajith Pyro Parks</h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">Discover our exclusive 2026 collection of premium crackers, sparkling fountains, and luxury gift boxes.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onProductClick={setSelectedProduct} onAddToCart={handleAddToCart} />
              ))}
            </div>
          </main>
        )}
        
        <Footer />
      </div>
    </>
  );
}

export default App;
