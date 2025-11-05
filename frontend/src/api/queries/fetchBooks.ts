const fetchBooks = async (query: any) => {
  if (!query) return { docs: [] };
  const searchTerm = encodeURIComponent(query);
  const fields = "key,title,author_name,cover_i";
  const url = `https://openlibrary.org/search.json?q=${searchTerm}&fields=${fields}&limit=10`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar os livros");
  }
  return response.json();
};

export default fetchBooks;
