/**
 * user-dictionary.js - 개선된 사용자 사전 관리 스크립트
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
    console.log('사용자 사전 스크립트 로드됨');
    
    // 사전 초기화
    initDictionary();
    
    // 번역 옵션 컨테이너가 로드되는 것을 감시
    const optionsContainer = document.getElementById('translation-options-container');
    if (optionsContainer) {
        // 옵션 컨테이너의 표시/숨김 상태 변경 감시
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style' &&
                    optionsContainer.style.display !== 'none') {
                    
                    // 옵션 컨테이너가 표시되면 약간의 지연 후 사전 UI 다시 초기화
                    setTimeout(function() {
                        console.log('번역 옵션 컨테이너가 표시됨. 사전 UI 다시 초기화');
                        initDictionary();
                        
                        // 폼 제출 이벤트도 다시 등록
                        const dictionaryForm = document.getElementById('dictionary-form');
                        if (dictionaryForm) {
                            console.log('사전 폼 발견됨, 이벤트 리스너 재등록');
                            
                            // 기존 이벤트 리스너 제거 (중복 방지)
                            const newForm = dictionaryForm.cloneNode(true);
                            dictionaryForm.parentNode.replaceChild(newForm, dictionaryForm);
                            
                            // 새 이벤트 리스너 등록
                            newForm.addEventListener('submit', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                addDictionaryEntry();
                                return false;
                            });
                            
                            // 추가 버튼 별도 처리
                            const addButton = newForm.querySelector('.add-entry-btn');
                            if (addButton) {
                                console.log('사전 추가 버튼 발견됨, 클릭 이벤트 재등록');
                                addButton.setAttribute('type', 'button');
                                addButton.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addDictionaryEntry();
                                    return false;
                                });
                            }
                        }
                    }, 300); // 0.3초 지연
                }
            });
        });
        
        // 옵션 컨테이너의 style 속성 변경 감시
        observer.observe(optionsContainer, { attributes: true });
    }
    
    // 디버깅을 위해 콘솔에 전역 객체 등록 여부 확인
    console.log('dictionaryManager 전역 객체 등록 여부:', window.dictionaryManager ? '등록됨' : '등록되지 않음');
});

// 사전 초기화 함수
function initDictionary() {
    // 저장된 사전 불러오기
    const savedDictionary = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (savedDictionary) {
        try {
            userDictionary = JSON.parse(savedDictionary);
            console.log('저장된 사전 로드 성공, 항목 수:', userDictionary.length);
        } catch (e) {
            console.error('사전 데이터 파싱 오류:', e);
            userDictionary = [];
        }
    } else {
        console.log('저장된 사전 없음, 빈 사전으로 초기화');
        userDictionary = [];
    }
    
    // 사전 활성화 상태 불러오기
    const savedEnabled = localStorage.getItem(DICTIONARY_ENABLED_KEY);
    isDictionaryEnabled = savedEnabled !== null ? savedEnabled === 'true' : true;
    console.log('사전 활성화 상태:', isDictionaryEnabled);
    
    // UI 업데이트 시도
    updateDictionaryUI();
    updateDictionaryToggle();
    
    // 번역 옵션 로드 이벤트를 위한 MutationObserver 설정
    const translationOptionsContainer = document.getElementById('translation-options-container');
    if (translationOptionsContainer) {
        const observer = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // translation-options가 로드되었을 때 다시 UI 업데이트 시도
                    const dictionaryEntries = document.getElementById('dictionary-entries');
                    if (dictionaryEntries) {
                        console.log('번역 옵션이 로드되어 사전 UI 다시 업데이트');
                        updateDictionaryUI();
                        updateDictionaryToggle();
                        
                        // 폼 이벤트 다시 설정
                        initDictionaryForm();
                        
                        // 감시 종료
                        observer.disconnect();
                    }
                }
            }
        });
        
        // 컨테이너 내용 변경 감시 시작
        observer.observe(translationOptionsContainer, { childList: true, subtree: true });
    }
}

// 초기 폼 설정 분리
function initDictionaryForm() {
    const dictionaryForm = document.getElementById('dictionary-form');
    if (dictionaryForm) {
        console.log('사전 폼 발견됨, 이벤트 리스너 등록');
        
        // 폼 제출 이벤트 방지
        dictionaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('사전 폼 제출 이벤트 발생, 항목 추가 시도');
            addDictionaryEntry();
            
            return false;
        });
        
        // 추가 버튼 별도 처리
        const addButton = document.getElementById('add-dictionary-btn') || 
                          dictionaryForm.querySelector('.add-entry-btn');
        if (addButton) {
            console.log('사전 추가 버튼 발견됨, 클릭 이벤트 등록');
            
            // 버튼 타입을 button으로 명시적 변경
            addButton.setAttribute('type', 'button');
            
            addButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('사전 추가 버튼 클릭됨, 항목 추가 시도');
                addDictionaryEntry();
                
                return false;
            });
        }
    }
}

/**
 * 사전 항목 UI 업데이트
 */
function updateDictionaryUI() {
    const entriesContainer = document.getElementById('dictionary-entries');
    if (!entriesContainer) {
        console.log('사전 항목 컨테이너가 아직 로드되지 않았습니다. 나중에 다시 시도합니다.');
        
        // 요소가 나타날 때까지 기다렸다가 업데이트 시도
        setTimeout(function() {
            const retryContainer = document.getElementById('dictionary-entries');
            if (retryContainer) {
                console.log('사전 항목 컨테이너를 찾았습니다. UI 업데이트를 진행합니다.');
                updateDictionaryUI();
            }
        }, 500); // 0.5초 후 다시 시도
        
        return;
    }
    
    console.log('사전 UI 업데이트, 항목 수:', userDictionary.length);
    
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
    
    if (!sourceInput || !targetInput) {
        console.error('사전 입력 필드를 찾을 수 없습니다');
        alert('사전 입력 필드를 찾을 수 없습니다. 페이지를 새로고침하고 다시 시도해보세요.');
        return;
    }
    
    const source = sourceInput.value.trim();
    const target = targetInput.value.trim();
    
    console.log('사전 항목 추가 시도:', source, '->', target);
    
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
        console.log('기존 항목 업데이트:', source);
    } else {
        // 새 항목 추가
        userDictionary.push({ source, target });
        console.log('새 항목 추가:', source);
    }
    
    // 저장 및 UI 업데이트
    saveDictionary();
    updateDictionaryUI();
    
    // 입력 필드 초기화
    sourceInput.value = '';
    targetInput.value = '';
    sourceInput.focus();
    
    // 성공 메시지 표시
    alert(`사전에 "${source}" → "${target}" 항목이 추가되었습니다.`);
}

/**
 * 사전 항목 삭제
 * @param {number} index - 삭제할 항목의 인덱스
 */
function removeDictionaryEntry(index) {
    if (index >= 0 && index < userDictionary.length) {
        const removedEntry = userDictionary[index];
        console.log('사전 항목 삭제:', removedEntry.source);
        
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
    console.log('사전 저장 완료, 항목 수:', userDictionary.length);
    
    // 번역 기능과의 통합을 위해 이벤트 발생
    const event = new CustomEvent('dictionaryUpdated', { 
        detail: { dictionary: userDictionary, enabled: isDictionaryEnabled } 
    });
    window.dispatchEvent(event);
}

/**
 * 사전 설정 저장
 */
function saveDictionarySettings() {
    localStorage.setItem(DICTIONARY_ENABLED_KEY, isDictionaryEnabled);
    console.log('사전 설정 저장 완료, 활성화:', isDictionaryEnabled);
}

/**
 * 번역 텍스트에 사전 적용
 * @param {string} text - 번역할 원본 텍스트
 * @returns {string} 사전이 적용된 텍스트
 */
function applyDictionary(text) {
    if (!isDictionaryEnabled || userDictionary.length === 0) {
        console.log('사전 적용 안 함 (비활성화 또는 빈 사전)');
        return text;
    }
    
    console.log('사전 적용 시작, 항목 수:', userDictionary.length);
    
    // 정규식 이스케이프 함수
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    let result = text;
    
    // 사전 항목 적용 (단어 단위 매칭)
    userDictionary.forEach(entry => {
        // 단어 경계를 고려한 정규식 패턴 생성
        const pattern = new RegExp(`\\b${escapeRegExp(entry.source)}\\b`, 'g');
        const origResult = result;
        result = result.replace(pattern, entry.target);
        
        // 변경이 있었는지 확인
        if (origResult !== result) {
            console.log(`사전 적용: "${entry.source}" → "${entry.target}"`);
        }
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
        console.log('사전 프롬프트 추가 안 함 (비활성화 또는 빈 사전)');
        return prompt;
    }
    
    console.log('사전 프롬프트 추가, 항목 수:', userDictionary.length);
    
    // 사전 항목을 문자열로 변환
    const dictionaryTerms = userDictionary.map(entry => 
        `"${entry.source}" → "${entry.target}"`
    ).join('\n');
    
    console.log('사전 항목:', dictionaryTerms);
    
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
    let resultPrompt;
    
    if (lastUserPos !== -1) {
        resultPrompt = prompt.slice(0, lastUserPos) + dictionaryPrompt + prompt.slice(lastUserPos);
        console.log('사전 프롬프트가 마지막 사용자 메시지 이전에 삽입됨');
    } else {
        // 적절한 위치를 찾지 못한 경우 프롬프트 끝에 추가
        resultPrompt = prompt + dictionaryPrompt;
        console.log('사전 프롬프트가 프롬프트 끝에 추가됨');
    }
    
    // 디버깅용 프롬프트 길이 정보
    console.log('원본 프롬프트 길이:', prompt.length);
    console.log('사전 프롬프트 길이:', dictionaryPrompt.length);
    console.log('최종 프롬프트 길이:', resultPrompt.length);
    
    return resultPrompt;
}

// 디버깅용 사전 내용 출력 함수
function printDictionary() {
    console.log('--- 현재 사전 내용 ---');
    console.log('활성화 상태:', isDictionaryEnabled);
    console.log('항목 수:', userDictionary.length);
    
    if (userDictionary.length > 0) {
        userDictionary.forEach((entry, index) => {
            console.log(`${index + 1}. "${entry.source}" → "${entry.target}"`);
        });
    } else {
        console.log('(사전이 비어 있습니다)');
    }
    console.log('---------------------');
}

// 전역 객체에 함수 노출
window.dictionaryManager = {
    applyDictionary,
    addDictionaryToPrompt,
    addDictionaryEntry,  // 추가: 외부에서 직접 호출 가능하도록
    printDictionary,     // 추가: 디버깅용 함수
    isEnabled: () => isDictionaryEnabled,
    getDictionary: () => userDictionary,
    getCount: () => userDictionary.length
};

// 스크립트 로드 완료 알림
console.log('사용자 사전 관리 스크립트 초기화 완료');
