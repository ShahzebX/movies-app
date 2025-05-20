import {Client, Databases, ID, Query} from "appwrite";

const Project_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const Database_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const Collection_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(Project_ID);

const database = new Databases(client);

interface Movie {
  id: string;
  poster_path: string;
}

export const updateSearchCount = async (searchTerm: string, movie: Movie)  => {
  try {
    const result = await database.listDocuments(Database_ID, Collection_ID, [
      Query.equal("searchTerm", searchTerm), ]);
    
    if (result.documents.length > 0) {
      const document = result.documents[0];
      await database.updateDocument(Database_ID, Collection_ID, document.$id, {
        count: document.count + 1,});
    }
    else
      await database.createDocument(Database_ID, Collection_ID, ID.unique(), {
    searchTerm,
    count: 1,
    movie_id : movie.id,
    poster_url : `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    })
  } catch (error) {
    console.log(error);
  }
}

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(Database_ID, Collection_ID, [
      Query.limit(5),
      Query.orderDesc('count'),]);
  
      return result.documents;
  } catch (error) {
    console.log(error);
  }

}
