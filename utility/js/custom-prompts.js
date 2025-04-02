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

// 전역 변수 - 먼저 기본값으로 초기화
window.customPromptState = {
    isEnabled: true,
    promptText: '',
    promptPosition: 'start'
};

// 즉시 실행 함수로 설정 로드 (스크립트 실행 즉시)
(function loadSettings() {
    try {
        // 로컬 스토리지에서 설정 불러오기
        const savedText = localStorage.getItem(PROMPT_TEXT_STORAGE_KEY) || '';
        const savedPosition = localStorage.getItem(PROMPT_POSITION_STORAGE_KEY) || 'start';
        const savedEnabled = localStorage.getItem(PROMPT_ENABLED_KEY);
        const isEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
        
        // 전역 상태 객체에 설정
        window.customPromptState = {
            isEnabled: isEnabled,
            promptText: savedText,
            promptPosition: savedPosition
        };
        
        console.log('커스텀 프롬프트 설정이 즉시 로드됨:', window.customPromptState);
    } catch (error) {
        console.error('커스텀 프롬프트 설정 로드 실패:', error);
    }
})();

/**
 * 문서 로드 시 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    // UI 요소 초기화
    initCustomPrompt();
    
    // 프롬프트 활성화 토글 이벤트 리스너
    const promptToggle = document.getElementById('prompt-toggle');
    if (promptToggle) {
        promptToggle.addEventListener('change', function() {
            window.customPromptState.isEnabled = this.checked;
            savePromptSettings();
            console.log('커스텀 프롬프트 활성화 상태 변경:', window.customPromptState.isEnabled);
        });
    }
    
    // 프롬프트 위치 변경 이벤트 리스너
    const positionSelect = document.getElementById('prompt-position');
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            window.customPromptState.promptPosition = this.value;
            savePromptSettings();
        });
    }
    
    // 프롬프트 내용 변경 이벤트 리스너
    const promptText = document.getElementById('custom-prompt-text');
    if (promptText) {
        promptText.addEventListener('input', function() {
            window.customPromptState.promptText = this.value;
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
    try {
        // UI 요소 업데이트
        updatePromptUI();
        console.log('커스텀 프롬프트 UI가 초기화됨');
    } catch (error) {
        console.error('커스텀 프롬프트 UI 초기화 실패:', error);
    }
}

/**
 * 프롬프트 UI 업데이트
 */
function updatePromptUI() {
    // 프롬프트 텍스트 영역 업데이트
    const promptText = document.getElementById('custom-prompt-text');
    if (promptText) {
        promptText.value = window.customPromptState.promptText;
    }
    
    // 위치 선택 업데이트
    const positionSelect = document.getElementById('prompt-position');
    if (positionSelect) {
        positionSelect.value = window.customPromptState.promptPosition;
    }
    
    // 토글 스위치 업데이트
    const promptToggle = document.getElementById('prompt-toggle');
    if (promptToggle) {
        promptToggle.checked = window.customPromptState.isEnabled;
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
                    
                    // 전역 상태 업데이트
                    window.customPromptState.promptText = templateText;
                    
                    // 비활성화된 경우 활성화
                    if (!window.customPromptState.isEnabled) {
                        window.customPromptState.isEnabled = true;
                        const promptToggle = document.getElementById('prompt-toggle');
                        if (promptToggle) {
                            promptToggle.checked = true;
                        }
                    }
                    
                    // 설정 저장
                    savePromptSettings();
                    console.log('템플릿이 적용됨:', templateId);
                }
            }
        });
    });
}

/**
 * 프롬프트 설정 저장
 */
function savePromptSettings() {
    try {
        localStorage.setItem(PROMPT_TEXT_STORAGE_KEY, window.customPromptState.promptText);
        localStorage.setItem(PROMPT_POSITION_STORAGE_KEY, window.customPromptState.promptPosition);
        localStorage.setItem(PROMPT_ENABLED_KEY, window.customPromptState.isEnabled);
        console.log('커스텀 프롬프트 설정 저장됨:', window.customPromptState);
    } catch (error) {
        console.error('커스텀 프롬프트 설정 저장 실패:', error);
    }
}

/**
 * 번역 프롬프트에 커스텀 프롬프트 추가 (완전히 개선된 버전)
 * @param {string} prompt - 원본 프롬프트
 * @returns {string} 커스텀 프롬프트가 추가된 프롬프트
 */
function addCustomPromptToPrompt(prompt) {
    console.log('addCustomPromptToPrompt 함수 호출됨');
    
    try {
        // 현재 상태 확인을 위한 로그
        console.log('커스텀 프롬프트 상태:', window.customPromptState);
        
        // 프롬프트가 비활성화되었거나 내용이 없으면 원본 반환
        if (!window.customPromptState.isEnabled) {
            console.log('커스텀 프롬프트가 비활성화됨');
            return prompt;
        }
        
        const customText = window.customPromptState.promptText.trim();
        if (!customText) {
            console.log('커스텀 프롬프트 내용이 비어있음');
            return prompt;
        }
        
        // 추가할 프롬프트 텍스트 준비
        const promptText = `
<|im_start|>user
The following are specific instructions for the translation:
${customText}
<|im_end|>
<|im_start|>assistant
Ok, I understand. I will adhere to these specific instructions during the translation process.
<|im_end|>
`;
        
        let resultPrompt = prompt;
        const position = window.customPromptState.promptPosition;
        
        // 프롬프트 삽입 위치에 따라 처리
        if (position === 'start') {
            // 첫 번째 사용자 메시지 이전에 삽입 시도
            const firstUserPos = prompt.indexOf('<|im_start|>user');
            if (firstUserPos !== -1) {
                console.log('프롬프트 시작 부분에 삽입 (첫 번째 사용자 메시지 이전)');
                resultPrompt = prompt.slice(0, firstUserPos) + promptText + prompt.slice(firstUserPos);
            } else {
                // 두 번째 대안: 시스템 메시지 이후 삽입 시도
                const systemEndPos = prompt.indexOf('<|im_end|>');
                if (systemEndPos !== -1) {
                    console.log('시스템 메시지 이후에 삽입');
                    resultPrompt = prompt.slice(0, systemEndPos + 10) + promptText + prompt.slice(systemEndPos + 10);
                } else {
                    // 마지막 대안: 프롬프트 시작 부분에 삽입
                    console.log('프롬프트 시작 부분에 삽입 (기본)');
                    resultPrompt = promptText + prompt;
                }
            }
        } else {
            // 마지막 사용자 메시지 이전에 삽입 시도
            const lastUserPos = prompt.lastIndexOf('<|im_start|>user');
            if (lastUserPos !== -1) {
                console.log('마지막 사용자 메시지 이전에 삽입');
                resultPrompt = prompt.slice(0, lastUserPos) + promptText + prompt.slice(lastUserPos);
            } else {
                // 대안: 맨 마지막에 삽입
                console.log('프롬프트 맨 마지막에 삽입');
                resultPrompt = prompt + promptText;
            }
        }
        
        // 성공 여부 확인
        if (resultPrompt.length > prompt.length) {
            console.log('커스텀 프롬프트 추가 성공! 추가된 길이:', resultPrompt.length - prompt.length);
            return resultPrompt;
        } else {
            // 실패 시 명시적으로 끝에 추가
            console.warn('커스텀 프롬프트 추가 실패, 맨 끝에 강제 추가');
            return prompt + promptText;
        }
    } catch (error) {
        console.error('커스텀 프롬프트 추가 중 오류 발생:', error);
        return prompt; // 오류 발생 시 원본 반환
    }
}

// 템플릿 프롬프트 예시
const promptTemplates = {
    literary: '문학적인 번역을 해주세요. 원문의 뉘앙스와 느낌을 최대한 살려서 번역해 주세요. 직역보다는 의역을 선호하며, 타겟 언어에서 자연스럽게 읽히는 것이 중요합니다.',
    technical: '이 텍스트는 기술 문서입니다. 전문 용어를 정확하게 번역하고, 명확하고 간결한 문장 구조를 유지해 주세요. 기술적 정확성을 최우선으로 하며, 모호한 표현은 피해주세요.',
    conversation: '이 텍스트는 일상 대화입니다. 자연스러운 구어체로 번역하고, 공식적인 표현보다는 실제 대화에서 사용되는 표현을 사용해 주세요. 필요한 경우 타겟 언어의 관용적 표현을 적절히 활용해 주세요.',
    fantasy: '이 텍스트는 판타지/게임 콘텐츠입니다. 판타지 세계관에 맞는 용어와 분위기를 유지해주세요. 마법, 종족, 직업, 아이템 등의 용어는 일관되게 번역하고, 세계관의 분위기를 살려주세요.'
};

// 전역 객체에 함수 등록 - 호환성 유지
window.promptManager = {
    addCustomPromptToPrompt: addCustomPromptToPrompt,
    isEnabled: () => window.customPromptState.isEnabled,
    getPromptText: () => window.customPromptState.promptText,
    getPromptPosition: () => window.customPromptState.promptPosition,
    getStatus: () => ({ ...window.customPromptState })
};

// 콘솔에 초기화 메시지 출력
console.log('커스텀 프롬프트 관리자가 초기화되었습니다. 전역 상태:', window.customPromptState);
