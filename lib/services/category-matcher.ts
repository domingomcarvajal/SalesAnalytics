import type { CategoryOption } from "./llm-service"

export class CategoryMatcher {
  /**
   * Find matching category from extracted text
   */
  static findMatch(extracted: string | undefined, validCategories: CategoryOption[]): CategoryOption | null {
    if (!extracted) return null

    const exactMatch = validCategories.find(
      (c) => c.name.toLowerCase() === extracted.toLowerCase()
    )
    if (exactMatch) return exactMatch

    const partialMatch = validCategories.find(
      (c) =>
        c.name.toLowerCase().includes(extracted.toLowerCase()) ||
        extracted.toLowerCase().includes(c.name.toLowerCase())
    )
    if (partialMatch) return partialMatch

    return null
  }

  /**
   * Find matching industry or default to "otros"
   */
  static findIndustryMatch(extractedIndustry: string | undefined, validIndustries: CategoryOption[]): CategoryOption {
    if (!extractedIndustry) {
      return validIndustries.find((i) => i.name === "otros") || validIndustries[0]
    }

    const match = this.findMatch(extractedIndustry, validIndustries)
    return match || validIndustries.find((i) => i.name === "otros") || validIndustries[0]
  }

  /**
   * Find multiple category matches for arrays
   */
  static findMultipleMatches(extractedItems: string[], validCategories: CategoryOption[]): CategoryOption[] {
    if (!Array.isArray(extractedItems)) return []

    return extractedItems
      .map(item => this.findMatch(item, validCategories))
      .filter((match): match is CategoryOption => match !== null)
  }
}
