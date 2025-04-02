/**
 * user-dictionary-fix.js - 수정된 사용자 사전 관리 스크립트
 * 번역 시 적용할 사용자 정의 용어를 관리합니다.
 * 
 * 주요 수정사항: 
 * 1. 이벤트 리스너 등록 방식 개선
 * 2. 중복 이벤트 리스너 방지
 * 3. 동적 로딩된 요소 처리 강화
 */

// 로컬 스토리지 키
const DICTIONARY_STORAGE_KEY = 'user_dictionary';
const DICTIONARY_ENABLED_KEY = 'dictionary_enabled';

// 전역 변수로 사전 항목 관리
let userDictionary = [];
let isDictionaryEnabled = true;
let isListenerAttached = false; // 이벤트 리스너 중복 방지용

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('사용자 사전 스크립트 로드됨');
    
    // 사전 초기화
    initDictionary();
    
    // 번역 옵션 컨테이너 로딩 감시 - MutationObserver 사용
    setupTranslationOptionsObserver();
    
    // 이벤트 버블링을 활용한 문서 레벨 이벤트 리스너 (동적 요소에 대응)
    setupDocumentEventListeners();
    
    // 디버깅을 위해 콘솔에 전역 객체 등록 여부 확인
    console.log('dictionaryManager 전역 객체 등록 여부:', window.dictionaryManager ? '등록됨' : '등록되지 않음');
});

// 무한 루프 방지를 위한 플래그
let isUpdating = false;
let lastOptionsVisibility = false;
let lastChildCount = 0;

// 번역 옵션 컨테이너 로딩 감시 설정
function setupTranslationOptionsObserver() {
    const optionsContainer = document.getElementById('translation-options-container');
    if (!optionsContainer) return;
    
    // 초기 상태 저장
    lastOptionsVisibility = optionsContainer.style.display !== 'none';
    
    // 옵션 컨테이너의 표시/숨김 및 내용 변경 감시
    const observer = new MutationObserver(function(mutations) {
        if (isUpdating) return; // 이미 업데이트 중이면 중단
        
        // 현재 상태 확인
        const isVisible = optionsContainer.style.display !== 'none';
        const childCount = optionsContainer.childNodes.length;
        
        // 실제 변화가 있을 때만 처리
        if (isVisible !== lastOptionsVisibility || 
            (isVisible && childCount !== lastChildCount && childCount > 0)) {
            
            // 상태 업데이트
            lastOptionsVisibility = isVisible;
            lastChildCount = childCount;
            
            if (isVisible) {
                // 업데이트 중 플래그 설정
                isUpdating = true;
                
                setTimeout(function() {
                    console.log('번역 옵션 컨테이너 상태 변경 감지. 사전 UI 초기화');
                    
                    // 사전 UI 관련 초기화
                    updateDictionaryUI();
                    updateDictionaryToggle();
                    setupDictionaryFormListeners();
                    
                    // 업데이트 완료
                    isUpdating = false;
                }, 300);
            }
        }
    });
    
    // 컨테이너 감시 시작 (스타일 및 내용 변경)
    observer.observe(optionsContainer, { 
        attributes: true, 
        childList: true
    });
}

// 문서 레벨 이벤트 리스너 설정 (이벤트 버블링 활용)
function setupDocumentEventListeners() {
    // 이미 설정된 경우 중복 방지
    if (isListenerAttached) return;
    
    // 문서 레벨에서 클릭 이벤트 감지
    document.addEventListener('click', function(e) {
        // 추가 버튼 클릭 이벤트 처리
        if (e.target.id === 'add-dictionary-btn' || 
            e.target.closest('#add-dictionary-btn') ||
            (e.target.classList.contains('add-entry-btn') || 
             e.target.closest('.add-entry-btn'))) {
            
            e.preventDefault();
            e.stopPropagation();
            console.log('사전 추가 버튼 클릭 감지 (문서 레벨)');
            addDictionaryEntry();
            return false;
        }
        
        // 사전 토글 체크박스 변경 감지
        if (e.target.id === 'dictionary-toggle') {
            isDictionaryEnabled = e.target.checked;
            saveDictionarySettings();
            console.log('사전 활성화 상태 변경:', isDictionaryEnabled);
        }
        
        // 사전 항목 삭제 버튼 클릭 처리
        if (e.target.classList.contains('delete-btn') || 
            e.target.closest('.delete-btn')) {
            const button = e.target.classList.contains('delete-btn') ? 
                          e.target : e.target.closest('.delete-btn');
            const index = parseInt(button.getAttribute('data-index'));
            
            if (!isNaN(index)) {
                console.log('사전 항목 삭제 버튼 클릭 감지, 인덱스:', index);
                removeDictionaryEntry(index);
            }
        }
    });
    
    // 폼 제출 이벤트 처리 (이벤트 버블링 활용)
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'dictionary-form') {
            e.preventDefault();
            e.stopPropagation();
            console.log('사전 폼 제출 이벤트 감지 (문서 레벨)');
            addDictionaryEntry();
            return false;
        }
    });
    
    isListenerAttached = true;
    console.log('문서 레벨 이벤트 리스너 설정 완료');
}

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
}

// 이벤트 리스너 설정 상태 추적
let formListenersInitialized = false;

// 폼과 버튼 이벤트 리스너 설정 함수
function setupDictionaryFormListeners() {
    // 이미 설정된 경우 또는 최근에 설정된 경우 중복 방지
    if (formListenersInitialized) {
        return;
    }
    
    const dictionaryForm = document.getElementById('dictionary-form');
    if (!dictionaryForm) {
        // 로그를 한 번만 표시
        if (!formListenersInitialized) {
            console.log('사전 폼을 찾을 수 없음');
        }
        return; // 폼이 없으면 처리하지 않음
    }
    
    // 이벤트 리스너 설정 완료 표시
    formListenersInitialized = true;
    
    console.log('사전 폼 발견, 이벤트 리스너 설정');
    
    // 폼 제출 이벤트 방지 (이미 문서 레벨에서 처리하지만 안전을 위해 중복 설정)
    dictionaryForm.onsubmit = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('사전 폼 제출 이벤트 발생 (onsubmit)');
        addDictionaryEntry();
        return false;
    };
    
    // 명시적으로 onsubmit 속성 설정
    dictionaryForm.setAttribute('onsubmit', 'return false;');
    
    // 추가 버튼 찾기
    const addButton = document.getElementById('add-dictionary-btn') || 
                     dictionaryForm.querySelector('.add-entry-btn');
    
    if (addButton) {
        console.log('사전 추가 버튼 발견, 직접 이벤트 리스너 설정');
        
        // 기존 이벤트 리스너 제거 (중복 방지)
        const newButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newButton, addButton);
        
        // 버튼 타입을 명시적으로 설정
        newButton.setAttribute('type', 'button');
        
        // 클릭 이벤트 직접 연결
        newButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('사전 추가 버튼 클릭됨 (onclick)');
            addDictionaryEntry();
            return false;
        };
    } else {
        console.warn('사전 추가 버튼을 찾을 수 없음');
    }
    
    // 토글 체크박스 이벤트 리스너
    const dictionaryToggle = document.getElementById('dictionary-toggle');
    if (dictionaryToggle) {
        // 기존 이벤트 리스너 제거
        const newToggle = dictionaryToggle.cloneNode(true);
        dictionaryToggle.parentNode.replaceChild(newToggle, dictionaryToggle);
        
        // 초기 상태 설정
        newToggle.checked = isDictionaryEnabled;
        
        // 변경 이벤트 리스너
        newToggle.onchange = function() {
            isDictionaryEnabled = this.checked;
            saveDictionarySettings();
            console.log('사전 활성화 상태 변경:', isDictionaryEnabled);
        };
    }
}

// UI 업데이트 제한을 위한 변수
let lastUpdateTime = 0;
const UPDATE_COOLDOWN = 1000; // 1초 쿨다운

/**
 * 사전 항목 UI 업데이트
 */
function updateDictionaryUI() {
    // 마지막 업데이트 이후 쿨다운 시간이 지나지 않았으면 중단
    const now = Date.now();
    if (now - lastUpdateTime < UPDATE_COOLDOWN) {
        return;
    }
    lastUpdateTime = now;
    
    const entriesContainer = document.getElementById('dictionary-entries');
    if (!entriesContainer) {
        console.log('사전 항목 컨테이너를 찾을 수 없음');
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

// 사전 항목 추가 중복 방지 플래그
let isAddingEntry = false;

/**
 * 새 사전 항목 추가
 */
function addDictionaryEntry() {
    // 이미 처리 중이면 중복 실행 방지
    if (isAddingEntry) return;
    isAddingEntry = true;
    
    console.log('addDictionaryEntry 함수 호출됨');
    
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
    
    // 중복 실행 방지 플래그 초기화
    isAddingEntry = false;
}

// 사전 항목 삭제 중복 방지 플래그
let isRemovingEntry = false;

/**
 * 사전 항목 삭제
 * @param {number} index - 삭제할 항목의 인덱스
 */
function removeDictionaryEntry(index) {
    // 이미 처리 중이면 중복 실행 방지
    if (isRemovingEntry) return;
    isRemovingEntry = true;
    
    if (index >= 0 && index < userDictionary.length) {
        const removedEntry = userDictionary[index];
        console.log('사전 항목 삭제:', removedEntry.source);
        
        // 해당 인덱스 항목 제거
        userDictionary.splice(index, 1);
        
        // 저장 및 UI 업데이트
        saveDictionary();
        updateDictionaryUI();
    }
    
    // 중복 실행 방지 플래그 초기화
    isRemovingEntry = false;
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
    } else {
        // 적절한 위치를 찾지 못한 경우 프롬프트 끝에 추가
        resultPrompt = prompt + dictionaryPrompt;
    }
    
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
    applyDictionary: (text) => {
        // 사전 적용 함수 - 필요 시 구현
        return text;
    },
    addDictionaryToPrompt,
    addDictionaryEntry,
    printDictionary,
    isEnabled: () => isDictionaryEnabled,
    getDictionary: () => userDictionary,
    getCount: () => userDictionary.length
};

// 스크립트 로드 완료 알림
console.log('개선된 사용자 사전 관리 스크립트 초기화 완료');
