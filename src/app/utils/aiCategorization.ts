import { CategoryDef, SubCategory } from "./categories";

/**
 * Predicts the best category, subcategory, and sub-subcategory for a transaction based on the payee name.
 */
export function predictCategory(payee: string, categories: CategoryDef[]): { category: string; subCategory?: string; subSubCategory?: string; classification?: string } | null {
  if (!payee || payee.length < 2) return null;

  const normalizedPayee = payee.toLowerCase();

  for (const cat of categories) {
    // 1. Check direct matches in children (recursive)
    if (cat.children) {
      for (const sc of cat.children) {
        // Check sub-sub-categories
        if (sc.children) {
          const sscMatch = sc.children.find(ssc => normalizedPayee.includes(ssc.name.toLowerCase()));
          if (sscMatch) {
            return { category: cat.name, subCategory: sc.name, subSubCategory: sscMatch.name, classification: cat.classification };
          }
        }
        
        // Check sub-category name
        if (normalizedPayee.includes(sc.name.toLowerCase())) {
          return { category: cat.name, subCategory: sc.name, classification: cat.classification };
        }
      }
    }

    // 2. Check AI Keywords
    if (cat.aiKeywords?.some(kw => normalizedPayee.includes(kw.toLowerCase()))) {
      return { category: cat.name, classification: cat.classification };
    }

    // 3. Check AI Rules (regex or pattern)
    if (cat.aiRules?.some(rule => {
      try {
        const regex = new RegExp(rule, "i");
        return regex.test(normalizedPayee);
      } catch {
        return normalizedPayee.includes(rule.toLowerCase());
      }
    })) {
      return { category: cat.name, classification: cat.classification };
    }

    // 4. Check legacy flat subcategory list
    const subMatch = cat.subcategories.find(sc => normalizedPayee.includes(sc.toLowerCase()));
    if (subMatch) {
      return { category: cat.name, subCategory: subMatch, classification: cat.classification };
    }
    
    // 5. Check if payee name contains category name
    if (normalizedPayee.includes(cat.name.toLowerCase()) && cat.name.length > 3) {
      return { category: cat.name, classification: cat.classification };
    }
  }

  return null;
}
