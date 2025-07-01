import Search from "./components/Search";
import { useState, useEffect } from "react";
import Spinner from "./components/Spinner";
import Card from "./components/Card";
import MovieDetails from "./components/MovieDetails";
import Movie from "./Interfaces";
import { Models } from "appwrite";
import { useDebounce } from "react-use";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import "./index.css";
import { getTrendingMovies, updateSearchCount } from "./appwrite";
import AuthForm from "./components/AuthForm";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useDebounce(() => setDebouncedSearchQuery(searchQuery), 500, [searchQuery]);

  const fetchData = async (query = "", page = 1, type = mediaType) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      let url = query
        ? `https://api.themoviedb.org/3/search/${type}?query=${encodeURI(
            query
          )}&page=${page}`
        : `https://api.themoviedb.org/3/discover/${type}?sort_by=popularity.desc&page=${page}`;
      if (selectedGenre) url += `&with_genres=${selectedGenre}`;
      if (selectedYear) {
        if (type === "movie") {
          url += `&primary_release_year=${selectedYear}`;
        } else if (type === "tv") {
          url += `&first_air_date_year=${selectedYear}`;
        }
      }
      const response = await fetch(url, API_OPTIONS);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.status_message ||
            `Error Finding ${type === "movie" ? "Movies" : "TV Shows"}...`
        );
      }
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      if (query && data.results.length > 0 && type === "movie") {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(
        `Error fetching ${type === "movie" ? "movies" : "tv shows"}: ${error}`
      );
      setErrorMsg(
        `Error fetching ${type === "movie" ? "movies" : "tv shows"}. Try again!`
      );
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData(debouncedSearchQuery, currentPage, mediaType);
    // Reset to first page when filters change
    // (currentPage is already set to 1 in the onChange handlers)
  }, [
    debouncedSearchQuery,
    currentPage,
    mediaType,
    selectedGenre,
    selectedYear,
  ]);

  const fetchTrendingMovies = async (type = mediaType) => {
    const endpoint =
      type === "movie"
        ? `${API_BASE_URL}/trending/movie/week`
        : `${API_BASE_URL}/trending/tv/week`;
    try {
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch trending");
      const data = await response.json();
      setTrendingMovies(data.results || []);
    } catch (err) {
      setTrendingMovies([]);
    }
  };

  useEffect(() => {
    fetchTrendingMovies(mediaType);
  }, [mediaType]);

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
    const type = movie.title ? "movie" : "tv";
    navigate(`/media/${type}/${movie.id}`);
  };

  // Suggestion 4: Fetch movie details by ID if on /movie/:id and selectedMovie is null
  useEffect(() => {
    if (id && !selectedMovie) {
      fetchMovieDetails(Number(id))
        .then(setSelectedMovie)
        .catch(() => setErrorMsg("Failed to load movie details."));
    }
  }, [id, selectedMovie]);

  // Fetch genres when mediaType changes
  useEffect(() => {
    const fetchGenres = async () => {
      const endpoint = `https://api.themoviedb.org/3/genre/${mediaType}/list`;
      try {
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) throw new Error("Failed to fetch genres");
        const data = await response.json();
        setGenresList(data.genres || []);
      } catch (err) {
        setGenresList([]);
      }
    };
    fetchGenres();
  }, [mediaType]);

  useEffect(() => {
    setSelectedGenre("");
    setSelectedYear("");
  }, [mediaType]);

  return (
    <>
      {isAuthenticated && (
        <button
          className="fixed top-6 right-8 z-50 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          onClick={() => setIsAuthenticated(false)}
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3"
            />
          </svg>
        </button>
      )}
      <Routes>
        <Route
          path="/auth"
          element={<AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
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
                      {trendingMovies.map((movie: any, index) => {
                        const type = movie.title ? "movie" : "tv";
                        return (
                          <li
                            key={movie.id || movie.$id}
                            className="transition-transform duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                            onClick={() =>
                              navigate(`/media/${type}/${movie.id}`)
                            }
                          >
                            <p>{index + 1}</p>
                            <img
                              src={
                                movie.poster_path
                                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                  : movie.poster_url
                              }
                              alt={movie.title || movie.name}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-semibold text-white">
                          All
                        </h2>
                        <select
                          className="bg-dark-100 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 font-semibold text-lg"
                          value={mediaType}
                          onChange={(e) => {
                            setMediaType(e.target.value as "movie" | "tv");
                            setCurrentPage(1);
                          }}
                        >
                          <option value="movie">Movies</option>
                          <option value="tv">TV Shows</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap md:ml-auto">
                        {/* Genre Dropdown */}
                        <select
                          className="bg-dark-100 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold text-lg"
                          value={selectedGenre}
                          onChange={(e) => {
                            setSelectedGenre(e.target.value);
                            setCurrentPage(1);
                          }}
                        >
                          <option value="">All Genres</option>
                          {genresList.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                              {genre.name}
                            </option>
                          ))}
                        </select>
                        {/* Year Dropdown */}
                        <select
                          className="bg-dark-100 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 font-semibold text-lg"
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setCurrentPage(1);
                          }}
                        >
                          <option value="">All Years</option>
                          {Array.from({ length: 40 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                    {isLoading ? (
                      <Spinner />
                    ) : errorMsg ? (
                      <p className="text-white">{errorMsg}</p>
                    ) : (
                      <>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {movies.map((movie) => (
                            <li key={movie.id}>
                              <Card
                                movie={movie}
                                onCardClick={handleCardClick}
                              />
                            </li>
                          ))}
                        </ul>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-2 mt-10 mb-4">
                          <button
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${
                              currentPage === 1
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-dark-100 hover:bg-gray-800"
                            }`}
                            onClick={() =>
                              setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          {/* Page Numbers */}
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let page = i + Math.max(1, currentPage - 2);
                              if (page > totalPages) page = totalPages;
                              return (
                                <button
                                  key={page}
                                  className={`mx-1 px-3 py-2 rounded-lg font-bold text-lg transition-all duration-200 ${
                                    currentPage === page
                                      ? "underline underline-offset-8 text-red-400"
                                      : "text-white hover:text-red-400"
                                  }`}
                                  onClick={() => setCurrentPage(page)}
                                  disabled={currentPage === page}
                                >
                                  {page}
                                </button>
                              );
                            }
                          )}
                          <button
                            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${
                              currentPage === totalPages
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-dark-100 hover:bg-gray-800"
                            }`}
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </main>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="/media/:type/:id" element={<MovieDetails />} />
      </Routes>
    </>
  );
};

export default App;
