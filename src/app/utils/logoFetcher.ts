/**
 * Unified utility for fetching brand logos from multiple sources.
 * Supports Logo.dev (direct CDN) and Brandfetch (Search API).
 */

export interface BrandfetchResult {
  brandId: string;
  name: string;
  domain: string;
  icon: string;
  logo: string;
}

/**
 * Searches for a brand icon using the Brandfetch API.
 */
export async function searchBrandfetchIcon(term: string, clientId: string): Promise<string | null> {
  if (!clientId || !term) return null;

  try {
    const response = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(term)}?c=${clientId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;

    const results = await response.json() as BrandfetchResult[];

    if (results && results.length > 0) {
      // Brandfetch search returns a list of brands. 
      // We pick the first one's logo or icon.
      return results[0].logo || results[0].icon || null;
    }
  } catch (error) {
    console.error("Error fetching Brandfetch icon:", error);
  }

  return null;
}

/**
 * Returns a direct Logo.dev URL for a domain.
 */
export function getLogoDevUrl(domain: string, token?: string): string {
  const cleanDomain = domain.toLowerCase().trim();
  const tokenPart = token ? `?token=${token}` : '';
  return `https://img.logo.dev/${cleanDomain}${tokenPart}`;
}

/**
 * Heuristic to check if a brand name is likely an Indian brand.
 * (Still useful for prioritization if needed, though Brandfetch is global)
 */
export function isLikelyIndianBrand(name: string): boolean {
  const indianKeywords = [
    'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'swiggy', 'zomato', 'phonepe', 'paytm', 
    'ola', 'uber india', 'jio', 'airtel', 'tata', 'reliance', 'bigbasket', 'blinkit', 
    'zepto', 'dunzo', 'myntra', 'ajio', 'nykaa', 'lic', 'zerodha', 'upstox', 'groww'
  ];
  const n = name.toLowerCase();
  return indianKeywords.some(k => n.includes(k));
}

/**
 * Extracts a domain from a name, URL or provider string.
 */
export function getBrandDomain(name: string, url?: string, provider?: string): string {
  const domainMap: Record<string, string> = {
    'hdfc': 'hdfcbank.com',
    'icici': 'icicibank.com',
    'sbi': 'sbi.co.in',
    'axis': 'axisbank.com',
    'kotak': 'kotak.com',
    'amazon': 'amazon.in',
    'flipkart': 'flipkart.com',
    'paytm': 'paytm.com',
    'phonepe': 'phonepe.com',
    'zomato': 'zomato.com',
    'swiggy': 'swiggy.com',
    'blinkit': 'blinkit.com',
    'zepto': 'zepto.com',
    'bigbasket': 'bigbasket.com',
    'tatacliq': 'tatacliq.com',
    'myntra': 'myntra.com',
    'ajio': 'ajio.com',
    'nykaa': 'nykaa.com',
    'meesho': 'meesho.com',
    'jiomart': 'jiomart.com',
    'indianoil': 'iocl.com',
    'hpcl': 'hindustanpetroleum.com',
    'bpcl': 'bharatpetroleum.in',
    'lic': 'licindia.in',
    'airtel': 'airtel.in',
    'jio': 'jio.com',
    'vi': 'myvi.in',
    'bsnl': 'bsnl.co.in',
    'tata play': 'tataplay.com',
    'dish tv': 'dishtv.in',
    'netmeds': 'netmeds.com',
    'pharmeasy': 'pharmeasy.in',
    '1mg': '1mg.com',
    'cult.fit': 'cult.fit',
    'urban company': 'urbancompany.com',
    'ola': 'olacabs.com',
    'uber': 'uber.com',
    'rapido': 'rapido.bike',
    'blusmart': 'blusmart.io',
    'irctc': 'irctc.co.in',
    'make-my-trip': 'makemytrip.com',
    'cleartrip': 'cleartrip.com',
    'easemytrip': 'easemytrip.com'
  };

  const n = (name || provider || '').toLowerCase();
  
  for (const [key, domain] of Object.entries(domainMap)) {
    if (n.includes(key)) return domain;
  }

  if (url) {
    try {
      const hostname = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
      if (hostname.includes('.')) return hostname;
    } catch (e) {}
  }

  return n.includes('.') ? n : `${n.replace(/\s+/g, '')}.com`;
}
