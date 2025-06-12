import Search from "./components/Search";
import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import Card from "./components/Card";
import MovieDetails from "./components/MovieDetails";
import Movie from "./Interfaces";
import { Models } from "appwrite";
import { useDebounce } from "react-use";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./index.css";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

// import heroImg from "./assets/hero-img.png";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  throw new Error(
    "TMDB API key is missing. Please check your environment variables."
  );
}

const API_OPTIONS = {
  method: "GET",
  headers: { accept: "application/json", Authorization: `Bearer ${API_KEY}` },
};

const fetchMovieDetails = async (movieId: number): Promise<Movie> => {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, API_OPTIONS);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.status_message || `Error fetching movie details...`
    );
  }

  return response.json();
};

const App = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

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
        ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status_message || `Error Finding Movies...`);
      }

      const data = await response.json();
      setMovies(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMsg(`Error fetching movies. Try again!`);
      setMovies([]);
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

  const handleTrendingClick = async (trending: Models.Document) => {
    try {
      const movieId = Number(trending.movie_id);
      if (!movieId) return;
      const movieDetails = await fetchMovieDetails(movieId);
      setSelectedMovie(movieDetails);
    } catch (err) {
      console.log(`Failed to load movie details. ${err}`);
    }
  };

  const handleCardClick = (movie: Movie) => {
    setSelectedMovie(movie);
    navigate(`/movie/${movie.id}`);
  };

  // Suggestion 4: Fetch movie details by ID if on /movie/:id and selectedMovie is null
  useEffect(() => {
    if (id && !selectedMovie) {
      fetchMovieDetails(Number(id))
        .then(setSelectedMovie)
        .catch(() => setErrorMsg("Failed to load movie details."));
    }
  }, [id, selectedMovie]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            <div className="pattern" />
            <div className="wrapper">
              <header>
                <h1>
                  Discover Your Next Favorite{" "}
                  <span className="text-gradient">Movie</span>
                </h1>
                <Search
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </header>

              <section className="trending">
                <h2>Trending</h2>
                <ul>
                  {trendingMovies.map((movie: Models.Document, index) => {
                    return (
                      <li
                        key={movie.$id}
                        className="transition-transform duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                        onClick={() => handleTrendingClick(movie)}
                      >
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt={movie.title} />
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section>
                <h2>All Movies</h2>
                {isLoading ? (
                  <Spinner />
                ) : errorMsg ? (
                  <p className="text-white">{errorMsg}</p>
                ) : (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                      <li key={movie.id}>
                        <Card movie={movie} onCardClick={handleCardClick} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </main>
        }
      />
      <Route
        path="/movie/:id"
        element={
          selectedMovie ? (
            <MovieDetails movie={selectedMovie} />
          ) : errorMsg ? (
            <p className="text-white">{errorMsg}</p>
          ) : (
            <Spinner />
          )
        }
      />
    </Routes>
  );
};

export default App;
