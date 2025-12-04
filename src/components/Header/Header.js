import './Header.css';
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className='header'>
            <div className='logo'>
                <img src='hotel-icon.png' alt='hotel-icon'/>
                <Link to='/' className="logo"> Staycation Station.</Link>
            </div>
            <nav className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/cart">Cart</Link>
                <Link to="/payment">Payment</Link>
            </nav>
        </header>
    )
}

export default Header;