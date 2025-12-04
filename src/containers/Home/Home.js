import './Home.css';
import { useState, useEffect } from 'react';
import HotelCard from '../../components/HotelCard/HotelCard.js';

const api_key = "sand_97a1f77d-488e-4b82-945f-d60e20f43621";

function extractPrice(rateData) {
  const hotel = rateData?.data?.[0];
  if (!hotel) return null;

  for (const roomType of hotel.roomTypes || []) {
    for (const rate of roomType.rates || []) {
      return rate?.retailRate?.total?.[0]?.amount || null;
    }
  }
  return null;
}

const Home = () => {
  const api_key = "sand_97a1f77d-488e-4b82-945f-d60e20f43621";
  
  const [location, setLocation] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('recentSearches') : null;
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // restore last search (inputs + results) so navigating back keeps results
  useEffect(() => {
    try {
      const last = typeof localStorage !== 'undefined' ? localStorage.getItem('lastSearch') : null;
      if (last) {
        const parsed = JSON.parse(last);
        if (parsed) {
          setLocation(parsed.location || "");
          setCheckin(parsed.checkin || "");
          setCheckout(parsed.checkout || "");
          setAdults(parsed.adults || 1);
          setChildren(parsed.children || 0);
          setHotels(parsed.hotels || []);
          if (parsed.hotels && parsed.hotels.length) setSearched(true);
        }
      }
    } catch (e) {
      console.warn('Could not restore last search', e);
    }
  }, []);

  const handleUseRecent = (search) => {
    setLocation(search.location);
    setCheckin(search.checkin);
    setCheckout(search.checkout);
    setAdults(Number(search.adults) || 1);
    setChildren(Number(search.children) || 0);
    // run search after state updates
    setTimeout(() => handleSearch(), 0);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem('recentSearches'); } catch {}
  };

  const handleSearch = async () => {
    if (!location || !checkin || !checkout || adults < 1) {
      alert("Please fill in all fields");
      return;
    }

    const city = location.split(",")[0].trim();
    setLoading(true);
    setSearched(true);

    try {
      // Step 1: Get hotels
      const response = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?countryCode=US&cityName=${encodeURIComponent(city)}&limit=10`,
        {
          headers: {
            "X-API-Key": api_key,
            
            "accept": "application/json",
          },
        }
      );
      const hotelData = await response.json();
      const hotels = hotelData.data || hotelData || [];

      // Step 2: Fetch rates for each hotel (limit to first 3 for speed)
      const hotelsWithRates = [];
      for (const hotel of hotels) {
        const hotelId = hotel.id;
        if (!hotelId) continue;

        const body = {
          hotelIds: [hotelId],
          checkin,
          checkout,
          currency: "USD",
          guestNationality: "US",
          occupancies: [
            {
              adults,
              children: Array(children).fill(0) // children ages, here just placeholders
            }
          ]
        };
        console.log("Request body:", body);

        try {
          const rateRes = await fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
            method: "POST",
            headers: {
              "X-API-Key": api_key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
          const rateData = await rateRes.json();
          const price = extractPrice(rateData);
          hotelsWithRates.push({ ...hotel, price });
        } catch (e) {
          console.warn("Error fetching rates for hotel", hotelId, e);
          hotelsWithRates.push({ ...hotel, price: null });
        }
      }

          setHotels(hotelsWithRates);

          // persist last successful search so returning to Home restores results
          try {
            const last = { location, checkin, checkout, adults, children, hotels: hotelsWithRates };
            localStorage.setItem('lastSearch', JSON.stringify(last));
          } catch (e) {
            console.warn('Could not persist last search', e);
          }

          // Save this search to recent searches (keep unique, most-recent-first, max 5)
          try {
            const entry = { location, checkin, checkout, adults, children, when: Date.now() };
            setRecentSearches(prev => {
              const key = (s) => `${s.location}|${s.checkin}|${s.checkout}|${s.adults}|${s.children}`;
              const filtered = (prev || []).filter(s => key(s) !== key(entry));
              const next = [entry, ...filtered].slice(0, 5);
              localStorage.setItem('recentSearches', JSON.stringify(next));
              return next;
            });
          } catch (e) {
            console.warn('Could not save recent search', e);
          }
    } catch (error) {
      console.error("Cannot fetch hotels", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="parralax">
        <div className="search-bar">
          <div className="sub-search" id="location">
            <p>Location</p>
            <input
              value={location}
              placeholder="Where are you going?"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="sub-search" id="check-in">
            <p>Check in</p>
            <input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
          </div>
          <div className="sub-search" id="check-out">
            <p>Check out</p>
            <input
              type="date"
              value={checkout}
              min={checkin ? new Date(new Date(checkin).getTime() + 86400000).toISOString().split("T")[0] : ""}
              onChange={(e) => setCheckout(e.target.value)}
            />
          </div>
          <div className="sub-search" id="adults">
            <p>Adults</p>
            <input
              type="number"
              value={adults}
              min="1"
              onChange={(e) => setAdults(Number(e.target.value))}
            />
          </div>
          <div className="sub-search" id="children">
            <p>Children</p>
            <input
              type="number"
              value={children}
              min="0"
              onChange={(e) => setChildren(Number(e.target.value))}
            />
          </div>
          <button className="search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="recent-searches">
        <div className="recent-header">
          <h2>Recent search</h2>
          <button className='clear-btn' onClick={handleClearRecent}>Clear</button>
        </div>

        {recentSearches && recentSearches.length > 0 ? (
          <div className="recent-list">
            {recentSearches.map((search, index) => (
              <div key={index} className="recent-search-item" onClick={() => handleUseRecent(search)}>
                <div className="rs-icon">🏨</div>
                <div className="rs-content">
                  <p className="rs-title">{search.location}</p>
                  <p className="rs-meta">{search.checkin} — {search.checkout} • {search.adults} adult(s){search.children ? `, ${search.children} child(ren)` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent searches</p>
        )}
      </div>

      <div className="hotel-list">
        {loading ? (
          <p>Loading...</p>
        ) : searched && hotels.length === 0 ? (
          <p>No hotels found</p>
        ) : (
          hotels.map((hotel, index) => (
            <HotelCard
              key={index}
              hotel={hotel}
              checkin={checkin}
              checkout={checkout}
              adults={adults}
              children={children}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;