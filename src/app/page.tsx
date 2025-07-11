'use client';

import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Image from 'next/image';
import Link from 'next/link';

interface Salesman {
  name: string;
  sales: number;
  imageUrl?: string;
}


const XLSX_URL = '/WBSC Grass Weekly avg by rep.xlsx';

// Image mapping - maps salesperson names to their image filenames
// You'll need to update this mapping based on your actual image files
const SALESMAN_IMAGE_MAP: Record<string, string> = {
  'Edwards': 'edwards-cole-200x200.png',
  'Pivonka': 'pivonka-todd-200x200-01.png',
  'Smith': 'smith-mike-200x200-01.png',
  'Talken': 'talken-dwayne-200x200-01.png',
  'Brekke': 'brekke-bryan-200x200-01.png',
  'Dolezal': 'dolezal-pat-200x200-01.png',
  'Johnson': 'johnson-scott-200x200-01.png',
  'Lachowitzer': 'lachowitzer-dan-200x200-01.png',
  'Schnurr': 'Schnurr-Dustin-200x200.png',
  'Schull': 'sales-rep-generic-200x200-02.png',
  'Slowey': 'slowey-mike-200x200-01.png',
  'Weir': 'weir-brandon-200x200-01.png',
  'Roemer': 'roemer-rick-200x200-01.png',
  'Starr': 'starr-heath-200x200-01.png',
  'Strukel': 'sales-rep-generic-200x200-02.png',
  'Springer': 'springer-bryan-200x200-01.png',
  'Barnes': 'barnes-craig-200x200-01.png',
  'Wagner': 'sales-rep-generic-200x200-02.png',
  'Callahan': 'Callahan-Craig-200x200.png',
  'Chouteau': 'sales-rep-generic-200x200-02.png',
  'Nafziger': 'nafziger-alex-200x200-01.png',
  'Cimaglia': 'Cimaglia-Mary2-200x200.png',
  'Gasser': 'Gasser-Chad2-200x200.png',
  'Paoloni': 'paolini-gino-200x200-01.png',
  'Lonero': 'lonero-mike-200x200-01.png',
  'Mendenhall': 'Mendenhall-Richard-200x200.png',
  'Day': 'day-cliff-200x200-01.png',
  'Young': 'sales-rep-generic-200x200-02.png',
  'Schafer': 'shafer-bobby-200x200-01.png',
  'Beck': 'beck-kyle-200x200-01.png',
  'Dennehy': 'Dennehy-Patrick-200x200.png',
  'Ellis': 'ellis-mike-200x200-01.png',
  'Florence': 'florence-bill-200x200-01.png',
  'Martin': 'Martin-Corey-200x200.png',
  'Bennett': 'Bennett-Chuck-200x200.png',
  'Insko': 'insko-brian-200x200-01.png',
  'McCarty': 'McCarty-Don-200x200.png',
  'Brock': 'brock-ken-200x200-01.png',
  'Ryan': 'ryan-steve-200x200-01.png',
  'Wittenauer': 'Wittenauer-Todd-200x200.png',
  'Cangialosi': 'cangialosi-frank-200x200-01.png',
  'Franco': 'sales-rep-generic-200x200-02.png',
  'Lohman': 'lohman-john-200x200-01.png',
  'Maynard': 'sales-rep-generic-200x200-02.png',
  'Pipoli': 'pipoli-mike-200x200-01.png',
  'Shuttlesworth': 'Shuttlesworth-Jeffrey-200x200.png',
  'Burklow': 'Burklow-Patty-200x200.png',
  'Galvan': 'galvan-kevin-200x200.png',
  'Herbst': 'Herbst-Charlie-200x200.png',
  'Rubino': 'rubino-chuck-200x200-01.png',
  'White': 'white-vernon-200x200.png',
  'Naxi': 'naxi-oscar-200x200.png',
};


// Helper function to get image URL for a salesperson
const getSalesmanImage = (name: string): string | undefined => {
  // Direct match first
  if (SALESMAN_IMAGE_MAP[name]) {
    const fileName = SALESMAN_IMAGE_MAP[name];
    // Don't show image if it's a placeholder
    if (fileName === 'placeholder.png') {
      return undefined;
    }
    return `/images/salesmen/${fileName}`;
  }
  
  // Try partial matching (in case of slight name variations)
  const normalizedName = name.toLowerCase().trim();
  for (const [mapName, fileName] of Object.entries(SALESMAN_IMAGE_MAP)) {
    if (normalizedName.includes(mapName.toLowerCase()) || mapName.toLowerCase().includes(normalizedName)) {
      // Don't show image if it's a placeholder
      if (fileName === 'placeholder.png') {
        return undefined;
      }
      return `/images/salesmen/${fileName}`;
    }
  }
  
  return undefined;
};

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

        const dataRows = jsonData.slice(2);

        const parsed = dataRows
          .map((row) => {
            const repField = (row[0] || '').toString().trim();
            const name = repField;

            const salesRaw = (row[1] || '').toString().replace(/[$,]/g, '').trim();
            const sales = Math.round(parseFloat(salesRaw));

            if (!name || isNaN(sales) || sales === 0) return null;

            const imageUrl = getSalesmanImage(name);

            return { name, sales, imageUrl };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null);

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
    const id = setInterval(fetchAndParseXLSX, 10000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <>
    <div className="w-full bg-black py-0 flex items-center justify-center mb-8">
      <Image
        src="/sales.jpg"
        alt="Sales Race Banner"
        width={1800}
        height={400}
        className="object-cover w-full h-65"
        priority
        quality={95}
      />
    </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">Loading Sales Data...</div>
        ) : (
          <>
            {error && (
              <div className="text-center text-red-600 font-bold mb-4">{error}</div>
            )}
            {/* Podium */}
            <div className="flex justify-center items-end mb-10">
              {[1, 0, 2].map((pos) => {
                const salesman = salesmen[pos];
                return (
                  <div key={pos} className="flex flex-col items-center">
                    {salesman?.imageUrl ? (
                      <Image
                      src={salesman.imageUrl}
                      alt={salesman.name}
                      width={64}
                      height={64}
                      className="rounded-full border-4 border-white mb-2 object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-2xl font-bold mb-2 bg-white">
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`font-semibold ${pos === 0 ? 'text-lg' : 'text-base'}`}>
                        {salesman?.name || '-'}
                      </div>
                    </div>
                    <div className="text-sm text-black">
                      ${salesman?.sales.toLocaleString() || '-'}
                    </div>
                    <div className="relative flex flex-col items-center mt-2 w-28">
                        <div
                        className={`border-white/80 border w-full flex items-center justify-center ${
                          pos === 0 ? 'bg-red-600' : 'bg-black'
                        }`}
                        style={{
                          height: pos === 0 ? '150px' : pos === 1 ? '105px' : '75px',
                        }}
                        >
                        <span className="text-white font-bold text-lg absolute inset-0 flex items-center justify-center">
                          {pos === 0 ? '1st' : pos === 1 ? '2nd' : '3rd'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Full Width Three Column Layout */}
      {!loading && (
        <div className="flex w-full items-start">
          {/* Left side - Details */}
          <div className="w-100 bg-gray-100 h-60 p-4 ml-4">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Details:</h3>
            <ul className="text-md text-gray-700 space-y-1">
              <li>• The rep with the most growth at the end of the week wins!</li>
              <li>• If you do not hit plan for that vendor for the week, you will not be in the running</li>
              <li>• Your baseline is your YTD average weekly sales</li>
              <li>• The average margin must be min. 18% on all sales to be in the running</li>
            </ul>
          </div>

          {/* Center - Leaderboard */}
          <div className="flex-1 flex justify-center">
            <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg shadow-black p-6">
              <h2 className="text-3xl font-extrabold mb-4 text-center">Leaderboard</h2>
              <h2 className="text-xl font-lightbold mb-4 text-center">Updated as of end of day Monday</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-center">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4">Rank</th>
                      <th className="py-2 px-4 w-16">Photo</th>
                      <th className="py-2 px-4">Salesman</th>
                      <th className="py-2 px-4">Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmen.map((s, i) => {
                      let rowClass = '';
                      if (i === 0)
                        rowClass =
                          'bg-yellow-100 border-l-4 border-yellow-500 text-black';
                      else if (i === 1)
                        rowClass =
                          'bg-gray-100 border-l-4 border-gray-400 text-black';
                      else if (i === 2)
                        rowClass =
                          'bg-[#f8e6d2] border-l-4 border-[#b87333] text-black';

                      return (
                        <tr
                          key={`${s.name}-${i}`}
                          className={`${rowClass} ${i < 3 ? 'font-bold' : ''}`}
                        >
                          <td className="py-2 px-4">{i + 1}</td>
                          <td className="py-2 px-4">
                            <div className="flex items-center justify-center">
                              {s.imageUrl && (
                                <Image
                                  src={s.imageUrl}
                                  alt={s.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            <span>{s.name}</span>
                          </td>
                          <td className="py-2 px-4">${s.sales.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right side - Prizes */}
          <div className="w-100 bg-gray-100 h-60 p-4 mr-4">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Prizes:</h3>
            <ul className="text-md text-gray-700 mt-4 space-y-4">
                <li>
                <strong>1st Place:</strong>{' '}
                <a
                  href="https://www.tagheuer.com/us/en/timepieces/collections/tag-heuer-formula-1/43-mm-quartz/CAZ1011.BA0842.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer hover:underline hover:text-red-600"
                >
                  Tag Heuer Formula 1 Chronograph or $2,450
                </a>
                </li>
                <li>
                <strong>2nd Place:</strong>{' '}
                <a
                  href="https://nomos-glashuette.com/en/club/club-701-1?gad_source=1&gad_campaignid=184967029&gbraid=0AAAAADs72kutkBp9CAIc81FNZfc5M78Fh&gclid=CjwKCAjw7MLDBhAuEiwAIeXGITuhsWhc1LOJCsPwlEV1FOwFi_aSERg6z5C8MNeDF4dL70tIyNTcRhoCg4YQAvD_BwE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer hover:underline hover:text-red-600"
                >
                  Nomos Reference 701.1 or $1,660
                </a>
                </li>
              <li>
                <strong>3rd Place:</strong>{' '}
                <a
                  href="https://www.tissotwatches.com/en-us/T1514221104100.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:cursor-pointer hover:underline hover:text-red-600"
                >
                  Tissot PRC 100 Solar Quartz or $525
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
