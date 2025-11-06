import React, { useState, useEffect, useRef, useCallback } from 'react';

// Hàm hỗ trợ để phân tích cú pháp CSV đơn giản
const parseCSV = (text: string): string[][] => {
  const rows = text.split('\n');
  return rows.map(row => 
    row.split(',').map(cell => {
      // Loại bỏ dấu ngoặc kép ở đầu và cuối nếu có
      if (cell.startsWith('"') && cell.endsWith('"')) {
        return cell.slice(1, -1);
      }
      return cell;
    })
  );
};

// ID của Google Sheet được chỉ định sẵn
const GOOGLE_SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return date.toLocaleDateString('vi-VN', options);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN');
    };

    return (
        <div className="text-right text-red-100 font-serif">
            <p className="text-sm">{formatDate(time)}</p>
            <p className="text-lg font-bold tracking-wider">{formatTime(time)}</p>
        </div>
    );
};

// Component để nhúng biểu đồ TradingView
const TradingViewWidget: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetLoaded = useRef(false);

    useEffect(() => {
        if (!containerRef.current || widgetLoaded.current) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            if (containerRef.current && typeof (window as any).TradingView !== 'undefined') {
                new (window as any).TradingView.widget({
                    "autosize": true,
                    "symbol": "OANDA:XAUUSD",
                    "interval": "60",
                    "timezone": "Asia/Ho_Chi_Minh",
                    "theme": "dark",
                    "style": "1",
                    "locale": "vi_VN",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "allow_symbol_change": true,
                    "container_id": "tradingview_chart_container"
                });
                widgetLoaded.current = true;
            }
        };

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div ref={containerRef} id="tradingview_chart_container" style={{ height: '100%', width: '100%' }} />
    );
};


const App: React.FC = () => {
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Thêm timestamp để tránh cache
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu. Vui lòng kiểm tra lại Sheet ID và quyền truy cập.');
      }

      const csvText = await response.text();
      const data = parseCSV(csvText);
      
      if (data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === '')) {
          throw new Error('Bảng tính trống hoặc không có dữ liệu.');
      }

      // Chỉ lấy 3 cột đầu tiên
      const threeColumnData = data.map(row => row.slice(0, 3));
      setSheetData(threeColumnData);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Hãy chắc chắn rằng bảng tính của bạn được chia sẻ công khai.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="bg-red-600 min-h-screen w-full flex flex-col items-center p-4 sm:p-6 md:p-8 text-white font-serif">
      <div className="w-full max-w-7xl">
        
        <header className="mb-8 flex justify-between items-start">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 tracking-wider">VÀNG BẠC HÙNG HẠ</h2>
            <p className="text-base text-red-100">Đ/c: 136 - Phố huyện</p>
            <p className="text-base text-red-100">ĐT: 0356999659</p>
          </div>
          <Clock />
        </header>

        <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 md:w-12 md:h-12 text-yellow-400">
                   <path d="M12 3c-4.39 0-8 1.79-8 4s3.61 4 8 4 8-1.79 8-4-3.61-4-8-4zm0 6c-3.15 0-5.88-1.2-6.73-2.79.85-1.59 3.58-2.79 6.73-2.79s5.88 1.2 6.73 2.79c-.85 1.59-3.58-2.79-6.73-2.79zm0 3c-4.39 0-8 1.79-8 4s3.61 4 8 4 8-1.79 8-4-3.61-4-8-4zm0 6c-3.15 0-5.88-1.2-6.73-2.79.85-1.59 3.58-2.79 6.73-2.79s5.88 1.2 6.73 2.79c-.85 1.59-3.58-2.79-6.73-2.79z"/>
                </svg>
                 <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 uppercase">
                    Bảng giá vàng hôm nay
                </h1>
                <button
                    onClick={fetchData}
                    className="ml-4 p-2 bg-yellow-400 text-red-700 rounded-full hover:bg-yellow-500 transition-transform duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Cập nhật dữ liệu"
                    disabled={loading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 15a9 9 0 11-1.63-9.51" />
                    </svg>
                </button>
            </div>
        </div>
        
        {loading && sheetData.length === 0 && (
           <div className="flex justify-center items-center h-60">
             <svg className="animate-spin h-10 w-10 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
           </div>
        )}

        {error && <div className="bg-red-900/80 border border-yellow-400 text-white p-4 rounded-lg my-6">{error}</div>}

        {!error && sheetData.length > 0 && (
          <div className="mt-8 w-full flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="w-full lg:w-1/2">
                <div className="bg-red-800/50 backdrop-blur-sm border border-red-500 rounded-xl shadow-2xl p-4 md:p-6 overflow-x-auto">
                    <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                        <tr className="border-b border-red-500">
                            {sheetData[0] && sheetData[0].map((headerCell, index) => (
                            <th key={index} className="p-4 sm:p-5 font-semibold text-yellow-300 bg-red-700/60 uppercase text-lg whitespace-nowrap">
                                {headerCell}
                            </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {sheetData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-red-500 last:border-b-0 hover:bg-red-700/40 transition-colors duration-200">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-4 sm:p-5 text-red-100 font-serif text-xl">
                                {cell}
                                </td>
                            ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-full lg:w-1/2">
                <h2 className="text-2xl font-bold text-yellow-300 uppercase mb-4 text-center lg:text-left">Biểu đồ XAU/USD (TradingView)</h2>
                <div className="bg-red-800/50 backdrop-blur-sm border border-red-500 rounded-xl shadow-2xl overflow-hidden" style={{height: '450px'}}>
                   <TradingViewWidget />
                </div>
            </div>

          </div>
        )}
        
        <footer className="mt-12 text-red-200 text-sm text-center">
          <p>Tạo bởi AI với React & Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
};

export default App;
