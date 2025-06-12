import React from "react";
import Movie from "../Interfaces.tsx";
import star from "../assets/star.svg";
import noPoster from "../assets/No-Poster.png";

interface Props {
  movie: Movie;
  onCardClick: (movie: Movie) => void;
}

const Card = ({ movie, onCardClick }: Props) => {
  const { title, poster_path, release_date, vote_average, original_language } =
    movie;
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  let year = "N/A";

  if (release_date) {
    try {
      const dateObject = new Date(release_date);
      if (!isNaN(dateObject.getTime())) {
        year = dateObject.getFullYear().toString();
      }
    } catch (error) {
      console.error("Error parsing date:", release_date, error);
    }
  }

  return (
    <div
      className="movie-card cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={() => onCardClick(movie)}
    >
      <img
        src={poster_path ? `${IMAGE_BASE_URL}${poster_path}` : noPoster}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div
          className="content"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <img
            className="mb-1"
            src={star}
            alt="star-img"
            style={{ width: 18, height: 18 }}
          />
          <span>{vote_average ? vote_average.toFixed(1) : "N/A"}</span>
          <span>•</span>
          <span className="lang">
            {original_language
              ? original_language.charAt(0).toUpperCase() +
                original_language.slice(1)
              : ""}
          </span>
          <span>•</span>
          <span className="year">{year}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
