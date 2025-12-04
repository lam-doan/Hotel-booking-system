import React from "react";
import { Link } from "react-router-dom";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  return (
    <div className="payment-success">
      <h2>Payment Successful!</h2>
      <p>Your order has been placed.</p>
      <Link to="/" className="btn">Return to Home</Link>
    </div>
  );
};

export default PaymentSuccess;