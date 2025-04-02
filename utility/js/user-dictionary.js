/**
 * user-dictionary.js - 사용자 사전 관리 스크립트
 * 번역 시 적용할 사용자 정의 용어를 관리합니다.
 */

// 로컬 스토리지 키
const DICTIONARY_STORAGE_KEY = 'user_dictionary';
const DICTIONARY_ENABLED_KEY = 'dictionary_enabled';

// 전역 변수로 사전 항목 관리
let userDictionary = [];
let isDictionaryEnabled = true;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 사전 초기화
    initDictionary();
    
    // 사전 폼 제출 이벤트 리스너
    const dictionaryForm = document.getElementById('dictionary-form');
    if (dictionaryForm) {
        dictionaryForm.addEventListener('submit', function(e) {
            // 폼 기본 제출 동작 방지
            e.preventDefault(); 
            // 이벤트 전파 중단 - 중요!
            e.stopPropagation();
            
            // 사전 항목 추가
            addDictionaryEntry();
            
            // 상위 폼으로의 이벤트 전파 확실히 방지
            return false;
        });
    }
    
    // 사전 활성화 토글 이벤트 리스너
    const dictionaryToggle = document.getElementById('dictionary-toggle');
    if (dictionaryToggle) {
        dictionaryToggle.addEventListener('change', function() {
            isDictionaryEnabled = this.checked;
            saveDictionarySettings();
        });
    }
});

/**
 * 사전 초기화 - 저장된 설정 불러오기
 */
function initDictionary() {
    // 저장된 사전 불러오기
    const savedDictionary = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (savedDictionary) {
        try {
            userDictionary = JSON.parse(savedDictionary);
        } catch (e) {
            console.error('사전 데이터 파싱 오류:', e);
            userDictionary = [];
        }
    }
    
    // 사전 활성화 상태 불러오기
    const savedEnabled = localStorage.getItem(DICTIONARY_ENABLED_KEY);
    isDictionaryEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
    
    // UI 업데이트
    updateDictionaryUI();
    updateDictionaryToggle();
}

/**
 * 사전 항목 UI 업데이트
 */
function updateDictionaryUI() {
    const entriesContainer = document.getElementById('dictionary-entries');
    if (!entriesContainer) return;
    
    // 사전이 비어있는 경우
    if (userDictionary.length === 0) {
        entriesContainer.innerHTML = `
            <div class="empty-dictionary">
                등록된 단어가 없습니다. 위 폼을 통해 새 단어를 추가해보세요.
            </div>
        `;
        return;
    }
    
    // 사전 항목 테이블 생성
    let tableHTML = `
        <table class="dictionary-table">
            <thead>
                <tr>
                    <th>원본 텍스트</th>
                    <th>번역 텍스트</th>
                    <th>액션</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // 각 항목 추가
    userDictionary.forEach((entry, index) => {
        tableHTML += `
            <tr>
                <td>${entry.source}</td>
                <td>${entry.target}</td>
                <td>
                    <button type="button" class="action-btn delete-btn" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    // HTML 삽입
    entriesContainer.innerHTML = tableHTML;
    
    // 삭제 버튼 이벤트 리스너 추가
    const deleteButtons = entriesContainer.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeDictionaryEntry(index);
        });
    });
}

/**
 * 사전 토글 상태 업데이트
 */
function updateDictionaryToggle() {
    const dictionaryToggle = document.getElementById('dictionary-toggle');
    if (dictionaryToggle) {
        dictionaryToggle.checked = isDictionaryEnabled;
    }
}

/**
 * 새 사전 항목 추가
 */
function addDictionaryEntry() {
    const sourceInput = document.getElementById('dict-source');
    const targetInput = document.getElementById('dict-target');
    
    if (!sourceInput || !targetInput) return;
    
    const source = sourceInput.value.trim();
    const target = targetInput.value.trim();
    
    // 입력 검증
    if (!source || !target) {
        alert('원본 텍스트와 번역 텍스트를 모두 입력해주세요.');
        return;
    }
    
    // 중복 검사
    const isDuplicate = userDictionary.some(entry => entry.source === source);
    if (isDuplicate) {
        // 기존 항목 업데이트
        userDictionary = userDictionary.map(entry => 
            entry.source === source ? { source, target } : entry
        );
    } else {
        // 새 항목 추가
        userDictionary.push({ source, target });
    }
    
    // 저장 및 UI 업데이트
    saveDictionary();
    updateDictionaryUI();
    
    // 입력 필드 초기화
    sourceInput.value = '';
    targetInput.value = '';
    sourceInput.focus();
}

/**
 * 사전 항목 삭제
 * @param {number} index - 삭제할 항목의 인덱스
 */
function removeDictionaryEntry(index) {
    if (index >= 0 && index < userDictionary.length) {
        // 해당 인덱스 항목 제거
        userDictionary.splice(index, 1);
        
        // 저장 및 UI 업데이트
        saveDictionary();
        updateDictionaryUI();
    }
}

/**
 * 사전 저장
 */
function saveDictionary() {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(userDictionary));
}

/**
 * 사전 설정 저장
 */
function saveDictionarySettings() {
    localStorage.setItem(DICTIONARY_ENABLED_KEY, isDictionaryEnabled);
}

/**
 * 번역 텍스트에 사전 적용
 * @param {string} text - 번역할 원본 텍스트
 * @returns {string} 사전이 적용된 텍스트
 */
function applyDictionary(text) {
    if (!isDictionaryEnabled || userDictionary.length === 0) {
        return text;
    }
    
    // 정규식 이스케이프 함수
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    let result = text;
    
    // 사전 항목 적용 (단어 단위 매칭)
    userDictionary.forEach(entry => {
        // 단어 경계를 고려한 정규식 패턴 생성
        const pattern = new RegExp(`\\b${escapeRegExp(entry.source)}\\b`, 'g');
        result = result.replace(pattern, entry.target);
    });
    
    return result;
}

/**
 * 번역 API 호출 전 사전 지시사항 추가
 * @param {string} prompt - 원본 프롬프트
 * @returns {string} 사전 지시사항이 추가된 프롬프트
 */
function addDictionaryToPrompt(prompt) {
    if (!isDictionaryEnabled || userDictionary.length === 0) {
        return prompt;
    }
    
    // 사전 항목을 문자열로 변환
    const dictionaryTerms = userDictionary.map(entry => 
        `"${entry.source}" → "${entry.target}"`
    ).join('\n');
    
    // 사전 지시사항
    const dictionaryPrompt = `
<|im_start|>user
I have some specific terms that I want you to translate in a particular way. Please use the following translations for these terms:

${dictionaryTerms}

These translations should be applied consistently throughout the text.
<|im_end|>
<|im_start|>assistant
I understand and will use these specific translations for the terms you've provided.
<|im_end|>
`;
    
    // 마지막 사용자 메시지 이전에 사전 지시사항 삽입
    const lastUserPos = prompt.lastIndexOf('<|im_start|>user');
    if (lastUserPos !== -1) {
        return prompt.slice(0, lastUserPos) + dictionaryPrompt + prompt.slice(lastUserPos);
    }
    
    // 적절한 위치를 찾지 못한 경우 프롬프트 끝에 추가
    return prompt + dictionaryPrompt;
}

// 전역 객체에 함수 노출
window.dictionaryManager = {
    applyDictionary,
    addDictionaryToPrompt,
    isEnabled: () => isDictionaryEnabled,
    getDictionary: () => userDictionary
};
