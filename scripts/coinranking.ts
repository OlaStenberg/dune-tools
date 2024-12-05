import { writeFile } from 'fs/promises';

type Token = {
    address: string;
    symbol: string;
    name: string;
  };
  
  async function fetchTokens(apiUrl: string): Promise<Token[]> {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.status !== "success") {
        throw new Error("API did not return success status");
      }
  
      const tokens: Token[] = data.data.coins.map((coin: any) => {
        const baseAddress = coin.contractAddresses?.find((addr: string) =>
          addr.startsWith("base/")
        )?.split("/")[1] || "";
  
        return {
          address: baseAddress,
          symbol: coin.symbol,
          name: coin.name,
        };
      });
  
      return tokens;
    } catch (error) {
      console.error("Error fetching tokens:", error);
      return [];
    }
  }

  // Function to save tokens to a JSON file
async function saveTokensToFile(tokens: Token[], filePath: string): Promise<void> {
    try {
      await writeFile(filePath, JSON.stringify(tokens, null, 4), 'utf-8');
      console.log(`Tokens saved to ${filePath}`);
    } catch (error) {
      console.error("Error saving tokens to file:", error);
    }
  }
  
  // Example usage
  (async () => {

    const urls = [
        "https://api.coinranking.com/v2/coins?tags[]=meme&blockchains[]=base&orderBy=marketCap&limit=100",
    ]
    const result = await Promise.all(urls.map(fetchTokens));
    const tokens = result.flat();
    
    const filePath = './coinranking-base-memes.json';
    await saveTokensToFile(tokens, filePath);
  })();
  