import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleUser, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import "./Header.css";

type User = {
  id: number;
  name: string;
  email: string;
};

const LS_USER_KEY = "user";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);

  const readUser = () => {
    const raw = localStorage.getItem(LS_USER_KEY);
    setUser(raw ? (JSON.parse(raw) as User) : null);
  };


  useEffect(() => {
    readUser();

  }, [location.pathname]);


  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_USER_KEY) readUser();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);

  }, []);

  const handleLogout = () => {
    localStorage.removeItem(LS_USER_KEY);
    readUser();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="topbar-brand">
          Gamble like a Boss
        </Link>
      </div>

      <div className="topbar-right">
        <Link to="/discover" className="topbar-link">
          Discover
        </Link>

        {user ? (
          <>
            <Link to="/create" className="topbar-create">
              Create
            </Link>

            <span className="topbar-user">
              <span className="topbar-username">{user.name}</span>
              <CircleUser size={36} />
            </span>

            <button className="topbar-logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="topbar-login">
              Log in
            </Link>
            <Circle size={36} />
          </>
        )}

      </div>
    </header>
  );
}

export default Header;
