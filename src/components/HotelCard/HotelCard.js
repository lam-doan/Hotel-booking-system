import './HotelCard.css';
import { Link } from "react-router-dom";

const HotelCard = ({ hotel, checkin, checkout, adults, children }) => {
  // Format price if available
  const formatPrice = (price) => {
    if (price == null || isNaN(Number(price))) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  const formattedPrice = formatPrice(hotel.price);
  const hotelId = hotel.id;
  return (
    <div className="hotel-card">
      <img
        src={hotel.thumbnail || "/images/hotel-placeholder.jpg"}
        alt={hotel.name}
        className="hotel-img"
      />
      <div className="hotel-info">
        <h3 className="hotel-name">{hotel.name}</h3>
        <p className="hotel-location">{hotel.address}</p>

        <div className="hotel-badges">
          {/* Rating */}
          {hotel.rating > 0 && (
            <span className="hotel-rating">⭐ {hotel.rating}</span>
          )}

          {/* Price */}
          {formattedPrice ? (
            <span className="hotel-price">From {formattedPrice}/night</span>
          ) : (
            <span className="hotel-price hotel-price--unavailable">
              Check availability
            </span>
          )}
        </div>
        
        <Link
          className="view-button"
          to={`/hotel/${hotelId}`}
          state={{ checkin, checkout, adults, children }}
        >
          View Details
        </Link>
        
        {/*<button className="btn add-btn" onClick={handleAddToCart} >Add to Cart</button>*/}
      </div>
    </div>
  );
};

export default HotelCard;