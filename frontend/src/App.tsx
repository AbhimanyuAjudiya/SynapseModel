import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from '@/contexts/WalletContext'
import { ScrollToTop } from './components/ScrollToTop'
import Home from './pages/Home'
import Models from './pages/Models'
import Upload from './pages/Upload'
import About from './pages/About'
import Playground from './pages/Playground'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <WalletProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/models/:id/playground" element={<Playground />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </WalletProvider>
    </BrowserRouter>
  )
}

export default App