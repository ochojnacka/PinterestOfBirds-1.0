import ribbon from "../assets/everything.svg";

const Header = () => {
    return (
        /* Dodajemy klasę 'main-header', żeby odróżnić go od .header znajomej */
        <header className="main-header bg-gradient-to-b from-darkGreen/80 to-transparent pt-3 relative z-[100]">
            <div className="max-w-lg mx-auto">
                <img
                    src={ribbon}
                    alt="ribbon"
                    className="w-full h-auto"
                />
            </div>
            
            <div className="relative py-4 overflow-hidden">
                {/* Naprawa gradientu kremowego - używamy theme() zamiast var() */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,_theme(colors.cream)_70%,_transparent_90%)] opacity-60 blur-xl" />
                
                <div className="relative z-10 font-serif text-xl text-darkGreen tracking-wide text-center cursor-default">
                    For your collection of flying friends!
                </div>
            </div>
        </header>
    )
}

export default Header;