import { NavLink } from 'react-router-dom';

const Navbar = () => {
    // Styl bazowy dla wszystkich linków
    const baseStyle = "font-serif uppercase text-xl p-2 text-vDarkGreen hover:cursor-pointer flex justify-center items-center transition-all duration-300";
    
    // Styl, gdy link jest AKTYWNY
    const activeStyle = "bg-darkGreen/40 text-vDarkGreen";
    
    // Styl, gdy link jest NIEAKTYWNY (hover)
    const inactiveStyle = "hover:bg-[radial-gradient(circle,_var(--color-darkGreen)_30%,_transparent_100%)] hover:text-cream";

    return (
        <nav>
            <div className="bg-darkGreen/40 outline-3 outline-darkGreen/70 grid grid-cols-3 divide-x-3 divide-solid divide-darkGreen/70 mb-4">
                
                <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                        `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
                    }
                >
                    Birds
                </NavLink>

                <NavLink 
                    to="/favorites" 
                    className={({ isActive }) => 
                        `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
                    }
                >
                    Favorites
                </NavLink>

                <NavLink 
                    to="/upload" 
                    className={({ isActive }) => 
                        `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
                    }
                >
                    Upload a bird
                </NavLink>

            </div>
        </nav>
    );
};

export default Navbar;
