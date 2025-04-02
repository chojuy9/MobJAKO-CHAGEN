/**
 * custom-prompts.js - 번역 프롬프트 커스터마이징 기능
 * 
 * 사용자가 번역 품질을 향상시키기 위한 커스텀 프롬프트를 
 * 입력하고 적용할 수 있는 기능을 제공합니다.
 */

// 로컬 스토리지 키
const PROMPT_TEXT_STORAGE_KEY = 'custom_prompt_text';
const PROMPT_POSITION_STORAGE_KEY = 'custom_prompt_position';
const PROMPT_ENABLED_KEY = 'custom_prompt_enabled';

// 전역 변수
let isPromptEnabled = true;
let cachedPromptText = '';
let cachedPromptPosition = 'start';

// 템플릿 프롬프트 예시
const promptTemplates = {
    literary: '문학적인 번역을 해주세요. 원문의 뉘앙스와 느낌을 최대한 살려서 번역해 주세요. 직역보다는 의역을 선호하며, 타겟 언어에서 자연스럽게 읽히는 것이 중요합니다.',
    technical: '이 텍스트는 기술 문서입니다. 전문 용어를 정확하게 번역하고, 명확하고 간결한 문장 구조를 유지해 주세요. 기술적 정확성을 최우선으로 하며, 모호한 표현은 피해주세요.',
    conversation: '이 텍스트는 일상 대화입니다. 자연스러운 구어체로 번역하고, 공식적인 표현보다는 실제 대화에서 사용되는 표현을 사용해 주세요. 필요한 경우 타겟 언어의 관용적 표현을 적절히 활용해 주세요.',
    fantasy: '이 텍스트는 판타지/게임 콘텐츠입니다. 판타지 세계관에 맞는 용어와 분위기를 유지해주세요. 마법, 종족, 직업, 아이템 등의 용어는 일관되게 번역하고, 세계관의 분위기를 살려주세요.'
};

/**
 * 문서 로드 시 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    // 커스텀 프롬프트 기능 초기화
    initCustomPrompt();
    
    // 프롬프트 활성화 토글 이벤트 리스너
    const promptToggle = document.getElementById('prompt-toggle');
    if (promptToggle) {
        promptToggle.addEventListener('change', togglePromptEnabled);
    }
    
    // 프롬프트 위치 변경 이벤트 리스너
    const positionSelect = document.getElementById('prompt-position');
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            cachedPromptPosition = this.value;
            savePromptSettings();
        });
    }
    
    // 프롬프트 내용 변경 이벤트 리스너
    const promptText = document.getElementById('custom-prompt-text');
    if (promptText) {
        promptText.addEventListener('input', function() {
            cachedPromptText = this.value;
            savePromptSettings();
        });
    }
    
    // 템플릿 버튼 이벤트 리스너 추가
    setupTemplateButtons();
});

/**
 * 커스텀 프롬프트 초기화
 */
function initCustomPrompt() {
    // 로컬 스토리지에서 설정 불러오기
    const savedText = localStorage.getItem(PROMPT_TEXT_STORAGE_KEY);
    const savedPosition = localStorage.getItem(PROMPT_POSITION_STORAGE_KEY);
    const savedEnabled = localStorage.getItem(PROMPT_ENABLED_KEY);
    
    // 저장된 값 또는 기본값으로 초기화
    cachedPromptText = savedText || '';
    cachedPromptPosition = savedPosition || 'start';
    isPromptEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
    
    // UI 요소 업데이트
    updatePromptUI();
}

/**
 * 프롬프트 UI 업데이트
 */
function updatePromptUI() {
    // 프롬프트 텍스트 영역 업데이트
    const promptText = document.getElementById('custom-prompt-text');
    if (promptText) {
        promptText.value = cachedPromptText;
    }
    
    // 위치 선택 업데이트
    const positionSelect = document.getElementById('prompt-position');
    if (positionSelect) {
        positionSelect.value = cachedPromptPosition;
    }
    
    // 토글 스위치 업데이트
    const promptToggle = document.getElementById('prompt-toggle');
    if (promptToggle) {
        promptToggle.checked = isPromptEnabled;
    }
}

/**
 * 프롬프트 템플릿 버튼 설정
 */
function setupTemplateButtons() {
    const templateButtons = document.querySelectorAll('.template-btn');
    
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const templateId = this.getAttribute('data-template');
            const templateText = promptTemplates[templateId];
            
            if (templateText) {
                // 프롬프트 입력 영역에 템플릿 텍스트 설정
                const promptTextArea = document.getElementById('custom-prompt-text');
                if (promptTextArea) {
                    promptTextArea.value = templateText;
                    
                    // 전역 캐시 및 저장
                    cachedPromptText = templateText;
                    savePromptSettings();
                    
                    // 프롬프트 활성화
                    if (!isPromptEnabled) {
                        isPromptEnabled = true;
                        const promptToggle = document.getElementById('prompt-toggle');
                        if (promptToggle) {
                            promptToggle.checked = true;
                        }
                        savePromptSettings();
                    }
                }
            }
        });
    });
}

/**
 * 프롬프트 활성화 상태 토글
 */
function togglePromptEnabled() {
    isPromptEnabled = this.checked;
    savePromptSettings();
}

/**
 * 프롬프트 설정 저장
 */
function savePromptSettings() {
    localStorage.setItem(PROMPT_TEXT_STORAGE_KEY, cachedPromptText);
    localStorage.setItem(PROMPT_POSITION_STORAGE_KEY, cachedPromptPosition);
    localStorage.setItem(PROMPT_ENABLED_KEY, isPromptEnabled);
}

/**
 * 번역 프롬프트에 커스텀 프롬프트 추가
 * @param {string} prompt - 원본 프롬프트
 * @returns {string} 커스텀 프롬프트가 추가된 프롬프트
 */
function addCustomPromptToPrompt(prompt) {
    // 프롬프트가 비활성화되었거나 내용이 없으면 원본 반환
    if (!isPromptEnabled || !cachedPromptText.trim()) {
        return prompt;
    }
    
    // 프롬프트에 추가할 텍스트
    const promptText = `
<|im_start|>user
${cachedPromptText}
<|im_start|>assistant
I understand. I'll follow this specific instruction for the translation.
`;
    
    // 위치에 따라 삽입
    if (cachedPromptPosition === 'start') {
        // 첫 번째 사용자 메시지 이전에 삽입
        const firstUserPos = prompt.indexOf('<|im_start|>user');
        if (firstUserPos !== -1) {
            return prompt.slice(0, firstUserPos) + promptText + prompt.slice(firstUserPos);
        }
    } else {
        // 마지막 어시스턴트 메시지 이후, 마지막 사용자 메시지 이전에 삽입
        const lastUserPos = prompt.lastIndexOf('<|im_start|>user');
        if (lastUserPos !== -1) {
            return prompt.slice(0, lastUserPos) + promptText + prompt.slice(lastUserPos);
        }
    }
    
    // 적절한 위치를 찾지 못한 경우 프롬프트 끝에 추가
    return prompt + promptText;
}

// 외부 스크립트에서 사용할 수 있도록 전역 객체에 함수 노출
window.promptManager = {
    addCustomPromptToPrompt,
    isEnabled: () => isPromptEnabled,
    getPromptText: () => cachedPromptText,
    getPromptPosition: () => cachedPromptPosition
};
