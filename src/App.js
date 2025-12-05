import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './containers/Home/Home';
import HotelDetail from './containers/HotelDetail/HotelDetail';
import { HotelDetailProvider } from './contexts/HotelDetailContext';
import Cart from './containers/Cart/Cart';
import Payment from './containers/Payment/Payment';
import PaymentSuccess from './containers/Payment/PaymentSuccess';

function App() {
  return (
    <HotelDetailProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <div className='app-container'>
          <Header/>
          <main className='main-content'>
            <Routes>
              <Route path="/" element={<Home />}/>
              <Route path="/hotel/:id" element={<HotelDetail />}/>
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
            </Routes>
          </main>
          <Footer/>
        </div>
      </Router>
    </HotelDetailProvider>
  );
}

export default App;