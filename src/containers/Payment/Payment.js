import "./Payment.css";
import { useContext, useState } from "react";
import { HotelDetailContext } from "../../contexts/HotelDetailContext";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const { cart, clearCart } = useContext(HotelDetailContext);
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  const [method, setMethod] = useState("card");

  const [card, setCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const [isPaying, setIsPaying] = useState(false);

  const navigate = useNavigate();

  const handlePay = () => {
    setIsPaying(true);

    setTimeout(() => {
      clearCart();
      navigate("/payment-success");
    }, 1000);
  };

  const isShippingFilled =
    shipping.fullName &&
    shipping.address &&
    shipping.city &&
    shipping.zip &&
    shipping.phone;

  const isCardFilled =
    method !== "card" || (card.name && card.number && card.expiry && card.cvv);

  const isFormValid = isShippingFilled && isCardFilled;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");

    // format as (123) 456-7890
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(
      6,
      10
    )}`;
  };

  const formatCardNumber = (value) => {
    // keep only digits
    const digits = value.replace(/\D/g, "");

    // group into 4 digits: 1234 5678 9012 3456
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="payment-page">
      <h2>Checkout</h2>

      <div className="payment-container">
        <div className="form-section">
          <h3>Shipping Address</h3>

          <div className="form-group">
            <label>Full Name</label>
            <input
              value={shipping.fullName}
              onChange={(e) =>
                setShipping({ ...shipping, fullName: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              value={shipping.address}
              onChange={(e) =>
                setShipping({ ...shipping, address: e.target.value })
              }
            />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>City</label>
              <input
                value={shipping.city}
                onChange={(e) =>
                  setShipping({ ...shipping, city: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Zip</label>
              <input
                value={shipping.zip}
                onChange={(e) =>
                  setShipping({ ...shipping, zip: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              value={shipping.phone}
              onChange={(e) =>
                setShipping({ ...shipping, phone: formatPhone(e.target.value) })
              }
              maxLength="14" // (123) 456-7890
            />
          </div>

          <h3>Payment Method</h3>
          <div className="form-group">
            <select
              onChange={(e) => {
                setMethod(e.target.value);
              }}
            >
              <option value="card">Credit Card</option>
              <option value="gift">Gift Card</option>
              <option value="credit">Store Credit</option>
            </select>
          </div>

          {method === "card" && (
            <div className="credit-card-box">
              <div className="form-group">
                <label>Name on Card</label>
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input
                  value={card.number}
                  onChange={(e) =>
                    setCard({
                      ...card,
                      number: formatCardNumber(e.target.value),
                    })
                  }
                  maxLength="19" // 16 digits + 3 spaces
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="form-group">
                <label>Expiry</label>
                <input
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  placeholder="MM/YY"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  maxLength="4"
                  placeholder="123"
                />
              </div>
            </div>
          )}
        </div>

        <div className="summary-section">
          <h3>Order Summary</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.title} * {item.quantity}
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="total">
            Total: <strong>${totalPrice}</strong>
          </div>
          <button
            className="pay-btn"
            disabled={!isFormValid || isPaying}
            onClick={handlePay}
          >
            {isPaying ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;