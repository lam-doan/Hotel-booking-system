import { createContext, useContext } from "react";
import { useState} from 'react';

export const HotelDetailContext = createContext();

export const HotelDetailProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        setCart((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (existing) {
            return prev.map((p) =>
            p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
            );
        }
        return [...prev, { ...item, quantity: 1 }];
        });
    };

    const increaseQty = (id) => {
        setCart((prev) =>
        prev.map((p) =>
            p.id === id ? { ...p, quantity: p.quantity + 1 } : p
        )
        );
    };

    const decreaseQty = (id) => {
        setCart((prev) =>
        prev
            .map((p) =>
            p.id === id ? { ...p, quantity: p.quantity - 1 } : p
            )
            .filter((p) => p.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((p) => p.id !== id));
    };

    const clearCart = () => setCart([]);

    return (
        <HotelDetailContext.Provider 
            value={{
                cart,
                addToCart,
                increaseQty,
                decreaseQty,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </HotelDetailContext.Provider>
    )
}