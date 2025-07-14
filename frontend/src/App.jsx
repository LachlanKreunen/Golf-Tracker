import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
<<<<<<< HEAD
import Hole from './Pages/Hole';
=======
import Signup from './Pages/Signup';
import Login from './Pages/Login';
>>>>>>> 360aa92742aa116ee30a7e92160bb7b16293d41b
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home/>} />
<<<<<<< HEAD
        <Route path="/holes/:holeNumber" element = {<Hole/>} />

=======
        <Route path ="/signup" element={<Signup />} />
        <Route path ="/login" element={<Login />} />
>>>>>>> 360aa92742aa116ee30a7e92160bb7b16293d41b
      </Routes>
    </Router>
  )
}

export default App
