import React from "react";
import Search from "./components/Search";

const App = () => {
  return (
    <main>
      <div className="wrapper">
        <header>
          <img src="./assets/hero-img.png" alt="Hero Image" />

          <h1>
            Discover Your Next Favorite{" "}
            <span className="text-gradient">Movie</span>
          </h1>
        </header>

        <Search />
      </div>
    </main>
  );
};

export default App;
