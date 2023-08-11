
import './App.css'
import {Switch,Route} from 'react-router-dom';
import Home from './components/Home'
import Login from './components/Login'
import SignUp from './components/Signup'
import Video from './components/Video'
function App() {
  return (
    <div>
      {/* Navbar */}
      {/* <nav>
        <a href="/">Home</a>
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      </nav> */}
      <Switch>
        <Route exact path="/"> <Home /> </Route>
        <Route exact path="/login"> <Login /> </Route>
        <Route exact path="/signup"> <SignUp /> </Route>
        <Route exact path="/video/:id"> <Video /> </Route>
      </Switch>
    </div>
  )
}

export default App