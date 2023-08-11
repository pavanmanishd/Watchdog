



import { Outlet, Link } from "react-router-dom";
export default function Layout() {
  return (
    <div>
        <nav>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
        </nav>
        <Outlet />
    </div> 
  );
}
