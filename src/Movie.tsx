interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  original_language: string;
  genres: string[];
  runtime: number;
  overview: string;
}
export default Movie;
