import { useEffect, useState, useContext } from "react";
import "./HotelDetail.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';
import { HotelDetailContext } from '../../contexts/HotelDetailContext';

const API_KEY = "sand_97a1f77d-488e-4b82-945f-d60e20f43621";

// helper functions
function normalizeRoomName(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\b(room|suite|bed|beds)\b/g, "")
        .replace(/\btwo\b/g, "2")
        .replace(/\bone\b/g, "1")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfour\b/g, "4")
        .replace(/\s+/g, " ")
        .trim();
}

function findMatchingRoom(hotelRooms, rateRoomTypes) {
    const normRoom = normalizeRoomName(hotelRooms.roomName);
    for (const rateType of rateRoomTypes) {
        if (normRoom.includes(rateType) || rateType.includes(normRoom)) {
            return rateType;
        }
    }
}

const HotelDetail = () => {
    const {addToCart} = useContext(HotelDetailContext);

    const navigate = useNavigate();
    const {id} = useParams();
    const {state} = useLocation();
    const [hotel, setHotel] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [mainImage, setMainImage] = useState(null);
    const [roomPrices, setRoomPrices] = useState({});
    const [loadingPrices, setLoadingPrices] = useState(false);
    
    // Extract dates from router state
    const checkin = state?.checkin;
    const checkout = state?.checkout;
    const adults = state?.adults || 1;
    const children = state?.children || 0;

    // Fetch room prices if we have dates
    const fetchRoomPrices = async (hotelId, checkin, checkout, adults, children) => {
        if (!checkin || !checkout) {
            console.warn('Missing checkin or checkout date');
            return;
        }
        setLoadingPrices(true);
        try {
            const body = {
                hotelIds: [hotelId],
                checkin,
                checkout,
                currency: 'USD',
                guestNationality: 'US',
                occupancies: [{ adults, children: Array(children).fill(0) }]
            };
            console.log('Fetching rates with:', body);
            const priceResponse = await fetch('https://api.liteapi.travel/v3.0/hotels/rates', {
                method: 'POST',
                headers: {
                    'X-API-Key': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const priceData = await priceResponse.json();

            // Map rates to room IDs
            const prices = {};
            console.log("Raw priceData:", priceData);

            if (priceData?.data?.[0]?.roomTypes) {
                for (const roomType of priceData.data[0].roomTypes) {
                    if (!roomType.rates || roomType.rates.length === 0) {continue;}
                    for (const rate of roomType.rates) {
                        const price = rate?.retailRate?.total?.[0]?.amount
                        const key = normalizeRoomName(rate.name || roomType.name);
                        if (key && price != null) {
                            prices[key] = Number(price);
                        }
                    }
                }
            }
            setRoomPrices(prices);
        } catch (e) {
            console.error('Error fetching room rates:', e);
        } finally {
            setLoadingPrices(false);
        }
    };

    useEffect(() => {
        if (!id) {
            console.warn('No hotel ID provided');
            return;
        }
        console.log('Fetching hotel with id:', id);
        
        fetch(`https://api.liteapi.travel/v3.0/data/hotel?hotelId=${id}`, {
            method: 'GET',
            headers: {
                'X-API-Key': API_KEY,
                'accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log('API Response data:', data);
                setHotel(data.data);
                if (data.data?.hotelImages?.length) {
                    setMainImage(data.data.hotelImages[0].url);
                }
                // Fetch room rates if dates are available
                if (checkin && checkout) {
                    fetchRoomPrices(id, checkin, checkout, adults, children);
                }
            })
            .catch(e => console.error('Error fetching hotel details:', e));
    }, [id, checkin, checkout, adults, children]);

    if (!hotel) {
        return (
            <div className="loading">
                <p>Loading hotel details...</p>
                <p className="loading-tip">If this takes too long, check the browser console for errors.</p>
            </div>
        );
    }

    const handleBack = () => {
        // Prefer going back in history so Home state is preserved
        try {
            if (window.history.length > 1) {
                navigate(-1);
                return;
            }
        } catch (e) {
            // ignore and fall through to navigate home
        }
        // fallback: navigate to home (could include state if desired)
        navigate('/');
    };

    return (
        <div className="hotel-detail-container">
            <button className="back-button" onClick={handleBack} aria-label="Back to results">← Back to results</button>
            
            <div className="hotel-detail-header">
                <h1 className="hotel-title">{hotel?.name}</h1>
                <div className="hotel-rating-badge">
                    <span className="rating-label">Excellent</span>
                    <span className="rating-score">{hotel?.starRating?.toFixed(1) || 'N/A'}</span>
                </div>
            </div>

            {/* Image Gallery */}
            <div className="gallery-section">
                <div className="main-image">
                    <img src={mainImage || hotel?.thumbnail} alt={hotel?.name} />
                </div>
                <div className="gallery-grid">
                    {hotel?.hotelImages?.slice(0, 4)?.map((img, index) => (
                        <img 
                            key={index}
                            src={img.url} 
                            alt={`${hotel.name} ${index + 1}`}
                            className="gallery-thumb"
                            onClick={() => setMainImage(img.url)}
                        />
                    ))}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container">
                <div className="tabs">
                    <button 
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rooms')}
                    >
                        Rooms
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'amenities' ? 'active' : ''}`}
                        onClick={() => setActiveTab('amenities')}
                    >
                        Amenities
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'policies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('policies')}
                    >
                        Policies
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-section">
                        <div className="overview-grid">
                            <div className="overview-item">
                                <span className="icon">📡</span>
                                <span>Free Wifi</span>
                            </div>
                            <div className="overview-item">
                                <span className="icon">🅿️</span>
                                <span>Free Parking</span>
                            </div>
                            <div className="overview-item">
                                <span className="icon">❄️</span>
                                <span>Air Conditioning</span>
                            </div>
                            <div className="overview-item">
                                <span className="icon">🛎️</span>
                                <span>24-Hour Front Desk</span>
                            </div>
                        </div>

                        <div className="description-section">
                            <h3>About this property</h3>
                            <div
                                className="hotel-description"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hotel?.hotelDescription || '') }}
                            />
                        </div>

                        <div className="address-section">
                            <h3>Address</h3>
                            <p>{hotel?.address}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'amenities' && (
                    <div className="amenities-section">
                        <h3>Hotel Facilities</h3>
                        <div className="facilities-list">
                            {(() => {
                                const list = Array.isArray(hotel?.hotelFacilities) && hotel.hotelFacilities.length
                                    ? hotel.hotelFacilities
                                    : Array.isArray(hotel?.facilities) && hotel.facilities.length
                                        ? hotel.facilities.map(f => f.name)
                                        : [];

                                if (!list.length) return <span className="no-facilities">No facilities listed</span>;

                                return list.map((facility, index) => (
                                    <span key={index} className="facility">{facility}</span>
                                ));
                            })()}
                        </div>
                    </div>
                )}

                {activeTab === 'rooms' && (
                    <div className="rooms-section">
                        <h3>Available Rooms</h3>
                        {loadingPrices && <p className="loading-prices">Loading prices...</p>}
                        {hotel?.rooms?.map((room, index) => {
                                const matchingKey = findMatchingRoom(room, Object.keys(roomPrices));
                                const price = roomPrices[matchingKey];
                            return (
                                <div key={index} className="room-card">
                                <div className="room-header">
                                    <div>
                                    <h4>{room.roomName}</h4>
                                    <p>{room.description}</p>
                                    <p className="room-size">{room.roomSizeSquare} {room.roomSizeUnit}</p>
                                    </div>
                                    <div className="room-price-section">
                                    {!checkin || !checkout ? (
                                        <p className="room-price-missing">Select check-in and check-out to see prices</p>
                                    ) : price ? (
                                        <>
                                        <p className="room-price"> ${price.toFixed(2)}</p>
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={() => addToCart({
                                            id: room.id,
                                            name: room.roomName,
                                            hotelId: hotel.id,
                                            hotelName: hotel.name,
                                            hotelThumbnail: hotel.thumbnail,
                                            price
                                            })}
                                        >
                                            Add to Cart
                                        </button>
                                        </>
                                    ) : loadingPrices ? (
                                        <p className="room-price-loading">Loading price...</p>
                                    ) : (
                                        <p className="room-price-unavailable">No price available</p>
                                    )}
                                    </div>
                                </div>
                                </div>
                            );
                            })}

                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="policies-section">
                        <h3>Hotel Policies</h3>
                        {hotel?.policies?.map((policy, index) => (
                            <div key={index} className="policy-card">
                                <h4>{policy.name}</h4>
                                <p>{policy.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default HotelDetail;