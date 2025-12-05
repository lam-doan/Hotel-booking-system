import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="customer-engagment">
                <img src={process.env.PUBLIC_URL + '/email-icon.png'} alt="email-icon"/>
                <img src={process.env.PUBLIC_URL + '/insta-icon.png'} alt="insta-icon"/>
                <img src={process.env.PUBLIC_URL + '/facebook-icon.png'} alt="facebook-icon"/>

            </div>
            <div className="utility-links">
                <p>Info</p>
                <p>Support</p>
                <p>Terms of Use</p>
                <p>Privacy Policy</p>
            </div>
            <p>© {new Date().getFullYear()} Staycation Station. All rights reserved.</p>
        </footer>
    )
}

export default Footer;