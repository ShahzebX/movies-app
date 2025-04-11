import React from "react";
import Movie from "../Movie.tsx";
import star from "../assets/star.svg";
import noPoster from "../assets/No-Poster.png";
interface Props {
  movie: Movie;
}
const Card = ({
  movie: { title, poster_path, release_date, vote_average, original_language },
}: Props) => {
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
    <div className="movie-card">
      <img
        src={poster_path ? `${IMAGE_BASE_URL}${poster_path}` : noPoster}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src={star} alt="star-img" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">{year}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
