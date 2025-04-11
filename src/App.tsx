import Search from "./components/Search";
import heroImg from "./assets/hero-img.png";
import heroBG from "./assets/BG.png";
import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import Card from "./components/Card";
import Movie from "./Movie";

const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer  ${API_KEY}` },
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [Movies, setMovies] = useState<Movie[]>([]);

  const fetchData = async (query = "") => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error(`Error Finding Movies...`);

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMsg(data.error || "Failed to Fetch Data");
        setMovies([]);
        return;
      }

      setMovies(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg(`Error fetching movies. Try again!`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchQuery);
  }, [searchQuery]);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          {/* <img src={heroBG} alt="Hero Background Image" /> */}
          <img src={heroImg} alt="Hero Image" />
          <h1>
            Discover Your Next Favorite{" "}
            <span className="text-gradient">Movie</span>
          </h1>
          <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </header>

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMsg ? (
            <p className="text-white">{errorMsg}</p>
          ) : (
            <ul>
              {Movies.map((movie) => (
                <li>
                  <Card key={movie.id} movie={movie} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
