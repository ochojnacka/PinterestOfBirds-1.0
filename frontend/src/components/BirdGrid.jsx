import BirdCard from './BirdCard';

const BirdGrid = ({ birds, favorites, onFavorite }) => {
  if (!birds || birds.length === 0) {
    return <div className="text-center py-20 text-darkGreen/50 font-serif italic">No birds found here...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {birds.map((bird) => {
          const isFav = favorites && favorites.some(fav => 
            String(fav.id || fav._id) === String(bird.id || bird._id)
          );
          return (
            <BirdCard 
              key={bird.id || bird._id} 
              bird={bird} 
              onFavorite={onFavorite} 
              isFavorite={isFav} 
            />
          );
        })}
      </div>
    </div>
  );
};
export default BirdGrid;
