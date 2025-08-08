import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { loadRoadmapCsv, loadBooksCsv, RoadmapItem, BookItem } from '@/lib/csv';
import { useMemo } from 'react';

type Props = {
  roadmap: RoadmapItem[];
  books: BookItem[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const roadmapUrl = process.env.NEXT_PUBLIC_ROADMAP_CSV_URL;
  const booksUrl = process.env.NEXT_PUBLIC_BOOKS_CSV_URL;

  if (!roadmapUrl || !booksUrl) {
    return {
      props: { roadmap: [], books: [] },
    };
  }

  try {
    const [roadmap, books] = await Promise.all([
      loadRoadmapCsv(roadmapUrl),
      loadBooksCsv(booksUrl),
    ]);
    return { props: { roadmap, books } };
  } catch (error) {
    console.error(error);
    return { props: { roadmap: [], books: [] } };
  }
};

export default function Home({ roadmap, books }: Props) {
  const categories = useMemo(() => {
    const set = new Set(roadmap.map((r) => r.category).filter(Boolean));
    return Array.from(set);
  }, [roadmap]);

  const booksByCategory = useMemo(() => {
    const map = new Map<string, BookItem[]>();
    for (const b of books) {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category)!.push(b);
    }
    return map;
  }, [books]);

  return (
    <>
      <Head>
        <title>Life Challenges Timeline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', padding: '24px', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>Life Challenges Timeline</h1>
        {!process.env.NEXT_PUBLIC_ROADMAP_CSV_URL || !process.env.NEXT_PUBLIC_BOOKS_CSV_URL ? (
          <div style={{ padding: 12, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8, marginBottom: 16 }}>
            .env.local に NEXT_PUBLIC_ROADMAP_CSV_URL / NEXT_PUBLIC_BOOKS_CSV_URL を設定してください。
          </div>
        ) : null}

        {categories.length === 0 ? (
          <p>表示できるデータがありません。</p>
        ) : (
          categories.map((cat) => {
            const steps = roadmap
              .filter((r) => r.category === cat)
              .sort((a, b) => a.startDate.localeCompare(b.startDate));
            const catBooks = booksByCategory.get(cat) || [];
            return (
              <section key={cat} style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 22, margin: '16px 0' }}>{cat}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  {steps.map((s) => (
                    <div key={s.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{s.title}</div>
                      <div style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 8px' }}>
                        {s.startDate} → {s.endDate}
                      </div>
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{s.description}</p>
                    </div>
                  ))}
                </div>
                {catBooks.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Recommended Books</div>
                    <ul>
                      {catBooks.map((b) => (
                        <li key={b.id}>
                          <a href={b.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                            {b.title}
                          </a>{' '}
                          <span style={{ color: '#6b7280' }}>— {b.author}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>
    </>
  );
}