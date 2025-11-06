/**
 * 文字種判定とデータモデルサービス
 * ひらがな、カタカナ、アルファベットの判定ロジックを提供
 */

export enum CharacterType {
  HIRAGANA = 'hiragana',
  KATAKANA = 'katakana', 
  ALPHABET = 'alphabet',
  NUMBER = 'number',
  SYMBOL = 'symbol',
  MIXED = 'mixed'
}

export class CharacterAnalyzer {
  // ひらがなの文字範囲 (U+3040-U+309F)
  private static readonly HIRAGANA_RANGE = /[\u3040-\u309F]/;
  
  // カタカナの文字範囲 (U+30A0-U+30FF)
  private static readonly KATAKANA_RANGE = /[\u30A0-\u30FF]/;
  
  // アルファベットの文字範囲 (A-Z, a-z)
  private static readonly ALPHABET_RANGE = /[A-Za-z]/;
  
  // 数字の文字範囲 (0-9)
  private static readonly NUMBER_RANGE = /[0-9]/;

  /**
   * 単一文字の種類を判定する
   * @param char 判定対象の文字
   * @returns 文字種別
   */
  static detectType(char: string): CharacterType {
    if (!char || char.length !== 1) {
      return CharacterType.SYMBOL;
    }

    if (this.HIRAGANA_RANGE.test(char)) {
      return CharacterType.HIRAGANA;
    }
    
    if (this.KATAKANA_RANGE.test(char)) {
      return CharacterType.KATAKANA;
    }
    
    if (this.ALPHABET_RANGE.test(char)) {
      return CharacterType.ALPHABET;
    }
    
    if (this.NUMBER_RANGE.test(char)) {
      return CharacterType.NUMBER;
    }
    
    return CharacterType.SYMBOL;
  }

  /**
   * 文字列全体の主要な文字種を判定する
   * @param text 判定対象の文字列
   * @returns 主要な文字種別
   */
  static detectPrimaryType(text: string): CharacterType {
    if (!text || text.length === 0) {
      return CharacterType.SYMBOL;
    }

    const typeCounts = new Map<CharacterType, number>();
    
    // 各文字の種類をカウント
    for (const char of text) {
      const type = this.detectType(char);
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    // 最も多い文字種を取得
    let maxCount = 0;
    let primaryType = CharacterType.SYMBOL;
    
    for (const [type, count] of typeCounts) {
      if (count > maxCount) {
        maxCount = count;
        primaryType = type;
      }
    }

    // 複数の文字種が混在している場合はMIXEDを返す
    const significantTypes = Array.from(typeCounts.entries())
      .filter(([type, count]) => type !== CharacterType.SYMBOL && count > 0)
      .length;
    
    if (significantTypes > 1) {
      return CharacterType.MIXED;
    }

    return primaryType;
  }

  /**
   * 日本語文字かどうかを判定する
   * @param char 判定対象の文字
   * @returns 日本語文字の場合true
   */
  static isJapanese(char: string): boolean {
    const type = this.detectType(char);
    return type === CharacterType.HIRAGANA || type === CharacterType.KATAKANA;
  }

  /**
   * 書き順情報が必要な文字かどうかを判定する
   * @param char 判定対象の文字
   * @returns 書き順情報が必要な場合true
   */
  static requiresStrokeOrder(char: string): boolean {
    const type = this.detectType(char);
    return type === CharacterType.HIRAGANA || 
           type === CharacterType.KATAKANA || 
           type === CharacterType.ALPHABET;
  }

  /**
   * 文字列を文字種別でグループ化する
   * @param text 対象文字列
   * @returns 文字種別ごとのグループ
   */
  static groupByType(text: string): Map<CharacterType, string[]> {
    const groups = new Map<CharacterType, string[]>();
    
    for (const char of text) {
      const type = this.detectType(char);
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(char);
    }
    
    return groups;
  }

  /**
   * 入力文字列の検証を行う
   * @param text 検証対象の文字列
   * @returns 検証結果
   */
  static validateInput(text: string): {
    isValid: boolean;
    errors: string[];
    characterCount: number;
    primaryType: CharacterType;
  } {
    const errors: string[] = [];
    
    if (!text) {
      errors.push('文字列が入力されていません');
    }
    
    if (text.length > 1000) {
      errors.push('文字数が上限（1000文字）を超えています');
    }
    
    const primaryType = this.detectPrimaryType(text);
    
    return {
      isValid: errors.length === 0,
      errors,
      characterCount: text.length,
      primaryType
    };
  }
}