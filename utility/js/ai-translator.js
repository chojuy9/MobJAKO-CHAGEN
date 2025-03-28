/**
 * ai-translator.js - AI 번역 도구 전용 스크립트
 * 번역 기능의 사용자 인터페이스 및 API 통신을 처리합니다
 */

document.addEventListener('DOMContentLoaded', function() {
    // 번역 폼 제출 이벤트
    const translationForm = document.getElementById('translation-form');
    if (translationForm) {
        translationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const sourceText = document.getElementById('source-text').value.trim();
            if (!sourceText) {
                alert('번역할 텍스트를 입력해주세요.');
                return;
            }
            
            // 로딩 표시
            document.getElementById('translation-loading').classList.add('active');
            document.getElementById('translation-result').style.display = 'none';
            
            // API 호출을 시뮬레이션 (실제로는 여기서 서버에 요청을 보냄)
            setTimeout(() => {
                translateText(sourceText, document.getElementById('translation-direction').value);
            }, 1500);
        });
    }
});

/**
 * 텍스트 번역 함수
 * @param {string} text - 번역할 텍스트
 * @param {string} direction - 번역 방향 (ko-en, en-ko 등)
 */
function translateText(text, direction) {
    // 실제 구현에서는 API를 호출하여 번역 결과를 받아옴
    // 현재는 간단한 시뮬레이션으로 대체
    
    let result = '';
    
    // 간단한 번역 시뮬레이션 (실제로는 AI 번역 API를 사용)
    if (direction === 'ko-en') {
        result = '[영어 번역 결과]\n\n' + text + ' (translated to English)';
    } else if (direction === 'en-ko') {
        result = '[한국어 번역 결과]\n\n' + text + ' (영어에서 번역됨)';
    } else if (direction === 'ko-jp') {
        result = '[일본어 번역 결과]\n\n' + text + ' (日本語に翻訳)';
    } else {
        result = '[한국어 번역 결과]\n\n' + text + ' (일본어에서 번역됨)';
    }
    
    // 결과 표시
    document.getElementById('translation-loading').classList.remove('active');
    const resultElement = document.getElementById('translation-result');
    resultElement.textContent = result;
    resultElement.style.display = 'block';
    
    // 분석 및 로깅 (실제 구현 시)
    logTranslationEvent(direction, text.length);
}

/**
 * 번역 이벤트 로깅 함수 (분석 목적)
 * @param {string} direction - 번역 방향
 * @param {number} charCount - 번역된 글자 수
 */
function logTranslationEvent(direction, charCount) {
    // 분석 목적으로 번역 이벤트 로깅 (실제 구현 시)
    console.log(`번역 이벤트: ${direction}, 글자 수: ${charCount}`);
    
    // 실제 구현에서는 서버로 분석 데이터 전송
    // 사용자 개인정보는 수집하지 않음
}

/**
 * 번역 결과를 클립보드에 복사하는 함수
 * 복사 버튼이 추가될 경우 사용
 */
function copyTranslationResult() {
    const resultElement = document.getElementById('translation-result');
    
    if (resultElement) {
        const textToCopy = resultElement.textContent;
        
        // 클립보드 복사 구현
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('번역 결과가 클립보드에 복사되었습니다.');
            })
            .catch(err => {
                console.error('복사 실패:', err);
                alert('복사에 실패했습니다. 직접 선택하여 복사해주세요.');
            });
    }
}
