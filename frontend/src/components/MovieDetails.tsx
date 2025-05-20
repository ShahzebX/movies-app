import React, { useEffect, useState } from "react";
import Movie from "../Interfaces";
import star from "../assets/star.svg";
import noPoster from "../assets/No-Poster.png";

interface Genre {
  id: number;
  name: string;
}

interface Props {
  movie: Movie;
  onClose: () => void;
}

const MovieDetails = ({ movie, onClose }: Props) => {
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  const [genres, setGenres] = useState<Genre[]>([]);
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, [API_KEY]);

  const movieGenres = genres.filter((genre) =>
    movie.genre_ids?.includes(genre.id)
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-100 rounded-2xl max-w-4xl w-full flex flex-col md:flex-row gap-6 p-6">
        <div className="md:w-1/2">
          <img
            src={
              movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : noPoster
            }
            alt={movie.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
        <div className="md:w-1/2 text-white">
          <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>

          <div className="flex items-center gap-2 mb-4">
            <div className="rating">
              <img src={star} alt="star" className="w-5 h-5" />
              <p className="font-bold">
                {movie.vote_average?.toFixed(1) || "N/A"}
              </p>
            </div>
            <span>•</span>
            <p className="lang">{movie.original_language}</p>
            <span>•</span>
            <p className="year">{year}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Overview</h3>
            <p className="text-gray-300">
              {movie.overview || "No overview available"}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {movieGenres.length > 0 ? (
                movieGenres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-light-100/10 px-3 py-1 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-300">No genres available</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Runtime</h3>
            <p className="text-gray-300">
              {movie.runtime ? `${movie.runtime} minutes` : "N/A"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 bg-light-100/10 hover:bg-light-100/20 px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
