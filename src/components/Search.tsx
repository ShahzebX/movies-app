import searchImg from "../assets/search.svg";
interface Props {
  searchQuery: string;
  setSearchQuery: (e: string) => void;
}
const Search = ({ searchQuery, setSearchQuery }: Props) => {
  return (
    <div className="search">
      <div>
        <img src={searchImg} alt="Search Icon" />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          type="text"
          placeholder="Search for a movie..."
        />
      </div>
    </div>
  );
};

export default Search;
