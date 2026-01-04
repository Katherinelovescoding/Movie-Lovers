import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎬 Movie Library</Link>
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Home
        </Link>
        <Link 
          to="/my-watchlists" 
          className={location.pathname === '/my-watchlists' ? 'active' : ''}
        >
          My Watchlists
        </Link>
        <Link 
          to="/explore" 
          className={location.pathname === '/explore' ? 'active' : ''}
        >
          Explore
        </Link>
      </div>
      
      <div className="navbar-user">
        <span className="username">Hi, {user.username}</span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

