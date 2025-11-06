import { describe, it, expect } from 'vitest';
import { CharacterAnalyzer, CharacterType } from '../CharacterAnalyzer';

describe('CharacterAnalyzer', () => {
  describe('detectType - 各文字種の判定テスト', () => {
    it('ひらがなを正しく判定する', () => {
      expect(CharacterAnalyzer.detectType('あ')).toBe(CharacterType.HIRAGANA);
      expect(CharacterAnalyzer.detectType('か')).toBe(CharacterType.HIRAGANA);
      expect(CharacterAnalyzer.detectType('ん')).toBe(CharacterType.HIRAGANA);
    });

    it('カタカナを正しく判定する', () => {
      expect(CharacterAnalyzer.detectType('ア')).toBe(CharacterType.KATAKANA);
      expect(CharacterAnalyzer.detectType('カ')).toBe(CharacterType.KATAKANA);
      expect(CharacterAnalyzer.detectType('ン')).toBe(CharacterType.KATAKANA);
    });

    it('アルファベットを正しく判定する', () => {
      expect(CharacterAnalyzer.detectType('A')).toBe(CharacterType.ALPHABET);
      expect(CharacterAnalyzer.detectType('z')).toBe(CharacterType.ALPHABET);
      expect(CharacterAnalyzer.detectType('M')).toBe(CharacterType.ALPHABET);
    });

    it('数字を正しく判定する', () => {
      expect(CharacterAnalyzer.detectType('0')).toBe(CharacterType.NUMBER);
      expect(CharacterAnalyzer.detectType('5')).toBe(CharacterType.NUMBER);
      expect(CharacterAnalyzer.detectType('9')).toBe(CharacterType.NUMBER);
    });

    it('記号を正しく判定する', () => {
      expect(CharacterAnalyzer.detectType('!')).toBe(CharacterType.SYMBOL);
      expect(CharacterAnalyzer.detectType('？')).toBe(CharacterType.SYMBOL);
      expect(CharacterAnalyzer.detectType(' ')).toBe(CharacterType.SYMBOL);
    });

    it('空文字や複数文字の場合はSYMBOLを返す', () => {
      expect(CharacterAnalyzer.detectType('')).toBe(CharacterType.SYMBOL);
      expect(CharacterAnalyzer.detectType('あい')).toBe(CharacterType.SYMBOL);
    });
  });

  describe('detectPrimaryType - 混在文字列の処理テスト', () => {
    it('単一文字種の文字列を正しく判定する', () => {
      expect(CharacterAnalyzer.detectPrimaryType('あいうえお')).toBe(CharacterType.HIRAGANA);
      expect(CharacterAnalyzer.detectPrimaryType('アイウエオ')).toBe(CharacterType.KATAKANA);
      expect(CharacterAnalyzer.detectPrimaryType('HELLO')).toBe(CharacterType.ALPHABET);
      expect(CharacterAnalyzer.detectPrimaryType('12345')).toBe(CharacterType.NUMBER);
    });

    it('混在文字列でMIXEDを返す', () => {
      expect(CharacterAnalyzer.detectPrimaryType('あいうABC')).toBe(CharacterType.MIXED);
      expect(CharacterAnalyzer.detectPrimaryType('アイウ123')).toBe(CharacterType.MIXED);
      expect(CharacterAnalyzer.detectPrimaryType('Helloあいう')).toBe(CharacterType.MIXED);
    });

    it('記号が含まれていても主要文字種を判定する', () => {
      expect(CharacterAnalyzer.detectPrimaryType('あいう！')).toBe(CharacterType.HIRAGANA);
      expect(CharacterAnalyzer.detectPrimaryType('Hello!')).toBe(CharacterType.ALPHABET);
    });

    it('空文字列の場合はSYMBOLを返す', () => {
      expect(CharacterAnalyzer.detectPrimaryType('')).toBe(CharacterType.SYMBOL);
    });

    it('記号のみの場合はSYMBOLを返す', () => {
      expect(CharacterAnalyzer.detectPrimaryType('!@#$')).toBe(CharacterType.SYMBOL);
    });
  });

  describe('isJapanese', () => {
    it('日本語文字を正しく判定する', () => {
      expect(CharacterAnalyzer.isJapanese('あ')).toBe(true);
      expect(CharacterAnalyzer.isJapanese('ア')).toBe(true);
    });

    it('日本語以外の文字を正しく判定する', () => {
      expect(CharacterAnalyzer.isJapanese('A')).toBe(false);
      expect(CharacterAnalyzer.isJapanese('1')).toBe(false);
      expect(CharacterAnalyzer.isJapanese('!')).toBe(false);
    });
  });

  describe('requiresStrokeOrder', () => {
    it('書き順情報が必要な文字を正しく判定する', () => {
      expect(CharacterAnalyzer.requiresStrokeOrder('あ')).toBe(true);
      expect(CharacterAnalyzer.requiresStrokeOrder('ア')).toBe(true);
      expect(CharacterAnalyzer.requiresStrokeOrder('A')).toBe(true);
    });

    it('書き順情報が不要な文字を正しく判定する', () => {
      expect(CharacterAnalyzer.requiresStrokeOrder('1')).toBe(false);
      expect(CharacterAnalyzer.requiresStrokeOrder('!')).toBe(false);
    });
  });

  describe('groupByType', () => {
    it('文字列を文字種別でグループ化する', () => {
      const result = CharacterAnalyzer.groupByType('あアA1!');
      
      expect(result.get(CharacterType.HIRAGANA)).toEqual(['あ']);
      expect(result.get(CharacterType.KATAKANA)).toEqual(['ア']);
      expect(result.get(CharacterType.ALPHABET)).toEqual(['A']);
      expect(result.get(CharacterType.NUMBER)).toEqual(['1']);
      expect(result.get(CharacterType.SYMBOL)).toEqual(['!']);
    });
  });

  describe('validateInput', () => {
    it('有効な入力を正しく検証する', () => {
      const result = CharacterAnalyzer.validateInput('あいう');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.characterCount).toBe(3);
      expect(result.primaryType).toBe(CharacterType.HIRAGANA);
    });

    it('空文字列を正しく検証する', () => {
      const result = CharacterAnalyzer.validateInput('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('文字列が入力されていません');
    });

    it('文字数上限を超えた場合を正しく検証する', () => {
      const longText = 'あ'.repeat(1001);
      const result = CharacterAnalyzer.validateInput(longText);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('文字数が上限（1000文字）を超えています');
    });
  });
});