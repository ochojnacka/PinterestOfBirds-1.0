const Footer = () => {
    return (
        // Dodajemy klasę "footer" ze zwykłego CSS, ale zostawiamy Twoje klasy Tailwinda
        <footer className="footer bg-[radial-gradient(circle,_theme(colors.green)_30%,_transparent_100%)] py-6 text-center text-cream font-serif cursor-default mt-auto">
            <div className="footer-container">
                <p>Made by Anita Zaręba, Oliwia Chojnacka, Zofia Siemion and Weronika Ostrowska</p>
            </div>
        </footer>
    );
};

export default Footer;