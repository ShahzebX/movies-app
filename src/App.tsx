import Search from "./components/Search";
import heroImg from "./assets/hero-img.png";
import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import Card from "./components/Card";
import Movie from "./Interfaces";
import { Models } from "appwrite";
import { useDebounce } from "react-use";
import "./index.css";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer  ${API_KEY}` },
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [trendingMovies, setTrendingMovies] = useState<Models.Document[]>([]);

  useDebounce(() => setDebouncedSearchQuery(searchQuery), 500, [searchQuery]);

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

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg(`Error fetching movies. Try again!`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  const fetchTrendingMovies = async () => {
    const movies = await getTrendingMovies();
    if (movies) {
      setTrendingMovies(movies);
    }
  };

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

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

        <section className="trending">
          <h2>Trending</h2>
          <ul>
            {trendingMovies.map((movie: Models.Document, index) => {
              return (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="all-movies">
          <h2>Popular</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMsg ? (
            <p className="text-white">{errorMsg}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
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
