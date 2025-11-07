// 簡単なテスト
const testChars = ['か', 'う', 'し', 'と', 'あ', 'い', 'ア', 'イ', 'A', 'B', '1', '2'];

// ひらがなのパターンをテスト
const hiraganaPattern = /[\u3040-\u309F]/;

testChars.forEach(char => {
  console.log(`文字: ${char}, ひらがな判定: ${hiraganaPattern.test(char)}, Unicode: ${char.charCodeAt(0).toString(16)}`);
});