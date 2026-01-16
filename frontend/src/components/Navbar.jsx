import { NavLink } from 'react-router-dom';

const Navbar = () => {
    // Używamy theme() dla pewności, że pociągnie kolory z Twojego tailwind.config.js
    const baseStyle = "font-serif uppercase text-xl p-2 text-vDarkGreen hover:cursor-pointer flex justify-center items-center transition-all duration-300 decoration-0 no-underline";
    
    const activeStyle = "bg-darkGreen/40 text-vDarkGreen";
    
    // Poprawiony gradient z użyciem theme()
    const inactiveStyle = "hover:bg-[radial-gradient(circle,_theme(colors.darkGreen)_30%,_transparent_100%)] hover:text-cream";

    return (
        <nav className="relative z-10">
            {/* Dodajemy 'isolation', żeby style zewnętrzne nie psuły Twojego grida */}
            <div className="bg-darkGreen/40 outline-3 outline-darkGreen/70 grid grid-cols-3 divide-x-3 divide-solid divide-darkGreen/70 mb-4 border-y-0">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
                >
                    Birds
                </NavLink>

                <NavLink 
                    to="/favorites" 
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
                >
                    Favorites
                </NavLink>

                <NavLink 
                    to="/upload" 
                    className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
                >
                    Upload a bird
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;