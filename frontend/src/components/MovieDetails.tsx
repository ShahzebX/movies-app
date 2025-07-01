import React, { useEffect, useState, useMemo } from "react";
import Movie from "../Interfaces";
import star from "../assets/star.svg";
import noPoster from "../assets/No-Poster.png";
import { useNavigate, useParams } from "react-router-dom";

interface Genre {
  id: number;
  name: string;
}

interface MovieDetails {
  runtime?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  // Add other properties as needed
}

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id, type } = useParams();
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const [genres, setGenres] = useState<Genre[]>([]);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_OPTIONS = useMemo(
    () => ({
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    }),
    [API_KEY]
  );

  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // Fetch details by id and type from URL
  useEffect(() => {
    if (!id || !type) return;
    const fetchMedia = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}`,
          { ...API_OPTIONS }
        );
        if (!response.ok) throw new Error("Failed to fetch details");
        const data = await response.json();
        setMovie(data);
        setMovieDetails(data);
      } catch (error) {
        setMovie(null);
        setMovieDetails(null);
        console.error("Error fetching details:", error);
      }
    };
    fetchMedia();
  }, [id, type, API_OPTIONS]);

  // Fetch genres by type
  useEffect(() => {
    if (!type) return;
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${type}/list`,
          { ...API_OPTIONS }
        );
        if (!response.ok) throw new Error("Failed to fetch genres");
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        setGenres([]);
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, [type, API_OPTIONS]);

  // Fetch related by type
  useEffect(() => {
    if (!id || !type) return;
    const fetchRelated = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}/similar`,
          { ...API_OPTIONS }
        );
        if (!response.ok) throw new Error("Failed to fetch related");
        const data = await response.json();
        setRelatedMovies(data.results?.slice(0, 10) || []);
      } catch (error) {
        setRelatedMovies([]);
        console.error("Error fetching related:", error);
      }
    };
    fetchRelated();
  }, [id, type, API_OPTIONS]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleMovieClick = (mediaId: number) => {
    if (!type) return;
    navigate(`/media/${type}/${mediaId}`);
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const year = movie?.release_date
    ? new Date(movie.release_date).getFullYear()
    : movie?.first_air_date
    ? new Date(movie.first_air_date).getFullYear()
    : "N/A";

  const movieGenres =
    movieDetails && movieDetails.genres
      ? movieDetails.genres
      : genres.filter((genre) => movie.genre_ids?.includes(genre.id));

  const handleWatchTrailer = async () => {
    setIsLoadingTrailer(true);
    setShowTrailer(false);
    setTrailerKey(null);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${type}/${movie?.id}/videos`,
        API_OPTIONS
      );
      if (!response.ok) {
        throw new Error("Failed to fetch trailer");
      }
      const data = await response.json();
      const trailer = (data.results || []).find(
        (vid: { site: string; type: string }) =>
          vid.site === "YouTube" && vid.type === "Trailer"
      );
      if (trailer) {
        setTrailerKey(trailer.key);
        setShowTrailer(true);
      } else {
        setTrailerKey(null);
        setShowTrailer(false);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
      alert("Failed to fetch trailer.");
      setTrailerKey(null);
      setShowTrailer(false);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen relative">
      <div className="pattern" />
      <div className="wrapper">
        <div className="bg-dark-100 rounded-2xl p-8 relative z-10">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center justify-center w-10 h-10 rounded-full text-gray-300 hover:text-white hover:bg-dark-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 hover:scale-105 transition-transform duration-200"
            title="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <img
                  src={
                    movie.poster_path
                      ? `${IMAGE_BASE_URL}${movie.poster_path}`
                      : noPoster
                  }
                  alt={movie.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="md:w-2/3">
                <h1 className="text-4xl font-bold mb-4">
                  {movie.title || movie.name}
                </h1>

                {/* Year and Genres Row */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="rating flex items-center gap-1">
                    <img src={star} alt="star" className="w-5 h-5 mb-1" />
                    <p className="font-bold text-white">
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                  <span className="text-gray-300">•</span>
                  <p className="lang text-gray-300">
                    {movie.original_language
                      ? movie.original_language.charAt(0).toUpperCase() +
                        movie.original_language.slice(1)
                      : ""}
                  </p>
                  <span className="text-gray-300">•</span>
                  <p className="year text-gray-300">{year}</p>
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                  <p className="text-gray-300 leading-relaxed">
                    {movie.overview || "No overview available"}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Genres</h2>
                  <div className="flex flex-wrap gap-3">
                    {movieGenres.length > 0 ? (
                      movieGenres.map((genre) => (
                        <span
                          key={genre.id}
                          className="bg-light-100/10 px-4 py-2 rounded-full text-sm text-white"
                        >
                          {genre.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300">No genres available</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">Runtime</h2>
                  <p className="text-gray-300">
                    {typeof movieDetails?.runtime === "number" &&
                    movieDetails.runtime > 0
                      ? formatRuntime(movieDetails.runtime)
                      : Array.isArray(movieDetails?.episode_run_time) &&
                        movieDetails.episode_run_time.length > 0 &&
                        typeof movieDetails.episode_run_time[0] === "number"
                      ? formatRuntime(movieDetails.episode_run_time[0])
                      : "N/A"}
                  </p>
                </div>

                <div className="mb-6">
                  <button
                    onClick={handleWatchTrailer}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center w-full md:w-auto"
                    style={{ maxWidth: 900 }}
                  >
                    {isLoadingTrailer ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      "Watch Trailer"
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* Watch Trailer section (player only) */}
            {showTrailer && trailerKey && (
              <div
                className="rounded aspect-video w-full max-w-5xl mx-auto my-6"
                style={{ minHeight: 300 }}
              >
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            {showTrailer && !trailerKey && (
              <div className="text-center text-gray-300 py-8 w-full max-w-4xl mx-auto mb-6">
                No trailer available for this movie.
              </div>
            )}
            {relatedMovies.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-semibold mb-6">
                  You May Also Like
                </h2>
                <div className="relative">
                  <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                    {relatedMovies.map((relatedMovie) => (
                      <div
                        key={relatedMovie.id}
                        onClick={() => handleMovieClick(relatedMovie.id)}
                        className="cursor-pointer hover:scale-105 transition-all duration-200 flex-none w-[220px] group p-2"
                      >
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={
                              relatedMovie.poster_path
                                ? `${IMAGE_BASE_URL}${relatedMovie.poster_path}`
                                : noPoster
                            }
                            alt={relatedMovie.title}
                            className="w-full h-[330px] object-cover rounded-lg shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                            <span className="text-white font-medium">
                              View Details
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h3 className="font-semibold line-clamp-1 group-hover:text-red-500 transition-colors text-white">
                            {relatedMovie.title || relatedMovie.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <img src={star} alt="star" className="w-4 h-4" />
                              <span className="text-white">
                                {relatedMovie.vote_average?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                            <span>•</span>
                            <span>
                              {relatedMovie.release_date
                                ? new Date(
                                    relatedMovie.release_date
                                  ).getFullYear()
                                : relatedMovie.first_air_date
                                ? new Date(
                                    relatedMovie.first_air_date
                                  ).getFullYear()
                                : "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
