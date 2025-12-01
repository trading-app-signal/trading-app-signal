
import React, { useEffect, useRef } from 'react';

const ChartWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbol": "FX:XAUUSD",
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "dateRange": "1D",
      "colorTheme": "dark",
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="mb-6">
      <h3 className="text-white font-bold text-lg mb-3 tracking-tight">Market Overview</h3>
      <div className="h-64 w-full relative overflow-hidden rounded-3xl glass border border-white/5 shadow-2xl shadow-black/20">
        <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
          <div className="tradingview-widget-container__widget h-full w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ChartWidget;
