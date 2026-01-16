import outlineHeart from "../assets/outlineHeart.svg"
import fullHeart from "../assets/fullHeart.svg"

const BirdCard = ({ bird, onFavorite, isFavorite }) => {
    return (
        /* Główny kontener karty */
        <div className="group max-w-sm w-full rounded-xl overflow-hidden shadow-lg bg-cream relative transition-transform duration-300 hover:-translate-y-1">
            
            {/* Przycisk ulubionych - pojawia się w prawym górnym rogu */}
            {onFavorite && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Zapobiega innym akcjom po kliknięciu w serce
                        onFavorite(bird.id || bird._id);
                    }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                                ${isFavorite 
                                ? 'bg-white/90 opacity-100 scale-110' // Styl dla polubionego
                                : 'bg-white/90 opacity-0 group-hover:opacity-100 hover:scale-110' // Styl domyślny
                                } active:scale-95`}
                    title={isFavorite ? "In favorites" : "Add to favorites"}
                >
                    <span>
                        <img
                        src={isFavorite ? fullHeart : outlineHeart}
                        alt="heart"
                        className="w-7 h-7" />
                    </span>
                </button>
            )}

            {/* Zdjęcie z obsługą błędu */}
            <div className="h-48 overflow-hidden">
                <img 
                    src={bird.imageUrl} 
                    alt={bird.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/300x200?text=Brak+zdjęcia';
                    }}
                />
            </div>
            
            {/* Treść karty */}
            <div className="px-6 py-4">
                <div className="font-serif font-bold text-xl mb-2 text-darkGreen border-b border-darkGreen/10 pb-1">
                    {bird.name}
                </div>
                
                {/* Opis: pojawia się płynnie po najechaniu (hover) */}
                <div className="relative h-20 overflow-hidden">
                    <p className="text-gray-700 text-sm italic opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {bird.description}
                    </p>
                    
                    {/* Mała podpowiedź widoczna gdy nie ma hovera */}
                    <p className="text-darkGreen/40 text-xs absolute top-0 group-hover:hidden transition-all">
                        Hover to read about this bird...
                    </p>
                </div>
            </div>
        </div>
    )
}

export default BirdCard;
