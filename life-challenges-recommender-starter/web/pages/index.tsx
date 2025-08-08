import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  fetchRoadmapData, 
  fetchBooksData, 
  Challenge, 
  Book, 
  parseTagsString, 
  parseDate, 
  getPriorityWeight, 
  getStatusWeight 
} from '../lib/csv';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import clsx from 'clsx';

/**
 * タイムライン項目の統合型
 */
interface TimelineItem {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  priority: string;
  description: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
  type: 'challenge' | 'book';
  author?: string; // 書籍のみ
  pages?: number; // 書籍のみ
  timeframe?: string; // 課題のみ
}

export default function Home() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // データを取得して統合
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [challengesData, booksData] = await Promise.all([
          fetchRoadmapData(),
          fetchBooksData(),
        ]);

        // 課題データを変換
        const challengeItems: TimelineItem[] = challengesData.map((challenge: Challenge) => ({
          id: challenge.id,
          title: challenge.title,
          category: challenge.category,
          difficulty: challenge.difficulty,
          priority: challenge.priority,
          description: challenge.description,
          status: challenge.status,
          startDate: parseDate(challenge.start_date),
          endDate: parseDate(challenge.end_date),
          tags: parseTagsString(challenge.tags),
          type: 'challenge' as const,
          timeframe: challenge.timeframe,
        }));

        // 書籍データを変換
        const bookItems: TimelineItem[] = booksData.map((book: Book) => ({
          id: book.id,
          title: book.title,
          category: book.category,
          difficulty: book.difficulty,
          priority: book.priority,
          description: book.description,
          status: book.status,
          startDate: parseDate(book.start_date),
          endDate: parseDate(book.end_date),
          tags: parseTagsString(book.tags),
          type: 'book' as const,
          author: book.author,
          pages: book.pages,
        }));

        // 統合してソート
        const allItems = [...challengeItems, ...bookItems];
        allItems.sort((a, b) => {
          // まずステータスでソート
          const statusDiff = getStatusWeight(a.status) - getStatusWeight(b.status);
          if (statusDiff !== 0) return statusDiff;

          // 次に優先度でソート
          const priorityDiff = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
          if (priorityDiff !== 0) return priorityDiff;

          // 最後に開始日でソート
          if (a.startDate && b.startDate) {
            return a.startDate.getTime() - b.startDate.getTime();
          }
          if (a.startDate) return -1;
          if (b.startDate) return 1;
          return 0;
        });

        setTimelineItems(allItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
        console.error('Data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // フィルタリング
  const filteredItems = timelineItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && item.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  // カテゴリ一覧を取得
  const categories = Array.from(new Set(timelineItems.map(item => item.category)));
  const statuses = Array.from(new Set(timelineItems.map(item => item.status)));

  // 優先度の色を取得
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-600 bg-red-100';
      case '中': return 'text-yellow-600 bg-yellow-100';
      case '低': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ステータスの色を取得
  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中':
      case '読書中': return 'text-blue-600 bg-blue-100';
      case '計画中': return 'text-gray-600 bg-gray-100';
      case '完了':
      case '読了': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <Head>
        <title>Life Challenges Timeline</title>
        <meta name="description" content="人生の課題をタイムライン形式で表示" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Life Challenges Timeline
              </h1>
              <p className="mt-2 text-gray-600">
                人生の課題と学習計画をタイムライン形式で管理
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* フィルター */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">フィルター</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">すべて</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="all">すべて</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ローディングとエラー表示 */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">データを読み込み中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
              <h3 className="font-bold">エラーが発生しました</h3>
              <p>{error}</p>
            </div>
          )}

          {/* タイムライン表示 */}
          {!loading && !error && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  タイムライン ({filteredItems.length}件)
                </h2>
              </div>

              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  条件に合う項目が見つかりませんでした
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.title}
                            </h3>
                            <span className={clsx(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              item.type === 'challenge' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            )}>
                              {item.type === 'challenge' ? '課題' : '書籍'}
                            </span>
                          </div>

                          {item.author && (
                            <p className="text-sm text-gray-600 mb-2">
                              著者: {item.author}
                            </p>
                          )}

                          <p className="text-gray-700 mb-3">{item.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {item.category}
                            </span>
                            <span className={clsx(
                              'px-3 py-1 text-sm rounded-full',
                              getPriorityColor(item.priority)
                            )}>
                              優先度: {item.priority}
                            </span>
                            <span className={clsx(
                              'px-3 py-1 text-sm rounded-full',
                              getStatusColor(item.status)
                            )}>
                              {item.status}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              難易度: {item.difficulty}/5
                            </span>
                          </div>

                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-sm text-gray-500 space-y-1">
                            {item.startDate && (
                              <p>
                                開始: {format(item.startDate, 'yyyy/MM/dd', { locale: ja })}
                              </p>
                            )}
                            {item.endDate && (
                              <p>
                                終了: {format(item.endDate, 'yyyy/MM/dd', { locale: ja })}
                              </p>
                            )}
                            {item.timeframe && (
                              <p>期間: {item.timeframe}</p>
                            )}
                            {item.pages && (
                              <p>ページ数: {item.pages}ページ</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}