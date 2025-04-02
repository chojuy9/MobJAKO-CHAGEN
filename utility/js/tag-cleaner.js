/**
 * API 응답에서 태그를 제거하는 함수
 * @param {string} text - API로부터 받은 원본 텍스트
 * @returns {string} 정리된 텍스트
 */
function cleanResponseText(text) {
    if (!text) return '';
    
    // <|im_start|>assistant 및 <|im_end|> 태그 제거
    let cleanText = text.replace(/<\|im_start\|>assistant\s*/g, '');
    cleanText = cleanText.replace(/<\|im_end\|>/g, '');
    
    // 그 외 가능한 태그들 제거
    cleanText = cleanText.replace(/<\|im_start\|>.*?\|>/g, '');
    
    // 앞뒤 공백 제거
    cleanText = cleanText.trim();
    
    return cleanText;
}

/**
 * 번역 결과를 화면에 표시
 * @param {string} text - 번역된 텍스트
 * @param {string} targetLang - 대상 언어
 */
function displayTranslationResult(text, targetLang) {
    document.getElementById('translation-loading').classList.remove('active');
    
    // 응답 텍스트에서 태그 제거
    const cleanedText = cleanResponseText(text);
    
    const resultElement = document.getElementById('translation-result');
    let langLabel = '';
    
    switch(targetLang) {
        case '영어':
            langLabel = '영어 번역 결과';
            break;
        case '한국어':
            langLabel = '한국어 번역 결과';
            break;
        case '일본어':
            langLabel = '일본어 번역 결과';
            break;
        default:
            langLabel = '번역 결과';
    }
    
    // 결과를 구조화된 형식으로 표시
    resultElement.innerHTML = `
        <div class="result-header">${langLabel}</div>
        <div class="result-content">${cleanedText}</div>
    `;
    
    resultElement.style.display = 'block';
}

// 전역 객체에 함수 등록 (기존 함수 덮어쓰기)
window.displayTranslationResult = displayTranslationResult;
