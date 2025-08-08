import Papa from 'papaparse';

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  category: string;
};

export type BookItem = {
  id: string;
  title: string;
  author: string;
  url: string;
  category: string;
};

async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export async function loadRoadmapCsv(url: string): Promise<RoadmapItem[]> {
  const csvText = await fetchCsv(url);
  const parsed = Papa.parse<RoadmapItem>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
  }
  return parsed.data.map((row) => ({
    id: String(row.id || '').trim(),
    title: String(row.title || '').trim(),
    description: String(row.description || '').trim(),
    startDate: String(row.startDate || '').trim(),
    endDate: String(row.endDate || '').trim(),
    category: String(row.category || '').trim(),
  })).filter((r) => r.id && r.title);
}

export async function loadBooksCsv(url: string): Promise<BookItem[]> {
  const csvText = await fetchCsv(url);
  const parsed = Papa.parse<BookItem>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length) {
    throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
  }
  return parsed.data.map((row) => ({
    id: String(row.id || '').trim(),
    title: String(row.title || '').trim(),
    author: String(row.author || '').trim(),
    url: String(row.url || '').trim(),
    category: String(row.category || '').trim(),
  })).filter((r) => r.id && r.title);
}