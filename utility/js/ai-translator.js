/**
 * ai-translator.js - AI 번역 도구 전용 스크립트
 * Gemini API를 사용한 번역 기능의 사용자 인터페이스 및 API 통신을 처리합니다
 */

// 로컬 스토리지 키
const API_KEY_STORAGE_KEY = 'gemini_api_key';
const SAVE_API_KEY_STORAGE_KEY = 'save_gemini_api_key';

document.addEventListener('DOMContentLoaded', function() {
    // API 키 저장 여부 체크박스 초기화
    initApiKeySaveCheckbox();
    
    // 저장된 API 키 불러오기
    loadSavedApiKey();
    
    // API 키 표시/숨김 토글 버튼
    const toggleApiVisibilityBtn = document.getElementById('toggle-api-visibility');
    if (toggleApiVisibilityBtn) {
        toggleApiVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
    }
    
    // Gemini API 로드 확인
    checkGeminiApiLoaded();
    
    // 번역 폼 제출 이벤트
    const translationForm = document.getElementById('translation-form');
    if (translationForm) {
        translationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // API 키 확인
            const apiKey = document.getElementById('api-key').value.trim();
            if (!apiKey) {
                alert('Gemini API 키를 입력해주세요.');
                document.getElementById('api-key').focus();
                return;
            }
            
            const sourceText = document.getElementById('source-text').value.trim();
            if (!sourceText) {
                alert('번역할 텍스트를 입력해주세요.');
                document.getElementById('source-text').focus();
                return;
            }
            
            // API 키 저장 여부 확인 및 저장
            saveApiKeyIfRequested();
            
            // 번역 방향 가져오기
            const direction = document.getElementById('translation-direction').value;
            
            // 로딩 표시
            document.getElementById('translation-loading').classList.add('active');
            document.getElementById('translation-result').style.display = 'none';
            
            // 복사 버튼 숨기기
            document.getElementById('copy-translation-btn').style.display = 'none';
            
            // Gemini API 호출
            translateWithGemini(sourceText, direction, apiKey);
        });
    }

    // 번역 결과 복사 버튼 이벤트 리스너
    const copyButton = document.getElementById('copy-translation-btn');
    if (copyButton) {
        copyButton.addEventListener('click', copyTranslationResult);
    }
});

/**
 * API 키 저장 체크박스 초기화
 */
function initApiKeySaveCheckbox() {
    const saveApiKeyCheckbox = document.getElementById('save-api-key');
    if (saveApiKeyCheckbox) {
        // 이전 설정 복원
        const savedPreference = localStorage.getItem(SAVE_API_KEY_STORAGE_KEY);
        saveApiKeyCheckbox.checked = savedPreference === 'true';
        
        // 설정 변경 시 저장
        saveApiKeyCheckbox.addEventListener('change', function() {
            localStorage.setItem(SAVE_API_KEY_STORAGE_KEY, this.checked);
            
            // 체크를 해제하면 저장된 API 키도 삭제
            if (!this.checked) {
                localStorage.removeItem(API_KEY_STORAGE_KEY);
            }
        });
    }
}

/**
 * 저장된 API 키 불러오기
 */
function loadSavedApiKey() {
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyCheckbox = document.getElementById('save-api-key');
    
    if (apiKeyInput && saveApiKeyCheckbox && saveApiKeyCheckbox.checked) {
        const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
        }
    }
}

/**
 * API 키 저장 (사용자가 요청한 경우)
 */
function saveApiKeyIfRequested() {
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyCheckbox = document.getElementById('save-api-key');
    
    if (apiKeyInput && saveApiKeyCheckbox && saveApiKeyCheckbox.checked) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyInput.value.trim());
    }
}

/**
 * API 키 표시/숨김 토글
 */
function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key');
    const toggleBtn = document.getElementById('toggle-api-visibility');
    
    if (apiKeyInput && toggleBtn) {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}

/**
 * Gemini API가 로드되었는지 확인하는 함수
 */
function checkGeminiApiLoaded() {
    if (typeof window.GoogleGenerativeAI !== 'undefined') {
        console.log('Gemini API가 이미 로드되었습니다.');
        updateApiStatus('ready', 'Gemini API 준비 완료');
        return;
    }
    
    // API가 로드될 때까지 기다림
    window.addEventListener('geminiApiLoaded', function() {
        console.log('Gemini API가 로드되었습니다.');
        updateApiStatus('ready', 'Gemini API 준비 완료');
    });
    
    // 5초 이상 로드되지 않으면 경고 표시
    setTimeout(function() {
        if (typeof window.GoogleGenerativeAI === 'undefined') {
            console.warn('Gemini API 로드에 문제가 있을 수 있습니다.');
            updateApiStatus('error', 'Gemini API 로드 실패');
        }
    }, 5000);
}

/**
 * API 상태 표시 업데이트 함수
 * @param {string} status - 상태 (loading, ready, error)
 * @param {string} message - 표시할 메시지
 */
function updateApiStatus(status, message) {
    const statusElement = document.getElementById('api-status');
    if (!statusElement) return;
    
    statusElement.innerHTML = `
        <div class="status-indicator ${status}">
            <div class="status-dot"></div>
            <span>${message}</span>
        </div>
    `;
}

/**
 * Gemini API를 사용한 텍스트 번역 함수
 * @param {string} text - 번역할 텍스트
 * @param {string} direction - 번역 방향 (ko-en, en-ko 등)
 * @param {string} apiKey - 사용자의 Gemini API 키
 */
async function translateWithGemini(text, direction, apiKey) {
    try {
        // Google Generative AI가 로드되지 않았다면 오류 표시
        if (typeof window.GoogleGenerativeAI === 'undefined') {
            throw new Error('Gemini API가 로드되지 않았습니다. 페이지를 새로고침하고 다시 시도하세요.');
        }
        
        // Google Generative AI 초기화
        const genAI = new window.GoogleGenerativeAI(apiKey);
        
        // 모델 인스턴스 생성 (gemini-2.0-flash-exp 사용)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        
        // 번역 방향에 따른 프롬프트 설정
        let sourceLang = "";
        let targetLang = "";
        
        switch(direction) {
            case 'ko-en':
                sourceLang = "한국어";
                targetLang = "영어";
                break;
            case 'en-ko':
                sourceLang = "영어";
                targetLang = "한국어";
                break;
            case 'ko-jp':
                sourceLang = "한국어";
                targetLang = "일본어";
                break;
            case 'jp-ko':
                sourceLang = "일본어";
                targetLang = "한국어";
                break;
            default:
                sourceLang = "한국어";
                targetLang = "영어";
        }
        
        // 번역 프롬프트 구성
        const prompt = `다음 ${sourceLang} 텍스트를 ${targetLang}로 번역해주세요. 맥락과 뉘앙스를 살려서 자연스럽게 번역하고, 
        특히 판타지나 게임 관련 용어가 있다면 해당 분야에 맞게 전문적으로 번역해주세요. 그냥 번역 결과만 출력하세요.
        
        원문:
        ${text}`;
        
        // API 요청 (Google 가이드라인 예제 코드 기반)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();
        
        // 결과 표시
        displayTranslationResult(translatedText, targetLang);
        
        // 복사 버튼 표시
        document.getElementById('copy-translation-btn').style.display = 'block';
        
        // 분석 및 로깅
        logTranslationEvent(direction, text.length);
        
    } catch (error) {
        // 에러 처리
        console.error('번역 오류:', error);
        document.getElementById('translation-loading').classList.remove('active');
        
        // API 키 오류인 경우 특별 메시지
        let errorMessage = error.message || '알 수 없는 오류';
        if (errorMessage.includes('API key')) {
            errorMessage = 'API 키가 유효하지 않습니다. 올바른 API 키를 입력했는지 확인하세요.';
        }
        
        const resultElement = document.getElementById('translation-result');
        resultElement.innerHTML = `
            <div class="result-header">오류 발생</div>
            <div class="result-content error-content">번역 중 오류가 발생했습니다: ${errorMessage}</div>
        `;
        resultElement.style.display = 'block';
    }
}

/**
 * 번역 결과를 화면에 표시
 * @param {string} text - 번역된 텍스트
 * @param {string} targetLang - 대상 언어
 */
function displayTranslationResult(text, targetLang) {
    document.getElementById('translation-loading').classList.remove('active');
    
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
        <div class="result-content">${text}</div>
    `;
    
    resultElement.style.display = 'block';
}

/**
 * 번역 이벤트 로깅 함수 (분석 목적)
 * @param {string} direction - 번역 방향
 * @param {number} charCount - 번역된 글자 수
 */
function logTranslationEvent(direction, charCount) {
    // 분석 목적으로 번역 이벤트 로깅 (개인정보 없이)
    console.log(`번역 이벤트: ${direction}, 글자 수: ${charCount}`);
}

/**
 * 번역 결과를 클립보드에 복사하는 함수
 */
function copyTranslationResult() {
    const resultContent = document.querySelector('.result-content');
    
    if (resultContent) {
        const textToCopy = resultContent.textContent;
        
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
