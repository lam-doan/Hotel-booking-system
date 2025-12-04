import React, {useContext} from 'react';
import './Cart.css';
import { HotelDetailContext } from '../../contexts/HotelDetailContext';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, increaseQty, decreaseQty, removeFromCart, clearCart } = useContext(HotelDetailContext);

    const getTotal = () => {
        return cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0).toFixed(2);
    };

    if (cart.length === 0) {
        return <div className="cart-empty">Your cart is empty.</div>;
    }

    return (
        <div className='cart'>
            <h2>Your Cart</h2>
            <div className='cart-items'>
                {cart.map((item) => (
                    <div className='cart-item' key={item.id}>
                        <img src={item.hotelThumbnail} alt={item.hotelName}/>
                        <div className='item-details'>
                            <h3>{item.hotelName} - {item.name}</h3>
                            <p>Price: ${item.price}</p>
                            <div className='quantity-controls'>
                                <button onClick={() => decreaseQty(item.id)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => increaseQty(item.id)}>+</button>
                            </div>
                            <button className='remove-btn' onClick={() => removeFromCart(item.id)}>Remove</button>
                        </div>
                    </div>
                ))} 
            </div>
            <div className='cart-total'>
                <h3>Total: ${getTotal()}</h3>
                <button className='clear-btn' onClick={clearCart}>Clear Cart</button>
                <Link to="/payment" className="checkout-btn">
                    Go to Payment
                </Link>
            </div>
        </div>
    )
}

export default Cart;