'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Image from 'next/image';

interface Salesman {
  name: string;
  sales: number;
}


const XLSX_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQj1VZbVdNX3fSZGgT3j36IUWjyXgWLgdJxH5YqJB73S9ZGWxO7C07w_rY4a6_mytRfL0eMXz0SqCx_/pub?output=xlsx';

export default function SalesRacePage() {
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndParseXLSX = async () => {
      try {
        const res = await fetch(XLSX_URL);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          header: 1,
          defval: '',
        });

        // Skip header row
        const dataRows = jsonData.slice(1);

        const parsed: Salesman[] = dataRows
          .map((row) => {
            const repField = (row[0] || '').toString().trim();
            const parts = repField.split(/\s+/);
            const name = parts.slice(1).join(' ') || repField;

            const salesRaw = (row[1] || '').toString().replace(/[$,]/g, '').trim();
            const sales = parseFloat(salesRaw);

            if (!name || isNaN(sales)) return null;

            return { name, sales };
          })
          .filter((s): s is Salesman => !!s);

        if (parsed.length === 0) {
          setError('No valid sales data found. Please check the Excel file format.');
        } else {
          setError(null);
        }

        parsed.sort((a, b) => b.sales - a.sales);
        if (isMounted) {
          setSalesmen(parsed);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError('Failed to fetch Excel file: ' + errorMessage);
          setLoading(false);
        }
      }
    };

    fetchAndParseXLSX();
    const id = setInterval(fetchAndParseXLSX, 10000); // refresh every 10s
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  const trophyColors = [
    'bg-yellow-400 border-yellow-500',
    'bg-gray-300 border-gray-400',
    'bg-[#cd7f32] border-[#b87333]',
  ];

  return (
    <>
    <div className="w-full bg-black py-0 flex items-center justify-center mb-8">
      <Image
        src="/sales.jpg"
        alt="Sales Race Banner"
        width={1000}
        height={200}
        className="object-cover w-full h-80 rounded"
        priority
      />
    </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            {error && (
              <div className="text-center text-red-600 font-bold mb-4">{error}</div>
            )}

            {/* Podium */}
            <div className="flex justify-center items-end mb-10 gap-6">
              {[1, 0, 2].map((pos) => {
                const topSales = salesmen[0]?.sales || 1;
                const sales = salesmen[pos]?.sales || 0;
                const height = Math.round(40 + ((sales / topSales) * 60)); // 40-100px bar height
                return (
                  <div key={pos} className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full border-4 ${trophyColors[pos]} flex items-center justify-center text-2xl font-bold mb-2`}
                    >
                      {pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={`font-semibold ${pos === 0 ? 'text-lg' : 'text-base'}`}>
                      {salesmen[pos]?.name || '-'}
                    </div>
                    <div className="text-sm text-black">
                      ${salesmen[pos]?.sales.toLocaleString() || '-'}
                    </div>
                    <div
                      className="mt-2 w-10 bg-gray-200 rounded-t-md"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-3xl font-extrabold mb-4 text-center">Leaderboard</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4">Rank</th>
                      <th className="py-2 px-4">Salesman</th>
                      <th className="py-2 px-4">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmen.map((s, i) => {
                      let rowClass = '';
                      if (i === 0)
                        rowClass =
                          'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
                      else if (i === 1)
                        rowClass =
                          'bg-gray-100 border-l-4 border-gray-400 text-gray-800';
                      else if (i === 2)
                        rowClass =
                          'bg-[#f8e6d2] border-l-4 border-[#b87333] text-[#7c4a03]';

                      return (
                        <tr
                          key={`${s.name}-${i}`}
                          className={`${rowClass} ${i < 3 ? 'font-bold' : ''}`}
                        >
                          <td className="py-2 px-4">{i + 1}</td>
                          <td className="py-2 px-4">{s.name}</td>
                          <td className="py-2 px-4">${s.sales.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
