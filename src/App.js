import { useState } from "react";
import JourneyTimeline from "./components/JourneyTimeline";
import MemoryGallery from "./components/MemoryGallery";
import ProposalBox from "./components/ProposalBox";
import RelationshipQuiz from "./components/RelationshipQuiz";
import DreamDashboard from "./components/DreamDashboard";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("box");
  const [boxOpened, setBoxOpened] = useState(false);
  const renderPage = () => {
    switch (page) {
      case "box":
        return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
      case "journey":
        return <JourneyTimeline setPage={setPage} />;
      case "gallery":
        return <MemoryGallery setPage={setPage} />;
      case "quiz":
        return <RelationshipQuiz setPage={setPage} />;
      case "dream":
        return <DreamDashboard />;
      default:
        return <ProposalBox opened={boxOpened} setOpened={setBoxOpened} setPage={setPage} />;
    }
  };
  return (
    <div className="app">
      <nav className="nav">
        <button onClick={() => setPage("box")}>Proposal Box</button>
        <button onClick={() => setPage("journey")}>Our Journey</button>
        <button onClick={() => setPage("gallery")}>Memory Lane</button>
        <button onClick={() => setPage("quiz")}>Love Quiz</button>
        <button onClick={() => setPage("dream")}>Dreams 💫</button>
      </nav>
      <main>{renderPage()}</main>
      <div className="hearts">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            style={{
              left: `${10 + i * 11}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i}s`,
            }}
          >
            {" "}
            ❤️{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
