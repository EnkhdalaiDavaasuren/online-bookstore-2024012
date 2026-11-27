import { useEffect, useState, type FormEvent } from "react";
import type { BookRecord } from "../src/books";

type RequestState<T> =
  | { loading: true }
  | { loading: false; data: T }
  | { loading: false; error: string };

async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok) {
    const body = await response.json<unknown>().catch(() => null);
    const message = body && typeof body === "object" && "error" in body
      ? body.error
      : null;
    throw new Error(typeof message === "string" ? message : "Request failed");
  }
  return response.json() as Promise<T>;
}

function useRequest<T>(path: string, revision = 0): RequestState<T> {
  const [state, setState] = useState<RequestState<T>>({ loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    getJson<T>(path, controller.signal).then(
      data => { if (!controller.signal.aborted) setState({ loading: false, data }); },
      error => { if (!controller.signal.aborted) setState({ loading: false, error: error.message }); },
    );
    return () => controller.abort();
  }, [path, revision]);
  return state;
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function BookInformation({ book }: { book: BookRecord }) {
  return <>
    <h2>{book.title}</h2>
    <p>{book.author}</p>
    <p>{usd.format(book.price_cents / 100)} · {book.stock ? `${book.stock} in stock` : "Sold out"}</p>
  </>;
}

function BookDetail({ id, close }: { id: number; close: () => void }) {
  const detail = useRequest<BookRecord>(`/api/books/${id}`);
  return <section className="detail" aria-label="Book details">
    <button type="button" onClick={close}>Back to results</button>
    {detail.loading ? <p role="status">Loading book details…</p> :
      "error" in detail ? <p role="alert">{detail.error}</p> :
      <>
        <BookInformation book={detail.data} />
        {detail.data.isbn && <p>ISBN {detail.data.isbn}</p>}
      </>}
  </section>;
}

export function App() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState({ path: "/api/books", revision: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const books = useRequest<BookRecord[]>(search.path, search.revision);
  const health = useRequest<{ status: "ok" }>("/api/health");

  function load(path: string) {
    setSearch(previous => ({ path, revision: previous.revision + 1 }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!books.loading && query.trim()) {
      load(`/api/books/search?q=${encodeURIComponent(query)}`);
    }
  }

  return <main>
    <header>
      <h1>Online Bookstore</h1>
      <p role="status">{health.loading ? "Checking database…" :
        "error" in health ? "Database unavailable" : "Database connected"}</p>
    </header>
    {selected !== null ? <BookDetail key={selected} id={selected} close={() => setSelected(null)} /> :
      <>
        <form onSubmit={submit}>
          <label>Search by title or author
            <input type="search" value={query} disabled={books.loading}
              onChange={event => setQuery(event.target.value)} />
          </label>
          <button disabled={books.loading || !query.trim()}>Search</button>
          {search.path !== "/api/books" && <button type="button" disabled={books.loading}
            onClick={() => { setQuery(""); load("/api/books"); }}>Show all books</button>}
        </form>
        {books.loading ? <p role="status">Loading books…</p> :
          "error" in books ? <p role="alert">{books.error}</p> :
          books.data.length === 0 ? <p role="status">No books found.</p> :
          <section className="catalog" aria-label="Books">
            {books.data.map(book => <article key={book.book_id}>
              <BookInformation book={book} />
              <button type="button" aria-label={`View details for ${book.title}`}
                onClick={() => setSelected(book.book_id)}>View details</button>
            </article>)}
          </section>}
      </>}
  </main>;
}
