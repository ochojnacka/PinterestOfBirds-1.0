import { useNavigate } from 'react-router-dom';

const LogInBtn = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/login')}
      className="bg-darkGreen text-cream px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-vDarkGreen transition-all active:scale-95 font-serif"
    >
      Log In
    </button>
  );
};

export default LogInBtn;
