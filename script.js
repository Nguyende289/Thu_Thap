import React from 'react';
import ReactDOM from 'react-dom/client';

// Hàm hỗ trợ để phân tích cú pháp CSV đơn giản
const parseCSV = (text) => {
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
const GOOGLE_SHEET_ID = '1pjutzB4Bc9WBtqmA3MUoxQ7CoZpBvHBMGR1OxaZQENE';

const Clock = () => {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const formatDate = (date) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return date.toLocaleDateString('vi-VN', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN');
    };

    return React.createElement('div', { className: "text-right text-red-100" },
        React.createElement('p', { className: "text-sm" }, formatDate(time)),
        React.createElement('p', { className: "text-lg font-bold tracking-wider" }, formatTime(time))
    );
};

// Component để nhúng biểu đồ TradingView
const TradingViewWidget = () => {
    const containerRef = React.useRef(null);
    const widgetLoaded = React.useRef(false);

    React.useEffect(() => {
        if (!containerRef.current || widgetLoaded.current) {
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            if (containerRef.current && typeof window.TradingView !== 'undefined') {
                new window.TradingView.widget({
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

    return React.createElement('div', { ref: containerRef, id: 'tradingview_chart_container', style: { height: '100%', width: '100%' } });
};


const App = () => {
  const [sheetData, setSheetData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchData = React.useCallback(async (isManual = false) => {
    if (isManual) {
        setLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu. Vui lòng kiểm tra lại Sheet ID và quyền truy cập.');
      }

      const csvText = await response.text();
      const data = parseCSV(csvText);
      
      if (data.length === 0 || (data.length === 1 && data[0].length === 1 && data[0][0] === '')) {
          throw new Error('Bảng tính trống hoặc không có dữ liệu.');
      }

      const threeColumnData = data.map(row => row.slice(0, 3));
      setSheetData(threeColumnData);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Hãy chắc chắn rằng bảng tính của bạn được chia sẻ công khai.');
    } finally {
      if (isManual || sheetData.length === 0) {
        setLoading(false);
      }
    }
  }, [sheetData.length]);

  React.useEffect(() => {
    fetchData(true);
  }, []); 
  
  React.useEffect(() => {
    const interval = setInterval(() => {
        fetchData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const tableComponent = React.createElement('div', { className: "w-full lg:w-[60%]" },
    React.createElement('div', { className: "bg-black/30 backdrop-blur-sm border border-yellow-400/40 rounded-xl shadow-2xl shadow-black/40 p-4 md:p-6" },
      React.createElement('table', { className: "w-full text-left border-collapse table-fixed" },
        React.createElement('thead', null,
          React.createElement('tr', { className: "border-b border-yellow-400/60" },
            sheetData[0] && sheetData[0].map((headerCell, index) => (
              React.createElement('th', { key: index, className: `p-4 sm:p-5 font-bold text-yellow-200 bg-black/50 uppercase text-lg md:text-xl whitespace-normal font-heading ${index > 0 ? 'w-[30%] text-right' : 'w-[40%]'}` },
                headerCell
              )
            ))
          )
        ),
        React.createElement('tbody', null,
          sheetData.slice(1).map((row, rowIndex) => (
            React.createElement('tr', { key: rowIndex, className: "border-b border-yellow-500/20 last:border-b-0 hover:bg-white/10 transition-colors duration-200" },
              row.map((cell, cellIndex) => (
                React.createElement('td', { key: cellIndex, className: `p-4 sm:p-5 text-gray-50 text-xl md:text-2xl whitespace-normal break-words ${cellIndex > 0 ? 'font-bold text-right' : ''}` },
                  cell
                )
              ))
            )
          ))
        )
      )
    )
  );

  const chartComponent = React.createElement('div', { className: "w-full lg:w-[40%]" },
    React.createElement('h2', { className: "text-2xl font-bold text-yellow-200 uppercase mb-4 text-center lg:text-left font-heading" }, "Biểu đồ XAU/USD"),
    React.createElement('div', { className: "bg-black/30 backdrop-blur-sm border border-yellow-400/40 rounded-xl shadow-2xl shadow-black/40 overflow-hidden", style: { height: '450px' } },
        React.createElement(TradingViewWidget)
    )
  );
  
  const refreshButton = React.createElement('button', {
        onClick: () => fetchData(true),
        className: "ml-4 p-2 bg-yellow-300 text-red-800 rounded-full hover:bg-yellow-400 transition-transform duration-200 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed",
        'aria-label': "Cập nhật dữ liệu",
        disabled: loading,
    },
    React.createElement('svg', {
            xmlns: "http://www.w3.org/2000/svg",
            className: `h-6 w-6 ${loading ? 'animate-spin' : ''}`,
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 2
        },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691L7.985 5.982m13.03 4.993l-3.181-3.182a8.25 8.25 0 00-11.667 0L2.985 14.651" })
    )
  );

  return (
    React.createElement('main', { className: "bg-gradient-to-br from-red-600 to-red-800 min-h-screen w-full flex flex-col items-center p-4 sm:p-6 md:p-8 text-white" },
      React.createElement('div', { className: "w-full max-w-7xl" },
        React.createElement('header', { className: "mb-8 flex justify-between items-start" },
          React.createElement('div', { className: "text-left" },
            React.createElement('h2', { className: "text-3xl md:text-4xl font-bold text-yellow-300 tracking-wider font-heading" }, "VÀNG BẠC HUYNH HIỀN"),
            React.createElement('p', { className: "text-base text-red-100" }, "Đ/c: 108 - Phố Ngô Xá"),
            React.createElement('p', { className: "text-base text-red-100" }, "ĐT: 0983661316")
          ),
          React.createElement(Clock)
        ),
        React.createElement('div', { className: "text-center" },
            React.createElement('div', { className: "flex justify-center items-center gap-4 mb-8" },
                React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: "w-10 h-10 md:w-12 md:h-12 text-yellow-300" },
                    React.createElement('path', { d: "M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.735 9.735 0 0 0 3.25-.555.75.75 0 0 0 .5-.707V5.24a.75.75 0 0 0-.5-.707Z" }),
                    React.createElement('path', { d: "M15.75 4.533A9.707 9.707 0 0 0 10.5 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707V19.5a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 10.5 21a9.735 9.735 0 0 0 3.25-.555.75.75 0 0 0 .5-.707V5.24a.75.75 0 0 0-.5-.707Z" }),
                    React.createElement('path', { d: "M20.25 4.533A9.707 9.707 0 0 0 15 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707V19.5a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 15 21a9.735 9.735 0 0 0 3.25-.555.75.75 0 0 0 .5-.707V5.24a.75.75 0 0 0-.5-.707Z" })
                ),
                React.createElement('h1', { className: "text-4xl md:text-5xl font-bold text-yellow-300 uppercase font-heading" }, "Bảng giá vàng hôm nay"),
                refreshButton
            )
        ),
        loading && sheetData.length === 0 && React.createElement('div', { className: "flex justify-center items-center h-60" },
          React.createElement('svg', { className: "animate-spin h-10 w-10 text-yellow-300", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
            React.createElement('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            React.createElement('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          )
        ),
        error && React.createElement('div', { className: "bg-red-900/80 border border-yellow-400/50 text-white p-4 rounded-lg my-6" }, error),
        !error && sheetData.length > 0 && (
          React.createElement('div', { className: "mt-8 w-full flex flex-col lg:flex-row gap-8 items-start" },
            tableComponent,
            chartComponent
          )
        ),
        React.createElement('footer', { className: "mt-12 text-red-200/80 text-sm text-center" },
          React.createElement('p', null, "Tạo bởi AI với React & Tailwind CSS")
        )
      )
    )
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
);
