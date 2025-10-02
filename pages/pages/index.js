import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [prices, setPrices] = useState([]);

  const exchanges = [
    { name: "Binance", url: "https://api.binance.com/api/v3/ticker/price?symbol=" },
    { name: "Coinbase", url: "https://api.coinbase.com/v2/prices/" },
    { name: "Kraken", url: "https://api.kraken.com/0/public/Ticker?pair=" }
  ];

  const coins = [
    { symbol: "BTCUSDT", name: "Bitcoin" },
    { symbol: "ETHUSDT", name: "Ethereum" },
    { symbol: "SOLUSDT", name: "Solana" }
  ];

  const fetchPrices = async () => {
    let results = [];
    for (let coin of coins) {
      let row = { coin: coin.name, data: [] };

      for (let exchange of exchanges) {
        try {
          let price = "N/A";

          if (exchange.name === "Binance") {
            let res = await axios.get(exchange.url + coin.symbol);
            price = res.data.price;
          }

          if (exchange.name === "Coinbase") {
            let symbol = coin.symbol.replace("USDT", "-USD").replace("BTC", "BTC").replace("ETH", "ETH").replace("SOL", "SOL");
            let res = await axios.get(exchange.url + symbol + "/spot");
            price = res.data.data.amount;
          }

          if (exchange.name === "Kraken") {
            let krakenSymbol = coin.symbol.replace("USDT", "USD");
            let res = await axios.get(exchange.url + krakenSymbol);
            let pair = Object.keys(res.data.result)[0];
            price = res.data.result[pair].c[0];
          }

          row.data.push({ exchange: exchange.name, price: parseFloat(price).toFixed(2) });
        } catch (err) {
          row.data.push({ exchange: exchange.name, price: "Error" });
        }
      }
      results.push(row);
    }
    setPrices(results);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-6">BTC, ETH & SOL Price Comparator</h1>
      <div className="w-full max-w-4xl">
        {prices.map((row, idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{row.coin}</h2>
            <div className="grid grid-cols-3 gap-4">
              {row.data.map((d, i) => (
                <div key={i} className="p-4 rounded-lg bg-gray-800 shadow text-center">
                  <h3 className="font-semibold">{d.exchange}</h3>
                  <p className={`${d.price === "Error" ? "text-red-500" : "text-green-400"} text-lg`}>
                    {d.price}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
