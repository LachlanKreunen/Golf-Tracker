import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
import Hole from './Pages/Hole';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import Start from './Pages/Start';
import Rounds from './Pages/Rounds';
function App() {

  return (
      <div className="app-container">
    <Router>
      <Routes>
        <Route path="/" element = {<Home/>} />
        <Route path="/holes/:holeNumber" element = {<Hole/>} />
        <Route path ="/rounds" element={<Rounds />} />
        <Route path ="/start" element={<Start />} />
        <Route path ="/signup" element={<Signup />} />
        <Route path ="/login" element={<Login />} />
      </Routes>
    </Router>
    </div>
  )
}


export default App
