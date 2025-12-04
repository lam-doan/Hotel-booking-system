import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="customer-engagment">
                <img src="/email-icon.png" alt="email-icon"/>
                <img src="/insta-icon.png" alt="email-icon"/>
                <img src="/facebook-icon.png" alt="email-icon"/>
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