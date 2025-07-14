import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Pages/Home';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home/>} />
        <Route path ="/signup" element={<Signup />} />
        <Route path ="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
