import ribbon from "../assets/everything.svg";


const Header = () => {
    return (
        <header className="bg-gradient-to-b from-darkGreen/80 to-transparent pt-3 ">
            {/* <div classNAme="max-w-6xl mx-auto flex flex-col items-center text-center">

            </div> */}
            <div className="max-w-lg mx-auto">
                <img
                src={ribbon}
                alt="ribbon"
                />
            </div>
            {/* <div className="font-serif text-2xl text-darkGreen tracking-wide text-center bg-[radial-gradient(circle,_transparent_30%,_cream_50%,_transparent_70%)] py-10">
                For your collection of flying friends!
            </div> */}
            <div className="relative py-4 overflow-hidden">

                <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--color-cream)_70%,_transparent_90%)] opacity-60 blur-xl" />
                <div className="relative z-10 font-serif text-xl text-darkGreen tracking-wide text-center cursor-default">
                    For your collection of flying friends!
                </div>
            </div>
        </header>
    )
}

export default Header
