import { HashRouter, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Shell } from "./components/Shell";
import { useArcadeFeed } from "./hooks/useArcadeFeed";
import { GamePage } from "./routes/GamePage";
import { HomePage } from "./routes/HomePage";
import { NotFoundPage } from "./routes/NotFoundPage";

function App() {
  const feed = useArcadeFeed();

  return (
    <HashRouter>
      <Shell>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage feed={feed} />} />
          <Route path="/game/:slug" element={<GamePage feed={feed} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}

export default App;
