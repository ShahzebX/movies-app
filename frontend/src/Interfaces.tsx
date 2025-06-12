interface Video {
  key: string;
  type: string;
  site: string;
}

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
  genre_ids: number[];
  videos?: {
    results: Video[];
  };
}

export default Movie;
