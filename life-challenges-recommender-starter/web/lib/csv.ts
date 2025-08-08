import Papa from 'papaparse';

/**
 * 課題データの型定義
 */
export interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  timeframe: string;
  priority: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  tags: string;
}

/**
 * 書籍データの型定義
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  difficulty: number;
  pages: number;
  estimated_reading_time: string;
  priority: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  tags: string;
}

/**
 * CSVデータを取得する共通関数
 * @param url CSV URL
 * @returns CSVの生データ
 */
async function fetchCsvData(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
        'Content-Type': 'text/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error('CSV data fetch error:', error);
    throw new Error(`Failed to fetch CSV data: ${error}`);
  }
}

/**
 * CSVテキストをパースして配列に変換
 * @param csvText CSV形式のテキスト
 * @returns パースされたデータ配列
 */
function parseCsvData<T>(csvText: string): T[] {
  try {
    const result = Papa.parse<T>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim(),
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    return result.data;
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV data: ${error}`);
  }
}

/**
 * Roadmapデータを取得
 */
export async function fetchRoadmapData(): Promise<Challenge[]> {
  const csvUrl = process.env.NEXT_PUBLIC_ROADMAP_CSV_URL;
  
  if (!csvUrl) {
    throw new Error('NEXT_PUBLIC_ROADMAP_CSV_URL environment variable is not set');
  }

  try {
    const csvText = await fetchCsvData(csvUrl);
    const challenges = parseCsvData<Challenge>(csvText);
    
    // データの整形
    return challenges.map(challenge => ({
      ...challenge,
      tags: typeof challenge.tags === 'string' ? challenge.tags : '',
      start_date: challenge.start_date || '',
      end_date: challenge.end_date || '',
    }));
  } catch (error) {
    console.error('Failed to fetch roadmap data:', error);
    throw error;
  }
}

/**
 * Booksデータを取得
 */
export async function fetchBooksData(): Promise<Book[]> {
  const csvUrl = process.env.NEXT_PUBLIC_BOOKS_CSV_URL;
  
  if (!csvUrl) {
    throw new Error('NEXT_PUBLIC_BOOKS_CSV_URL environment variable is not set');
  }

  try {
    const csvText = await fetchCsvData(csvUrl);
    const books = parseCsvData<Book>(csvText);
    
    // データの整形
    return books.map(book => ({
      ...book,
      tags: typeof book.tags === 'string' ? book.tags : '',
      start_date: book.start_date || '',
      end_date: book.end_date || '',
      pages: typeof book.pages === 'number' ? book.pages : parseInt(book.pages as any) || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch books data:', error);
    throw error;
  }
}

/**
 * タグ文字列を配列に変換
 * @param tagsString カンマ区切りのタグ文字列
 * @returns タグの配列
 */
export function parseTagsString(tagsString: string): string[] {
  if (!tagsString) return [];
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}

/**
 * 日付文字列を Date オブジェクトに変換
 * @param dateString 日付文字列（YYYY-MM-DD形式）
 * @returns Date オブジェクト
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * 優先度による並び順の重みを取得
 * @param priority 優先度文字列
 * @returns 数値（小さいほど高優先度）
 */
export function getPriorityWeight(priority: string): number {
  switch (priority) {
    case '高':
      return 1;
    case '中':
      return 2;
    case '低':
      return 3;
    default:
      return 4;
  }
}

/**
 * ステータスによる並び順の重みを取得
 * @param status ステータス文字列
 * @returns 数値（小さいほど優先して表示）
 */
export function getStatusWeight(status: string): number {
  switch (status) {
    case '進行中':
      return 1;
    case '計画中':
      return 2;
    case '読書中':
      return 1;
    case '読了':
      return 3;
    case '完了':
      return 3;
    default:
      return 4;
  }
}