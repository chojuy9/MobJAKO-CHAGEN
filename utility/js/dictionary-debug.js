/**
 * 사전 폼 디버깅을 위한 스크립트
 * utility/js/dictionary-debug.js로 저장하고 HTML에 추가하여 사용
 */

// 디버깅용 스크립트 추가
document.addEventListener('DOMContentLoaded', function() {
    // 사전 폼 클릭 이벤트 추가
    const dictionaryForm = document.getElementById('dictionary-form');
    if (dictionaryForm) {
        // 버튼 타입 변경을 위한 코드 추가
        const addEntryBtn = dictionaryForm.querySelector('.add-entry-btn');
        if (addEntryBtn) {
            // 명시적으로 버튼 타입을 button으로 설정 (기본값이 submit일 수 있음)
            addEntryBtn.setAttribute('type', 'button');
            
            // 클릭 이벤트 추가
            addEntryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('사전 추가 버튼 클릭됨');
                
                // 전역 함수로 노출된 addDictionaryEntry 함수 호출
                if (typeof window.dictionaryManager !== 'undefined' && 
                    typeof window.dictionaryManager.addDictionaryEntry === 'function') {
                    window.dictionaryManager.addDictionaryEntry();
                } else {
                    // 직접 구현된 함수 호출
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
                    
                    console.log('사전 항목 추가:', source, '->', target);
                    
                    // 여기서 실제 추가 로직 호출
                    if (typeof addDictionaryEntry === 'function') {
                        addDictionaryEntry();
                    } else {
                        alert('사전 항목 추가 함수를 찾을 수 없습니다.');
                    }
                }
                
                return false;
            });
        }
    }
});
